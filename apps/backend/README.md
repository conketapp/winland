# Backend API (NestJS + Prisma)

REST API backend cho nền tảng bất động sản, xây dựng với NestJS và Prisma ORM.

## 🛠️ Tech Stack

- **Framework**: NestJS 10
- **ORM**: Prisma 5
- **Database**: PostgreSQL
- **Authentication**: JWT + Passport
- **Validation**: class-validator, class-transformer
- **Language**: TypeScript 5

## 📁 Project Structure

```
src/
├── common/              # Common utilities, DTOs, guards
│   └── dto/            # Common DTOs (pagination, etc.)
├── modules/            # Feature modules
│   ├── auth/           # Authentication module
│   ├── users/          # User management
│   ├── properties/     # Property management
│   ├── categories/     # Category management
│   └── amenities/      # Amenity management
├── prisma/             # Prisma module
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── app.module.ts       # Main application module
└── main.ts             # Application entry point

prisma/
├── schema.prisma       # Prisma schema
└── migrations/         # Database migrations
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm 9+

### Installation

1. **Navigate to backend directory**
```bash
cd apps/backend
```

2. **Install dependencies** (from root)
```bash
npm install
```

3. **Set up environment variables**
```bash
# Copy from root .env
DATABASE_URL="postgresql://user:password@localhost:5432/batdongsan?schema=public"
BACKEND_PORT=3001
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
```

4. **Generate Prisma client**
```bash
npm run prisma:generate
```

5. **Run migrations**
```bash
npm run prisma:migrate
```

6. **Seed database (optional)**
```bash
npm run prisma:seed
```

### Development

```bash
# Start in development mode
npm run dev

# Start in watch mode with debug
npm run start:debug
```

API will be available at: `http://localhost:3001/api`

## 📚 API Documentation

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users

- `GET /api/users/me` - Get current user profile (Protected)

### Properties

- `GET /api/properties` - Get all properties (with pagination & filters)
- `GET /api/properties/:id` - Get property by ID
- `POST /api/properties` - Create property (Protected)

### Categories

- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category (Protected)

### Amenities

- `GET /api/amenities` - Get all amenities
- `GET /api/amenities/:id` - Get amenity by ID
- `POST /api/amenities` - Create amenity (Protected)

## 🗄️ Database Schema

### Main Tables

- **users** - User accounts
- **properties** - Property listings
- **property_images** - Property images
- **categories** - Property categories
- **amenities** - Property amenities
- **property_amenities** - Many-to-many relation
- **favorites** - User favorites

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🔧 Prisma Commands

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio

# Seed database
npm run prisma:seed
```

## 📦 Build

```bash
# Build for production
npm run build

# Start production server
npm run start:prod
```

## 🔐 Authentication

API sử dụng JWT authentication. Để truy cập các protected routes:

1. Login hoặc register để nhận access token
2. Thêm token vào header: `Authorization: Bearer <token>`

## 🌍 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | - |
| BACKEND_PORT | Server port | 3001 |
| JWT_SECRET | JWT secret key | - |
| JWT_EXPIRES_IN | JWT expiration time | 7d |

## 📝 Development Notes

- Tất cả DTOs sử dụng class-validator để validation
- Không sử dụng `any` type trong code
- Prisma client được generate tự động sau mỗi migration
- Global validation pipe được enable trong `main.ts`

