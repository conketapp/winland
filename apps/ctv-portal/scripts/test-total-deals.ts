/**
 * Test Total Deals Feature
 * Verifies that totalDeals is returned from the API
 */

async function testTotalDeals() {
  const testPhone = '0912345678'
  
  console.log('🧪 Testing Total Deals Feature\n')
  console.log('=' .repeat(70))
  
  try {
    console.log(`\n📞 Fetching user data for phone: ${testPhone}`)
    
    const response = await fetch('http://localhost:3000/api/user/me', {
      headers: {
        'x-user-phone': testPhone
      }
    })

    const data = await response.json()
    
    if (data.success && data.user) {
      console.log(`\n✅ User Data Retrieved Successfully:`)
      console.log(`   Full Name: ${data.user.fullName}`)
      console.log(`   Phone: ${data.user.phone}`)
      console.log(`   Role: ${data.user.role}`)
      console.log(`   📊 Total Deals: ${data.user.totalDeals}`)
      
      if (data.user.totalDeals !== undefined) {
        console.log(`\n✅ totalDeals field is present!`)
        console.log(`   Value: ${data.user.totalDeals}`)
        console.log(`   Type: ${typeof data.user.totalDeals}`)
      } else {
        console.log(`\n❌ totalDeals field is missing!`)
      }
    } else {
      console.log(`\n❌ Failed to retrieve user data`)
      console.log(data)
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error)
  }
  
  console.log('\n' + '='.repeat(70))
}

// Note: This test requires the dev server to be running
console.log('⚠️  Make sure the dev server is running: npm run dev')
console.log('⚠️  Then run this test\n')

testTotalDeals()
