# Docker & VPS Deployment - COMPLETE SETUP

**Date:** November 12, 2025  
**Status:** ✅ Ready for Production Deployment

---

## 📦 What's New

Your project has been updated with **production-ready Docker configuration** for VPS deployment:

### ✅ Updated Files

1. **Dockerfile** (updated)
   - Multi-stage build optimized for production
   - Runs both backend (port 3001) and frontend (port 3000)
   - Non-root user for security
   - Health checks included
   - Uses Node 20 Alpine (lightweight, secure)

2. **docker-compose.yml** (updated)
   - Orchestrates app container + nginx reverse proxy
   - Proper logging and health checks
   - Automatic restart on failure
   - Service dependencies configured
   - Ready for production

3. **VPS_DEPLOYMENT_GUIDE.md** (NEW)
   - Complete deployment instructions
   - SSL/TLS setup with Let's Encrypt
   - Nginx configuration examples
   - Troubleshooting guide
   - Security best practices

4. **deploy-vps-automated.sh** (NEW)
   - Automated deployment script for your VPS
   - Installs Docker, Docker Compose, Certbot
   - Configures firewall
   - Builds and starts containers
   - Sets up SSL certificates

5. **deploy-to-vps.ps1** (NEW)
   - PowerShell script to upload files from Windows
   - Validates SSH connection
   - Uploads only essential files
   - Shows next steps

---

## 🚀 Quick Deployment (Choose One Path)

### **PATH 1: Automated (Easiest)**

From your VPS, run:
```bash
bash /home/aaawififly/deploy-vps-automated.sh
```

This script will:
- ✅ Update system
- ✅ Install Docker & Docker Compose
- ✅ Install Certbot for SSL
- ✅ Configure firewall
- ✅ Build Docker image
- ✅ Start services
- ✅ Setup SSL certificates (optional, interactive)

### **PATH 2: Manual (More Control)**

From your VPS:
```bash
cd /home/aaawififly
docker-compose build --no-cache
docker-compose up -d
docker-compose logs -f
```

---

## 📤 How to Upload Files to VPS

### **Option A: PowerShell Script (Windows)**

```powershell
cd C:\Users\Turners\Desktop\Robot\aaawififly
.\deploy-to-vps.ps1 -VpsIP "YOUR_VPS_IP"
```

### **Option B: Manual SCP (Windows PowerShell)**

```powershell
scp -r C:\Users\Turners\Desktop\Robot\aaawififly\* root@YOUR_VPS_IP:/home/aaawififly/
```

### **Option C: Git Clone (Fastest if already on GitHub)**

```bash
cd /home
git clone https://github.com/YOUR_USERNAME/aaawififly.git
cd aaawififly
```

---

## 🔒 SSL/TLS Certificates

### Automatic (during deployment):
The `deploy-vps-automated.sh` script can automatically setup SSL with Let's Encrypt.

### Manual Setup:
```bash
# On VPS
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy to ssl/ directory
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /home/aaawififly/ssl/wififly.crt
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /home/aaawififly/ssl/wififly.key

# Restart Nginx
docker-compose restart nginx
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│           Your VPS (Linux)              │
├─────────────────────────────────────────┤
│  ┌──────────────────────────────────┐   │
│  │   Nginx (Reverse Proxy)          │   │
│  │   Port 80 (HTTP)                 │   │
│  │   Port 443 (HTTPS/SSL)           │   │
│  └──────────────┬───────────────────┘   │
│                 │                       │
│  ┌──────────────▼───────────────────┐   │
│  │  Docker Container (wififly-app)  │   │
│  ├──────────────────────────────────┤   │
│  │  ┌─────────────────────────────┐ │   │
│  │  │ Frontend (Next.js)          │ │   │
│  │  │ Port 3000                   │ │   │
│  │  └─────────────────────────────┘ │   │
│  │  ┌─────────────────────────────┐ │   │
│  │  │ Backend (LibreSpeed)        │ │   │
│  │  │ Port 3001                   │ │   │
│  │  │ (/empty.php, /garbage.php)  │ │   │
│  │  └─────────────────────────────┘ │   │
│  └──────────────────────────────────┘   │
│                                         │
│  Storage: /home/aaawififly/            │
│  - Dockerfile                          │
│  - docker-compose.yml                  │
│  - nginx.conf                          │
│  - ssl/ (certificates)                 │
│  - src/ (frontend code)                │
│  - public/ (assets + backend)          │
│  - package.json (dependencies)         │
└─────────────────────────────────────────┘
```

---

## 📋 File Checklist

Before uploading to VPS, ensure you have:

- ✅ Dockerfile
- ✅ docker-compose.yml
- ✅ nginx.conf
- ✅ package.json & package-lock.json
- ✅ next.config.ts
- ✅ tailwind.config.ts
- ✅ postcss.config.mjs
- ✅ tsconfig.json
- ✅ src/ directory (frontend code)
- ✅ public/ directory (assets + backend)
- ✅ VPS_DEPLOYMENT_GUIDE.md
- ✅ deploy-vps-automated.sh

---

## 🔧 Key Features of New Docker Setup

### ✨ Frontend & Backend in One Container
- No need to manage separate containers
- Single `docker-compose up -d` command
- Both services auto-restart on failure

### 🔒 Security
- Non-root user (nextjs) inside container
- Alpine Linux (smaller attack surface)
- Health checks for automatic recovery
- SSL/TLS support with Nginx

### 📊 Monitoring & Logging
- JSON file logging (limited to 10MB per file)
- Max 3 log files kept (total 30MB)
- View with: `docker-compose logs -f`

### ⚡ Performance
- Multi-stage build (smaller image)
- Layer caching (faster rebuilds)
- Nginx for static content + reverse proxy
- Gzip compression enabled

### 🔄 Maintenance
- Auto-restart on crash (`restart: unless-stopped`)
- Easy updates: `git pull` + `docker-compose build --no-cache`
- Health checks every 30s
- Graceful shutdown with SIGTERM

---

## 🚨 Common Scenarios

### Deploying for the first time:
```bash
# On VPS
bash deploy-vps-automated.sh
# Answer prompts for SSL setup
```

### Updating after code changes:
```bash
cd /home/aaawififly
git pull  # Or upload files manually
docker-compose build --no-cache
docker-compose up -d
```

### Checking everything is running:
```bash
docker-compose ps
docker-compose logs -f
curl https://yourdomain.com
```

### Troubleshooting:
```bash
# View detailed logs
docker-compose logs wififly-app

# Restart services
docker-compose restart

# Full reset
docker-compose down
docker-compose up -d
```

---

## 📞 Need Help?

1. **Read VPS_DEPLOYMENT_GUIDE.md** - Comprehensive guide with all commands
2. **Check Docker logs** - `docker-compose logs -f`
3. **Verify connectivity** - `curl http://localhost:3000`
4. **Test backend** - `curl http://localhost:3001/empty.php`

---

## ✅ Post-Deployment Verification

```bash
# SSH into VPS
ssh root@YOUR_VPS_IP

# Check containers
docker-compose ps

# Test frontend
curl http://localhost:3000

# Test backend
curl http://localhost:3001/empty.php

# View real-time logs
docker-compose logs -f

# Check system resources
docker stats
```

---

## 🎉 You're Ready!

Your WiFiFly application is now ready for production deployment with Docker and VPS support!

**Next Steps:**
1. Update your nginx.conf with your domain name
2. Point your domain DNS to your VPS IP
3. Run `deploy-vps-automated.sh` on your VPS
4. Access your app at `https://yourdomain.com`

**Happy deploying! 🚀**
