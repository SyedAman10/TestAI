#!/bin/bash

# Ubuntu Server Setup Script for Ketamine Therapy Companion API
# This script installs Node.js, dependencies, and sets up the application

set -e  # Exit on error

echo "=================================="
echo "Ubuntu Server Setup - LLM API"
echo "=================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}Please do not run as root/sudo${NC}"
   exit 1
fi

# Update system packages
echo -e "\n${GREEN}[1/6] Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x (LTS)
echo -e "\n${GREEN}[2/6] Installing Node.js 20.x...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "Node.js is already installed ($(node -v))"
fi

# Install build essentials (needed for some npm packages)
echo -e "\n${GREEN}[3/6] Installing build essentials...${NC}"
sudo apt-get install -y build-essential

# Install npm dependencies
echo -e "\n${GREEN}[4/6] Installing npm dependencies...${NC}"
npm install

# Setup environment file
echo -e "\n${GREEN}[5/6] Setting up environment file...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Created .env file from .env.example${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env and add your HUGGINGFACE_API_KEY${NC}"
else
    echo ".env file already exists"
fi

# Create necessary directories
echo -e "\n${GREEN}[6/6] Creating necessary directories...${NC}"
mkdir -p uploads knowledge-base logs

# Set proper permissions
chmod 755 uploads knowledge-base logs

echo -e "\n${GREEN}=================================="
echo "✅ Setup Complete!"
echo "==================================${NC}"
echo ""
echo "Next steps:"
echo "1. Edit .env file: nano .env"
echo "2. Add your Hugging Face API key"
echo "3. Start the server: npm start"
echo "4. Or use PM2 for production: ./deploy-ubuntu.sh"
echo ""


