import { PrismaClient } from '../../lib/generated/prisma'

const prisma = new PrismaClient()

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function main() {
  console.log('🔄 Updating users with random totalDeals...\n')

  const users = await prisma.user.findMany()

  if (users.length === 0) {
    console.log('❌ No users found in database')
    return
  }

  console.log(`📊 Found ${users.length} user(s)\n`)

  for (const user of users) {
    const totalDeals = randomInt(5, 50)
    
    await prisma.user.update({
      where: { id: user.id },
      data: { totalDeals }
    })

    console.log(`✅ ${user.fullName}: ${totalDeals} deals`)
  }

  console.log('\n✅ All users updated successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
