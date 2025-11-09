import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function main() {
    // Create a test user
    const user = await prisma.user.upsert({
        where: { phone: '0912345678' },
        update: {
            password: 'Test@123', // Updated to meet new password requirements
        },
        create: {
            phone: '0912345678',
            password: 'Test@123', // In production, use bcrypt to hash this!
            fullName: 'Test CTV User',
            email: 'testctv@winland.com',
            role: 'CTV',
            isActive: true,
        },
    })

    console.log('✅ Test user created/updated:', user)
}

main()
    .catch((e) => {
        console.error('❌ Error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
