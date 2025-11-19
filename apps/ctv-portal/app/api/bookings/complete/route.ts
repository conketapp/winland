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

        // Update booking status to COMPLETED
        // Using raw query as fallback if enum not updated
        try {
            await prisma.booking.update({
                where: { id: bookingId },
                data: {
                    status: 'COMPLETED',
                    cancelledReason: 'Đã hoàn thành xem nhà'
                }
            })
        } catch (enumError: any) {
            // If COMPLETED enum not available, use raw query
            if (enumError.code === 'P2000' || enumError.message?.includes('COMPLETED')) {
                await prisma.$executeRaw`
                    UPDATE "Booking" 
                    SET status = 'COMPLETED', cancelled_reason = 'Đã hoàn thành xem nhà'
                    WHERE id = ${bookingId}
                `
            } else {
                throw enumError
            }
        }

        // Return unit to AVAILABLE status
        await prisma.unit.update({
            where: { id: booking.unitId },
            data: { status: 'AVAILABLE' }
        })

        return NextResponse.json({
            success: true,
            message: 'Đã kết thúc booking và trả căn hộ về trạng thái có sẵn'
        })

    } catch (error: any) {
        console.error('Complete booking error:', error)
        return NextResponse.json(
            { 
                error: 'Đã xảy ra lỗi khi kết thúc booking',
                details: error.message || 'Unknown error'
            },
            { status: 500 }
        )
    }
}
