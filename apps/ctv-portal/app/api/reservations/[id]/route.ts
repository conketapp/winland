import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: reservationId } = await params

        if (!reservationId) {
            return NextResponse.json(
                { error: 'Thiếu ID giữ chỗ' },
                { status: 400 }
            )
        }

        // Check if reservation exists
        const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId }
        })

        if (!reservation) {
            return NextResponse.json(
                { error: 'Không tìm thấy giữ chỗ' },
                { status: 404 }
            )
        }

        // Only allow hiding completed, expired, missed, or cancelled reservations
        if (!['COMPLETED', 'EXPIRED', 'MISSED', 'CANCELLED'].includes(reservation.status)) {
            return NextResponse.json(
                { error: 'Chỉ có thể ẩn giữ chỗ đã hoàn thành, hết hạn, bỏ lỡ hoặc đã hủy' },
                { status: 400 }
            )
        }

        // Add hidden marker WITHOUT changing status - keep original status
        // This preserves the reservation history while hiding it from dashboard
        await prisma.reservation.update({
            where: { id: reservationId },
            data: {
                // Keep original status (COMPLETED, EXPIRED, MISSED, or CANCELLED), just add hidden marker in notes
                notes: reservation.notes 
                    ? `${reservation.notes}\n[HIDDEN_FROM_DASHBOARD]`
                    : '[HIDDEN_FROM_DASHBOARD]'
            }
        })

        // Return unit to AVAILABLE if no other active bookings/reservations/deposits
        const activeBookings = await prisma.booking.count({
            where: {
                unitId: reservation.unitId,
                status: {
                    in: ['CONFIRMED', 'PENDING_APPROVAL', 'PENDING_PAYMENT']
                },
            }
        })

        const activeReservations = await prisma.reservation.count({
            where: {
                unitId: reservation.unitId,
                status: {
                    in: ['ACTIVE', 'YOUR_TURN']
                },
                id: { not: reservationId }
            }
        })

        const activeDeposits = await prisma.deposit.count({
            where: {
                unitId: reservation.unitId,
                status: {
                    in: ['PENDING_APPROVAL', 'CONFIRMED']
                }
            }
        })

        // Only return to AVAILABLE if no active transactions exist
        if (activeBookings === 0 && activeReservations === 0 && activeDeposits === 0) {
            await prisma.unit.update({
                where: { id: reservation.unitId },
                data: { status: 'AVAILABLE' }
            })
        }

        return NextResponse.json({
            success: true,
            message: 'Đã ẩn giữ chỗ và trả căn hộ về trạng thái có sẵn'
        })

    } catch (error) {
        console.error('Hide reservation error:', error)
        return NextResponse.json(
            { error: 'Đã xảy ra lỗi khi ẩn giữ chỗ' },
            { status: 500 }
        )
    }
}
