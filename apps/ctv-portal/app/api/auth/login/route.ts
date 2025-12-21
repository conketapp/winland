import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'

import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userPhone, userPassword } = await request.json()
    // Only log basic payload info in non-production for debugging
    if (process.env.NODE_ENV !== 'production') {
      // Không log password, chỉ log thông tin tối thiểu để debug
      console.log('CTV login payload:', {
        userPhone,
        hasPassword: Boolean(userPassword),
      })
    }

    // Validate input
    if (!userPhone || !userPassword) {
      return NextResponse.json(
        { error: 'Số điện thoại và mật khẩu là bắt buộc' },
        { status: 400 }
      )
    }

    // Find user by phone (exclude soft-deleted)
    const user = await prisma.user.findFirst({
      where: { 
        phone: userPhone,
        deletedAt: null, // Exclude soft-deleted users
      },
      select: {
        id: true,
        phone: true,
        email: true,
        password: true,
        fullName: true,
        avatar: true,
        role: true,
        isActive: true,
        totalDeals: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: 'Số điện thoại hoặc mật khẩu không đúng' },
        { status: 401 }
      )
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Tài khoản đã bị vô hiệu hóa' },
        { status: 403 }
      )
    }

    const isHashedPassword = user.password.startsWith('$2')
    const isPasswordValid = isHashedPassword
      ? await bcrypt.compare(userPassword, user.password)
      : user.password === userPassword

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Số điện thoại hoặc mật khẩu không đúng' },
        { status: 401 }
      )
    }

    // Return user data (exclude password)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    })

  } catch (error: unknown) {
    console.error('Login error:', error)
    
    // Better error logging for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : ''
    
    const errorName = error instanceof Error ? error.name : 'Error'
    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
      name: errorName,
    })
    
    // Return more detailed error in development
    const isDevelopment = process.env.NODE_ENV !== 'production'
    
    return NextResponse.json(
      { 
        error: 'Đã xảy ra lỗi khi đăng nhập',
        ...(isDevelopment && { 
          details: errorMessage,
          hint: 'Check server logs for more information'
        })
      },
      { status: 500 }
    )
  }
}
