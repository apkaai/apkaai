#!/bin/bash
# =============================================================================
# 02-nginx.sh — Configure Nginx as reverse proxy for apkaai.com
# Run AFTER 01-setup-ec2.sh
# =============================================================================
set -euo pipefail

DOMAIN="apkaai.com"
NGINX_CONF="/etc/nginx/conf.d/apkaai.conf"

echo "=============================================="
echo "  ApkaAI — Nginx Reverse Proxy Setup"
echo "  Domain: $DOMAIN"
echo "=============================================="

# ── Write Nginx config ─────────────────────────────────────────────────────────
echo "[1/3] Writing Nginx configuration..."

sudo tee "$NGINX_CONF" > /dev/null << EOF
# ── Rate limiting zone ─────────────────────────────────────────────────────────
limit_req_zone \$binary_remote_addr zone=apkaai_api:10m rate=20r/s;

# ── HTTP → HTTPS redirect ──────────────────────────────────────────────────────
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$host\$request_uri;
}

# ── Main HTTPS server ──────────────────────────────────────────────────────────
server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL certs (managed by certbot — filled in by 03-ssl.sh)
    ssl_certificate     /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header X-Frame-Options          "SAMEORIGIN"            always;
    add_header X-Content-Type-Options   "nosniff"               always;
    add_header X-XSS-Protection         "1; mode=block"         always;
    add_header Referrer-Policy          "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1024;

    # ── API routes → Express backend (port 4000) ────────────────────────────────
    location /api/ {
        limit_req zone=apkaai_api burst=40 nodelay;

        proxy_pass         http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade           \$http_upgrade;
        proxy_set_header   Connection        "upgrade";
        proxy_set_header   Host              \$host;
        proxy_set_header   X-Real-IP         \$remote_addr;
        proxy_set_header   X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_read_timeout 30s;
        proxy_buffering    off;
    }

    # ── Health check endpoint ────────────────────────────────────────────────────
    location /health {
        proxy_pass       http://127.0.0.1:4000/health;
        proxy_set_header Host \$host;
        access_log       off;
    }

    # ── Next.js frontend (port 3000) ─────────────────────────────────────────────
    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade           \$http_upgrade;
        proxy_set_header   Connection        "upgrade";
        proxy_set_header   Host              \$host;
        proxy_set_header   X-Real-IP         \$remote_addr;
        proxy_set_header   X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_read_timeout 60s;
    }

    # ── Static Next.js assets (long cache) ──────────────────────────────────────
    location /_next/static/ {
        proxy_pass    http://127.0.0.1:3000/_next/static/;
        expires       365d;
        add_header    Cache-Control "public, immutable";
    }

    # Block dotfiles
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

# ── Test and reload Nginx ──────────────────────────────────────────────────────
echo "[2/3] Testing Nginx configuration..."
sudo nginx -t

echo "[3/3] Enabling and starting Nginx..."
sudo systemctl enable nginx
sudo systemctl restart nginx

echo ""
echo "✅ Nginx configured for $DOMAIN"
echo ""
echo "Next step: Run bash 03-ssl.sh to install SSL certificate"
