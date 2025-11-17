import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { bookingId } = body

        if (!bookingId) {
            return NextResponse.json(
                { error: 'Thiếu thông tin booking' },
                { status: 400 }
            )
        }

        // Get booking details
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { unit: true }
        })

        if (!booking) {
            return NextResponse.json(
                { error: 'Không tìm thấy booking' },
                { status: 404 }
            )
        }

        // Only allow cancelling CONFIRMED bookings
        if (booking.status !== 'CONFIRMED') {
            return NextResponse.json(
                { error: 'Chỉ có thể hủy booking đã xác nhận' },
                { status: 400 }
            )
        }

        // Update booking status to CANCELLED
        await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: 'CANCELLED',
                cancelledReason: 'Đã hủy bởi CTV'
            }
        })

        // Return unit to AVAILABLE status
        await prisma.unit.update({
            where: { id: booking.unitId },
            data: { status: 'AVAILABLE' }
        })

        return NextResponse.json({
            success: true,
            message: 'Đã hủy booking và trả căn hộ về trạng thái có sẵn'
        })

    } catch (error) {
        console.error('Cancel booking error:', error)
        return NextResponse.json(
            { error: 'Đã xảy ra lỗi khi hủy booking' },
            { status: 500 }
        )
    }
}
