# Docker Deployment Guide

## 📋 Overview

GitHub Actions workflow tự động build và push Docker images lên Docker Hub khi push code lên branch `main`.

## 🐳 Docker Images

Workflow sẽ build và push 3 Docker images:

1. **winland-backend** - Backend API (NestJS)
2. **winland-admin** - Admin Panel (Vite + React)
3. **winland-ctv-portal** - CTV Portal (Next.js)

## ⚙️ Setup Docker Hub Secrets

Để workflow hoạt động, bạn cần thêm các secrets sau vào GitHub repository:

1. Vào **Settings** → **Secrets and variables** → **Actions**
2. Thêm các secrets sau:

### Required Secrets:

- `DOCKER_HUB_USERNAME` - Tên người dùng Docker Hub của bạn
- `DOCKER_HUB_TOKEN` - Access token từ Docker Hub

### Cách tạo Docker Hub Token:

1. Đăng nhập vào [Docker Hub](https://hub.docker.com/)
2. Vào **Account Settings** → **Security**
3. Click **New Access Token**
4. Đặt tên token (ví dụ: `github-actions`)
5. Copy token và thêm vào GitHub Secrets với tên `DOCKER_HUB_TOKEN`

## 🚀 Workflow Trigger

Workflow sẽ tự động chạy khi:
- Push code lên branch `main`
- Manual trigger từ GitHub Actions tab

## 📦 Image Tags

Images sẽ được tag với:
- `latest` - Cho branch main
- `main-<sha>` - Tag với commit SHA
- `main` - Tag với branch name

## 🔍 Kiểm tra Images

Sau khi workflow chạy thành công, bạn có thể kiểm tra images tại:
- `https://hub.docker.com/r/<your-username>/winland-backend`
- `https://hub.docker.com/r/<your-username>/winland-admin`
- `https://hub.docker.com/r/<your-username>/winland-ctv-portal`

## 🧪 Test Local

Để test build Docker images local:

```bash
# Build backend
docker build -f apps/backend/Dockerfile -t winland-backend:test .

# Build admin
docker build -f apps/admin/Dockerfile -t winland-admin:test .

# Build ctv-portal
docker build -f apps/ctv-portal/Dockerfile -t winland-ctv-portal:test .
```

## 📝 Environment Variables

Khi chạy containers, bạn cần cung cấp các environment variables:

### Backend:
- `DATABASE_URL` - PostgreSQL connection string
- `BACKEND_PORT` - Port (default: 3002)
- `JWT_SECRET` - JWT secret key
- `JWT_EXPIRES_IN` - JWT expiration (default: 7d)

### CTV Portal:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - NextAuth secret
- `NEXTAUTH_URL` - NextAuth URL

## 🐛 Troubleshooting

### Workflow fails với "unauthorized"
- Kiểm tra lại `DOCKER_HUB_USERNAME` và `DOCKER_HUB_TOKEN` trong GitHub Secrets
- Đảm bảo token có quyền push images

### Build fails
- Kiểm tra logs trong GitHub Actions
- Đảm bảo tất cả dependencies được cài đặt đúng
- Kiểm tra Dockerfile paths

