import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function testAPI() {
    console.log('🧪 Testing Prisma Client with totalDeals\n')

    try {
        const user = await prisma.user.findUnique({
            where: { phone: '0912345678' },
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

        if (user) {
            console.log('✅ User found:')
            console.log(JSON.stringify(user, null, 2))
            console.log(`\n✅ totalDeals field: ${user.totalDeals}`)
        } else {
            console.log('❌ User not found')
        }
    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

testAPI()
