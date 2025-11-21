import { NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

export async function POST() {
    try {
        const now = new Date()

        // Find all ACTIVE reservations where reserved until time has passed
        const expiredReservations = await prisma.reservation.findMany({
            where: {
                status: 'ACTIVE',
                reservedUntil: {
                    lt: now // Reserved until time is less than now
                }
            },
            include: {
                unit: true
            }
        })

        // Update expired reservations
        const updatePromises = expiredReservations.map(async (reservation) => {
            // Update reservation status to EXPIRED with reason
            // Unit stays in RESERVED_BOOKING status until user clicks Trash button
            // This preserves the reservation history and allows user to manually clean up
            await prisma.reservation.update({
                where: { id: reservation.id },
                data: { 
                    status: 'EXPIRED',
                    cancelledReason: 'Đã qua thời gian giữ chỗ'
                }
            })

            // Note: Unit status is NOT changed here
            // Unit will return to AVAILABLE only when user clicks Trash button (DELETE endpoint)
            // This ensures reservation history is preserved and user has control over cleanup

            return reservation
        })

        const expiredResults = await Promise.all(updatePromises)

        return NextResponse.json({
            success: true,
            expiredCount: expiredResults.length,
            expiredReservations: expiredResults.map(r => r.code)
        })

    } catch (error) {
        console.error('Check expired reservations error:', error)
        return NextResponse.json(
            { error: 'Đã xảy ra lỗi khi kiểm tra giữ chỗ hết hạn' },
            { status: 500 }
        )
    }
}
