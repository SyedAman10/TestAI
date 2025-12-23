# Ubuntu Server Deployment Guide

This guide will help you deploy the Ketamine Therapy Companion API on an Ubuntu server.

## Prerequisites

- Ubuntu Server 20.04 or later
- SSH access to the server
- At least 2GB RAM
- Hugging Face API key ([Get one here](https://huggingface.co/settings/tokens))

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd TestAI
```

### 2. Run Setup Script

Make the setup script executable and run it:

```bash
chmod +x setup-ubuntu.sh
./setup-ubuntu.sh
```

This script will:
- Update system packages
- Install Node.js 20.x (LTS)
- Install build essentials
- Install npm dependencies
- Create `.env` file from template
- Create necessary directories

### 3. Configure Environment Variables

Edit the `.env` file and add your API key:

```bash
nano .env
```

Update the following:
```
HUGGINGFACE_API_KEY=your_actual_api_key_here
PORT=3000
```

Save and exit (Ctrl+X, then Y, then Enter)

### 4. Test the Application

Run the application in development mode to test:

```bash
npm start
```

Visit `http://your-server-ip:3000` to verify it's working.

Press Ctrl+C to stop the server.

## Production Deployment with PM2

For production, use PM2 to keep your application running 24/7:

### 1. Deploy with PM2

Make the deployment script executable and run it:

```bash
chmod +x deploy-ubuntu.sh
./deploy-ubuntu.sh
```

This will:
- Install PM2 (if not already installed)
- Start your application as a background service
- Configure automatic restart on system reboot
- Set up auto-recovery if the app crashes

### 2. Verify Deployment

Check the application status:

```bash
pm2 status
```

View logs:

```bash
pm2 logs llm-api
```

### 3. PM2 Management Commands

```bash
pm2 restart llm-api   # Restart the application
pm2 stop llm-api      # Stop the application
pm2 start llm-api     # Start the application
pm2 delete llm-api    # Remove from PM2
pm2 monit             # Monitor CPU/Memory usage
```

## Firewall Configuration

If you have a firewall enabled, allow access to the application port:

```bash
sudo ufw allow 3000/tcp
sudo ufw reload
```

## Nginx Reverse Proxy (Optional)

For production, it's recommended to use Nginx as a reverse proxy:

### 1. Install Nginx

```bash
sudo apt install nginx -y
```

### 2. Configure Nginx

Create a new configuration file:

```bash
sudo nano /etc/nginx/sites-available/llm-api
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Enable the Configuration

```bash
sudo ln -s /etc/nginx/sites-available/llm-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Allow HTTP/HTTPS through firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw reload
```

## SSL/HTTPS with Let's Encrypt (Optional)

Secure your API with free SSL certificates:

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

Follow the prompts to complete the SSL setup.

## Monitoring and Logs

### View Application Logs

```bash
pm2 logs llm-api
```

### Monitor Resources

```bash
pm2 monit
```

### System Logs

```bash
# Check if Node.js is running
ps aux | grep node

# Check port usage
sudo netstat -tulpn | grep :3000
```

## Updating the Application

When you push updates to your repository:

```bash
git pull origin main
npm install  # Install any new dependencies
pm2 restart llm-api
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill the process
sudo kill -9 <PID>
```

### Permission Issues

```bash
# Fix directory permissions
chmod 755 uploads knowledge-base logs
```

### Environment Variables Not Loading

```bash
# Verify .env file exists and has correct values
cat .env

# Restart the application
pm2 restart llm-api
```

### Check Application Status

```bash
pm2 status
pm2 logs llm-api --lines 100
```

## Security Recommendations

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use strong API keys** - Rotate them regularly
3. **Keep system updated**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```
4. **Use Nginx** - Add rate limiting and security headers
5. **Enable UFW firewall** - Only allow necessary ports
6. **Regular backups** - Back up your knowledge base and uploads

## Support

If you encounter issues:
1. Check logs: `pm2 logs llm-api`
2. Verify environment variables: `cat .env`
3. Check Node.js version: `node -v` (should be 20.x)
4. Verify port is not in use: `sudo lsof -i :3000`

---

**Ready to deploy!** 🚀


