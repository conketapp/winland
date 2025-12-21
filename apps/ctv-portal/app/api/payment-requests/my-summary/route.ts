import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const userPhone = request.headers.get('x-user-phone');

    if (!userPhone) {
      return NextResponse.json(
        { error: 'Không tìm thấy thông tin người dùng' },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { phone: userPhone },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Người dùng không tồn tại' },
        { status: 404 },
      );
    }

    // Get commissions of this CTV (exclude soft-deleted)
    const commissions = await prisma.commission.findMany({
      where: {
        ctvId: user.id,
      },
      include: {
        paymentRequests: true,
        unit: true,
      },
      orderBy: { createdAt: 'desc' },
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

    const paymentRequests = await prisma.paymentRequest.findMany({
      where: {
        ctvId: user.id,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      summary,
      paymentRequests,
      commissions: commissions.map((c) => ({
        id: c.id,
        amount: c.amount,
        status: c.status,
        paidAt: c.paidAt,
        createdAt: c.createdAt,
        unit: c.unit,
      })),
    });
  } catch (error) {
    console.error('Get commissions summary error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi lấy dữ liệu hoa hồng' },
      { status: 500 },
    );
  }
}








