import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const bookingId = params.id

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
        await prisma.booking.update({
            where: { id: bookingId },
            data: {
                // Keep original status (EXPIRED or CANCELLED), just add hidden marker in notes
                notes: booking.notes 
                    ? `${booking.notes}\n[HIDDEN_FROM_DASHBOARD]`
                    : '[HIDDEN_FROM_DASHBOARD]'
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Đã ẩn booking khỏi dashboard'
        })

    } catch (error) {
        console.error('Hide booking error:', error)
        return NextResponse.json(
            { error: 'Đã xảy ra lỗi khi ẩn booking' },
            { status: 500 }
        )
    }
}
