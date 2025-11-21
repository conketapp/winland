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

        // Get all deposits for this CTV to calculate commissions
        const deposits = await prisma.deposit.findMany({
            where: {
                ctvId: user.id,
                status: {
                    in: ['CONFIRMED', 'COMPLETED']
                }
            },
            include: {
                unit: {
                    select: {
                        code: true,
                        project: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Calculate commissions (2% of deposit amount)
        const commissions = deposits.map(deposit => ({
            id: deposit.id,
            depositCode: deposit.code,
            unitCode: deposit.unit?.code || 'N/A',
            projectName: deposit.unit?.project?.name || 'N/A',
            customerName: deposit.customerName,
            depositAmount: deposit.depositAmount,
            commissionAmount: deposit.depositAmount * 0.02, // 2% commission
            commissionRate: 0.02,
            status: deposit.status,
            depositDate: deposit.depositDate,
            createdAt: deposit.createdAt
        }))

        // Calculate summary
        const totalCommission = commissions.reduce((sum, c) => sum + c.commissionAmount, 0)
        const totalDeposits = deposits.length

        return NextResponse.json({
            commissions,
            summary: {
                totalCommission,
                totalDeposits,
                averageCommission: totalDeposits > 0 ? totalCommission / totalDeposits : 0
            }
        })

    } catch (error) {
        console.error('Get commissions error:', error)
        return NextResponse.json(
            { error: 'Đã xảy ra lỗi khi lấy danh sách hoa hồng' },
            { status: 500 }
        )
    }
}
