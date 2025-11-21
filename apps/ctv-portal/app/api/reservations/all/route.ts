import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
    try {
        const userPhone = request.headers.get('x-user-phone')

        if (!userPhone) {
            return NextResponse.json(
                { error: 'Không tìm thấy thông tin người dùng' },
                { status: 401 }
            )
        }

        // Verify user exists
        const user = await prisma.user.findUnique({
            where: { phone: userPhone }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Người dùng không tồn tại' },
                { status: 404 }
            )
        }

        // Get ALL reservations (not filtered by user)
        const reservations = await prisma.reservation.findMany({
            include: {
                ctv: {
                    select: {
                        fullName: true,
                        phone: true,
                        email: true
                    }
                },
                unit: {
                    include: {
                        project: {
                            select: {
                                name: true,
                                code: true
                            }
                        },
                        building: {
                            select: {
                                name: true,
                                code: true
                            }
                        },
                        floor: {
                            select: {
                                number: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 100 // Limit to last 100 reservations
        })

        return NextResponse.json(reservations)

    } catch (error) {
        console.error('Get all reservations error:', error)
        return NextResponse.json(
            { error: 'Đã xảy ra lỗi khi lấy danh sách giữ chỗ' },
            { status: 500 }
        )
    }
}
