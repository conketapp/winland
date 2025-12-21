import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: bookingId } = await params

        if (!bookingId) {
            return NextResponse.json(
                { error: 'Thiếu ID booking' },
                { status: 400 }
            )
        }

        // Check if booking exists and is completed (EXPIRED)
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId }
        })

        if (!booking) {
            return NextResponse.json(
                { error: 'Không tìm thấy booking' },
                { status: 404 }
            )
        }

        // Only allow hiding completed, expired or cancelled bookings
        if (booking.status !== 'COMPLETED' && booking.status !== 'EXPIRED' && booking.status !== 'CANCELLED') {
            return NextResponse.json(
                { error: 'Chỉ có thể ẩn booking đã hoàn thành, hết hạn hoặc đã hủy' },
                { status: 400 }
            )
        }

        // Add hidden marker WITHOUT changing status - keep original status
        // This preserves the booking history while hiding it from dashboard
        await prisma.booking.update({
            where: { id: bookingId },
            data: {
                // Keep original status (EXPIRED, COMPLETED, or CANCELLED), just add hidden marker in notes
                notes: booking.notes 
                    ? `${booking.notes}\n[HIDDEN_FROM_DASHBOARD]`
                    : '[HIDDEN_FROM_DASHBOARD]'
            }
        })

        // Return unit to AVAILABLE if no other active bookings/reservations/deposits
        const activeBookings = await prisma.booking.count({
            where: {
                unitId: booking.unitId,
                status: {
                    in: ['CONFIRMED', 'PENDING_APPROVAL', 'PENDING_PAYMENT']
                },
                id: { not: bookingId }
            }
        })

        const activeReservations = await prisma.reservation.count({
            where: {
                unitId: booking.unitId,
                status: {
                    in: ['ACTIVE', 'YOUR_TURN']
                }
            }
        })

        const activeDeposits = await prisma.deposit.count({
            where: {
                unitId: booking.unitId,
                status: {
                    in: ['PENDING_APPROVAL', 'CONFIRMED']
                }
            }
        })

        // Only return to AVAILABLE if no active transactions exist
        if (activeBookings === 0 && activeReservations === 0 && activeDeposits === 0) {
            await prisma.unit.update({
                where: { id: booking.unitId },
                data: { status: 'AVAILABLE' }
            })
        }

        return NextResponse.json({
            success: true,
            message: 'Đã ẩn booking và trả căn hộ về trạng thái có sẵn'
        })

    } catch (error) {
        console.error('Hide booking error:', error)
        return NextResponse.json(
            { error: 'Đã xảy ra lỗi khi ẩn booking' },
            { status: 500 }
        )
    }
}
