import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
    try {
        // Get all projects with their buildings, floors, and units
        const projects = await prisma.project.findMany({
            where: {
                status: 'OPEN' // Only show open projects
            },
            include: {
                buildings: {
                    include: {
                        floorsData: {
                            include: {
                                units: {
                                    include: {
                                        reservations: {
                                            where: {
                                                status: 'ACTIVE'
                                            },
                                            take: 1
                                        },
                                        bookings: {
                                            where: {
                                                status: {
                                                    // Include EXPIRED bookings so they show as blue "Đang có booking"
                                                    // until user clicks Trash button
                                                    in: ['PENDING_APPROVAL', 'CONFIRMED', 'PENDING_PAYMENT', 'EXPIRED']
                                                }
                                            },
                                            take: 1
                                        }
                                    },
                                    orderBy: {
                                        unitNumber: 'asc'
                                    }
                                }
                            },
                            orderBy: {
                                number: 'asc'
                            }
                        },
                        units: {
                            include: {
                                reservations: {
                                    where: {
                                        status: 'ACTIVE'
                                    },
                                    take: 1
                                },
                                bookings: {
                                    where: {
                                        status: {
                                            // Include EXPIRED bookings so they show as blue "Đang có booking"
                                            // until user clicks Trash button
                                            in: ['PENDING_APPROVAL', 'CONFIRMED', 'PENDING_PAYMENT', 'EXPIRED']
                                        }
                                    },
                                    take: 1
                                }
                            },
                            orderBy: {
                                unitNumber: 'asc'
                            }
                        }
                    },
                    orderBy: {
                        code: 'asc'
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(projects)

    } catch (error) {
        console.error('Get projects error:', error)
        return NextResponse.json(
            { error: 'Đã xảy ra lỗi khi lấy danh sách dự án' },
            { status: 500 }
        )
    }
}
