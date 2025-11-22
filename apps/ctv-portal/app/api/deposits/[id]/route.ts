import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const depositId = params.id

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

        // Only allow hiding completed or cancelled deposits
        if (!['COMPLETED', 'CANCELLED'].includes(deposit.status)) {
            return NextResponse.json(
                { error: 'Chỉ có thể ẩn đặt cọc đã hoàn thành hoặc đã hủy' },
                { status: 400 }
            )
        }

        // Add hidden marker to notes instead of deleting
        const currentNotes = deposit.notes || ''
        const updatedNotes = currentNotes.includes('[HIDDEN_FROM_DASHBOARD]')
            ? currentNotes
            : `${currentNotes}\n[HIDDEN_FROM_DASHBOARD]`.trim()

        await prisma.deposit.update({
            where: { id: depositId },
            data: {
                notes: updatedNotes
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
            console.log(`✅ Unit ${deposit.unit.code} returned to AVAILABLE after hiding deposit`)
        } else {
            console.log(`⚠️ Unit ${deposit.unit.code} has other active transactions, status unchanged`)
        }

        console.log(`✅ Deposit hidden from dashboard: ${deposit.code}`)

        return NextResponse.json({
            success: true,
            message: 'Đã ẩn đặt cọc khỏi dashboard thành công'
        })

    } catch (error) {
        console.error('Delete deposit error:', error)
        return NextResponse.json(
            { error: 'Đã xảy ra lỗi khi ẩn đặt cọc' },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}
