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
        // Business rule:
        // - Chỉ cho phép tạo deposit khi unit đang AVAILABLE trong CTV portal
        // - Nếu unit đã DEPOSITED hoặc SOLD → chặn
        if (unit.status !== 'AVAILABLE') {
        if (unit.status === 'SOLD') {
            return NextResponse.json(
                { error: 'Căn hộ đã được bán' },
                { status: 400 }
                )
            }

            if (unit.status === 'DEPOSITED') {
                return NextResponse.json(
                    { error: 'Căn hộ đã được đặt cọc' },
                    { status: 400 }
                )
            }

            return NextResponse.json(
                { error: 'Căn hộ không còn ở trạng thái AVAILABLE, không thể đặt cọc' },
                { status: 400 }
            )
        }

        // Ensure there is no other active deposit for this unit
        const existingActiveDeposit = await prisma.deposit.findFirst({
            where: {
                unitId,
                status: {
                    in: ['PENDING_APPROVAL', 'CONFIRMED']
                }
            }
        })

        if (existingActiveDeposit) {
            return NextResponse.json(
                { error: 'Căn hộ đã có phiếu đặt cọc đang hoạt động' },
                { status: 409 }
            )
        }

        // Generate sequential deposit code
        const depositCount = await prisma.deposit.count()
        const depositCode = `DP${String(depositCount + 1).padStart(6, '0')}`

        // Calculate minimum deposit (config: min 5% - làm tròn lên)
        const minPercentage = depositPercentage || 5
        const minDepositAmount = Math.ceil(unit.price * (minPercentage / 100))

        // If client gửi depositAmount thấp hơn min → lỗi
        if (depositAmount && depositAmount < minDepositAmount) {
            return NextResponse.json(
                { error: `Số tiền cọc tối thiểu là ${minDepositAmount.toLocaleString('vi-VN')} VNĐ (${minPercentage}% giá căn)` },
                { status: 400 }
            )
        }

        // Final deposit amount & percentage
        const finalDepositAmount = depositAmount || minDepositAmount
        const finalDepositPercentage = depositPercentage ?? (finalDepositAmount / unit.price * 100)

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

        if (process.env.NODE_ENV !== 'production') {
        console.log(`✅ Deposit created: ${depositCode} for unit ${unit.code}`)
        }

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
