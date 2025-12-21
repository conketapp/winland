# 🐘 Hướng dẫn cài đặt PostgreSQL Local

## ✅ Đã hoàn thành

PostgreSQL đã được cài đặt và cấu hình thành công trên máy của bạn!

### Những gì đã được cài đặt:

1. ✅ **PostgreSQL 16** - Cài đặt qua Homebrew
2. ✅ **Database `batdongsan`** - Đã được tạo
3. ✅ **PostgreSQL Service** - Đang chạy và sẽ tự động khởi động khi login
4. ✅ **Schema Prisma** - Đã cập nhật để sử dụng PostgreSQL
5. ✅ **File .env** - Đã cấu hình DATABASE_URL

## 🔧 Thông tin kết nối

- **Host:** localhost
- **Port:** 5432
- **Database:** batdongsan
- **User:** mac (username hệ thống của bạn)
- **Connection String:** `postgresql://mac@localhost:5432/batdongsan?schema=public`

## 🚀 Sử dụng

### 1. Khởi động/Stop PostgreSQL

```bash
# Khởi động
brew services start postgresql@16

# Dừng
brew services stop postgresql@16

# Xem trạng thái
brew services list | grep postgresql
```

### 2. Kết nối đến database

```bash
# Thêm PostgreSQL vào PATH (nếu chưa có trong .zshrc)
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"

# Kết nối
psql -d batdongsan
```

### 3. Chạy Prisma Migrations

```bash
cd apps/backend

# Generate Prisma Client
export DATABASE_URL="postgresql://mac@localhost:5432/batdongsan?schema=public"
npx prisma generate

# Tạo migration mới
npx prisma migrate dev --name your_migration_name

# Áp dụng migrations
npx prisma migrate deploy

# Reset database (development only - sẽ xóa tất cả data!)
npx prisma migrate reset
```

### 4. Prisma Studio (GUI để xem database)

```bash
cd apps/backend
export DATABASE_URL="postgresql://mac@localhost:5432/batdongsan?schema=public"
npx prisma studio
```

Mở trình duyệt tại: http://localhost:5555

## ⚙️ Cấu hình trong dự án

### File `.env` (root directory)

```env
DATABASE_URL="postgresql://mac@localhost:5432/batdongsan?schema=public"
```

### File `apps/backend/prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### File `apps/ctv-portal/prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## 📝 Lưu ý quan trọng

1. **Environment Variable:** Prisma cần biến môi trường `DATABASE_URL`. Đảm bảo file `.env` ở root directory có biến này.

2. **Path trong Terminal:** Nếu lệnh `psql` không được tìm thấy, thêm vào `~/.zshrc`:
   ```bash
   export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
   ```
   Sau đó chạy: `source ~/.zshrc`

3. **PostgreSQL tự khởi động:** Service đã được cấu hình để tự khởi động khi bạn login vào máy.

4. **Password:** PostgreSQL local trên macOS thường không yêu cầu password cho user hệ thống. Nếu bạn muốn thêm password, có thể dùng:
   ```bash
   psql -d postgres -c "ALTER USER mac WITH PASSWORD 'your_password';"
   ```
   Sau đó cập nhật connection string: `postgresql://mac:your_password@localhost:5432/batdongsan?schema=public`

## 🔍 Kiểm tra trạng thái

```bash
# Kiểm tra PostgreSQL đang chạy
brew services list | grep postgresql

# Kiểm tra kết nối
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
psql -d batdongsan -c "SELECT version();"

# Xem danh sách databases
psql -d postgres -c "\l"

# Xem danh sách tables trong database
psql -d batdongsan -c "\dt"
```

## 🆘 Troubleshooting

### Lỗi: "psql: command not found"

```bash
# Thêm vào ~/.zshrc
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Lỗi: "database does not exist"

```bash
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
createdb batdongsan
```

### Lỗi: "could not connect to server"

```bash
# Kiểm tra service có đang chạy không
brew services list | grep postgresql

# Nếu không, khởi động lại
brew services restart postgresql@16
```

### Lỗi Prisma: "Environment variable not found: DATABASE_URL"

Đảm bảo file `.env` ở root directory có biến `DATABASE_URL`, hoặc export trước khi chạy lệnh:

```bash
export DATABASE_URL="postgresql://mac@localhost:5432/batdongsan?schema=public"
npx prisma generate
```

## 📚 Tài liệu tham khảo

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma PostgreSQL Guide](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [Homebrew PostgreSQL](https://formulae.brew.sh/formula/postgresql@16)

---

**Chúc bạn code vui vẻ! 🎉**
