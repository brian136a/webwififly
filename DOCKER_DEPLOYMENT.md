# Docker Deployment Guide for WiFiFly App

This guide explains how to deploy your Docker-containerized Next.js app to a VPS server.

## Prerequisites on Your VPS

1. **Ubuntu/Debian Server** (16GB RAM, 2+ CPU cores recommended)
2. **SSH access** to your VPS
3. **Domain name** (optional but recommended)

## Step 1: Install Docker and Docker Compose on VPS

SSH into your VPS and run these commands:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group (so you don't need sudo)
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

## Step 2: Upload Your Project to VPS

**Option A: Using Git (Recommended)**
```bash
# On VPS, clone your repository
cd /home/your-user
git clone https://github.com/your-username/your-repo.git wififly
cd wififly
```

**Option B: Using SCP**
```bash
# From your local machine
scp -r ./aaawififly your-user@your-vps-ip:/home/your-user/wififly
```

## Step 3: Create Production Environment File

SSH into your VPS and navigate to the project folder:

```bash
cd /home/your-user/wififly
```

Create the `.env.production` file:

```bash
cat > .env.production << EOF
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
EOF
```

## Step 4: Build and Start Docker Containers

```bash
# Build the Docker image
docker-compose build

# Start the containers in background
docker-compose up -d

# Check status
docker-compose ps
```

## Step 5: Configure Your Domain (Nginx Setup)

Edit the `nginx.conf` file to use your domain:

```bash
nano nginx.conf
```

Find this line:
```
server_name localhost;
```

Replace with your domain:
```
server_name yourdomain.com www.yourdomain.com;
```

Then restart Nginx:
```bash
docker-compose restart nginx
```

## Step 6: Set Up SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Create SSL certificate (replace with your domain)
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Certificate files will be at:
# - /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# - /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

## Step 7: Update Nginx Config for HTTPS

Copy SSL certificates to a secure location:

```bash
sudo mkdir -p /home/your-user/wififly/ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /home/your-user/wififly/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /home/your-user/wififly/ssl/key.pem
sudo chown your-user:your-user /home/your-user/wififly/ssl/*
```

Edit `nginx.conf` and uncomment the HTTPS server block:

```bash
nano nginx.conf
```

Replace the commented HTTPS section with:
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    location / {
        proxy_pass http://nextjs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

Restart Nginx:
```bash
docker-compose restart nginx
```

## Step 8: Point Your Domain to VPS

In your domain provider (GoDaddy, Namecheap, etc.), update DNS records:

- **A Record**: `@` or `yourdomain.com` → `your-vps-ip`
- **A Record**: `www` → `your-vps-ip`

Wait 5-30 minutes for DNS to propagate.

## Useful Commands

### View Logs
```bash
# All containers
docker-compose logs -f

# Specific container
docker-compose logs -f wififly-app
docker-compose logs -f nginx
```

### Stop and Start
```bash
# Stop all containers
docker-compose down

# Start all containers
docker-compose up -d

# Restart a specific service
docker-compose restart wififly-app
```

### Update Your App
```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

### View Container Status
```bash
docker-compose ps
```

## Firewall Rules

Make sure your VPS firewall allows:
- Port 80 (HTTP)
- Port 443 (HTTPS)
- Port 22 (SSH)

```bash
# UFW firewall example
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Auto-Renew SSL Certificate

Create a cron job to auto-renew certificates:

```bash
# Edit crontab
sudo crontab -e

# Add this line (runs at 2 AM daily)
0 2 * * * certbot renew --quiet --post-hook "cd /home/your-user/wififly && sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./ssl/cert.pem && sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./ssl/key.pem && sudo chown your-user:your-user ./ssl/*"
```

## Troubleshooting

**Container won't start:**
```bash
docker-compose logs wififly-app
```

**Nginx not proxying correctly:**
```bash
docker-compose logs nginx
```

**Port already in use:**
```bash
sudo lsof -i :80
sudo lsof -i :443
sudo lsof -i :3000
```

**Need to rebuild:**
```bash
docker-compose build --no-cache
docker-compose up -d
```

## Performance Tips

1. Monitor resource usage: `docker stats`
2. Enable gzip compression (already in nginx.conf)
3. Use CDN for static assets (optional)
4. Set up regular backups
5. Monitor logs for errors

## Next Steps

1. Set up monitoring/alerts
2. Configure automatic backups
3. Set up CI/CD pipeline for automatic deployments
4. Monitor performance and logs regularly

---

Questions? Check Docker and Next.js documentation!