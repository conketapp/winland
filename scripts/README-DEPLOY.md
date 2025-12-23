# Server Deployment Guide

## 📋 Overview

Script này dùng để deploy các Docker images từ Docker Hub lên server sử dụng Podman.

## 🔧 Prerequisites

1. **Podman** đã được cài đặt trên server
2. **Docker Hub credentials** để pull images
3. **Environment variables** đã được cấu hình

## 📦 Installation

### 1. Cài đặt Podman (nếu chưa có)

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y podman
```

**CentOS/RHEL:**
```bash
sudo yum install -y podman
```

**macOS:**
```bash
brew install podman
```

### 2. Cấu hình Environment Variables

```bash
# Copy example file
cp scripts/deploy-server.env.example scripts/deploy-server.env

# Edit với thông tin của bạn
nano scripts/deploy-server.env
```

### 3. Source environment variables

```bash
source scripts/deploy-server.env
```

## 🚀 Usage

### Deploy tất cả services

```bash
chmod +x scripts/deploy-server.sh
./scripts/deploy-server.sh
```

### Hoặc với environment file

```bash
source scripts/deploy-server.env
./scripts/deploy-server.sh
```

## 📝 Script Functions

Script sẽ thực hiện các bước sau:

1. ✅ Kiểm tra Podman đã được cài đặt
2. 📥 Pull 3 images từ Docker Hub:
   - `winland-backend`
   - `winland-admin`
   - `winland-ctv-portal`
3. 📦 Tạo Pod để quản lý networking
4. 🚀 Chạy các containers:
   - Backend trên port 3002
   - Admin trên port 80
   - CTV Portal trên port 3000

## 🔍 Kiểm tra Status

```bash
# Xem containers đang chạy
podman ps

# Xem logs
podman logs winland-backend
podman logs winland-admin
podman logs winland-ctv-portal

# Xem pod status
podman pod ps
podman pod inspect winland-pod
```

## 🔄 Update Deployment

Để update deployment với image mới:

```bash
# Pull image mới
IMAGE_TAG=main-abc123 ./scripts/deploy-server.sh

# Hoặc pull latest
IMAGE_TAG=latest ./scripts/deploy-server.sh
```

## 🛑 Stop Containers

```bash
# Stop tất cả containers
podman stop winland-backend winland-admin winland-ctv-portal

# Stop và remove pod
podman pod stop winland-pod
podman pod rm winland-pod
```

## 🗑️ Clean Up

```bash
# Remove containers
podman rm winland-backend winland-admin winland-ctv-portal

# Remove pod
podman pod rm winland-pod

# Remove images (optional)
podman rmi your-username/winland-backend:latest
podman rmi your-username/winland-admin:latest
podman rmi your-username/winland-ctv-portal:latest
```

## 🔐 Security Notes

1. **Environment Variables**: Không commit file `.env` vào git
2. **Secrets**: Sử dụng secret management tool cho production
3. **Network**: Cân nhắc sử dụng firewall để bảo vệ ports
4. **Updates**: Thường xuyên update images để có security patches

## 🐛 Troubleshooting

### Podman permission denied
```bash
# Thêm user vào podman group (Linux)
sudo usermod -aG podman $USER
newgrp podman
```

### Cannot pull images
- Kiểm tra Docker Hub credentials
- Kiểm tra network connection
- Kiểm tra image name và tag

### Container không start
```bash
# Xem logs để debug
podman logs winland-backend
podman logs winland-admin
podman logs winland-ctv-portal
```

### Port already in use
```bash
# Kiểm tra port đang được sử dụng
sudo lsof -i :3002
sudo lsof -i :80
sudo lsof -i :3000

# Thay đổi port trong deploy-server.env
```

## 📚 Additional Resources

- [Podman Documentation](https://docs.podman.io/)
- [Podman vs Docker](https://podman.io/whatis-podman)
- [Podman Pods](https://docs.podman.io/en/latest/markdown/podman-pod.1.html)

