# WiFiFly VPS Deployment Guide

**Updated:** November 12, 2025  
**Status:** Ready for Production Deployment

---

## 📋 Prerequisites

Before deploying to your VPS, ensure you have:

- ✅ VPS with Ubuntu 22.04 or newer (or similar Linux distro)
- ✅ SSH access to your VPS
- ✅ Domain name pointed to your VPS IP
- ✅ Git installed on your local machine
- ✅ Docker & Docker Compose installed on VPS (we'll install if needed)

---

## 🚀 Quick Start (5 Minutes)

### Step 1: SSH into Your VPS

```bash
ssh root@YOUR_VPS_IP
# Or with username
ssh username@YOUR_VPS_IP
```

### Step 2: Install Docker & Docker Compose (if not already installed)

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### Step 3: Clone Your Repository

```bash
cd /home
git clone https://github.com/YOUR_USERNAME/aaawififly.git
cd aaawififly
```

If not using Git, you can upload files with SCP:

```bash
# From your local Windows machine (PowerShell)
scp -r "C:\Users\Turners\Desktop\Robot\aaawififly\*" root@YOUR_VPS_IP:/home/aaawififly/
```

### Step 4: Build and Deploy

```bash
# Navigate to project
cd /home/aaawififly

# Build Docker image
docker-compose build --no-cache

# Start services
docker-compose up -d

# Verify services are running
docker-compose ps
```

### Step 5: Verify Deployment

```bash
# Check if app is running
curl http://localhost:3000

# View logs
docker-compose logs -f

# Check backend
curl http://localhost:3001/empty.php
```

---

## 🔒 SSL/TLS Setup (Let's Encrypt)

### Option 1: Automatic with Certbot

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get certificate
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Update nginx.conf with certificate paths (see below)
# Then restart Nginx
docker-compose restart nginx
```

### Option 2: Manual Certificate Placement

1. Place your SSL certificates in the `ssl/` directory:
   ```
   ssl/
   ├── wififly.crt
   └── wififly.key
   ```

2. Update `nginx.conf` with your certificate paths

3. Restart Nginx:
   ```bash
   docker-compose restart nginx
   ```

---

## 📝 nginx.conf Configuration

Your `nginx.conf` should look like this for HTTPS:

```nginx
worker_processes auto;

events {
    worker_connections 1024;
}

http {
    upstream backend {
        server wififly-app:3000;
    }

    upstream librespeed {
        server wififly-app:3001;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        
        location / {
            return 301 https://$server_name$request_uri;
        }
    }

    # HTTPS Server
    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        # SSL Certificates
        ssl_certificate /etc/nginx/ssl/wififly.crt;
        ssl_certificate_key /etc/nginx/ssl/wififly.key;

        # SSL Configuration
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        # Compression
        gzip on;
        gzip_types text/plain text/css application/json application/javascript;

        # Frontend
        location / {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # Backend Speed Test
        location /api/ {
            proxy_pass http://librespeed/;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header Connection "";
            proxy_set_header Cache-Control "no-store, no-cache";
        }
    }
}
```

---

## 🛠️ Common Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f wififly-app
docker-compose logs -f nginx
```

### Stop Services

```bash
docker-compose down
```

### Restart Services

```bash
docker-compose restart
```

### Rebuild After Code Changes

```bash
# Pull latest code
git pull

# Rebuild image
docker-compose build --no-cache

# Restart
docker-compose up -d
```

### Check Service Status

```bash
docker-compose ps
docker ps
```

---

## 🔍 Troubleshooting

### App won't start

```bash
# Check logs
docker-compose logs wififly-app

# Rebuild from scratch
docker-compose down
docker system prune -a --volumes
docker-compose build --no-cache
docker-compose up -d
```

### Port already in use

```bash
# Find process using port
lsof -i :3000
lsof -i :3001
lsof -i :80
lsof -i :443

# Kill process
kill -9 PID
```

### SSL certificate issues

```bash
# Check certificate validity
openssl x509 -in /etc/nginx/ssl/wififly.crt -text -noout

# Renew certificate
certbot renew --force-renewal

# Restart Nginx
docker-compose restart nginx
```

### DNS issues

```bash
# Test DNS resolution
nslookup yourdomain.com
dig yourdomain.com
```

---

## 📊 Monitoring

### Check System Resources

```bash
# CPU and Memory
docker stats

# Disk usage
df -h

# View container logs with timestamps
docker-compose logs --timestamps -f
```

### Auto-restart on reboot

```bash
# Enable Docker service to start on boot
sudo systemctl enable docker

# Services will auto-restart due to 'restart: unless-stopped' policy
```

---

## 🔄 Updates & Maintenance

### Update Application

```bash
cd /home/aaawififly

# Pull latest changes
git pull

# Rebuild and deploy
docker-compose build --no-cache
docker-compose up -d

# Verify
docker-compose ps
```

### Backup Database/Config

```bash
# Backup volumes and config
docker-compose exec wififly-app tar czf /tmp/backup.tar.gz /app

# Download backup
scp root@YOUR_VPS_IP:/tmp/backup.tar.gz ./backup-$(date +%Y%m%d).tar.gz
```

### Clean up old images

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Full cleanup
docker system prune -a --volumes
```

---

## 🚨 Security Best Practices

1. **SSH Key Authentication**
   ```bash
   # Disable password login
   sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
   sudo systemctl restart sshd
   ```

2. **Firewall Configuration**
   ```bash
   # Enable UFW
   sudo ufw enable
   
   # Allow SSH, HTTP, HTTPS
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   
   # Check status
   sudo ufw status
   ```

3. **Keep system updated**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

4. **Monitor logs**
   ```bash
   # Check system logs
   tail -f /var/log/syslog
   
   # Check Docker logs
   docker-compose logs -f
   ```

---

## ✅ Post-Deployment Checklist

- [ ] App is accessible at `https://yourdomain.com`
- [ ] Frontend loads without errors
- [ ] Speed test functionality works
- [ ] Backend is responding (`/api/empty.php`)
- [ ] SSL certificate is valid and auto-renews
- [ ] Nginx is proxying correctly
- [ ] Logs are clean and no errors
- [ ] Firewall is properly configured
- [ ] Backups are scheduled
- [ ] Monitoring is set up

---

## 📞 Support

If you encounter issues:

1. Check logs: `docker-compose logs -f`
2. Verify containers are running: `docker-compose ps`
3. Test connectivity: `curl http://localhost:3000`
4. Check firewall: `sudo ufw status`
5. Verify DNS: `nslookup yourdomain.com`

---

## 🎉 Deployment Complete!

Your WiFiFly application is now running on your VPS with:
- ✅ Docker containerization
- ✅ Nginx reverse proxy with SSL/TLS
- ✅ Auto-restart on failure
- ✅ Health checks
- ✅ Logging and monitoring
- ✅ Production-ready configuration

Access your app at: **https://yourdomain.com**
