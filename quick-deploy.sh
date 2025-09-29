#!/bin/bash

# Quick EV Backend Deployment Script
# This script automates the entire deployment process

set -e

echo "🚀 EV Backend Quick Deployment Script"
echo "====================================="

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo "❌ Please don't run this script as root. Run as ubuntu user."
    exit 1
fi

# Get EC2 public IP
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
echo "📍 EC2 Public IP: $PUBLIC_IP"

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install dependencies
echo "🔧 Installing system dependencies..."
sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip nginx mysql-client curl git

# Create application directory
echo "📁 Setting up application directory..."
mkdir -p ~/ev-backend
cd ~/ev-backend

# Create virtual environment
echo "🐍 Creating Python virtual environment..."
python3.11 -m venv venv
source venv/bin/activate

# Install Python dependencies
echo "📚 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements-prod.txt

# Set up environment variables
echo "⚙️ Setting up environment variables..."
cat > .env << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ev_charging
DB_USER=ev_user
DB_PASSWORD=ev_password_123

# Application Configuration
APP_NAME=EV Charging Backend
APP_VERSION=1.0.0
DEBUG=False
LOG_LEVEL=INFO

# Server Configuration
HOST=0.0.0.0
PORT=9000
WORKERS=4

# Security
SECRET_KEY=$(openssl rand -hex 32)
ALLOWED_HOSTS=$PUBLIC_IP,localhost

# CORS Configuration
CORS_ORIGINS=http://$PUBLIC_IP,http://localhost:3000
EOF

# Set up systemd service
echo "🔧 Setting up systemd service..."
sudo tee /etc/systemd/system/ev-backend.service > /dev/null << EOF
[Unit]
Description=EV Charging Backend Service
After=network.target

[Service]
Type=exec
User=ubuntu
Group=ubuntu
WorkingDirectory=/home/ubuntu/ev-backend
Environment=PATH=/home/ubuntu/ev-backend/venv/bin
ExecStart=/home/ubuntu/ev-backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 9000 --workers 4
ExecReload=/bin/kill -HUP \$MAINPID
Restart=always
RestartSec=10

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths=/home/ubuntu/ev-backend

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=ev-backend

[Install]
WantedBy=multi-user.target
EOF

# Configure Nginx
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/ev-backend > /dev/null << EOF
server {
    listen 80;
    server_name $PUBLIC_IP _;

    location / {
        proxy_pass http://127.0.0.1:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /ws/ {
        proxy_pass http://127.0.0.1:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/ev-backend /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Enable and start services
echo "🚀 Starting services..."
sudo systemctl daemon-reload
sudo systemctl enable ev-backend
sudo systemctl start ev-backend
sudo systemctl restart nginx

# Wait for service to start
sleep 5

# Check service status
echo "📊 Checking service status..."
if sudo systemctl is-active --quiet ev-backend; then
    echo "✅ EV Backend service is running"
else
    echo "❌ EV Backend service failed to start"
    sudo systemctl status ev-backend --no-pager
    exit 1
fi

if sudo systemctl is-active --quiet nginx; then
    echo "✅ Nginx service is running"
else
    echo "❌ Nginx service failed to start"
    sudo systemctl status nginx --no-pager
    exit 1
fi

# Test endpoints
echo "🧪 Testing endpoints..."
if curl -f http://localhost:9000/health > /dev/null 2>&1; then
    echo "✅ Health endpoint is working"
else
    echo "❌ Health endpoint is not responding"
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo "====================================="
echo "🌐 Your EV Backend is now accessible at:"
echo "   http://$PUBLIC_IP"
echo "   http://$PUBLIC_IP/docs (API Documentation)"
echo "   http://$PUBLIC_IP/health (Health Check)"
echo ""
echo "📝 Next steps:"
echo "   1. Set up your MySQL database"
echo "   2. Update .env file with your database credentials"
echo "   3. Configure security groups to allow traffic on port 80 and 9000"
echo "   4. Test the WebSocket connection: ws://$PUBLIC_IP/ws/EV001"
echo ""
echo "🔧 Useful commands:"
echo "   sudo systemctl status ev-backend    # Check backend status"
echo "   sudo journalctl -u ev-backend -f    # View backend logs"
echo "   sudo systemctl restart ev-backend   # Restart backend"
echo ""
