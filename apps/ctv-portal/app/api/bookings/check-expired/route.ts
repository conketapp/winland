import { NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

export async function POST() {
    try {
        const now = new Date()

        // Find all confirmed bookings where expiresAt has passed
        // Only check CONFIRMED bookings (not COMPLETED or already EXPIRED)
        const expiredBookings = await prisma.booking.findMany({
            where: {
                status: 'CONFIRMED',
                expiresAt: {
                    lte: now // Expired if expiresAt is in the past
                }
            },
            include: {
                unit: true
            }
        })

        // Update expired bookings
        const updatePromises = expiredBookings.map(async (booking) => {
            // Update booking status to EXPIRED with reason
            // Unit stays in RESERVED_BOOKING status until user clicks Trash button
            // This preserves the booking history and allows user to manually clean up
            await prisma.booking.update({
                where: { id: booking.id },
                data: { 
                    status: 'EXPIRED',
                    cancelledReason: 'Đã qua thời gian booking'
                }
            })

            // Note: Unit status is NOT changed here
            // Unit will return to AVAILABLE only when user clicks Trash button (DELETE endpoint)
            // This ensures booking history is preserved and user has control over cleanup

            return booking
        })

        const expiredResults = await Promise.all(updatePromises)

        return NextResponse.json({
            success: true,
            expiredCount: expiredResults.length,
            expiredBookings: expiredResults.map(b => b.code)
        })

    } catch (error) {
        console.error('Check expired bookings error:', error)
        return NextResponse.json(
            { error: 'Đã xảy ra lỗi khi kiểm tra booking hết hạn' },
            { status: 500 }
        )
    }
}
