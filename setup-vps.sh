#!/bin/bash

# WiFiFly Docker VPS Setup Script
# Run this on your VPS after cloning the repository

set -e

echo "================================================"
echo "WiFiFly Docker VPS Setup Script"
echo "================================================"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "This script should be run as root (use sudo)"
   exit 1
fi

# Update system
echo "Step 1: Updating system packages..."
apt update && apt upgrade -y

# Install Docker
echo "Step 2: Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Install Docker Compose
echo "Step 3: Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Certbot for SSL
echo "Step 4: Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# Verify installations
echo ""
echo "================================================"
echo "Installation Complete!"
echo "================================================"
echo ""
echo "Docker version:"
docker --version
echo ""
echo "Docker Compose version:"
docker-compose --version
echo ""
echo "Certbot version:"
certbot --version
echo ""
echo "Next steps:"
echo "1. Create .env.production file with your settings"
echo "2. Run: docker-compose build"
echo "3. Run: docker-compose up -d"
echo "4. Point your domain to this server's IP"
echo "5. Set up SSL certificate"
echo ""
echo "For more details, see DOCKER_DEPLOYMENT.md"