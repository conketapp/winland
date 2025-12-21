import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'
import { logger } from '@/lib/logger'

// Create a new Prisma client instance for this route
const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
    try {
        // Get user phone from session storage (passed as query param or header)
        const userPhone = request.headers.get('x-user-phone')

        logger.debug('[API] Fetching user', { phone: userPhone ? '***' : 'none' })

        if (!userPhone) {
            logger.warn('[API] No phone provided')
            return NextResponse.json(
                { error: 'Không tìm thấy thông tin người dùng' },
                { status: 401 }
            )
        }

        // Find user by phone (exclude soft-deleted users)
        logger.debug('[API] Querying database')
        const user = await prisma.user.findFirst({
            where: { 
                phone: userPhone,
                deletedAt: null // Exclude soft-deleted users
            },
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
        
        logger.debug('[API] User query result', { found: !!user, totalDeals: user?.totalDeals })

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

        return NextResponse.json(user)

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

export async function PUT(request: NextRequest) {
    try {
        // Get user phone from session storage
        const userPhone = request.headers.get('x-user-phone')

        if (!userPhone) {
            return NextResponse.json(
                { error: 'Không tìm thấy thông tin người dùng' },
                { status: 401 }
            )
        }

        // Parse request body
        const body = await request.json()
        const { fullName, email, avatar } = body

        // Debug logging (only in development)
        logger.debug('[API PUT /user/me] Update request received', {
            phone: userPhone ? '***' : 'none',
            fields: {
                hasFullName: !!fullName,
                hasEmail: !!email,
                hasAvatar: !!avatar
            }
        })

        // Find user first (exclude soft-deleted users)
        const existingUser = await prisma.user.findFirst({
            where: { 
                phone: userPhone,
                deletedAt: null // Exclude soft-deleted users
            }
        })

        if (!existingUser) {
            logger.warn('[API] User not found')
            return NextResponse.json(
                { error: 'Người dùng không tồn tại' },
                { status: 404 }
            )
        }

        // Prepare update data
        const updateData = {
            fullName: fullName !== undefined ? fullName : existingUser.fullName,
            email: email !== undefined ? email : existingUser.email,
            avatar: avatar !== undefined ? avatar : existingUser.avatar,
        }

        logger.debug('[API] Updating user', {
            hasAvatar: !!updateData.avatar,
            hasEmail: !!updateData.email,
            hasFullName: !!updateData.fullName
        })

        // Update user
        const updatedUser = await prisma.user.update({
            where: { phone: userPhone },
            data: updateData,
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
            }
        })

        logger.info('[API] User updated successfully')

        return NextResponse.json(updatedUser)

    } catch (error) {
        console.error('[API] Update user error:', error)
        if (process.env.NODE_ENV === 'development') {
            console.error('[API] Error details:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
            })
        }
        return NextResponse.json(
            { 
                error: 'Đã xảy ra lỗi khi cập nhật thông tin người dùng',
                details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}
