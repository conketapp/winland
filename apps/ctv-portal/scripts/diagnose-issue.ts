import { PrismaClient } from '../lib/generated/prisma'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function diagnose() {
  console.log('🔍 Running Diagnostics...\n')
  console.log('='.repeat(70))
  
  // Check 1: Prisma Client
  console.log('\n1️⃣ Checking Prisma Client...')
  try {
    const clientPath = path.join(__dirname, '../lib/generated/prisma/index.d.ts')
    const exists = fs.existsSync(clientPath)
    console.log(`   Prisma client exists: ${exists ? '✅' : '❌'}`)
    
    if (exists) {
      const content = fs.readFileSync(clientPath, 'utf-8')
      const hasTotalDeals = content.includes('totalDeals')
      console.log(`   Has totalDeals field: ${hasTotalDeals ? '✅' : '❌'}`)
    }
  } catch (error) {
    console.log(`   ❌ Error checking client: ${error}`)
  }
  
  // Check 2: Database Connection
  console.log('\n2️⃣ Checking Database Connection...')
  try {
    await prisma.$connect()
    console.log('   Connection: ✅')
  } catch (error) {
    console.log(`   Connection: ❌ ${error}`)
    return
  }
  
  // Check 3: User Count
  console.log('\n3️⃣ Checking Users...')
  try {
    const count = await prisma.user.count()
    console.log(`   Total users: ${count}`)
  } catch (error) {
    console.log(`   ❌ Error: ${error}`)
  }
  
  // Check 4: Test User
  console.log('\n4️⃣ Checking Test User (0912345678)...')
  try {
    const user = await prisma.user.findUnique({
      where: { phone: '0912345678' }
    })
    
    if (user) {
      console.log('   User found: ✅')
      console.log(`   Full Name: ${user.fullName}`)
      console.log(`   Phone: ${user.phone}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Active: ${user.isActive}`)
      console.log(`   Total Deals: ${(user as any).totalDeals ?? 'MISSING!'}`)
    } else {
      console.log('   User found: ❌')
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error}`)
  }
  
  // Check 5: Schema
  console.log('\n5️⃣ Checking Schema File...')
  try {
    const schemaPath = path.join(__dirname, '../prisma/schema.prisma')
    const schema = fs.readFileSync(schemaPath, 'utf-8')
    const hasTotalDeals = schema.includes('totalDeals')
    console.log(`   Schema has totalDeals: ${hasTotalDeals ? '✅' : '❌'}`)
  } catch (error) {
    console.log(`   ❌ Error: ${error}`)
  }
  
  // Check 6: Environment
  console.log('\n6️⃣ Checking Environment...')
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`)
  console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Not set'}`)
  
  console.log('\n' + '='.repeat(70))
  console.log('\n✅ Diagnostics Complete!')
  console.log('\nIf all checks pass, restart your dev server:')
  console.log('   1. Stop server (Ctrl+C)')
  console.log('   2. Remove-Item -Recurse -Force .next')
  console.log('   3. npm run dev')
  
  await prisma.$disconnect()
}

diagnose().catch(console.error)
