# Deployment Quick Start Guide

## 🚀 Tổng quan nhanh

Hướng dẫn nhanh để deploy Winland lên server production.

## 📋 Prerequisites

- Server với Ubuntu 20.04+ hoặc CentOS 8+
- Root hoặc sudo access
- Domain names đã được cấu hình DNS
- Docker Hub account

## ⚡ Quick Setup (5 bước)

### Bước 1: Chuẩn bị Server

```bash
# SSH vào server
ssh user@your-server-ip

# Tạo cấu trúc thư mục
sudo mkdir -p /opt/apps/winland/{logs,data/uploads,backups}
sudo chown -R $USER:$USER /opt/apps/winland
cd /opt/apps/winland
```

### Bước 2: Cài đặt Dependencies

```bash
# Cài Podman
sudo apt-get update
sudo apt-get install -y podman

# Cài Nginx (hoặc Caddy)
sudo apt-get install -y nginx

# Cài Certbot (cho SSL)
sudo apt-get install -y certbot python3-certbot-nginx
```

### Bước 3: Copy Scripts

```bash
# Copy deploy script từ local
scp scripts/deploy-server.sh user@server:/opt/apps/winland/
scp scripts/deploy-server.env.example user@server:/opt/apps/winland/

# Trên server
cd /opt/apps/winland
chmod +x deploy-server.sh
cp deploy-server.env.example deploy-server.env
nano deploy-server.env  # Điền thông tin
```

### Bước 4: Cấu hình Environment

Chỉnh sửa `deploy-server.env`:

```bash
DOCKER_HUB_USERNAME=your-username
IMAGE_TAG=latest

# Ports
EXTERNAL_BACKEND_PORT=3002
EXTERNAL_ADMIN_PORT=8080
EXTERNAL_CTV_PORT=3000

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/winland?schema=public

# Secrets (thay đổi!)
JWT_SECRET=your-super-secret-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://ctv.yourdomain.com
```

### Bước 5: Deploy

```bash
source deploy-server.env
./deploy-server.sh
```

## 🌐 Cấu hình Domain (Nginx)

### Tạo Nginx configs

```bash
# Backend API
sudo nano /etc/nginx/sites-available/api.yourdomain.com
```

Paste nội dung từ `docs/SERVER-DEPLOYMENT.md` (phần Nginx config)

```bash
# Enable sites
sudo ln -s /etc/nginx/sites-available/api.yourdomain.com /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/admin.yourdomain.com /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/ctv.yourdomain.com /etc/nginx/sites-enabled/

# Test và reload
sudo nginx -t
sudo systemctl reload nginx
```

### Tạo SSL Certificates

```bash
sudo certbot --nginx -d api.yourdomain.com
sudo certbot --nginx -d admin.yourdomain.com
sudo certbot --nginx -d ctv.yourdomain.com
```

## ✅ Verify Deployment

```bash
# Check containers
podman ps

# Check logs
podman logs winland-backend

# Test endpoints
curl http://localhost:3002/api
curl http://localhost:8080
curl http://localhost:3000
```

## 🔄 Update Deployment

Khi có image mới trên Docker Hub:

```bash
cd /opt/apps/winland
source deploy-server.env
IMAGE_TAG=latest ./deploy-server.sh
```

## 📚 Chi tiết

Xem file `docs/SERVER-DEPLOYMENT.md` để biết chi tiết về:
- Cấu trúc thư mục
- Cấu hình Nginx/Caddy
- Security best practices
- Monitoring và logging
- Troubleshooting

