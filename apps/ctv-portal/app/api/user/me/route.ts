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
                gender: true,
                address: true,
                birthday: true,
                cifNumber: true,
                sector: true,
                workingPlace: true,
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
        const { fullName, email, avatar, gender, address, birthday, workingPlace } = body

        // Debug logging (only in development)
        if (process.env.NODE_ENV === 'development') {
            console.log('[API PUT /user/me] Update request received')
            console.log('[API] User phone:', userPhone)
            console.log('[API] Request body:', {
                fullName,
                email,
                gender,
                address,
                birthday,
                avatar: avatar ? `${avatar.substring(0, 50)}...` : null,
            })
        }

        // Find user first
        const existingUser = await prisma.user.findUnique({
            where: { phone: userPhone }
        })

        if (!existingUser) {
            if (process.env.NODE_ENV === 'development') {
                console.log('[API] User not found:', userPhone)
            }
            return NextResponse.json(
                { error: 'Người dùng không tồn tại' },
                { status: 404 }
            )
        }

        // Generate CIF Number if user doesn't have one
        let cifNumber = existingUser.cifNumber;
        if (!cifNumber) {
            const now = new Date();
            const year = now.getFullYear().toString().slice(-2);
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const hour = String(now.getHours()).padStart(2, '0');
            const minute = String(now.getMinutes()).padStart(2, '0');
            const second = String(now.getSeconds()).padStart(2, '0');
            cifNumber = `${year}${month}${hour}${minute}${second}`;
        }

        // Auto-set sector based on role
        const sector = existingUser.role === 'CTV' ? 'Cộng Tác Viên' : existingUser.sector;

        // Prepare update data
        const updateData = {
            fullName: fullName !== undefined ? fullName : existingUser.fullName,
            email: email !== undefined ? email : existingUser.email,
            avatar: avatar !== undefined ? avatar : existingUser.avatar,
            gender: gender !== undefined ? gender : existingUser.gender,
            address: address !== undefined ? address : existingUser.address,
            birthday: birthday !== undefined ? (birthday ? new Date(birthday) : null) : existingUser.birthday,
            cifNumber: cifNumber,
            sector: sector,
            workingPlace: workingPlace !== undefined ? workingPlace : existingUser.workingPlace,
        }

        if (process.env.NODE_ENV === 'development') {
            console.log('[API] Updating user with data:', {
                ...updateData,
                avatar: updateData.avatar ? `${updateData.avatar.substring(0, 50)}...` : null,
            })
        }

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
                gender: true,
                address: true,
                birthday: true,
                cifNumber: true,
                sector: true,
                workingPlace: true,
                role: true,
                isActive: true,
                totalDeals: true,
                createdAt: true,
                updatedAt: true,
            }
        })

        if (process.env.NODE_ENV === 'development') {
            console.log('[API] User updated successfully:', {
                id: updatedUser.id,
                fullName: updatedUser.fullName,
                email: updatedUser.email,
                gender: updatedUser.gender,
                address: updatedUser.address,
                birthday: updatedUser.birthday,
            })
        }

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
