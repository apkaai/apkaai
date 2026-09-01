#!/bin/bash
# =============================================================================
# 01-setup-ec2.sh — Bootstrap an EC2 t2.micro (Amazon Linux 2023) for apkaai.com
# Run this as: bash 01-setup-ec2.sh
# Tested on   : Amazon Linux 2023 (free tier t2.micro, ap-south-1)
# =============================================================================
set -euo pipefail

echo "=============================================="
echo "  ApkaAI — EC2 Bootstrap Script"
echo "  Region: ap-south-1 (Mumbai)"
echo "=============================================="

# ── 1. System update ───────────────────────────────────────────────────────────
echo "[1/8] Updating system packages..."
sudo dnf update -y

# ── 2. Install Node.js 20 LTS ─────────────────────────────────────────────────
echo "[2/8] Installing Node.js 20 LTS..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs
node --version
npm --version

# ── 3. Install Git, nginx, certbot ────────────────────────────────────────────
echo "[3/8] Installing Git, Nginx, Certbot..."
sudo dnf install -y git nginx python3-certbot-nginx

# ── 4. Install PM2 (process manager) ─────────────────────────────────────────
echo "[4/8] Installing PM2..."
sudo npm install -g pm2
pm2 --version

# ── 5. Clone / update repository ─────────────────────────────────────────────
echo "[5/8] Cloning apkaai repository..."
cd /home/ec2-user

if [ -d "apkaai" ]; then
  echo "  Repo exists — pulling latest..."
  cd apkaai && git pull origin main
else
  # Replace with your actual Git repo URL
  git clone https://github.com/YOUR_USERNAME/apkaai.git
  cd apkaai
fi

# ── 6. Install dependencies ───────────────────────────────────────────────────
echo "[6/8] Installing dependencies..."

# Backend
cd /home/ec2-user/apkaai/backend
npm ci --omit=dev

# Frontend
cd /home/ec2-user/apkaai/frontend
npm ci
npm run build

# ── 7. Environment files ──────────────────────────────────────────────────────
echo "[7/8] Setting up .env files..."

# Backend .env (edit these values after running the script)
if [ ! -f /home/ec2-user/apkaai/backend/.env ]; then
  cat > /home/ec2-user/apkaai/backend/.env << 'EOF'
PORT=4000
NODE_ENV=production
AWS_REGION=ap-south-1
DYNAMODB_TOOLS_TABLE=apkaai-tools
DYNAMODB_CATEGORIES_TABLE=apkaai-categories
DYNAMODB_CONTACTS_TABLE=apkaai-contacts
FRONTEND_URL=https://apkaai.com
EOF
  echo "  Created backend/.env — add your AWS credentials if not using IAM role"
fi

# Frontend .env.production
if [ ! -f /home/ec2-user/apkaai/frontend/.env.production ]; then
  cat > /home/ec2-user/apkaai/frontend/.env.production << 'EOF'
NEXT_PUBLIC_API_URL=https://apkaai.com/api
EOF
fi

# ── 8. Start with PM2 ─────────────────────────────────────────────────────────
echo "[8/8] Starting services with PM2..."

# Stop any existing PM2 apps
pm2 delete all 2>/dev/null || true

# Start backend API
cd /home/ec2-user/apkaai/backend
pm2 start src/index.js --name "apkaai-api" --env production

# Start Next.js frontend
cd /home/ec2-user/apkaai/frontend
pm2 start npm --name "apkaai-frontend" -- start

# Save PM2 process list and enable on boot
pm2 save
pm2 startup systemd -u ec2-user --hp /home/ec2-user | tail -1 | sudo bash

echo ""
echo "✅ EC2 bootstrap complete!"
echo "   Backend  running on : http://localhost:4000"
echo "   Frontend running on : http://localhost:3000"
echo ""
echo "Next steps:"
echo "  1. Run: bash 02-nginx.sh       (configure reverse proxy)"
echo "  2. Run: bash 03-ssl.sh         (get SSL certificate)"
echo "  3. Run: bash 04-s3-cloudfront.sh (set up CDN)"
