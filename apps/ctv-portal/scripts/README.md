# CTV Portal Scripts

Utility scripts for managing users, testing, and diagnostics.

## 📁 Structure

```
scripts/
├── index.ts                    # Main CLI entry point
├── user/                       # User management scripts
│   ├── create-test-user.ts    # Create/update test user
│   ├── update-user-deals.ts   # Update all users with random deals
│   └── set-user-deals.ts      # Set deals for specific user
├── test/                       # Testing scripts
│   ├── test-api-direct.ts     # Test database connection
│   ├── test-password-validation.ts
│   └── test-form-validation.ts
├── utils/                      # Utility scripts
│   └── diagnose-issue.ts      # System diagnostics
└── README.md                   # This file
```

## 🚀 Quick Start

### Using the CLI (Recommended)

```bash
# Show all available commands
npx tsx scripts/index.ts help

# Create test user
npx tsx scripts/index.ts user:create

# Update all users with random deals
npx tsx scripts/index.ts user:deals

# Set deals for specific user
npx tsx scripts/index.ts user:set-deals 0912345678 25

# Test database connection
npx tsx scripts/index.ts test:db

# Test password validation
npx tsx scripts/index.ts test:password

# Run diagnostics
npx tsx scripts/index.ts diagnose
```

### Direct Script Execution

```bash
# User Management
npx tsx scripts/user/create-test-user.ts
npx tsx scripts/user/update-user-deals.ts
npx tsx scripts/user/set-user-deals.ts 0912345678 25

# Testing
npx tsx scripts/test/test-api-direct.ts
npx tsx scripts/test/test-password-validation.ts
npx tsx scripts/test/test-form-validation.ts

# Diagnostics
npx tsx scripts/utils/diagnose-issue.ts
```

## 📚 Script Details

### User Management

#### `user:create` - Create Test User
Creates or updates the default test user.

**Credentials:**
- Phone: `0912345678`
- Password: `Test@123`
- Total Deals: `25`

```bash
npx tsx scripts/index.ts user:create
```

#### `user:deals` - Update All Users
Updates all users with random totalDeals (5-50).

```bash
npx tsx scripts/index.ts user:deals
```

#### `user:set-deals` - Set User Deals
Sets totalDeals for a specific user.

```bash
npx tsx scripts/index.ts user:set-deals <phone> <deals>
# Example:
npx tsx scripts/index.ts user:set-deals 0912345678 30
```

### Testing

#### `test:db` - Test Database
Tests Prisma client and database connection.

```bash
npx tsx scripts/index.ts test:db
```

**Output:**
```json
{
  "fullName": "Test CTV User",
  "totalDeals": 25,
  ...
}
```

#### `test:password` - Test Password Validation
Tests password validation rules.

```bash
npx tsx scripts/index.ts test:password
```

**Tests:**
- Minimum 8 characters
- Uppercase letters
- Lowercase letters
- Special characters

#### `test:form` - Test Form Validation
Tests signup form validation logic.

```bash
npx tsx scripts/index.ts test:form
```

#### `test:phone` - Test Phone Validation
Tests Vietnamese phone number validation.

```bash
npx tsx scripts/index.ts test:phone
```

**Tests:**
- Mobile numbers (03x, 05x, 07x, 08x, 09x)
- Landline numbers (02x)
- Invalid formats
- Formatted numbers

### Diagnostics

#### `diagnose` - System Diagnostics
Runs comprehensive system checks.

```bash
npx tsx scripts/index.ts diagnose
```

**Checks:**
- ✅ Prisma client exists
- ✅ Database connection
- ✅ User count
- ✅ Test user data
- ✅ Schema file
- ✅ Environment variables

## 🔧 Common Tasks

### Setup New Environment

```bash
# 1. Create test user
npx tsx scripts/index.ts user:create

# 2. Test database connection
npx tsx scripts/index.ts test:db

# 3. Run diagnostics
npx tsx scripts/index.ts diagnose
```

### Troubleshooting

```bash
# Run diagnostics first
npx tsx scripts/index.ts diagnose

# If database issues, test connection
npx tsx scripts/index.ts test:db

# If user issues, recreate test user
npx tsx scripts/index.ts user:create
```

### Development Workflow

```bash
# After schema changes
npx prisma db push
npx prisma generate

# Verify changes
npx tsx scripts/index.ts test:db

# Update test data
npx tsx scripts/index.ts user:create
```

## 📝 Adding New Scripts

1. Create script in appropriate folder (`user/`, `test/`, `utils/`)
2. Add command to `index.ts`
3. Update this README

Example:

```typescript
// scripts/user/my-script.ts
import { PrismaClient } from '../../lib/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  // Your code here
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

## 🐛 Debugging

### Script Fails to Run

```bash
# Check if tsx is installed
npm list tsx

# Install if missing
npm install -D tsx
```

### Database Connection Error

```bash
# Check .env file
cat .env | grep DATABASE_URL

# Test connection
npx tsx scripts/index.ts test:db
```

### Prisma Client Error

```bash
# Regenerate client
npx prisma generate

# Test again
npx tsx scripts/index.ts test:db
```

## 📖 Related Documentation

- [Password Validation](../docs/PASSWORD-VALIDATION.md)
- [Total Deals Feature](../docs/TOTAL-DEALS-FEATURE.md)
- [User Data Integration](../docs/USER-DATA-INTEGRATION.md)
- [Troubleshooting](../docs/TROUBLESHOOT-500-ERROR.md)
