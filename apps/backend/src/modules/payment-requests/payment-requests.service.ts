import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, PaymentRequestStatus } from '@prisma/client';
import { CreatePaymentRequestDto } from './dto/create-payment-request.dto';
import { ApprovePaymentRequestDto } from './dto/approve-payment-request.dto';
import { RejectPaymentRequestDto } from './dto/reject-payment-request.dto';
import { QueryPaymentRequestDto } from './dto/query-payment-request.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { CommissionsService } from '../commissions/commissions.service';
import { ErrorMessages } from '../../common/constants/error-messages';

@Injectable()
export class PaymentRequestsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private commissionsService: CommissionsService,
  ) {}

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

    // Notify CTV about new payment request
    await this.notificationsService.createNotification({
      userId: ctvId,
      type: 'PAYMENT_REQUEST_CREATED',
      title: 'Tạo yêu cầu thanh toán hoa hồng',
      message: `Bạn đã tạo yêu cầu thanh toán hoa hồng cho căn ${commission.unit.code}.`,
      entityType: 'PAYMENT_REQUEST',
      entityId: paymentRequest.id,
      metadata: {
        paymentRequestId: paymentRequest.id,
        commissionId: commission.id,
        unitId: commission.unitId,
        unitCode: commission.unit.code,
      },
    });

    return paymentRequest;
  }

  /**
   * Get all payment requests (Admin)
   */
  async findAll(query: QueryPaymentRequestDto) {
    const where: Prisma.PaymentRequestWhereInput = {};

    if (query.ctvId) {
      where.ctvId = query.ctvId;
    }

    if (query.status) {
      // Cast string to enum value - Prisma WhereInput accepts enum values directly
      where.status = query.status as PaymentRequestStatus;
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
      throw new NotFoundException(ErrorMessages.PAYMENT_REQUEST.NOT_FOUND);
    }

    return paymentRequest;
  }

  /**
   * Admin approves payment request
   * This updates commission status to APPROVED (waiting payout)
   */
  async approve(id: string, approveDto: ApprovePaymentRequestDto, adminId: string) {
    const paymentRequest = await this.findOne(id);

    if (paymentRequest.status !== 'PENDING') {
      throw new BadRequestException(ErrorMessages.PAYMENT_REQUEST.NOT_PENDING);
    }

    // Update payment request to APPROVED
    await this.prisma.paymentRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: adminId,
        approvedAt: new Date(),
        notes: approveDto.notes || paymentRequest.notes,
      },
    });

    // Update commission status to APPROVED (payment scheduled)
    await this.prisma.commission.update({
      where: { id: paymentRequest.commissionId },
      data: {
        status: 'APPROVED',
      },
    });

    const updated = await this.findOne(id);

    // Notify requester
    await this.notificationsService.createNotification({
      userId: updated.ctvId,
      type: 'PAYMENT_REQUEST_APPROVED',
      title: 'Yêu cầu thanh toán đã được duyệt',
      message: `Yêu cầu thanh toán hoa hồng cho căn ${updated.commission.unit.code} đã được admin duyệt.`,
      entityType: 'PAYMENT_REQUEST',
      entityId: updated.id,
      metadata: {
        paymentRequestId: updated.id,
        commissionId: updated.commissionId,
        unitId: updated.commission.unit.id,
        unitCode: updated.commission.unit.code,
      },
    });

    return updated;
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

    const updated = await this.findOne(id);

    // Notify requester
    await this.notificationsService.createNotification({
      userId: updated.ctvId,
      type: 'PAYMENT_REQUEST_REJECTED',
      title: 'Yêu cầu thanh toán bị từ chối',
      message: `Yêu cầu thanh toán hoa hồng cho căn ${updated.commission.unit.code} đã bị từ chối.`,
      entityType: 'PAYMENT_REQUEST',
      entityId: updated.id,
      metadata: {
        paymentRequestId: updated.id,
        commissionId: updated.commissionId,
        unitId: updated.commission.unit.id,
        unitCode: updated.commission.unit.code,
      },
    });

    return updated;
  }
  /**
   * Admin marks payment as PAID (commission)
   * This updates commission status to PAID (payment completed)
   */
  async markAsPaid(id: string, payload: { paidProof?: string }, _adminId: string) {
    const paymentRequest = await this.findOne(id);

    if (paymentRequest.status !== 'APPROVED') {
      throw new BadRequestException(ErrorMessages.PAYMENT_REQUEST.NOT_APPROVED);
    }

    // Optionally update payment request notes with proof info
    if (payload.paidProof) {
      await this.prisma.paymentRequest.update({
        where: { id },
        data: {
          notes: paymentRequest.notes
            ? `${paymentRequest.notes}\nPAID_PROOF: ${payload.paidProof}`
            : `PAID_PROOF: ${payload.paidProof}`,
        },
      });
    }

    // Update commission status to PAID
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
   * Get payment request summary for CTV
   * Uses CommissionsService for commission summary calculation
   */
  async getMySummary(ctvId: string) {
    // Get commission summary from CommissionsService
    const summary = await this.commissionsService.getMySummary(ctvId);

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

    // Get commissions list for response (first page only for summary endpoint)
    const commissionsData = await this.commissionsService.findMyCommissions(ctvId, undefined, { page: 1, limit: 100 });
    const commissions = Array.isArray(commissionsData) 
      ? commissionsData 
      : commissionsData.items || [];

    return {
      summary,
      paymentRequests,
      commissions: commissions.map((c: any) => ({
        id: c.id,
        amount: c.amount,
        status: c.status,
        paidAt: c.paidAt,
        createdAt: c.createdAt,
        unit: c.unit,
      })),
    };
  }
}

