#!/bin/bash

# EV Backend AWS EC2 Deployment Script
# Make sure to run this script as ubuntu user on your EC2 instance

set -e  # Exit on any error

echo "🚀 Starting EV Backend Deployment..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required system packages
echo "🔧 Installing system dependencies..."
sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip nginx mysql-client curl

# Create application directory
echo "📁 Setting up application directory..."
sudo mkdir -p /home/ubuntu/ev-backend
sudo chown ubuntu:ubuntu /home/ubuntu/ev-backend
cd /home/ubuntu/ev-backend

# Create virtual environment
echo "🐍 Creating Python virtual environment..."
python3.11 -m venv venv
source venv/bin/activate

# Install Python dependencies
echo "📚 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements-prod.txt

# Copy application files (assuming you've uploaded them)
echo "📋 Copying application files..."
# Note: You'll need to upload your application files to this directory

# Set up environment variables
echo "⚙️ Setting up environment variables..."
cp production.env .env
echo "⚠️  Please edit .env file with your actual database credentials and settings"

# Set up systemd service
echo "🔧 Setting up systemd service..."
sudo cp ev-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable ev-backend

# Configure Nginx
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/ev-backend > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com your-ec2-public-ip;

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

    # WebSocket support
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

# Start services
echo "🚀 Starting services..."
sudo systemctl start ev-backend
sudo systemctl restart nginx

# Check service status
echo "📊 Checking service status..."
sudo systemctl status ev-backend --no-pager
sudo systemctl status nginx --no-pager

echo "✅ Deployment completed!"
echo "🌐 Your EV Backend should be accessible at: http://your-ec2-public-ip"
echo "📝 Don't forget to:"
echo "   1. Edit .env file with your database credentials"
echo "   2. Set up your RDS MySQL database"
echo "   3. Configure security groups to allow traffic on port 80 and 9000"
echo "   4. Set up SSL certificate for HTTPS (optional but recommended)"
