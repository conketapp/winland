import { validatePassword, isPasswordValid } from '../../lib/password-validation'

interface FormState {
  userName: string
  userPhone: string
  userEmail: string
  userPassword: string
  confirmPassword: string
}

function checkFormValid(form: FormState): boolean {
  const passwordValidation = validatePassword(form.userPassword)
  
  return (
    form.userName.trim() !== '' &&
    form.userPhone.trim() !== '' &&
    form.userEmail.trim() !== '' &&
    form.userPassword !== '' &&
    form.confirmPassword !== '' &&
    isPasswordValid(passwordValidation) &&
    form.userPassword === form.confirmPassword
  )
}

const testCases: Array<{ name: string; form: FormState }> = [
  {
    name: 'Empty Form',
    form: {
      userName: '',
      userPhone: '',
      userEmail: '',
      userPassword: '',
      confirmPassword: '',
    }
  },
  {
    name: 'Weak Password',
    form: {
      userName: 'Nguyen Van A',
      userPhone: '0987654321',
      userEmail: 'test@example.com',
      userPassword: 'test123',
      confirmPassword: 'test123',
    }
  },
  {
    name: 'Passwords Don\'t Match',
    form: {
      userName: 'Nguyen Van A',
      userPhone: '0987654321',
      userEmail: 'test@example.com',
      userPassword: 'Test@123',
      confirmPassword: 'Test@456',
    }
  },
  {
    name: 'Valid Form',
    form: {
      userName: 'Nguyen Van A',
      userPhone: '0987654321',
      userEmail: 'test@example.com',
      userPassword: 'Test@123',
      confirmPassword: 'Test@123',
    }
  },
]

console.log('🔍 Form Validation Test Cases\n')
console.log('='.repeat(70))

testCases.forEach((testCase, index) => {
  const isValid = checkFormValid(testCase.form)
  const passwordValidation = validatePassword(testCase.form.userPassword)
  const passwordsMatch = testCase.form.userPassword === testCase.form.confirmPassword
  
  console.log(`\n${index + 1}. ${testCase.name}`)
  console.log('-'.repeat(70))
  console.log(`   Password Validation:`)
  console.log(`     Min 8 chars: ${passwordValidation.minLength ? '✓' : '✗'}`)
  console.log(`     Has uppercase: ${passwordValidation.hasUpperCase ? '✓' : '✗'}`)
  console.log(`     Has lowercase: ${passwordValidation.hasLowerCase ? '✓' : '✗'}`)
  console.log(`     Has special char: ${passwordValidation.hasSpecialChar ? '✓' : '✗'}`)
  console.log(`     Passwords match: ${passwordsMatch ? '✓' : '✗'}`)
  console.log(`\n   Button Status: ${isValid ? '✅ ENABLED' : '❌ DISABLED'}`)
})

console.log('\n' + '='.repeat(70))
