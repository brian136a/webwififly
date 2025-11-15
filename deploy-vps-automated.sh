#!/bin/bash

#################################
# WiFiFly VPS Automated Deployment
# Usage: bash deploy-vps-automated.sh
#################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  WiFiFly VPS Automated Deployment${NC}"
echo -e "${BLUE}================================================${NC}\n"

# Function to print colored output
log_info() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    log_error "This script must be run as root (use sudo)"
    exit 1
fi

# Step 1: Update system
echo -e "\n${BLUE}Step 1: Updating system packages...${NC}"
apt update && apt upgrade -y
log_info "System packages updated"

# Step 2: Install Docker
echo -e "\n${BLUE}Step 2: Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    log_info "Docker installed"
else
    log_warn "Docker already installed"
fi

# Step 3: Install Docker Compose
echo -e "\n${BLUE}Step 3: Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    log_info "Docker Compose installed"
else
    log_warn "Docker Compose already installed"
fi

# Step 4: Install Certbot for SSL
echo -e "\n${BLUE}Step 4: Installing Certbot for SSL certificates...${NC}"
if ! command -v certbot &> /dev/null; then
    apt install -y certbot python3-certbot-nginx
    log_info "Certbot installed"
else
    log_warn "Certbot already installed"
fi

# Step 5: Create application directory
echo -e "\n${BLUE}Step 5: Creating application directory...${NC}"
mkdir -p /home/aaawififly
log_info "Application directory created at /home/aaawififly"

# Step 6: Clone repository or sync files
echo -e "\n${BLUE}Step 6: Cloning repository...${NC}"
if [ -d "/home/aaawififly/.git" ]; then
    cd /home/aaawififly
    git pull origin main
    log_info "Repository updated"
else
    log_warn "Repository not found. Please upload your files using:"
    echo "   scp -r your-repo/* root@YOUR_VPS_IP:/home/aaawififly/"
    log_warn "Or clone manually: git clone https://github.com/YOUR_USERNAME/aaawififly.git /home/aaawififly"
    read -p "Press Enter once files are uploaded..."
fi

# Step 7: Create SSL directory
echo -e "\n${BLUE}Step 7: Creating SSL directory...${NC}"
mkdir -p /home/aaawififly/ssl
log_info "SSL directory created"

# Step 8: Configure firewall
echo -e "\n${BLUE}Step 8: Configuring firewall...${NC}"
if command -v ufw &> /dev/null; then
    ufw enable -y
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    log_info "Firewall configured (SSH, HTTP, HTTPS enabled)"
else
    log_warn "UFW not available. Please configure firewall manually."
fi

# Step 9: Enable Docker daemon on startup
echo -e "\n${BLUE}Step 9: Configuring Docker to start on boot...${NC}"
systemctl enable docker
log_info "Docker enabled on startup"

# Step 10: Build Docker image
echo -e "\n${BLUE}Step 10: Building Docker image...${NC}"
cd /home/aaawififly
docker-compose build --no-cache
log_info "Docker image built successfully"

# Step 11: Start services
echo -e "\n${BLUE}Step 11: Starting services...${NC}"
docker-compose up -d
log_info "Services started"

# Step 12: Verify services
echo -e "\n${BLUE}Step 12: Verifying services...${NC}"
sleep 5
docker-compose ps

# Step 13: Test connectivity
echo -e "\n${BLUE}Step 13: Testing connectivity...${NC}"
if curl -s http://localhost:3000 > /dev/null; then
    log_info "Frontend is responding (port 3000)"
else
    log_error "Frontend not responding"
fi

if curl -s http://localhost:3001/empty.php > /dev/null; then
    log_info "Backend is responding (port 3001)"
else
    log_error "Backend not responding"
fi

# Step 14: SSL Certificate Setup
echo -e "\n${BLUE}Step 14: SSL Certificate Setup${NC}"
read -p "Do you want to setup SSL with Let's Encrypt now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter your domain name: " DOMAIN
    certbot certonly --standalone -d "$DOMAIN" -d "www.$DOMAIN"
    
    # Copy certificates to ssl directory
    cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem /home/aaawififly/ssl/wififly.crt
    cp /etc/letsencrypt/live/$DOMAIN/privkey.pem /home/aaawififly/ssl/wififly.key
    
    log_info "SSL certificates configured"
    log_warn "Remember to update nginx.conf with your domain name"
    log_warn "Then run: docker-compose restart nginx"
else
    log_warn "SSL setup skipped. Configure manually later with:"
    echo "   certbot certonly --standalone -d yourdomain.com"
    echo "   Then copy certificates to ssl/ directory"
fi

# Final summary
echo -e "\n${BLUE}================================================${NC}"
echo -e "${GREEN}✓ Deployment Complete!${NC}"
echo -e "${BLUE}================================================${NC}\n"

echo "Your WiFiFly application is running!"
echo ""
echo "Access your app at:"
echo "  - Frontend: http://$(hostname -I | awk '{print $1}'):3000"
echo "  - Backend: http://$(hostname -I | awk '{print $1}'):3001"
echo ""
echo "Useful commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Restart: docker-compose restart"
echo "  - Stop: docker-compose down"
echo "  - Status: docker-compose ps"
echo ""
echo "Next steps:"
echo "  1. Point your domain to this VPS IP"
echo "  2. Update nginx.conf with your domain"
echo "  3. Setup SSL certificate (if not done)"
echo "  4. Restart Nginx: docker-compose restart nginx"
echo ""
log_info "Deployment finished successfully!"
