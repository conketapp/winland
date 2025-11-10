import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('Signup API called')
    const { userName, userEmail, userPhone, userPassword, confirmPassword } = await request.json()
    console.log('Request data:', { userName, userEmail, userPhone, hasPassword: !!userPassword })

    // Validate input
    if (!userName || !userPhone || !userPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'Vui lòng điền đầy đủ thông tin bắt buộc' },
        { status: 400 }
      )
    }

    // Check if passwords match
    if (userPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'Mật khẩu xác nhận không khớp' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (userPassword.length < 8) {
      return NextResponse.json(
        { error: 'Mật khẩu phải có ít nhất 8 ký tự' },
        { status: 400 }
      )
    }

    // Check if password has uppercase and lowercase
    if (!/[a-z]/.test(userPassword) || !/[A-Z]/.test(userPassword)) {
      return NextResponse.json(
        { error: 'Mật khẩu phải có chữ hoa và chữ thường' },
        { status: 400 }
      )
    }

    // Check if password has special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(userPassword)) {
      return NextResponse.json(
        { error: 'Mật khẩu phải có ít nhất một ký tự đặc biệt' },
        { status: 400 }
      )
    }

    // Check if phone already exists
    console.log('Checking if phone exists:', userPhone)
    const existingUserByPhone = await prisma.user.findUnique({
      where: { phone: userPhone }
    })
    console.log('Existing user by phone:', existingUserByPhone)

    if (existingUserByPhone) {
      return NextResponse.json(
        { error: 'Số điện thoại đã được đăng ký' },
        { status: 409 }
      )
    }

    // Check if email already exists (if provided)
    if (userEmail) {
      console.log('Checking if email exists:', userEmail)
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email: userEmail }
      })
      console.log('Existing user by email:', existingUserByEmail)

      if (existingUserByEmail) {
        return NextResponse.json(
          { error: 'Email đã được đăng ký' },
          { status: 409 }
        )
      }
    }

    // TODO: In production, use bcrypt to hash the password
    // const hashedPassword = await bcrypt.hash(userPassword, 10)

    // Generate random totalDeals for new user (between 0 and 10)
    const randomDeals = Math.floor(Math.random() * 11)

    // Create new user
    console.log('Creating new user with data:', {
      phone: userPhone,
      email: userEmail || null,
      fullName: userName,
      role: 'CTV',
      totalDeals: randomDeals
    })
    const newUser = await prisma.user.create({
      data: {
        phone: userPhone,
        email: userEmail || null,
        password: userPassword, // In production, use hashedPassword
        fullName: userName,
        role: 'CTV',
        isActive: true,
        totalDeals: randomDeals,
      }
    })
    console.log('User created successfully:', newUser.id)

    // Return user data (exclude password)
    const { password, ...userWithoutPassword } = newUser

    return NextResponse.json({
      success: true,
      message: 'Đăng ký thành công!',
      user: userWithoutPassword
    }, { status: 201 })

  } catch (error) {
    console.error('Signup error:', error)
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return NextResponse.json(
      { 
        error: 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
