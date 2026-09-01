#!/bin/bash
# =============================================================================
# 03-ssl.sh — Install free Let's Encrypt SSL certificate for apkaai.com
# Run AFTER 02-nginx.sh AND after DNS A record points to this EC2 IP
# =============================================================================
set -euo pipefail

DOMAIN="apkaai.com"
EMAIL="admin@apkaai.com"     # ← change to your real email

echo "=============================================="
echo "  ApkaAI — SSL Certificate Setup (Let's Encrypt)"
echo "  Domain: $DOMAIN"
echo "  Email : $EMAIL"
echo "=============================================="

# ── Verify DNS points to this server ──────────────────────────────────────────
echo "[1/3] Checking DNS for $DOMAIN..."
MY_IP=$(curl -s https://checkip.amazonaws.com)
DNS_IP=$(dig +short "$DOMAIN" | tail -1)

echo "  This server IP : $MY_IP"
echo "  DNS resolves to: $DNS_IP"

if [ "$MY_IP" != "$DNS_IP" ]; then
  echo ""
  echo "⚠️  WARNING: DNS does not yet point to this server!"
  echo "   Please update your GoDaddy A record first (see 05-godaddy-dns-guide.md)"
  echo "   Then re-run this script."
  echo ""
  read -rp "   Continue anyway? (y/N) " CONFIRM
  [[ "$CONFIRM" =~ ^[Yy]$ ]] || exit 1
fi

# ── Stop Nginx temporarily so certbot can use port 80 ─────────────────────────
echo "[2/3] Requesting SSL certificate..."
sudo systemctl stop nginx

sudo certbot certonly \
  --standalone \
  --non-interactive \
  --agree-tos \
  --email "$EMAIL" \
  -d "$DOMAIN" \
  -d "www.$DOMAIN"

# ── Restart Nginx ──────────────────────────────────────────────────────────────
echo "[3/3] Restarting Nginx with SSL..."
sudo systemctl start nginx
sudo nginx -t
sudo systemctl reload nginx

# ── Auto-renewal cron ─────────────────────────────────────────────────────────
echo "  Setting up auto-renewal..."
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --pre-hook 'systemctl stop nginx' --post-hook 'systemctl start nginx'") | crontab -

echo ""
echo "✅ SSL certificate installed for $DOMAIN"
echo "   Certificate expires in 90 days and auto-renews."
echo ""
echo "Next step: Run bash 04-s3-cloudfront.sh to set up S3 + CloudFront CDN"
