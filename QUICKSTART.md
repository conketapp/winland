# 🚀 Quick Start Guide

Hướng dẫn nhanh để chạy dự án mà **không cần cài đặt database phức tạp**.

## 📋 Yêu cầu

- Node.js 18+ 
- npm 9+

## 🎯 Chạy dự án (3 bước đơn giản)

### Bước 1: Cài đặt dependencies

```bash
cd /Users/mac/Documents/GitHub/batdongsan
npm install
```

### Bước 2: Tạo file .env

```bash
cp env.example .env
```

Nội dung file `.env` (đã được setup sẵn cho SQLite):
```env
DATABASE_URL="file:./dev.db"
BACKEND_PORT=3001
JWT_SECRET=my-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d
VITE_API_URL=http://localhost:3001/api
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Bước 3: Setup database & chạy dự án

```bash
# Setup database (SQLite - tự động tạo file dev.db)
cd apps/backend
npx prisma generate
npx prisma migrate dev --name init

# Quay về root và chạy tất cả
cd ../..
npm run dev
```

## 🎉 Kết quả

Sau khi chạy `npm run dev`, bạn sẽ có:

- ✅ **Backend API**: http://localhost:3001/api
- ✅ **Admin Panel**: http://localhost:5173
- ✅ **Client Website**: http://localhost:3000

## 🔐 Test Login

Bạn có thể register tài khoản mới qua API:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "fullName": "Admin User"
  }'
```

Sau đó login ở Admin Panel với:
- Email: `admin@example.com`
- Password: `admin123`

## 📱 Chạy từng app riêng lẻ

Nếu chỉ muốn xem UI mà không cần backend:

```bash
# Chỉ Admin Panel
npm run admin:dev

# Chỉ Client Website
npm run client:dev

# Chỉ Backend API
npm run backend:dev
```

## 🗄️ Database

Hiện tại dự án đang dùng **SQLite** (file: `apps/backend/prisma/dev.db`) nên:
- ✅ Không cần cài PostgreSQL
- ✅ Không cần setup database server
- ✅ Chỉ cần chạy migrate là xong
- ✅ Database là 1 file local, dễ reset/backup

### Xem database với Prisma Studio

```bash
cd apps/backend
npm run prisma:studio
```

→ Mở http://localhost:5555 để xem & edit data

## 🔄 Chuyển sang PostgreSQL sau này

Nếu muốn chuyển sang PostgreSQL sau:

1. Cài PostgreSQL
2. Sửa file `apps/backend/prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
3. Sửa `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/batdongsan?schema=public"
```
4. Chạy lại migrate:
```bash
cd apps/backend
npx prisma migrate dev
```

## ❓ Troubleshooting

### Port đã được sử dụng?

Đổi port trong `.env`:
```env
BACKEND_PORT=3002  # Thay vì 3001
```

### Lỗi khi migrate?

Xóa database và tạo lại:
```bash
cd apps/backend
rm -f prisma/dev.db
npx prisma migrate dev --name init
```

### Admin/Client không kết nối được Backend?

Kiểm tra `.env` có đúng API URL:
```env
VITE_API_URL=http://localhost:3001/api
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 📚 Tài liệu chi tiết

- [Backend Documentation](./apps/backend/README.md)
- [Admin Documentation](./apps/admin/README.md)
- [Client Documentation](./apps/client/README.md)
- [Shared Package](./packages/shared/README.md)

## 🎨 Thêm shadcn/ui components

```bash
# Cho Admin
cd apps/admin
npx shadcn@latest add button

# Cho Client
cd apps/client
npx shadcn@latest add button
```

---

**Chúc bạn code vui vẻ! 🎉**

