# ApkaAI — Project Documentation

India's #1 AI Products Marketplace — Discover, compare and access the best AI tools.

---

## 🌐 Live URLs

| Environment | URL | Status |
|-------------|-----|--------|
| HTTP (live now) | http://3.6.107.51 | ✅ Live |
| Production | https://apkaai.com | ⏳ DNS pending |
| API Health | http://3.6.107.51/health | ✅ Live |

---

## 🏗️ Architecture

```
                    apkaai.com (GoDaddy DNS)
                           │
                    A record → 3.6.107.51
                           │
                    ┌──────▼──────────────┐
                    │   EC2 t3.micro      │
                    │   ap-south-1        │
                    │   (Mumbai)          │
                    │                     │
                    │  Nginx (port 80/443)│
                    │    ├── /api/*  ─────┼──► Node.js API (port 4000)
                    │    └── /*      ─────┼──► Next.js Frontend (port 3000)
                    └─────────────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
         PostgreSQL      S3 Bucket    IAM Role
        (RDS - 6 tables)(apkaai-assets)(apkaai-ec2-role)
```

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js (App Router) | 14.2.5 |
| UI | Tailwind CSS | 3.4.6 |
| Icons | Lucide React | 0.408.0 |
| Animations | Framer Motion | 11.3.8 |
| Backend | Node.js + Express | 20 LTS |
| Database | PostgreSQL (AWS RDS) | 16.9 |
| Static Assets | AWS S3 | — |
| Web Server | Nginx | Latest |
| Process Manager | PM2 | Latest |
| SSL | Let's Encrypt (certbot) | — |
| DNS | GoDaddy | — |
| Region | AWS ap-south-1 (Mumbai) | — |

---

## ☁️ AWS Infrastructure

| Resource | Name / ID | Details |
|----------|-----------|---------|
| EC2 Instance | `i-0bfe6016514b389ca` | t3.micro, Amazon Linux 2023 |
| Elastic IP | `3.6.107.51` | Allocation: `eipalloc-0c06934beb915b3b7` |
| Security Group | `sg-03244b4513931bae0` | Ports: 22, 80, 443 |
| S3 Bucket | `apkaai-assets` | Static media storage |
| IAM Role | `apkaai-ec2-role` | PostgreSQL + S3 access |
| IAM Policy | `apkaai-ec2-policy` | `arn:aws:iam::409154939720:policy/apkaai-ec2-policy` |
| RDS PostgreSQL | `apkaai-db` | `apkaai-db.cl8qcg44s0p7.ap-south-1.rds.amazonaws.com` |
| AWS Region | `ap-south-1` | Mumbai |
| AWS Account | `409154939720` | Free tier |

---

## 🗄️ Database Schema (PostgreSQL — 6 Tables)

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `users` | Registered users | user_id, email, name, password, role, reset_token |
| `categories` | AI tool categories | slug (PK), name, emoji, description, tool_count |
| `tools` | AI tools catalog | id, slug, name, pricing, rating, tags, featured |
| `contacts` | Contact form submissions | id, name, email, subject, message, status |
| `orders` | User orders | order_id, user_id, status, subtotal, discount, tax, total, coupon_code |
| `order_items` | Line items per order | id, order_id, tool_id, tool_name, plan_name, plan_price, billing_cycle |
| `cloud_estimates` | Cloud cost calculations | id, user_id, provider, monthly_cost, items |

### Order Status Flow
```
pending → confirmed → processing → completed
                                 ↘ cancelled → refunded
```

---

## 📁 Project Structure

```
apkaai/
├── PROJECT.md
├── README.md
├── .gitignore
│
├── frontend/                          ← Next.js 14 App
│   ├── app/
│   │   ├── page.tsx                   ← Homepage
│   │   ├── layout.tsx                 ← Root layout (CartProvider)
│   │   ├── globals.css                ← Dark purple theme
│   │   ├── tools/
│   │   │   ├── page.tsx               ← All tools catalog
│   │   │   └── [slug]/page.tsx        ← Tool detail page
│   │   ├── category/[slug]/page.tsx   ← Category page
│   │   ├── compare/page.tsx           ← Side-by-side comparison
│   │   ├── cart/
│   │   │   ├── page.tsx
│   │   │   └── CartPageClient.tsx     ← Cart with real checkout → /api/orders
│   │   ├── orders/
│   │   │   └── page.tsx               ← ✅ NEW: User order history
│   │   ├── profile/page.tsx           ← User profile + Order History link
│   │   ├── signin/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   ├── admin/
│   │   │   ├── page.tsx               ← Admin dashboard (Orders tab added)
│   │   │   ├── login/page.tsx
│   │   │   └── datalake/page.tsx
│   │   ├── cloud/page.tsx
│   │   ├── pricing/page.tsx
│   │   ├── blog/page.tsx
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   └── [careers|help|privacy|terms|cookies]/
│   ├── components/
│   │   ├── Navbar.tsx                 ← Order History in user dropdown
│   │   ├── Footer.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── ToolCard.tsx
│   │   ├── CategoryCard.tsx
│   │   ├── AIChatbot.tsx
│   │   ├── FloatingSocialWidget.tsx
│   │   ├── HoverPreview.tsx
│   │   ├── cart/
│   │   │   ├── CartDrawer.tsx
│   │   │   └── PlanModal.tsx
│   │   └── landing/
│   │       ├── HeroSection.tsx
│   │       ├── StatsBar.tsx
│   │       ├── FeaturedToolsSection.tsx
│   │       ├── CategoriesSection.tsx
│   │       ├── HowItWorksSection.tsx
│   │       ├── FeaturesSection.tsx
│   │       ├── CompareCTASection.tsx
│   │       ├── TestimonialsSection.tsx
│   │       └── FinalCTASection.tsx
│   └── lib/
│       ├── tools-data.ts              ← 70 tools + 16 categories (static)
│       └── cart-context.tsx           ← Cart state with localStorage
│
├── backend/                           ← Node.js + Express API
│   ├── src/
│   │   ├── index.js                   ← Express server (port 4000)
│   │   ├── routes/
│   │   │   ├── auth.js                ← register, login, me, forgot/reset-password
│   │   │   ├── tools.js
│   │   │   ├── categories.js
│   │   │   ├── contact.js
│   │   │   ├── admin.js               ← users, contacts, stats, drive-files
│   │   │   ├── analytics.js
│   │   │   ├── cloud.js
│   │   │   ├── orders.js              ← ✅ NEW: full order CRUD
│   │   │   └── datalake.js
│   │   └── lib/
│   │       ├── db.js                  ← PostgreSQL connection pool
│   │       ├── schema.sql             ← Full DB schema (6 tables)
│   │       ├── migrate.js             ← Run schema + seed data
│   │       └── migrate-history.js     ← Standalone: add user_history table
│   ├── package.json
│   └── .env.example
│
├── deploy/
│   ├── deploy.sh                      ← Re-deploy from Git
│   ├── 01-setup-ec2.sh
│   ├── 02-nginx.sh
│   ├── 03-ssl.sh
│   ├── 04-s3-cloudfront.sh
│   └── 05-godaddy-dns-guide.md
│
└── .kiro/settings/mcp.json
```

---

## 🔌 API Endpoints

Base URL: `http://3.6.107.51/api` (will be `https://apkaai.com/api` after DNS)

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Sign in, returns token |
| GET | `/api/auth/me` | Bearer | Get current user |
| POST | `/api/auth/forgot-password` | — | Send reset email |
| GET | `/api/auth/verify-reset-token` | — | Validate reset token |
| POST | `/api/auth/reset-password` | — | Set new password |

### Tools & Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tools` | List all tools (filter: category, pricing, search, sort) |
| GET | `/api/tools/featured` | Featured tools only |
| GET | `/api/tools/:slug` | Single tool by slug |
| GET | `/api/categories` | All categories |
| GET | `/api/categories/:slug` | Single category + its tools |
| POST | `/api/contact` | Submit contact form |

### Orders ✅ NEW

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/orders` | Bearer (user) | Place a new order from cart |
| GET | `/api/orders/my` | Bearer (user) | Get logged-in user's order history |
| GET | `/api/orders/:orderId` | Bearer (owner/admin) | Get single order with items |
| GET | `/api/orders` | Bearer (admin) | Get all orders — paginated, filterable |
| PATCH | `/api/orders/:orderId/status` | Bearer (admin) | Update order status |

#### POST `/api/orders` — Request Body
```json
{
  "items": [
    {
      "toolId": "1",
      "toolName": "ChatGPT",
      "toolSlug": "chatgpt",
      "toolLogo": "🤖",
      "toolCategory": "AI Chat & Research",
      "planName": "Plus",
      "planPrice": "₹1,650/mo",
      "planMonthly": 1650,
      "billingCycle": "monthly",
      "quantity": 1
    }
  ],
  "subtotal": 1650,
  "discount": 165,
  "tax": 268,
  "total": 1753,
  "couponCode": "APKAAI10"
}
```

#### GET `/api/orders` — Admin Query Params
| Param | Example | Description |
|-------|---------|-------------|
| `page` | `1` | Page number |
| `limit` | `20` | Results per page |
| `status` | `confirmed` | Filter by status |
| `search` | `ashutosh` | Search by user name/email |

### Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/users` | Admin | All registered users |
| GET | `/api/admin/contacts` | Admin | All contact submissions |
| GET | `/api/admin/stats` | Admin | Platform stats |
| GET | `/api/admin/drive-files` | Admin | Google Drive file list |

### Cloud

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/cloud/providers` | — | List cloud providers |
| POST | `/api/cloud/estimate` | Bearer | Save cost estimate |
| GET | `/api/cloud/estimates` | Bearer | Get user's estimates |

---

## 🛒 Order History Feature (Added Sep 2026)

### User Flow
1. User browses AI tools and adds plans to cart
2. Applies optional coupon code (`APKAAI10` = 10% off)
3. Clicks **Proceed to Checkout** → must be signed in
4. Order is saved to PostgreSQL (`orders` + `order_items` tables)
5. Cart is cleared, confirmation screen shown with Order ID
6. User can view all past orders at `/orders`

### User Pages
- `/cart` — Cart with real checkout (places order via API)
- `/orders` — Full order history with expandable cards, status badges, price breakdown, pagination

### Admin Capabilities
- `/admin` → Orders tab — view all orders across all users
- Stats: total orders, confirmed, completed, total revenue (₹)
- Expandable order rows showing all items
- Inline status dropdown to update: `pending → confirmed → processing → completed → cancelled → refunded`
- Search by user name/email, filter by status, CSV export

### Coupon Codes
| Code | Discount |
|------|---------|
| `APKAAI10` | 10% off subtotal |

### Order Status Lifecycle
| Status | Meaning |
|--------|---------|
| `pending` | Order created, payment not yet confirmed |
| `confirmed` | Order confirmed (current default on placement) |
| `processing` | Subscription being activated |
| `completed` | Active and delivered |
| `cancelled` | Cancelled by user or admin |
| `refunded` | Refund processed |

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
# Server
PORT=4000
NODE_ENV=production

# PostgreSQL (RDS)
DB_HOST=apkaai-db.cl8qcg44s0p7.ap-south-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=apkaai
DB_USER=apkaai_user
DB_PASS=your_db_password_here
DB_SSL=true

# Auth
JWT_SECRET=your_jwt_secret_here_change_in_production
PASSWORD_SALT=your_password_salt_here_change_in_production

# CORS
FRONTEND_URL=https://apkaai.com

# Email (password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here
SMTP_FROM=ApkaAI <your_email@gmail.com>
```

### Frontend (`frontend/.env.production`)

```env
NEXT_PUBLIC_API_URL=https://apkaai.com/api
```

---

## 🚀 Deployment Guide

### Re-deploy after code changes (from EC2)

```bash
ssh -i deploy/apkaai-key.pem ec2-user@3.6.107.51

cd /home/ec2-user/apkaai
git pull origin main

# Run DB migration for new orders tables (run once)
cd backend
node src/lib/migrate-history.js

# Restart backend
npm install --omit=dev
pm2 restart apkaai-api

# Rebuild and restart frontend
cd ../frontend
npm install
npm run build
pm2 restart apkaai-frontend
```

### Or run the deploy script locally

```bash
bash deploy/deploy.sh
```

### Run migrations only

```bash
# Full schema (idempotent — safe to re-run)
psql $DATABASE_URL -f backend/src/lib/schema.sql

# Or via Node
node backend/src/lib/migrate.js
```

---

## 📋 Pending Tasks

| # | Task | Status |
|---|------|--------|
| 1 | GoDaddy DNS: A record `@` → `3.6.107.51` | ⏳ Pending |
| 2 | SSL certificate via certbot | ⏳ Blocked by DNS |
| 3 | Razorpay / Stripe payment integration | 🔜 Planned |
| 4 | Order confirmation email (nodemailer) | 🔜 Planned |
| 5 | PDF invoice download per order | 🔜 Planned |
| 6 | User order cancellation (within 24h) | 🔜 Planned |

### How to complete DNS (2 minutes):
1. Go to https://dcc.godaddy.com/control/portfolio/apkaai.com/settings
2. Click **DNS** tab
3. Edit `A` record `@` → set value to `3.6.107.51`, TTL `600`
4. Add `A` record `www` → `3.6.107.51`, TTL `600`
5. Save — propagates in 30-60 min

### How to install SSL (after DNS propagates):
```bash
ssh -i deploy/apkaai-key.pem ec2-user@3.6.107.51
sudo certbot --nginx -d apkaai.com -d www.apkaai.com \
  --email admin@apkaai.com --agree-tos --non-interactive
```

---

## 🔑 Access Credentials

| Service | Detail |
|---------|--------|
| SSH Key | `deploy/apkaai-key.pem` |
| EC2 IP | `3.6.107.51` |
| EC2 User | `ec2-user` |
| AWS Account | `409154939720` |
| AWS Region | `ap-south-1` |
| GitHub Repo | https://github.com/apkaai/apkaai |
| GoDaddy Domain | apkaai.com |

---

## 📅 Timeline

| Date | Milestone |
|------|-----------|
| Sep 1, 2026 | Project started — full stack built (Next.js + Express + PostgreSQL) |
| Sep 1, 2026 | AWS infrastructure provisioned (EC2, RDS, S3, IAM) |
| Sep 1, 2026 | Website live at http://3.6.107.51 |
| Sep 2, 2026 | Cart feature with drawer, plan modal, add-to-cart |
| Sep 3, 2026 | Cloud Cost Intelligence platform added |
| Sep 18, 2026 | Order History feature — users + admin (full CRUD) |
| Pending | DNS update → SSL → https://apkaai.com live |
| Pending | Razorpay / Stripe payment gateway |

---

*Built with ❤️ in India 🇮🇳 — apkaai.com*
