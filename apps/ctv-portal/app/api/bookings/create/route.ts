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
            visitDate,
            startTime,
            endTime
        } = body

        // Validate required fields
        if (!unitId || !ctvId || !customerName || !customerPhone || !customerEmail || !visitDate || !startTime || !endTime) {
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

        // Generate booking code
        const bookingCount = await prisma.booking.count()
        const bookingCode = `BK${String(bookingCount + 1).padStart(6, '0')}`

        // Calculate booking expiry: visitEndTime + 30 minutes
        const visitDateTime = new Date(`${visitDate}T${endTime}`)
        const expiresAt = new Date(visitDateTime)
        expiresAt.setMinutes(expiresAt.getMinutes() + 30)

        // Create booking
        const booking = await prisma.booking.create({
            data: {
                code: bookingCode,
                unitId,
                ctvId,
                customerName,
                customerPhone,
                customerEmail,
                customerIdCard: '', // Will be filled later
                customerAddress: '', // Will be filled later
                bookingAmount: 0, // No payment required for viewing
                paymentMethod: 'NONE',
                status: 'CONFIRMED',
                expiresAt,
                visitDate,
                visitStartTime: startTime,
                visitEndTime: endTime,
                notes: `Lịch xem nhà: ${visitDate} từ ${startTime} đến ${endTime}`,
                approvedAt: new Date()
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
            booking,
            message: 'Booking đã được tạo thành công'
        })

    } catch (error) {
        console.error('Create booking error:', error)
        return NextResponse.json(
            { error: 'Đã xảy ra lỗi khi tạo booking' },
            { status: 500 }
        )
    }
}
