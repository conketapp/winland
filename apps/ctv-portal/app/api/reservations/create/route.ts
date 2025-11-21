import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            unitId,
            ctvId,
            customerName,
            customerPhone,
            customerEmail,
            reservationDays = 7 // Default 7 days reservation period
        } = body

        // Validate required fields
        if (!unitId || !ctvId || !customerName || !customerPhone) {
            return NextResponse.json(
                { error: 'Thiếu thông tin bắt buộc' },
                { status: 400 }
            )
        }

        // Check if unit exists and is available
        const unit = await prisma.unit.findUnique({
            where: { id: unitId },
            include: {
                project: true
            }
        })

        if (!unit) {
            return NextResponse.json(
                { error: 'Không tìm thấy căn hộ' },
                { status: 404 }
            )
        }

        if (unit.status !== 'AVAILABLE') {
            return NextResponse.json(
                { error: 'Căn hộ không còn trống' },
                { status: 400 }
            )
        }

        // Generate reservation code
        const reservationCount = await prisma.reservation.count()
        const reservationCode = `RS${String(reservationCount + 1).padStart(6, '0')}`

        // Calculate reservation expiry (default 7 days from now)
        const now = new Date()
        const reservedUntil = new Date(now)
        reservedUntil.setDate(reservedUntil.getDate() + reservationDays)

        // Create reservation
        const reservation = await prisma.reservation.create({
            data: {
                code: reservationCode,
                unitId,
                ctvId,
                customerName,
                customerPhone,
                customerEmail: customerEmail || null,
                status: 'ACTIVE',
                priority: 0,
                reservedUntil,
                extendCount: 0,
                notes: `Giữ chỗ ${reservationDays} ngày`
            },
            include: {
                unit: {
                    include: {
                        project: true,
                        building: true
                    }
                },
                ctv: true
            }
        })

        // Update unit status to RESERVED_BOOKING
        await prisma.unit.update({
            where: { id: unitId },
            data: { status: 'RESERVED_BOOKING' }
        })

        return NextResponse.json({
            success: true,
            reservation,
            message: 'Giữ chỗ đã được tạo thành công'
        })

    } catch (error) {
        console.error('Create reservation error:', error)
        return NextResponse.json(
            { error: 'Đã xảy ra lỗi khi tạo giữ chỗ' },
            { status: 500 }
        )
    }
}
