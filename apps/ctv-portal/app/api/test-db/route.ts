import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        console.log('Testing database connection...')
        
        // Test 1: Check if Prisma client is initialized
        console.log('Prisma client:', prisma ? 'OK' : 'FAILED')
        
        // Test 2: Try to count users
        const userCount = await prisma.user.count()
        console.log('User count:', userCount)
        
        // Test 3: Try to get one user with totalDeals
        const user = await prisma.user.findFirst({
            select: {
                id: true,
                fullName: true,
                phone: true,
                totalDeals: true,
            }
        })
        console.log('Sample user:', user)
        
        return NextResponse.json({
            success: true,
            message: 'Database connection OK',
            userCount,
            sampleUser: user
        })
        
    } catch (error) {
        console.error('Database test error:', error)
        return NextResponse.json(
            { 
                error: 'Database test failed',
                details: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            },
            { status: 500 }
        )
    }
}
