import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userPhone, userPassword } = await request.json()

    // Validate input
    if (!userPhone || !userPassword) {
      return NextResponse.json(
        { error: 'Số điện thoại và mật khẩu là bắt buộc' },
        { status: 400 }
      )
    }

    // Find user by phone
    const user = await prisma.user.findUnique({
      where: { phone: userPhone }
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

    // TODO: In production, use bcrypt to compare hashed passwords
    // const isPasswordValid = await bcrypt.compare(userPassword, user.password)
    
    // For now, direct comparison (NOT SECURE - use bcrypt in production!)
    if (user.password !== userPassword) {
      return NextResponse.json(
        { error: 'Số điện thoại hoặc mật khẩu không đúng' },
        { status: 401 }
      )
    }

    // Return user data (exclude password)
    const { password, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi đăng nhập' },
      { status: 500 }
    )
  }
}
