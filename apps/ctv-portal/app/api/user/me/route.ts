import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

// Create a new Prisma client instance for this route
const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
    try {
        // Get user phone from session storage (passed as query param or header)
        const userPhone = request.headers.get('x-user-phone')

        console.log('[API] Fetching user for phone:', userPhone)

        if (!userPhone) {
            console.log('[API] No phone provided')
            return NextResponse.json(
                { error: 'Không tìm thấy thông tin người dùng' },
                { status: 401 }
            )
        }

        // Find user by phone
        console.log('[API] Querying database...')
        const user = await prisma.user.findUnique({
            where: { phone: userPhone },
            select: {
                id: true,
                phone: true,
                email: true,
                fullName: true,
                avatar: true,
                role: true,
                isActive: true,
                totalDeals: true,
                createdAt: true,
                updatedAt: true,
                // Exclude password
            }
        })
        
        console.log('[API] User found:', user ? 'Yes' : 'No')
        if (user) {
            console.log('[API] User totalDeals:', user.totalDeals)
        }

        if (!user) {
            return NextResponse.json(
                { error: 'Người dùng không tồn tại' },
                { status: 404 }
            )
        }

        if (!user.isActive) {
            return NextResponse.json(
                { error: 'Tài khoản đã bị vô hiệu hóa' },
                { status: 403 }
            )
        }

        return NextResponse.json({
            success: true,
            user
        })

    } catch (error) {
        console.error('Get user error:', error)
        console.error('Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            name: error instanceof Error ? error.name : undefined
        })
        return NextResponse.json(
            { 
                error: 'Đã xảy ra lỗi khi lấy thông tin người dùng',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}
