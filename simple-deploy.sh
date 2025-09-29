#!/bin/bash

# Ultra-Simple EV Backend Deployment (No Docker)
# This is the most basic deployment possible

set -e

echo "🚀 Simple EV Backend Deployment (No Docker)"
echo "=========================================="

# Update system
echo "📦 Updating system..."
sudo apt update && sudo apt upgrade -y

# Install Python and pip
echo "🐍 Installing Python..."
sudo apt install -y python3.11 python3.11-venv python3-pip

# Install Python dependencies
echo "📚 Installing Python packages..."
pip3 install fastapi uvicorn sqlalchemy pymysql mysql-connector-python ocpp python-dotenv pydantic pydantic-settings

# Create app directory
echo "📁 Setting up application..."
mkdir -p ~/ev-backend
cd ~/ev-backend

# Copy your application files here
echo "📋 Please copy your application files to ~/ev-backend/"
echo "   Files needed: main.py, database.py, models.py, schemas.py, crud.py, status_api.py, ocpp_router.py, ws_bridge.py"

# Create simple startup script
cat > start.sh << 'EOF'
#!/bin/bash
cd ~/ev-backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 9000 --reload
EOF

chmod +x start.sh

# Create simple systemd service
sudo tee /etc/systemd/system/ev-backend.service > /dev/null << EOF
[Unit]
Description=EV Backend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/ev-backend
ExecStart=/home/ubuntu/ev-backend/start.sh
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable ev-backend
sudo systemctl start ev-backend

# Get public IP
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

echo ""
echo "✅ Deployment completed!"
echo "🌐 Your API is running at: http://$PUBLIC_IP:9000"
echo "📖 API docs at: http://$PUBLIC_IP:9000/docs"
echo "❤️ Health check: http://$PUBLIC_IP:9000/health"
echo ""
echo "🔧 To manage the service:"
echo "   sudo systemctl start ev-backend    # Start"
echo "   sudo systemctl stop ev-backend     # Stop"
echo "   sudo systemctl restart ev-backend  # Restart"
echo "   sudo systemctl status ev-backend   # Status"
echo ""

