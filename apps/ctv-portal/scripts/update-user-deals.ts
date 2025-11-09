import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

// Generate random number between min and max
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function main() {
  console.log('🔄 Updating users with random totalDeals...\n')

  // Get all users
  const users = await prisma.user.findMany()

  if (users.length === 0) {
    console.log('❌ No users found in database')
    return
  }

  console.log(`📊 Found ${users.length} user(s)\n`)

  // Update each user with random totalDeals
  for (const user of users) {
    const totalDeals = randomInt(5, 50) // Random between 5 and 50 deals
    
    await prisma.user.update({
      where: { id: user.id },
      data: { totalDeals }
    })

    console.log(`✅ Updated ${user.fullName}:`)
    console.log(`   Phone: ${user.phone}`)
    console.log(`   Total Deals: ${totalDeals}`)
    console.log('')
  }

  console.log('✅ All users updated successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
