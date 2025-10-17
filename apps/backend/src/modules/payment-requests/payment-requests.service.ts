import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentRequestDto } from './dto/create-payment-request.dto';
import { ApprovePaymentRequestDto } from './dto/approve-payment-request.dto';
import { RejectPaymentRequestDto } from './dto/reject-payment-request.dto';
import { QueryPaymentRequestDto } from './dto/query-payment-request.dto';

@Injectable()
export class PaymentRequestsService {
  constructor(private prisma: PrismaService) {}

  /**
   * CTV creates payment request for their commission
   */
  async create(createDto: CreatePaymentRequestDto, ctvId: string) {
    // Verify commission exists and belongs to CTV
    const commission = await this.prisma.commission.findUnique({
      where: { id: createDto.commissionId },
      include: {
        unit: true,
        deposit: true,
      },
    });

    if (!commission) {
      throw new NotFoundException('Commission not found');
    }

    if (commission.ctvId !== ctvId) {
      throw new ForbiddenException('You can only create payment request for your own commissions');
    }

    if (commission.status !== 'PENDING') {
      throw new BadRequestException(
        `Commission status is ${commission.status}. Only PENDING commissions can request payment.`,
      );
    }

    // Check if payment request already exists for this commission
    const existingRequest = await this.prisma.paymentRequest.findFirst({
      where: {
        commissionId: createDto.commissionId,
        status: { in: ['PENDING', 'APPROVED'] },
      },
    });

    if (existingRequest) {
      throw new BadRequestException(
        'A payment request already exists for this commission',
      );
    }

    // Create payment request
    const paymentRequest = await this.prisma.paymentRequest.create({
      data: {
        commissionId: createDto.commissionId,
        ctvId,
        amount: createDto.amount,
        bankName: createDto.bankName,
        bankAccount: createDto.bankAccount,
        bankAccountName: createDto.bankAccountName,
        notes: createDto.notes,
        status: 'PENDING',
      },
      include: {
        commission: {
          include: {
            unit: true,
            deposit: true,
          },
        },
        ctv: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return paymentRequest;
  }

  /**
   * Get all payment requests (Admin)
   */
  async findAll(query: QueryPaymentRequestDto) {
    const where: any = {};

    if (query.ctvId) {
      where.ctvId = query.ctvId;
    }

    if (query.status) {
      where.status = query.status;
    }

    return this.prisma.paymentRequest.findMany({
      where,
      include: {
        commission: {
          include: {
            unit: true,
            deposit: true,
          },
        },
        ctv: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        approver: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get CTV's own payment requests
   */
  async findMyRequests(ctvId: string) {
    return this.prisma.paymentRequest.findMany({
      where: { ctvId },
      include: {
        commission: {
          include: {
            unit: true,
            deposit: true,
          },
        },
        approver: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get payment request by ID
   */
  async findOne(id: string) {
    const paymentRequest = await this.prisma.paymentRequest.findUnique({
      where: { id },
      include: {
        commission: {
          include: {
            unit: true,
            deposit: true,
          },
        },
        ctv: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        approver: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!paymentRequest) {
      throw new NotFoundException('Payment request not found');
    }

    return paymentRequest;
  }

  /**
   * Admin approves payment request
   * This updates commission status to PAID (payment completed)
   */
  async approve(id: string, approveDto: ApprovePaymentRequestDto, adminId: string) {
    const paymentRequest = await this.findOne(id);

    if (paymentRequest.status !== 'PENDING') {
      throw new BadRequestException('Payment request is not pending');
    }

    // Update payment request
    await this.prisma.paymentRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: adminId,
        approvedAt: new Date(),
        notes: approveDto.notes || paymentRequest.notes,
      },
    });

    // Update commission status to PAID (payment completed)
    await this.prisma.commission.update({
      where: { id: paymentRequest.commissionId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });

    return this.findOne(id);
  }

  /**
   * Admin rejects payment request
   */
  async reject(id: string, rejectDto: RejectPaymentRequestDto, adminId: string) {
    const paymentRequest = await this.findOne(id);

    if (paymentRequest.status !== 'PENDING') {
      throw new BadRequestException('Payment request is not pending');
    }

    // Update payment request
    await this.prisma.paymentRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        approvedBy: adminId,
        approvedAt: new Date(),
        rejectedReason: rejectDto.rejectedReason,
      },
    });

    return this.findOne(id);
  }


  /**
   * Get payment request summary for CTV
   */
  async getMySummary(ctvId: string) {
    const commissions = await this.prisma.commission.findMany({
      where: { ctvId },
      include: {
        paymentRequests: true,
      },
    });

    const summary = {
      totalEarned: 0,
      pending: 0,
      approved: 0,
      paid: 0,
      count: {
        total: commissions.length,
        pending: 0,
        approved: 0,
        paid: 0,
      },
    };

    commissions.forEach((commission) => {
      summary.totalEarned += commission.amount;

      if (commission.status === 'PENDING') {
        summary.pending += commission.amount;
        summary.count.pending++;
      } else if (commission.status === 'APPROVED') {
        summary.approved += commission.amount;
        summary.count.approved++;
      } else if (commission.status === 'PAID') {
        summary.paid += commission.amount;
        summary.count.paid++;
      }
    });

    // Get payment requests
    const paymentRequests = await this.prisma.paymentRequest.findMany({
      where: { ctvId },
      include: {
        commission: {
          include: {
            unit: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      summary,
      paymentRequests,
      commissions: commissions.map((c) => ({
        id: c.id,
        amount: c.amount,
        status: c.status,
        paidAt: c.paidAt,
        createdAt: c.createdAt,
        unit: c,
      })),
    };
  }
}

