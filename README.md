# Batdongsan Monorepo

Real Estate Platform built with modern technologies in a monorepo architecture.

## 📁 Project Structure

```
batdongsan/
├── apps/
│   ├── backend/        # NestJS + Prisma API
│   ├── admin/          # React + Vite Admin Panel
│   └── client/         # Next.js Client Website
├── packages/
│   └── shared/         # Shared types, utilities, constants
├── package.json        # Root workspace configuration
├── turbo.json          # Turborepo configuration
└── tsconfig.json       # Base TypeScript configuration
```

## 🚀 Tech Stack

### Backend (NestJS)
- **Framework**: NestJS
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Validation**: class-validator, class-transformer

### Admin Panel (React + Vite)
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v3
- **UI Components**: shadcn/ui, Preline UI
- **Routing**: React Router
- **State Management**: React Query
- **Forms**: React Hook Form + Zod

### Client Website (Next.js)
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS v3
- **UI Components**: shadcn/ui
- **State Management**: React Query
- **Forms**: React Hook Form + Zod

### Shared Package
- **Types**: TypeScript definitions
- **Utilities**: Common functions
- **Constants**: Shared constants

## 📦 Installation

### ⚡ Quick Start (Recommended)

**Không cần cài database phức tạp!** Xem hướng dẫn nhanh:

👉 **[QUICKSTART.md](./QUICKSTART.md)** - Chạy dự án trong 3 bước đơn giản với SQLite

### 📚 Chi tiết

1. **Clone the repository**
```bash
git clone <repository-url>
cd batdongsan
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp env.example .env
```

4. **Set up database**

**Option 1: SQLite (Đơn giản - Không cần cài gì)**
```bash
cd apps/backend
npx prisma generate
npx prisma migrate dev --name init
```

**Option 2: PostgreSQL (Production)**
- Cài PostgreSQL
- Tạo database `batdongsan`
- Cập nhật `DATABASE_URL` trong `.env`
- Sửa `apps/backend/prisma/schema.prisma` từ `sqlite` sang `postgresql`
- Run migrations: `npx prisma migrate dev`

## 🛠️ Development

### Run all applications
```bash
npm run dev
```

### Run individual applications
```bash
# Backend API
npm run backend:dev

# Admin Panel
npm run admin:dev

# Client Website
npm run client:dev
```

### Build all applications
```bash
npm run build
```

### Build individual applications
```bash
npm run backend:build
npm run admin:build
npm run client:build
```

## 📝 Scripts

- `npm run dev` - Start all apps in development mode
- `npm run build` - Build all apps
- `npm run lint` - Lint all apps
- `npm run format` - Format code with Prettier
- `npm run clean` - Clean build artifacts

## 🔧 Configuration

### Database Setup

**Hiện tại:** Dự án đang dùng **SQLite** - không cần cài đặt gì thêm!

**Chuyển sang PostgreSQL:**
1. Install PostgreSQL
2. Create a database named `batdongsan`
3. Update `DATABASE_URL` in `.env`
4. Sửa `apps/backend/prisma/schema.prisma`: `provider = "postgresql"`
5. Chạy lại: `cd apps/backend && npx prisma migrate dev`

### Port Configuration
- Backend API: `http://localhost:3001`
- Admin Panel: `http://localhost:5173`
- Client Website: `http://localhost:3000`

## 📚 Documentation

- [Backend API Documentation](./apps/backend/README.md)
- [Admin Panel Documentation](./apps/admin/README.md)
- [Client Website Documentation](./apps/client/README.md)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## 📄 License

MIT

