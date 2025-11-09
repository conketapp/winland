import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        // Get user phone from session storage (passed as query param or header)
        const userPhone = request.headers.get('x-user-phone')

        if (!userPhone) {
            return NextResponse.json(
                { error: 'Không tìm thấy thông tin người dùng' },
                { status: 401 }
            )
        }

        // Find user by phone
        const user = await prisma.user.findUnique({
            where: { phone: userPhone },
            select: {
                id: true,
                phone: true,
                email: true,
                fullName: true,
                avatar: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                // Exclude password
            }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Người dùng không tồn tại' },
                { status: 404 }
            )
        }

        if (!user.isActive) {
            return NextResponse.json(
                { error: 'Tài khoản đã bị vô hiệu hóa' },
                { status: 403 }
            )
        }

        return NextResponse.json({
            success: true,
            user
        })

    } catch (error) {
        console.error('Get user error:', error)
        return NextResponse.json(
            { error: 'Đã xảy ra lỗi khi lấy thông tin người dùng' },
            { status: 500 }
        )
    }
}
