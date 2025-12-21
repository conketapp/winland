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

        // Get commissions from Commission table (not calculating from deposits)
        const commissions = await prisma.commission.findMany({
            where: {
                ctvId: user.id,
            },
            include: {
                deposit: {
                    select: {
                        id: true,
                        code: true,
                        customerName: true,
                        depositAmount: true,
                        depositDate: true,
                    },
                },
                unit: {
                    select: {
                        code: true,
                        project: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        // Transform to response format
        const formattedCommissions = commissions.map(commission => ({
            id: commission.id,
            depositCode: commission.deposit.code,
            unitCode: commission.unit?.code || 'N/A',
            projectName: commission.unit?.project?.name || 'N/A',
            customerName: commission.deposit.customerName,
            depositAmount: commission.deposit.depositAmount,
            commissionAmount: commission.amount,
            commissionRate: commission.rate,
            status: commission.status,
            paidAt: commission.paidAt,
            depositDate: commission.deposit.depositDate,
            createdAt: commission.createdAt,
        }))

        // Calculate summary
        const totalCommission = commissions.reduce((sum, c) => sum + c.amount, 0)
        const totalCommissions = commissions.length

        return NextResponse.json({
            commissions: formattedCommissions,
            summary: {
                totalCommission,
                totalCommissions,
                averageCommission: totalCommissions > 0 ? totalCommission / totalCommissions : 0,
            },
        })

    } catch (error) {
        console.error('Get commissions error:', error)
        return NextResponse.json(
            { error: 'Đã xảy ra lỗi khi lấy danh sách hoa hồng' },
            { status: 500 }
        )
    }
}
