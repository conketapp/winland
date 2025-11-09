import { validatePassword, isPasswordValid, getPasswordErrorMessage } from '../lib/password-validation'

// Test cases
const testPasswords = [
  'abc',           // Too short, no uppercase, no special char
  'abcdefgh',      // No uppercase, no special char
  'ABCDEFGH',      // No lowercase, no special char
  'Abcdefgh',      // No special char
  'Test1234',      // No special char
  'MyPassword',    // No special char
  'Test@123',      // Valid!
  'MyPass@2024',   // Valid!
  'Welcome#123',   // Valid!
  'short',         // Too short, no uppercase, no special char
  'NoLower123',    // No special char
  'nouppercase',   // No uppercase, no special char
  'Pass@word',     // Valid!
]

console.log('🔐 Password Validation Tests (with Special Characters)\n')

testPasswords.forEach(password => {
  const validation = validatePassword(password)
  const isValid = isPasswordValid(validation)
  const errorMsg = getPasswordErrorMessage(validation)
  
  console.log(`Password: "${password}"`)
  console.log(`  ✓ Min 8 chars: ${validation.minLength ? '✓' : '✗'}`)
  console.log(`  ✓ Has uppercase: ${validation.hasUpperCase ? '✓' : '✗'}`)
  console.log(`  ✓ Has lowercase: ${validation.hasLowerCase ? '✓' : '✗'}`)
  console.log(`  ✓ Has special char: ${validation.hasSpecialChar ? '✓' : '✗'}`)
  console.log(`  Result: ${isValid ? '✅ VALID' : '❌ INVALID'}`)
  if (errorMsg) {
    console.log(`  Error: ${errorMsg}`)
  }
  console.log('')
})
