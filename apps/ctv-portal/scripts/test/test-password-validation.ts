import { validatePassword, isPasswordValid, getPasswordErrorMessage } from '../../lib/password-validation'

const testPasswords = [
  'abc',
  'abcdefgh',
  'ABCDEFGH',
  'Abcdefgh',
  'Test1234',
  'Test@123',
  'MyPass@2024',
  'Welcome#123',
  'Pass@word',
]

console.log('🔐 Password Validation Tests\n')
console.log('='.repeat(70))

testPasswords.forEach(password => {
  const validation = validatePassword(password)
  const isValid = isPasswordValid(validation)
  const errorMsg = getPasswordErrorMessage(validation)
  
  console.log(`\nPassword: "${password}"`)
  console.log(`  Min 8 chars: ${validation.minLength ? '✓' : '✗'}`)
  console.log(`  Has uppercase: ${validation.hasUpperCase ? '✓' : '✗'}`)
  console.log(`  Has lowercase: ${validation.hasLowerCase ? '✓' : '✗'}`)
  console.log(`  Has special char: ${validation.hasSpecialChar ? '✓' : '✗'}`)
  console.log(`  Result: ${isValid ? '✅ VALID' : '❌ INVALID'}`)
  if (errorMsg) {
    console.log(`  Error: ${errorMsg}`)
  }
})

console.log('\n' + '='.repeat(70))
