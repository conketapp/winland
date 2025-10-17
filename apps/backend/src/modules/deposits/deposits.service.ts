import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDepositDto } from './dto/create-deposit.dto';

@Injectable()
export class DepositsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate deposit code: DEP-YYYYMMDD-XXX
   */
  private async generateCode(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    
    const count = await this.prisma.deposit.count({
      where: {
        createdAt: {
          gte: new Date(today.setHours(0, 0, 0, 0)),
        },
      },
    });

    const counter = (count + 1).toString().padStart(3, '0');
    return `DEP-${dateStr}-${counter}`;
  }

  /**
   * Create deposit (CTV or from reservation)
   * CRITICAL: This triggers payment schedule + commission calculation
   */
  async create(dto: CreateDepositDto, ctvId: string) {
    // Get unit with project
    const unit = await this.prisma.unit.findUnique({
      where: { id: dto.unitId },
      include: { project: true },
    });

    if (!unit) {
      throw new NotFoundException('Căn hộ không tồn tại');
    }

    // Validate deposit amount (min 5% of unit price)
    const minDeposit = unit.price * 0.05; // TODO: Get from SystemConfig
    if (dto.depositAmount < minDeposit) {
      throw new BadRequestException(
        `Số tiền cọc tối thiểu là ${minDeposit.toLocaleString()} VNĐ (5% giá căn)`
      );
    }

    if (dto.depositAmount > unit.price) {
      throw new BadRequestException('Số tiền cọc không thể lớn hơn giá căn');
    }

    // Calculate deposit percentage
    const depositPercentage = (dto.depositAmount / unit.price) * 100;

    // Generate code
    const code = await this.generateCode();

    // Create deposit
    const deposit = await this.prisma.deposit.create({
      data: {
        code,
        unitId: dto.unitId,
        ctvId,
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        customerEmail: dto.customerEmail,
        customerIdCard: dto.customerIdCard,
        customerAddress: dto.customerAddress,
        depositAmount: dto.depositAmount,
        depositPercentage,
        depositDate: new Date(),
        paymentMethod: dto.paymentMethod || 'BANK_TRANSFER',
        paymentProof: dto.paymentProof ? JSON.stringify(dto.paymentProof) : null,
        status: 'PENDING_APPROVAL', // Waiting admin approval
        notes: dto.notes,
      },
      include: {
        unit: {
          include: {
            project: true,
            building: true,
            floor: true,
          },
        },
        ctv: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          },
        },
      },
    });

    // Update unit status
    await this.prisma.unit.update({
      where: { id: dto.unitId },
      data: { status: 'DEPOSITED' },
    });

    // If from reservation, mark as COMPLETED
    if (dto.reservationId) {
      await this.prisma.reservation.update({
        where: { id: dto.reservationId },
        data: { status: 'COMPLETED' },
      });

      // Mark all other reservations for this unit as MISSED
      await this.prisma.reservation.updateMany({
        where: {
          unitId: dto.unitId,
          id: { not: dto.reservationId },
          status: { in: ['ACTIVE', 'YOUR_TURN'] },
        },
        data: { status: 'MISSED' },
      });
    }

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        userId: ctvId,
        action: 'CREATE',
        entityType: 'DEPOSIT',
        entityId: deposit.id,
        newValue: JSON.stringify(deposit),
      },
    });

    // TODO: Generate contract PDF
    // await this.pdfService.generateDepositContract(deposit);

    return {
      ...deposit,
      message: 'Tạo phiếu cọc thành công! Chờ admin duyệt',
    };
  }

  /**
   * Approve deposit (Admin)
   * CRITICAL: This creates payment schedule + commission
   */
  async approve(id: string, adminId: string) {
    const deposit = await this.prisma.deposit.findUnique({
      where: { id },
      include: { unit: true },
    });

    if (!deposit) {
      throw new NotFoundException('Phiếu cọc không tồn tại');
    }

    if (deposit.status !== 'PENDING_APPROVAL') {
      throw new BadRequestException('Phiếu cọc này đã được xử lý');
    }

    // Update deposit status
    await this.prisma.deposit.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        approvedBy: adminId,
        approvedAt: new Date(),
      },
    });

    // 🔥 CRITICAL: Create payment schedule (4 installments)
    await this.createPaymentSchedule(id, deposit.unitId, deposit.depositAmount, deposit.depositPercentage);

    // 🔥 CRITICAL: Create commission for CTV
    await this.createCommission(deposit);

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'APPROVE',
        entityType: 'DEPOSIT',
        entityId: id,
        newValue: JSON.stringify({ status: 'CONFIRMED' }),
      },
    });

    return { message: 'Duyệt phiếu cọc thành công' };
  }

  /**
   * Create payment schedule (4 installments)
   * TODO: Get template from SystemConfig
   */
  private async createPaymentSchedule(depositId: string, unitId: string, depositAmount: number, depositPercentage: number) {
    const unit = await this.prisma.unit.findUnique({ where: { id: unitId } });
    if (!unit) return;

    const totalPrice = unit.price;

    // Installment 1: Deposit (already paid)
    await this.prisma.paymentSchedule.create({
      data: {
        depositId,
        installment: 1,
        name: 'Tiền cọc',
        percentage: depositPercentage,
        amount: depositAmount,
        dueDate: new Date(), // Already due
        status: 'PAID',
        paidAmount: depositAmount,
        paidAt: new Date(),
      },
    });

    // Installment 2: 30% after 30 days
    const inst2Date = new Date();
    inst2Date.setDate(inst2Date.getDate() + 30);
    await this.prisma.paymentSchedule.create({
      data: {
        depositId,
        installment: 2,
        name: 'Đợt 2',
        percentage: 30,
        amount: totalPrice * 0.3,
        dueDate: inst2Date,
        status: 'PENDING',
      },
    });

    // Installment 3: 30% after 60 days
    const inst3Date = new Date();
    inst3Date.setDate(inst3Date.getDate() + 60);
    await this.prisma.paymentSchedule.create({
      data: {
        depositId,
        installment: 3,
        name: 'Đợt 3',
        percentage: 30,
        amount: totalPrice * 0.3,
        dueDate: inst3Date,
        status: 'PENDING',
      },
    });

    // Installment 4: Remaining % (when handover)
    const remaining = 100 - depositPercentage - 30 - 30;
    await this.prisma.paymentSchedule.create({
      data: {
        depositId,
        installment: 4,
        name: 'Thanh toán cuối (Bàn giao)',
        percentage: remaining,
        amount: totalPrice * (remaining / 100),
        dueDate: null, // TBD
        status: 'PENDING',
      },
    });
  }

  /**
   * 🔥 CRITICAL: Create commission for CTV when deposit confirmed
   */
  private async createCommission(deposit: any) {
    const unit = await this.prisma.unit.findUnique({
      where: { id: deposit.unitId },
      include: { project: true },
    });

    if (!unit) return;

    // Get commission rate (unit override or project default)
    const rate = unit.commissionRate || unit.project.commissionRate || 2.0;
    const amount = unit.price * (rate / 100);

    await this.prisma.commission.create({
      data: {
        unitId: deposit.unitId,
        ctvId: deposit.ctvId,
        depositId: deposit.id,
        amount,
        rate,
        status: 'PENDING',
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId: deposit.ctvId,
        action: 'CREATE',
        entityType: 'COMMISSION',
        entityId: deposit.id,
        newValue: JSON.stringify({ amount, rate }),
      },
    });
  }

  /**
   * Get all deposits (Admin)
   */
  async findAll(filters?: { status?: string; projectId?: string }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.projectId) {
      where.unit = { projectId: filters.projectId };
    }

    return await this.prisma.deposit.findMany({
      where,
      include: {
        unit: {
          include: {
            project: true,
            building: true,
            floor: true,
          },
        },
        ctv: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get my deposits (CTV)
   */
  async getMyDeposits(ctvId: string) {
    return await this.prisma.deposit.findMany({
      where: { ctvId },
      include: {
        unit: {
          include: {
            project: true,
            building: true,
            floor: true,
          },
        },
        paymentSchedules: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

