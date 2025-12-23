# 🔄 RESTART BACKEND SERVER

## ⚠️ Vấn đề: 
Backend đang chạy code cũ, cần restart để load routes analytics mới.

## ✅ Giải pháp:

### Cách 1: Restart trong terminal hiện tại
```bash
# 1. Kill process cũ
lsof -ti:3002 | xargs kill

# 2. Start lại backend
cd apps/backend
npm run start:dev
```

### Cách 2: Nếu đang dùng nodemon/watch mode
- Nodemon sẽ tự động reload khi code thay đổi
- Nếu không tự reload, restart thủ công như Cách 1

### Cách 3: Kiểm tra và restart
```bash
# Xem process đang chạy
lsof -ti:3002

# Kill tất cả process trên port 3002
kill -9 $(lsof -ti:3002)

# Start lại
cd apps/backend
npm run start:dev
```

## ✅ Sau khi restart:
- Backend sẽ load routes mới:
  - `GET /api/dashboard/analytics/revenue`
  - `GET /api/dashboard/analytics/ctv-performance`
  - `GET /api/dashboard/analytics/project-performance`

## 🔍 Kiểm tra routes đã load:
Sau khi restart, test API:
```bash
curl -X GET "http://localhost:3002/api/dashboard/analytics/revenue?timeRange=30d&period=month" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
