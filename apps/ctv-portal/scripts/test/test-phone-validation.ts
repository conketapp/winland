import { 
  isValidVietnamesePhone, 
  getPhoneErrorMessage, 
  formatPhoneNumber,
  isMobilePhone,
  isLandlinePhone,
  getPhoneType
} from '../../lib/phone-validation'

const testPhones = [
  // Valid mobile numbers
  { phone: '0912345678', expected: true, type: 'mobile' },
  { phone: '0387654321', expected: true, type: 'mobile' },
  { phone: '0567891234', expected: true, type: 'mobile' },
  { phone: '0778889999', expected: true, type: 'mobile' },
  { phone: '0898765432', expected: true, type: 'mobile' },
  
  // Valid landline numbers
  { phone: '0212345678', expected: true, type: 'landline' },
  { phone: '02123456789', expected: true, type: 'landline' },
  
  // Invalid numbers
  { phone: '0112345678', expected: false, type: 'invalid' },
  { phone: '0412345678', expected: false, type: 'invalid' },
  { phone: '0612345678', expected: false, type: 'invalid' },
  { phone: '091234567', expected: false, type: 'invalid' },
  { phone: '09123456789', expected: false, type: 'invalid' },
  
  // With formatting
  { phone: '091 234 5678', expected: true, type: 'mobile' },
  { phone: '091-234-5678', expected: true, type: 'mobile' },
  { phone: '(091) 234-5678', expected: true, type: 'mobile' },
]

console.log('📱 Vietnamese Phone Number Validation Tests\n')
console.log('='.repeat(70))

testPhones.forEach((test, index) => {
  const isValid = isValidVietnamesePhone(test.phone)
  const errorMsg = getPhoneErrorMessage(test.phone)
  const phoneType = getPhoneType(test.phone)
  const formatted = formatPhoneNumber(test.phone)
  const isMobile = isMobilePhone(test.phone)
  const isLandline = isLandlinePhone(test.phone)
  
  console.log(`\n${index + 1}. Phone: "${test.phone}"`)
  console.log(`   Expected: ${test.expected ? '✅ Valid' : '❌ Invalid'}`)
  console.log(`   Result: ${isValid ? '✅ Valid' : '❌ Invalid'}`)
  console.log(`   Type: ${phoneType} (expected: ${test.type})`)
  console.log(`   Is Mobile: ${isMobile}`)
  console.log(`   Is Landline: ${isLandline}`)
  console.log(`   Formatted: ${formatted}`)
  
  if (errorMsg) {
    console.log(`   Error: ${errorMsg}`)
  }
  
  // Check if test passed
  const passed = isValid === test.expected && phoneType === test.type
  console.log(`   Test: ${passed ? '✅ PASSED' : '❌ FAILED'}`)
})

console.log('\n' + '='.repeat(70))

// Summary
const totalTests = testPhones.length
const passedTests = testPhones.filter(test => {
  const isValid = isValidVietnamesePhone(test.phone)
  const phoneType = getPhoneType(test.phone)
  return isValid === test.expected && phoneType === test.type
}).length

console.log(`\n📊 Summary: ${passedTests}/${totalTests} tests passed`)

if (passedTests === totalTests) {
  console.log('✅ All tests passed!')
} else {
  console.log(`❌ ${totalTests - passedTests} test(s) failed`)
}
