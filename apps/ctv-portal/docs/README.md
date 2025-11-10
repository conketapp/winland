# CTV Portal Documentation

Complete documentation for the CTV Portal application.

## 📚 Table of Contents

### 🚀 Getting Started
- [Quick Start Guide](#quick-start-guide)
- [Project Overview](#project-overview)

### 🔐 Authentication & Security
- [Password Validation](./features/PASSWORD-VALIDATION.md) - Password requirements and validation
- [Login Flow](./guides/LOGIN-FLOW.md) - Complete login flow documentation
- [Signup Validation](./features/SIGNUP-VALIDATION.md) - Form validation rules

### 👤 User Management
- [User Data Integration](./features/USER-DATA-INTEGRATION.md) - Database integration
- [Total Deals Feature](./features/TOTAL-DEALS.md) - Transaction tracking

### 🛠️ Development
- [Scripts Guide](../scripts/README.md) - Utility scripts documentation
- [Scripts Optimization](./development/SCRIPTS-OPTIMIZATION.md) - Script organization

### 🐛 Troubleshooting
- [500 Error Fix](./troubleshooting/500-ERROR-FIX.md) - Common API errors
- [Login Issues](./troubleshooting/LOGIN-ISSUES.md) - Login flow problems

### 📝 Changelog
- [Recent Updates](./CHANGELOG.md) - Latest changes and updates

---

## Quick Start Guide

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

```bash
# Install dependencies
cd apps/ctv-portal
npm install

# Setup database
npx prisma db push
npx prisma generate

# Create test user
npm run script:user:create

# Start development server
npm run dev
```

### Test Credentials
- **Phone:** `0912345678`
- **Password:** `Test@123`

---

## Project Overview

### Tech Stack
- **Framework:** Next.js 15
- **Database:** PostgreSQL + Prisma
- **UI:** React 19, Tailwind CSS, Radix UI
- **Animation:** Framer Motion
- **Validation:** Custom password validation

### Key Features
- ✅ User authentication with phone/password
- ✅ OTP verification flow
- ✅ Password validation (8+ chars, uppercase, lowercase, special)
- ✅ Real-time form validation
- ✅ Database integration with PostgreSQL
- ✅ Transaction tracking (totalDeals)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark mode support

---

## Documentation Structure

```
docs/
├── README.md                    # This file
├── CHANGELOG.md                 # Version history
├── features/                    # Feature documentation
│   ├── PASSWORD-VALIDATION.md
│   ├── SIGNUP-VALIDATION.md
│   ├── USER-DATA-INTEGRATION.md
│   └── TOTAL-DEALS.md
├── guides/                      # How-to guides
│   └── LOGIN-FLOW.md
├── troubleshooting/            # Problem solving
│   ├── 500-ERROR-FIX.md
│   └── LOGIN-ISSUES.md
└── development/                # Development docs
    └── SCRIPTS-OPTIMIZATION.md
```

---

## Common Tasks

### User Management
```bash
# Create test user
npm run script:user:create

# Update user deals
npm run script:user:deals

# Set specific user deals
npm run script user:set-deals 0912345678 25
```

### Database
```bash
# Open Prisma Studio
npm run db:studio

# Push schema changes
npm run db:push

# Generate Prisma client
npm run db:generate
```

### Testing
```bash
# Test database connection
npm run script:test:db

# Test password validation
npm run script:test:password

# Run diagnostics
npm run script:diagnose
```

---

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration

### User
- `GET /api/user/me` - Get current user data

### Testing
- `GET /api/test-db` - Test database connection

---

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public"

# Backend API
BACKEND_PORT=3001
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## Contributing

### Adding New Features
1. Create feature branch
2. Implement feature
3. Add tests
4. Update documentation
5. Submit PR

### Documentation Guidelines
- Use clear, concise language
- Include code examples
- Add screenshots when helpful
- Keep docs up to date

---

## Support

### Getting Help
- Check [Troubleshooting](./troubleshooting/) docs
- Run diagnostics: `npm run script:diagnose`
- Review [Changelog](./CHANGELOG.md)

### Reporting Issues
Include:
- Error messages
- Steps to reproduce
- Environment details
- Screenshots if applicable

---

## License

© 2025 Bất Động Sản Winland. All rights reserved.
