/**
 * Test User API
 * Tests fetching user data from the database
 */

async function testUserAPI() {
    const testPhone = '0912345678'

    console.log('🧪 Testing User API\n')
    console.log('='.repeat(70))

    try {
        console.log(`\n📞 Fetching user data for phone: ${testPhone}`)

        const response = await fetch('http://localhost:3000/api/user/me', {
            headers: {
                'x-user-phone': testPhone
            }
        })

        const data = await response.json()

        console.log(`\n📊 Response Status: ${response.status}`)
        console.log(`📊 Response Data:`)
        console.log(JSON.stringify(data, null, 2))

        if (data.success && data.user) {
            console.log(`\n✅ User Data Retrieved Successfully:`)
            console.log(`   ID: ${data.user.id}`)
            console.log(`   Full Name: ${data.user.fullName}`)
            console.log(`   Phone: ${data.user.phone}`)
            console.log(`   Email: ${data.user.email}`)
            console.log(`   Role: ${data.user.role}`)
            console.log(`   Active: ${data.user.isActive}`)
        } else {
            console.log(`\n❌ Failed to retrieve user data`)
        }

    } catch (error) {
        console.error('\n❌ Error:', error)
    }

    console.log('\n' + '='.repeat(70))
}

// Note: This test requires the dev server to be running
console.log('⚠️  Make sure the dev server is running: npm run dev')
console.log('⚠️  Then run this test\n')

testUserAPI()
