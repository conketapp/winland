// Test script to verify signup API
async function testSignup() {
  const testUser = {
    userName: 'Nguyen Van Test',
    userEmail: 'test@example.com',
    userPhone: '0987654321',
    userPassword: 'Test1234',
    confirmPassword: 'Test1234'
  }

  try {
    const response = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    })

    const data = await response.json()
    console.log('Response status:', response.status)
    console.log('Response data:', data)
  } catch (error) {
    console.error('Error:', error)
  }
}

testSignup()
