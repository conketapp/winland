import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
    try {
        const userPhone = request.headers.get('x-user-phone')

        if (!userPhone) {
            return NextResponse.json(
                { error: 'Không tìm thấy thông tin người dùng' },
                { status: 401 }
            )
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { phone: userPhone }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Người dùng không tồn tại' },
                { status: 404 }
            )
        }

        // Get deposits for this CTV
        const deposits = await prisma.deposit.findMany({
            where: {
                ctvId: user.id
            },
            include: {
                unit: {
                    select: {
                        code: true,
                        unitNumber: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 50 // Limit to last 50 deposits
        })

        return NextResponse.json(deposits)

    } catch (error) {
        console.error('Get deposits error:', error)
        return NextResponse.json(
            { error: 'Đã xảy ra lỗi khi lấy danh sách cọc' },
            { status: 500 }
        )
    }
}
