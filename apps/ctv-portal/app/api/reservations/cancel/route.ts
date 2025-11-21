import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { reservationId } = body

        if (!reservationId) {
            return NextResponse.json(
                { error: 'Thiếu thông tin giữ chỗ' },
                { status: 400 }
            )
        }

        // Get reservation details
        const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId },
            include: { unit: true }
        })

        if (!reservation) {
            return NextResponse.json(
                { error: 'Không tìm thấy giữ chỗ' },
                { status: 404 }
            )
        }

        // Only allow cancelling ACTIVE reservations
        if (reservation.status !== 'ACTIVE') {
            return NextResponse.json(
                { error: 'Chỉ có thể hủy giữ chỗ đang hoạt động' },
                { status: 400 }
            )
        }

        // Update reservation status to CANCELLED
        await prisma.reservation.update({
            where: { id: reservationId },
            data: {
                status: 'CANCELLED'
            }
        })

        // Return unit to AVAILABLE status only if no other active transactions
        const activeBookings = await prisma.booking.count({
            where: {
                unitId: reservation.unitId,
                status: {
                    in: ['CONFIRMED', 'PENDING_APPROVAL', 'PENDING_PAYMENT']
                }
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
            message: 'Đã hủy giữ chỗ và trả căn hộ về trạng thái có sẵn'
        })

    } catch (error) {
        console.error('Cancel reservation error:', error)
        return NextResponse.json(
            { error: 'Đã xảy ra lỗi khi hủy giữ chỗ' },
            { status: 500 }
        )
    }
}
