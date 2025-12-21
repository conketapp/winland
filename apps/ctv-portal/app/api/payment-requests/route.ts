import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const userPhone = request.headers.get('x-user-phone');

    if (!userPhone) {
      return NextResponse.json(
        { error: 'Không tìm thấy thông tin người dùng' },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { commissionId, amount, bankName, bankAccount, bankAccountName, notes } =
      body || {};

    if (!commissionId || !amount) {
      return NextResponse.json(
        { error: 'Thiếu thông tin commission hoặc số tiền' },
        { status: 400 },
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { phone: userPhone },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Người dùng không tồn tại' },
        { status: 404 },
      );
    }

    // Verify commission belongs to this CTV and is PENDING
    const commission = await prisma.commission.findUnique({
      where: { id: commissionId },
    });

    if (!commission || commission.ctvId !== user.id) {
      return NextResponse.json(
        { error: 'Hoa hồng không hợp lệ' },
        { status: 400 },
      );
    }

    if (commission.status !== 'PENDING') {
      return NextResponse.json(
        {
          error:
            'Chỉ được tạo yêu cầu rút tiền cho hoa hồng đang ở trạng thái PENDING',
        },
        { status: 400 },
      );
    }

    // Check existing payment request
    const existingRequest = await prisma.paymentRequest.findFirst({
      where: {
        commissionId,
        status: {
          in: ['PENDING', 'APPROVED'],
        },
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'Đã tồn tại yêu cầu rút tiền cho hoa hồng này' },
        { status: 400 },
      );
    }

    const paymentRequest = await prisma.paymentRequest.create({
      data: {
        commissionId,
        ctvId: user.id,
        amount,
        bankName: bankName || '',
        bankAccount: bankAccount || '',
        bankAccountName: bankAccountName || '',
        notes: notes || '',
        status: 'PENDING',
      },
    });

    return NextResponse.json(paymentRequest);
  } catch (error) {
    console.error('Create payment request error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi tạo yêu cầu rút tiền' },
      { status: 500 },
    );
  }
}








