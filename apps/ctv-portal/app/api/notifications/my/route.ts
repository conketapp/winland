import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const userPhone = request.headers.get('x-user-phone');

    if (!authHeader || !userPhone) {
      return NextResponse.json(
        { error: 'Không tìm thấy thông tin người dùng' },
        { status: 401 },
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { phone: userPhone },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Người dùng không tồn tại' },
        { status: 404 },
      );
    }

    const unreadOnly = request.nextUrl.searchParams.get('unreadOnly') === 'true';

    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi lấy danh sách thông báo' },
      { status: 500 },
    );
  }
}


