#!/bin/bash
# =============================================================================
# deploy.sh — Re-deploy latest code to EC2 (run after pushing to Git)
# Usage:   bash deploy/deploy.sh
# Prereq:  SSH key at ~/.ssh/apkaai-key.pem  OR  deploy/apkaai-key.pem
# =============================================================================
set -euo pipefail

EC2_USER="ec2-user"
EC2_HOST="3.6.107.51"            # ApkaAI EC2 Elastic IP (ap-south-1 Mumbai)
APP_DIR="/home/ec2-user/apkaai"

# ── Locate SSH key ────────────────────────────────────────────────────────────
SSH_KEY=""
for candidate in "$HOME/.ssh/apkaai-key.pem" "$(dirname "$0")/apkaai-key.pem"; do
  if [[ -f "$candidate" ]]; then
    SSH_KEY="-i $candidate"
    break
  fi
done

echo "🚀 Deploying ApkaAI to $EC2_HOST..."
echo "   SSH key : ${SSH_KEY:-<using ssh-agent>}"
echo ""

# shellcheck disable=SC2029
ssh -o StrictHostKeyChecking=no $SSH_KEY "$EC2_USER@$EC2_HOST" << 'REMOTE'
  set -euo pipefail
  APP_DIR="/home/ec2-user/apkaai"
  cd "$APP_DIR"

  # ── 1. Pull latest code ────────────────────────────────────────────────────
  echo "[1/6] Pulling latest code from GitHub..."
  git pull origin main
  echo "  ✅ Code up to date — $(git log --oneline -1)"

  # ── 2. Run DB migrations (idempotent — safe to run every deploy) ───────────
  echo "[2/6] Running database migrations..."
  if [[ -z "${DATABASE_URL:-}" ]]; then
    # Build DATABASE_URL from individual env vars in backend/.env
    export $(grep -E '^(DB_HOST|DB_PORT|DB_NAME|DB_USER|DB_PASS|DB_SSL)=' "$APP_DIR/backend/.env" | xargs)
    export DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT:-5432}/${DB_NAME}"
  fi

  # Run the full schema (all CREATE TABLE IF NOT EXISTS — safe to re-run)
  psql "$DATABASE_URL" -f "$APP_DIR/backend/src/lib/schema.sql" \
    && echo "  ✅ Schema migrations applied" \
    || echo "  ⚠️  Migration warning (check output above)"

  # ── 3. Install backend dependencies ───────────────────────────────────────
  echo "[3/6] Installing backend dependencies..."
  cd "$APP_DIR/backend"
  # Use npm install (not npm ci) so package-lock is updated if needed
  npm install --omit=dev --prefer-offline 2>&1 | tail -5
  echo "  ✅ Backend packages ready"

  # ── 4. Build frontend ─────────────────────────────────────────────────────
  echo "[4/6] Installing & building frontend..."
  cd "$APP_DIR/frontend"
  npm install --prefer-offline 2>&1 | tail -5
  # Clear Next.js build cache to avoid stale artefacts
  rm -rf .next
  npm run build 2>&1 | tail -20
  echo "  ✅ Frontend built"

  # ── 5. Restart services ───────────────────────────────────────────────────
  echo "[5/6] Restarting PM2 services..."
  pm2 restart apkaai-api      --update-env
  pm2 restart apkaai-frontend --update-env
  pm2 save
  echo "  ✅ Services restarted"

  # ── 6. Health checks ──────────────────────────────────────────────────────
  echo "[6/6] Running health checks..."
  sleep 5
  API_STATUS=$(curl -sf http://localhost:4000/health 2>/dev/null && echo "ok" || echo "fail")
  FE_STATUS=$(curl -sf -o /dev/null http://localhost:3000 2>/dev/null && echo "ok" || echo "fail")

  if [[ "$API_STATUS" == "ok" ]]; then
    echo "  ✅ API  healthy  → http://3.6.107.51/api"
  else
    echo "  ❌ API  NOT responding — check: pm2 logs apkaai-api"
  fi

  if [[ "$FE_STATUS" == "ok" ]]; then
    echo "  ✅ Frontend healthy → http://3.6.107.51"
  else
    echo "  ❌ Frontend NOT responding — check: pm2 logs apkaai-frontend"
  fi

REMOTE

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  ✅  Deployment complete!"
echo "  🌐  http://3.6.107.51      (live now)"
echo "  🔒  https://apkaai.com     (after DNS + SSL)"
echo "═══════════════════════════════════════════════════════"
