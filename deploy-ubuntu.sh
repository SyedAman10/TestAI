#!/bin/bash

# Production Deployment Script using PM2
# This script sets up the application to run as a service using PM2

set -e  # Exit on error

echo "=================================="
echo "Production Deployment with PM2"
echo "=================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    echo "Please run ./setup-ubuntu.sh first"
    exit 1
fi

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${GREEN}Installing PM2...${NC}"
    sudo npm install -g pm2
else
    echo "PM2 is already installed"
fi

# Stop existing PM2 process if running
echo -e "\n${GREEN}Stopping existing processes...${NC}"
pm2 delete llm-api 2>/dev/null || true

# Start the application with PM2
echo -e "\n${GREEN}Starting application with PM2...${NC}"
pm2 start server.js --name llm-api --node-args="--max-old-space-size=2048"

# Save PM2 configuration
echo -e "\n${GREEN}Saving PM2 configuration...${NC}"
pm2 save

# Setup PM2 to start on system boot
echo -e "\n${GREEN}Setting up PM2 startup script...${NC}"
pm2 startup | tail -n 1 | sudo bash

echo -e "\n${GREEN}=================================="
echo "✅ Deployment Complete!"
echo "==================================${NC}"
echo ""
echo "Useful PM2 commands:"
echo "  pm2 status          - Check application status"
echo "  pm2 logs llm-api    - View logs"
echo "  pm2 restart llm-api - Restart application"
echo "  pm2 stop llm-api    - Stop application"
echo "  pm2 monit           - Monitor resources"
echo ""
echo "Server is now running in the background!"
echo ""


