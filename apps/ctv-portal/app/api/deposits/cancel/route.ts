import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { depositId } = body

        if (!depositId) {
            return NextResponse.json(
                { error: 'Thiếu ID đặt cọc' },
                { status: 400 }
            )
        }

        // Find deposit
        const deposit = await prisma.deposit.findUnique({
            where: { id: depositId },
            include: {
                unit: true
            }
        })

        if (!deposit) {
            return NextResponse.json(
                { error: 'Không tìm thấy đặt cọc' },
                { status: 404 }
            )
        }

        // Check if deposit can be cancelled
        if (deposit.status === 'CANCELLED') {
            return NextResponse.json(
                { error: 'Đặt cọc đã được hủy trước đó' },
                { status: 400 }
            )
        }

        if (deposit.status === 'COMPLETED') {
            return NextResponse.json(
                { error: 'Không thể hủy đặt cọc đã hoàn thành' },
                { status: 400 }
            )
        }

        // Update deposit status to CANCELLED
        const updatedDeposit = await prisma.deposit.update({
            where: { id: depositId },
            data: {
                status: 'CANCELLED',
                cancelledReason: 'Hủy bởi CTV',
                updatedAt: new Date()
            }
        })

        // Check if there are any other active transactions on this unit
        const [activeBookings, activeReservations, activeDeposits] = await Promise.all([
            prisma.booking.count({
                where: {
                    unitId: deposit.unitId,
                    status: {
                        in: ['CONFIRMED', 'PENDING_APPROVAL']
                    }
                }
            }),
            prisma.reservation.count({
                where: {
                    unitId: deposit.unitId,
                    status: {
                        in: ['ACTIVE', 'YOUR_TURN']
                    }
                }
            }),
            prisma.deposit.count({
                where: {
                    unitId: deposit.unitId,
                    id: { not: depositId },
                    status: {
                        in: ['PENDING_APPROVAL', 'CONFIRMED']
                    }
                }
            })
        ])

        // If no other active transactions, return unit to AVAILABLE
        if (activeBookings === 0 && activeReservations === 0 && activeDeposits === 0) {
            await prisma.unit.update({
                where: { id: deposit.unitId },
                data: { status: 'AVAILABLE' }
            })
            console.log(`✅ Unit ${deposit.unit.code} returned to AVAILABLE after deposit cancellation`)
        } else {
            console.log(`⚠️ Unit ${deposit.unit.code} has other active transactions, status unchanged`)
        }

        console.log(`✅ Deposit cancelled: ${deposit.code}`)

        return NextResponse.json({
            success: true,
            deposit: updatedDeposit,
            message: 'Đã hủy đặt cọc thành công'
        })

    } catch (error) {
        console.error('Cancel deposit error:', error)
        return NextResponse.json(
            { error: 'Đã xảy ra lỗi khi hủy đặt cọc' },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}
