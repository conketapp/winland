# Server Deployment Guide

## 📋 Tổng quan

Hướng dẫn chi tiết về cách deploy ứng dụng Winland lên server production, bao gồm cấu trúc thư mục, cấu hình domain, và reverse proxy.

## 📁 Cấu trúc thư mục trên Server

### Khuyến nghị cấu trúc thư mục

```
/opt/apps/winland/
├── deploy-server.sh          # Script deploy chính
├── deploy-server.env         # Environment variables (không commit)
├── logs/                     # Logs từ containers
│   ├── backend.log
│   ├── admin.log
│   └── ctv-portal.log
├── data/                     # Persistent data (nếu cần)
│   └── uploads/              # Uploaded files
└── backups/                  # Database backups (nếu cần)
```

### Tạo cấu trúc thư mục

```bash
# Tạo thư mục chính
sudo mkdir -p /opt/apps/winland/{logs,data/uploads,backups}

# Set ownership (thay your-user bằng user của bạn)
sudo chown -R your-user:your-user /opt/apps/winland

# Set permissions
chmod 755 /opt/apps/winland
chmod 700 /opt/apps/winland/data
```

## 🔧 Cấu hình Environment Variables

### Tạo file environment

```bash
cd /opt/apps/winland
nano deploy-server.env
```

### Nội dung file `deploy-server.env`

```bash
# Docker Hub Configuration
DOCKER_HUB_USERNAME=your-dockerhub-username
IMAGE_TAG=latest

# Port Configuration (Internal - trong pod)
BACKEND_PORT=3002
ADMIN_PORT=80
CTV_PORT=3000

# External Ports (mapped từ host)
EXTERNAL_BACKEND_PORT=3002
EXTERNAL_ADMIN_PORT=8080
EXTERNAL_CTV_PORT=3000

# Backend Environment Variables
DATABASE_URL=postgresql://postgres:your-password@localhost:5432/winland?schema=public
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CTV Portal Environment Variables
NEXTAUTH_SECRET=your-nextauth-secret-change-this-in-production
NEXTAUTH_URL=https://ctv.yourdomain.com

# Admin Panel (nếu cần)
ADMIN_URL=https://admin.yourdomain.com

# Optional: Logging
LOG_LEVEL=info
```

### Bảo mật file environment

```bash
# Chỉ owner mới đọc được
chmod 600 deploy-server.env
```

## 🌐 Cấu hình Domain và Reverse Proxy

### Option 1: Sử dụng Nginx (Khuyến nghị)

#### Cài đặt Nginx

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y nginx

# CentOS/RHEL
sudo yum install -y nginx
```

#### Cấu hình Nginx cho Backend API

```bash
sudo nano /etc/nginx/sites-available/api.yourdomain.com
```

**Nội dung:**

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL Certificate (sử dụng Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Logging
    access_log /var/log/nginx/api.yourdomain.com.access.log;
    error_log /var/log/nginx/api.yourdomain.com.error.log;

    # Proxy settings
    client_max_body_size 50M;
    proxy_read_timeout 300s;
    proxy_connect_timeout 75s;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # WebSocket support (nếu cần)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

#### Cấu hình Nginx cho Admin Panel

```bash
sudo nano /etc/nginx/sites-available/admin.yourdomain.com
```

**Nội dung:**

```nginx
# Admin Panel
server {
    listen 80;
    server_name admin.yourdomain.com;

    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name admin.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/admin.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.yourdomain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    access_log /var/log/nginx/admin.yourdomain.com.access.log;
    error_log /var/log/nginx/admin.yourdomain.com.error.log;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Proxy API requests to backend
    location /api {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Cấu hình Nginx cho CTV Portal

```bash
sudo nano /etc/nginx/sites-available/ctv.yourdomain.com
```

**Nội dung:**

```nginx
# CTV Portal
server {
    listen 80;
    server_name ctv.yourdomain.com;

    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ctv.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/ctv.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ctv.yourdomain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    access_log /var/log/nginx/ctv.yourdomain.com.access.log;
    error_log /var/log/nginx/ctv.yourdomain.com.error.log;

    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

#### Kích hoạt sites

```bash
# Tạo symbolic links
sudo ln -s /etc/nginx/sites-available/api.yourdomain.com /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/admin.yourdomain.com /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/ctv.yourdomain.com /etc/nginx/sites-enabled/

# Test cấu hình
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Option 2: Sử dụng Caddy (Đơn giản hơn, tự động SSL)

#### Cài đặt Caddy

```bash
# Ubuntu/Debian
sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt-get update
sudo apt-get install -y caddy
```

#### Cấu hình Caddyfile

```bash
sudo nano /etc/caddy/Caddyfile
```

**Nội dung:**

```
# Backend API
api.yourdomain.com {
    reverse_proxy localhost:3002 {
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
    }
}

# Admin Panel
admin.yourdomain.com {
    reverse_proxy localhost:8080 {
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
    }
}

# CTV Portal
ctv.yourdomain.com {
    reverse_proxy localhost:3000 {
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
    }
}
```

#### Khởi động Caddy

```bash
sudo systemctl enable caddy
sudo systemctl start caddy
sudo systemctl status caddy
```

## 🔒 SSL Certificate với Let's Encrypt

### Cài đặt Certbot

```bash
# Ubuntu/Debian
sudo apt-get install -y certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install -y certbot python3-certbot-nginx
```

### Tạo SSL Certificate

```bash
# Với Nginx
sudo certbot --nginx -d api.yourdomain.com
sudo certbot --nginx -d admin.yourdomain.com
sudo certbot --nginx -d ctv.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Auto-renewal với Cron

```bash
# Thêm vào crontab
sudo crontab -e

# Thêm dòng này
0 0 * * * certbot renew --quiet --post-hook "systemctl reload nginx"
```

## 🔄 Cập nhật Script Deploy

Cập nhật `deploy-server.sh` để sử dụng external ports:

```bash
# Trong deploy-server.sh, thay đổi phần create_pod:

create_pod() {
    local pod_name="winland-pod"
    
    if podman pod exists "${pod_name}"; then
        echo -e "${YELLOW}🛑 Stopping existing pod ${pod_name}...${NC}"
        podman pod stop "${pod_name}" || true
        podman pod rm "${pod_name}" || true
    fi
    
    echo -e "${YELLOW}📦 Creating pod ${pod_name}...${NC}"
    podman pod create --name "${pod_name}" \
        -p "${EXTERNAL_BACKEND_PORT:-3002}:3002" \
        -p "${EXTERNAL_ADMIN_PORT:-8080}:80" \
        -p "${EXTERNAL_CTV_PORT:-3000}:3000" || {
        echo -e "${RED}❌ Failed to create pod${NC}"
        exit 1
    }
    echo -e "${GREEN}✅ Pod ${pod_name} created${NC}"
}
```

## 📊 Monitoring và Logs

### Xem logs containers

```bash
# Real-time logs
podman logs -f winland-backend
podman logs -f winland-admin
podman logs -f winland-ctv-portal

# Save logs to file
podman logs winland-backend > /opt/apps/winland/logs/backend.log
```

### Health checks

```bash
# Check container status
podman ps

# Check pod status
podman pod ps
podman pod inspect winland-pod

# Test API endpoint
curl http://localhost:3002/api
```

## 🔐 Security Best Practices

1. **Firewall Configuration**
   ```bash
   # Chỉ mở ports cần thiết
   sudo ufw allow 22/tcp    # SSH
   sudo ufw allow 80/tcp     # HTTP
   sudo ufw allow 443/tcp    # HTTPS
   sudo ufw enable
   ```

2. **Database Security**
   - Sử dụng strong password cho PostgreSQL
   - Chỉ cho phép localhost connection
   - Regular backups

3. **Container Security**
   - Không chạy containers với root user
   - Sử dụng read-only filesystem khi có thể
   - Regular updates images

4. **Environment Variables**
   - Không commit secrets vào git
   - Sử dụng secret management tools
   - Rotate secrets định kỳ

## 🚀 Deployment Checklist

- [ ] Tạo cấu trúc thư mục `/opt/apps/winland`
- [ ] Cấu hình environment variables
- [ ] Cài đặt Podman
- [ ] Cài đặt Nginx hoặc Caddy
- [ ] Cấu hình DNS records
- [ ] Tạo SSL certificates
- [ ] Cấu hình firewall
- [ ] Test deployment script
- [ ] Setup monitoring và logging
- [ ] Setup backups
- [ ] Document credentials và configuration

## 📚 Additional Resources

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Caddy Documentation](https://caddyserver.com/docs/)
- [Podman Documentation](https://docs.podman.io/)
- [Let's Encrypt](https://letsencrypt.org/)

