# EV Backend AWS EC2 Deployment Guide

This guide will help you deploy the EV Charging Backend to AWS EC2.

## Prerequisites

- AWS Account with EC2 access
- Basic knowledge of AWS services
- SSH access to EC2 instances

## Step 1: Launch EC2 Instance

### 1.1 Create EC2 Instance
1. Go to AWS EC2 Console
2. Click "Launch Instance"
3. Choose Ubuntu Server 22.04 LTS (Free tier eligible)
4. Select instance type: `t2.micro` (free tier) or `t3.small` (recommended for production)
5. Configure security group with these rules:
   - SSH (22) - Your IP
   - HTTP (80) - 0.0.0.0/0
   - HTTPS (443) - 0.0.0.0/0
   - Custom TCP (9000) - 0.0.0.0/0 (for direct API access)

### 1.2 Connect to Instance
```bash
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

## Step 2: Set Up RDS MySQL Database (Recommended)

### 2.1 Create RDS Instance
1. Go to AWS RDS Console
2. Click "Create database"
3. Choose MySQL
4. Select "Free tier" template
5. Set database identifier: `ev-charging-db`
6. Set master username: `ev_user`
7. Set master password: `your-secure-password`
8. Configure VPC and security group
9. Note the endpoint URL

### 2.2 Create Database and User
```sql
CREATE DATABASE ev_charging;
CREATE USER 'ev_user'@'%' IDENTIFIED BY 'your-secure-password';
GRANT ALL PRIVILEGES ON ev_charging.* TO 'ev_user'@'%';
FLUSH PRIVILEGES;
```

## Step 3: Deploy Application

### 3.1 Upload Application Files
```bash
# On your local machine, create a deployment package
tar -czf ev-backend.tar.gz \
  main.py \
  database.py \
  models.py \
  schemas.py \
  crud.py \
  status_api.py \
  ocpp_router.py \
  ws_bridge.py \
  requirements-prod.txt \
  Dockerfile \
  docker-compose.yml \
  nginx.conf \
  ev-backend.service \
  production.env \
  deploy.sh

# Upload to EC2
scp -i your-key.pem ev-backend.tar.gz ubuntu@your-ec2-public-ip:~/
```

### 3.2 Extract and Deploy
```bash
# On EC2 instance
cd ~
tar -xzf ev-backend.tar.gz
mkdir -p ev-backend
mv *.py *.txt *.yml *.conf *.service *.env *.sh ev-backend/
cd ev-backend

# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### 3.3 Configure Environment Variables
```bash
# Edit the .env file with your actual values
nano .env

# Update these values:
# DB_HOST=your-rds-endpoint.amazonaws.com
# DB_PASSWORD=your-secure-password
# ALLOWED_HOSTS=your-domain.com,your-ec2-public-ip
```

## Step 4: Start Services

### 4.1 Start Backend Service
```bash
sudo systemctl start ev-backend
sudo systemctl enable ev-backend
sudo systemctl status ev-backend
```

### 4.2 Start Nginx
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl status nginx
```

## Step 5: Test Deployment

### 5.1 Test API Endpoints
```bash
# Test health endpoint
curl http://your-ec2-public-ip/health

# Test root endpoint
curl http://your-ec2-public-ip/

# Test API docs
curl http://your-ec2-public-ip/docs
```

### 5.2 Test WebSocket Connection
```bash
# Test WebSocket (you can use a WebSocket testing tool)
# URL: ws://your-ec2-public-ip/ws/EV001
```

## Step 6: Optional - Set Up Domain and SSL

### 6.1 Configure Domain (if you have one)
1. Point your domain to EC2 public IP
2. Update Nginx configuration with your domain
3. Restart Nginx

### 6.2 Set Up SSL with Let's Encrypt
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## Step 7: Monitoring and Maintenance

### 7.1 View Logs
```bash
# Backend logs
sudo journalctl -u ev-backend -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 7.2 Restart Services
```bash
# Restart backend
sudo systemctl restart ev-backend

# Restart Nginx
sudo systemctl restart nginx
```

### 7.3 Update Application
```bash
# Stop services
sudo systemctl stop ev-backend

# Update code
# (upload new files and replace old ones)

# Restart services
sudo systemctl start ev-backend
```

## Docker Deployment (Alternative)

If you prefer Docker deployment:

```bash
# Install Docker
sudo apt install docker.io docker-compose
sudo usermod -aG docker ubuntu
newgrp docker

# Deploy with Docker Compose
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f
```

## Security Considerations

1. **Firewall**: Only open necessary ports
2. **Database**: Use RDS with proper security groups
3. **SSL**: Always use HTTPS in production
4. **Updates**: Keep system and dependencies updated
5. **Monitoring**: Set up CloudWatch or similar monitoring
6. **Backups**: Regular database backups

## Troubleshooting

### Common Issues

1. **Port 9000 not accessible**: Check security group rules
2. **Database connection failed**: Verify RDS endpoint and credentials
3. **Service won't start**: Check logs with `journalctl -u ev-backend`
4. **WebSocket not working**: Verify Nginx WebSocket configuration

### Useful Commands

```bash
# Check service status
sudo systemctl status ev-backend nginx

# Check port usage
sudo netstat -tlnp | grep :9000

# Check Nginx configuration
sudo nginx -t

# View real-time logs
sudo journalctl -u ev-backend -f
```

## Cost Optimization

1. Use t2.micro for development/testing
2. Use t3.small for production
3. Consider Spot instances for non-critical workloads
4. Use RDS free tier for development
5. Set up CloudWatch billing alerts

## Next Steps

1. Set up monitoring with CloudWatch
2. Configure auto-scaling if needed
3. Set up CI/CD pipeline
4. Implement backup strategies
5. Set up staging environment

---

**Your EV Backend should now be running on AWS EC2!** 🚀

Access your API at: `http://your-ec2-public-ip`
API Documentation: `http://your-ec2-public-ip/docs`
Health Check: `http://your-ec2-public-ip/health`
