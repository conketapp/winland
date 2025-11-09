import { PrismaClient } from '../../lib/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('👤 Creating/Updating Test User...\n')

  const user = await prisma.user.upsert({
    where: { phone: '0912345678' },
    update: {
      password: 'Test@123',
      totalDeals: 25,
    },
    create: {
      phone: '0912345678',
      password: 'Test@123',
      fullName: 'Test CTV User',
      email: 'testctv@winland.com',
      role: 'CTV',
      isActive: true,
      totalDeals: 25,
    },
  })

  console.log('✅ Test user created/updated:')
  console.log(`   ID: ${user.id}`)
  console.log(`   Name: ${user.fullName}`)
  console.log(`   Phone: ${user.phone}`)
  console.log(`   Email: ${user.email}`)
  console.log(`   Password: Test@123`)
  console.log(`   Total Deals: ${user.totalDeals}`)
  console.log(`   Role: ${user.role}`)
  console.log(`   Active: ${user.isActive}`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
