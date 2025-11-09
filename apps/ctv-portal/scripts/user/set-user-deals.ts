import { PrismaClient } from '../../lib/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length < 2) {
    console.log('❌ Usage: npx tsx scripts/user/set-user-deals.ts <phone> <totalDeals>')
    console.log('   Example: npx tsx scripts/user/set-user-deals.ts 0912345678 25')
    process.exit(1)
  }

  const [phone, dealsStr] = args
  const totalDeals = parseInt(dealsStr)

  if (isNaN(totalDeals)) {
    console.log('❌ Error: totalDeals must be a number')
    process.exit(1)
  }

  console.log(`🔄 Setting totalDeals for user ${phone}...\n`)

  const user = await prisma.user.findUnique({ where: { phone } })

  if (!user) {
    console.log(`❌ User with phone ${phone} not found`)
    process.exit(1)
  }

  const updatedUser = await prisma.user.update({
    where: { phone },
    data: { totalDeals }
  })

  console.log('✅ User updated successfully!')
  console.log(`   Name: ${updatedUser.fullName}`)
  console.log(`   Phone: ${updatedUser.phone}`)
  console.log(`   Old Total Deals: ${user.totalDeals}`)
  console.log(`   New Total Deals: ${updatedUser.totalDeals}`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
