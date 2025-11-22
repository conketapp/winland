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
            customerIdCard,
            customerAddress,
            depositAmount,
            depositPercentage
        } = body

        // Validate required fields
        if (!unitId || !ctvId || !customerName || !customerPhone || !customerIdCard || !customerAddress) {
            return NextResponse.json(
                { error: 'Thiếu thông tin bắt buộc' },
                { status: 400 }
            )
        }

        // Check if unit exists and get its details
        const unit = await prisma.unit.findUnique({
            where: { id: unitId },
            include: {
                project: true,
                building: true
            }
        })

        if (!unit) {
            return NextResponse.json(
                { error: 'Không tìm thấy căn hộ' },
                { status: 404 }
            )
        }

        // Check if unit is available for deposit
        if (unit.status === 'SOLD') {
            return NextResponse.json(
                { error: 'Căn hộ đã được bán' },
                { status: 400 }
            )
        }

        // Generate sequential deposit code
        const depositCount = await prisma.deposit.count()
        const depositCode = `DP${String(depositCount + 1).padStart(6, '0')}`

        // Calculate deposit amount if not provided
        const finalDepositAmount = depositAmount || unit.price * 0.1
        const finalDepositPercentage = depositPercentage || 10

        // Create deposit record
        const deposit = await prisma.deposit.create({
            data: {
                code: depositCode,
                unitId,
                ctvId,
                customerName,
                customerPhone,
                customerEmail,
                customerIdCard,
                customerAddress,
                depositAmount: finalDepositAmount,
                depositPercentage: finalDepositPercentage,
                depositDate: new Date(),
                status: 'PENDING_APPROVAL',
                paymentMethod: 'BANK_TRANSFER',
                notes: `Đặt cọc căn hộ ${unit.code} - ${unit.project?.name || 'N/A'}`
            },
            include: {
                unit: {
                    select: {
                        code: true,
                        unitNumber: true,
                        price: true,
                        area: true
                    }
                },
                ctv: {
                    select: {
                        fullName: true,
                        phone: true,
                        email: true
                    }
                }
            }
        })

        // Update unit status to DEPOSITED
        await prisma.unit.update({
            where: { id: unitId },
            data: { status: 'DEPOSITED' }
        })

        console.log(`✅ Deposit created: ${depositCode} for unit ${unit.code}`)

        return NextResponse.json({
            success: true,
            deposit,
            message: 'Đặt cọc đã được tạo thành công'
        })

    } catch (error) {
        console.error('Create deposit error:', error)
        return NextResponse.json(
            { error: 'Đã xảy ra lỗi khi tạo đặt cọc' },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}
