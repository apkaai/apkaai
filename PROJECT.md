# ApkaAI — Project Documentation

World's #1 AI Tools Marketplace — Discover, compare and access 100+ AI tools.

---

## 🌐 Live URLs

| Environment | URL | Status |
|-------------|-----|--------|
| HTTP (live) | http://3.6.107.51 | ✅ Live |
| Production  | https://apkaai.com | ⏳ DNS pending |
| API Health  | http://3.6.107.51/health | ✅ Live |

---

## 🏗️ Architecture

```
                    apkaai.com (GoDaddy DNS)
                           │
                    A record → 3.6.107.51
                           │
                    ┌──────▼──────────────┐
                    │   EC2 t3.micro      │
                    │   ap-south-1 Mumbai │
                    │                     │
                    │  Nginx (port 80/443)│
                    │  ├── /api/*  ───────┼──► Node.js API  (port 4000, PM2)
                    │  └── /*      ───────┼──► Next.js App  (port 3000, PM2)
                    └─────────────────────┘
                           │
          ┌────────────────┼──────────────────┐
          ▼                ▼                  ▼
     PostgreSQL          S3 Bucket          IAM Role
  (RDS ap-south-1)   (apkaai-assets)   (apkaai-ec2-role)
```

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js (App Router) | 14.2.5 |
| UI | Tailwind CSS | 3.4.6 |
| Icons | Lucide React | 0.408.0 |
| Animations | Framer Motion | 11.3.8 |
| HTTP Client | Axios | 1.7.2 |
| Backend | Node.js + Express | 20 LTS |
| Database | PostgreSQL (AWS RDS) | 16.9 |
| PDF Generation | PDFKit | 0.15.0 |
| Payments | Razorpay | 2.9.2 |
| Email | Nodemailer | 6.9.14 |
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
| RDS PostgreSQL | `apkaai-db` | `apkaai-db.cl8qcg44s0p7.ap-south-1.rds.amazonaws.com` |
| AWS Region | `ap-south-1` | Mumbai |
| AWS Account | `409154939720` | — |

---

## 🗄️ Database Schema (PostgreSQL — 12 Tables)

| Table | Purpose |
|-------|---------|
| `users` | Auth — user_id, email, name, password, role, reset_token, **referral_code**, **referred_by** |
| `categories` | AI tool categories — slug (PK), name, emoji, description, tool_count |
| `tools` | AI tools catalog — id, slug, name, pricing, rating, tags, featured, pricingPlans |
| `contacts` | Contact form submissions |
| `cloud_estimates` | Cloud cost calculations per user |
| `orders` | Orders — order_id, user_id, status, subtotal, discount, tax, total, coupon_code, payment_id |
| `order_items` | Line items per order — tool_id, plan_name, plan_price, billing_cycle |
| `user_wishlist` | Saved tools per user (unique user_id + tool_id) |
| `tool_reviews` | Tool ratings & reviews (1–5 stars, unique per tool + user) |
| `referrals` | Referral tracking — referrer_id, referred_id, code, status |
| `newsletter_subscribers` | Newsletter list — email, name, source, status |
| `user_history` | Activity events — view, search, compare, cart_add, cart_remove |

### Order Status Flow
```
pending → confirmed → processing → completed
                               ↘ cancelled → refunded
```

### Referral Status Flow
```
pending → signed_up → rewarded
```

---

## 📁 Project Structure

```
apkaai/
├── PROJECT.md
├── README.md
├── .gitignore
│
├── frontend/                              ← Next.js 14 App
│   ├── app/
│   │   ├── page.tsx                       ← Homepage
│   │   ├── layout.tsx                     ← Root layout (CartProvider + WishlistProvider)
│   │   ├── globals.css                    ← Dark purple theme
│   │   ├── tools/
│   │   │   ├── page.tsx                   ← All tools catalog (search + filter)
│   │   │   └── [slug]/page.tsx            ← Tool detail + ReviewSection
│   │   ├── category/[slug]/page.tsx       ← Category page
│   │   ├── compare/page.tsx               ← Side-by-side comparison
│   │   ├── pricing/page.tsx               ← Pricing guide (INR)
│   │   ├── deals/[slug]/
│   │   │   ├── page.tsx                   ← Tool deals page (server component)
│   │   │   └── DealCard.tsx               ← Client coupon card with copy-to-clipboard
│   │   ├── cart/
│   │   │   ├── page.tsx
│   │   │   └── CartPageClient.tsx         ← Cart + Razorpay checkout
│   │   ├── orders/page.tsx                ← User order history + cancel + PDF invoice
│   │   ├── wishlist/page.tsx              ← Saved tools
│   │   ├── dashboard/page.tsx             ← User dashboard (orders, spent, wishlist, reviews)
│   │   ├── referral/page.tsx              ← Refer & Earn page
│   │   ├── profile/page.tsx               ← User profile + quick links
│   │   ├── signin/page.tsx
│   │   ├── signup/page.tsx                ← Reads ?ref= and passes referralCode to API
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   ├── admin/
│   │   │   ├── page.tsx                   ← Admin dashboard (Users, Contacts, Orders, Data Lake)
│   │   │   ├── login/page.tsx
│   │   │   ├── monitoring/page.tsx        ← Grafana monitoring iframe
│   │   │   └── datalake/page.tsx
│   │   ├── cloud/                         ← Cloud Cost Intelligence Platform
│   │   │   ├── page.tsx                   ← Cloud landing (5 providers)
│   │   │   ├── calculator/page.tsx
│   │   │   ├── compare/page.tsx
│   │   │   ├── backup/page.tsx
│   │   │   └── bill/page.tsx
│   │   ├── blog/ | about/ | careers/ | contact/
│   │   └── help/ | privacy/ | terms/ | cookies/
│   │
│   ├── components/
│   │   ├── Navbar.tsx                     ← Search suggestions + user dropdown
│   │   ├── Footer.tsx                     ← With NewsletterBar
│   │   ├── NewsletterBar.tsx              ← Client subscribe widget
│   │   ├── ToolCard.tsx                   ← With WishlistButton (heart)
│   │   ├── CategoryCard.tsx
│   │   ├── AIChatbot.tsx                  ← Floating AI assistant
│   │   ├── FloatingSocialWidget.tsx
│   │   ├── HoverPreview.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── StarryBackground.tsx
│   │   ├── GaneshaFloat.tsx
│   │   ├── cart/
│   │   │   ├── CartDrawer.tsx
│   │   │   ├── PlanModal.tsx
│   │   │   └── AddToCartButton.tsx
│   │   ├── payment/
│   │   │   └── PaymentModal.tsx           ← Razorpay checkout flow
│   │   ├── reviews/
│   │   │   └── ReviewSection.tsx          ← Star ratings + write/edit reviews
│   │   └── wishlist/
│   │       └── WishlistButton.tsx         ← Heart toggle on tool cards
│   │
│   └── lib/
│       ├── tools-data.ts                  ← 100+ tools + 16 categories (static)
│       ├── cart-context.tsx               ← Cart state (localStorage)
│       ├── wishlist-context.tsx           ← Wishlist state (synced to DB)
│       └── cloud-pricing.ts              ← Cloud pricing data (5 providers)
│
├── backend/                               ← Node.js + Express API
│   ├── src/
│   │   ├── index.js                       ← Express server (port 4000, all routes)
│   │   ├── routes/
│   │   │   ├── auth.js                    ← register (+ referral tracking), login, me, reset-password
│   │   │   ├── tools.js
│   │   │   ├── categories.js
│   │   │   ├── contact.js
│   │   │   ├── admin.js                   ← users, contacts, stats, drive-files, CloudWatch
│   │   │   ├── analytics.js
│   │   │   ├── cloud.js
│   │   │   ├── orders.js                  ← CRUD, cancel (24h), PDF invoice, admin status update
│   │   │   ├── payment.js                 ← Razorpay create-order, verify, webhook, config
│   │   │   ├── wishlist.js                ← toggle, ids, delete
│   │   │   ├── reviews.js                 ← CRUD, helpful, mine/count, mine
│   │   │   ├── referral.js                ← me (code+stats), track, validate/:code
│   │   │   ├── newsletter.js              ← subscribe, unsubscribe, subscribers (admin)
│   │   │   └── datalake.js
│   │   └── lib/
│   │       ├── db.js                      ← PostgreSQL connection pool
│   │       ├── schema.sql                 ← Full DB schema (12 tables, idempotent)
│   │       └── migrate.js                 ← Seed categories + tools
│   ├── package.json                       ← Includes pdfkit, razorpay, nodemailer
│   └── .env.example
│
└── deploy/
    ├── deploy.sh                          ← 6-step deploy: pull→migrate→install→build→restart→healthcheck
    ├── 01-setup-ec2.sh
    ├── 02-nginx.sh
    ├── 03-ssl.sh
    ├── 04-s3-cloudfront.sh
    └── 05-godaddy-dns-guide.md
```

---

## 🔌 API Reference

Base URL: `http://3.6.107.51/api`

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register. Accepts optional `referralCode` in body |
| POST | `/api/auth/login` | — | Sign in, returns token + user |
| GET | `/api/auth/me` | Bearer | Get current user |
| POST | `/api/auth/forgot-password` | — | Send reset email |
| GET | `/api/auth/verify-reset-token` | — | Validate reset token |
| POST | `/api/auth/reset-password` | — | Set new password |

### Tools & Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tools` | List tools (`category`, `pricing`, `search`, `sort` params) |
| GET | `/api/tools/featured` | Featured tools |
| GET | `/api/tools/:slug` | Single tool |
| GET | `/api/categories` | All 16 categories |
| GET | `/api/categories/:slug` | Category + its tools |
| POST | `/api/contact` | Submit contact form |

### Orders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/orders` | Bearer | Place order from cart |
| GET | `/api/orders/my` | Bearer | User order history (paginated) |
| GET | `/api/orders/:id` | Bearer | Single order (owner or admin) |
| PATCH | `/api/orders/:id/cancel` | Bearer | Cancel order (within 24 hours) |
| GET | `/api/orders/:id/invoice` | Bearer | Download PDF invoice |
| GET | `/api/orders` | Admin | All orders with user info + stats |
| PATCH | `/api/orders/:id/status` | Admin | Update order status |

### Payment (Razorpay)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/payment/config` | — | Get Razorpay key_id |
| POST | `/api/payment/create-order` | Bearer | Create Razorpay order for an ApkaAI order |
| POST | `/api/payment/verify` | Bearer | Verify signature, mark order completed, send email |
| POST | `/api/payment/webhook` | — | Razorpay async webhook (payment.captured / payment.failed) |

### Reviews

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/reviews/:toolSlug` | — | All reviews for a tool (paginated + avg + distribution) |
| GET | `/api/reviews/:toolSlug/mine` | Bearer | Current user's review for a tool |
| GET | `/api/reviews/mine` | Bearer | All reviews written by current user |
| GET | `/api/reviews/mine/count` | Bearer | Count of reviews written by current user |
| POST | `/api/reviews/:toolSlug` | Bearer | Submit or update a review |
| POST | `/api/reviews/:reviewId/helpful` | Bearer | Mark review as helpful (+1) |
| DELETE | `/api/reviews/:reviewId` | Bearer | Delete review (owner or admin) |

### Wishlist

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/wishlist` | Bearer | All wishlisted tools |
| GET | `/api/wishlist/ids` | Bearer | Just the tool IDs (lightweight) |
| POST | `/api/wishlist/toggle` | Bearer | Add or remove a tool |
| DELETE | `/api/wishlist/:toolId` | Bearer | Remove specific tool |

### Referral

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/referral/me` | Bearer | Get/create referral code + stats + history |
| POST | `/api/referral/track` | — | Record a referral at signup (called by auth.js) |
| GET | `/api/referral/validate/:code` | — | Check if code is valid, returns referrer first name |

### Newsletter

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/newsletter/subscribe` | — | Subscribe email |
| POST | `/api/newsletter/unsubscribe` | — | Unsubscribe email |
| GET | `/api/newsletter/subscribers` | Admin | All subscribers + active count |

### Cloud

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/cloud/providers` | — | List 5 cloud providers |
| POST | `/api/cloud/estimate` | Bearer | Save cost estimate |
| GET | `/api/cloud/estimates` | Bearer | User's saved estimates |

### Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/users` | Admin | All registered users |
| GET | `/api/admin/contacts` | Admin | Contact form submissions |
| GET | `/api/admin/stats` | Admin | Platform stats |
| GET | `/api/admin/drive-files` | Admin | Google Drive file list |

---

## 🌟 Feature Summary

### User-Facing Pages
| Route | Feature |
|-------|---------|
| `/tools` | 100+ AI tools, search with live suggestions, filter by category/pricing |
| `/tools/[slug]` | Tool detail, pricing plans, add to cart, reviews section |
| `/category/[slug]` | Category listing |
| `/compare` | Side-by-side tool comparison |
| `/pricing` | Full pricing guide in INR |
| `/deals/[slug]` | Coupon codes + pricing plans per tool |
| `/cart` | Cart with Razorpay checkout, coupon `APKAAI10` |
| `/orders` | Order history, cancel (24h), PDF invoice download |
| `/dashboard` | Stats: orders, total spent, saved tools, reviews |
| `/wishlist` | Saved tools with remove |
| `/referral` | Referral code, share link, stats, friend list |
| `/profile` | Account info + quick links to all user pages |
| `/signin` | Login |
| `/signup` | Register — reads `?ref=CODE` from URL for referral tracking |
| `/cloud` | Cloud cost platform (AWS, Azure, GCP, ACE, Utho) |
| `/admin` | Admin dashboard (users, contacts, orders, newsletter, monitoring) |

### Key Features
- **100+ AI Tools** across 16 categories, all priced in INR (₹)
- **Real-time search** with debounced suggestions dropdown in navbar
- **Cart + Checkout** via Razorpay (UPI, Cards, Net Banking) with coupon support
- **Order History** — cancel within 24h, download branded PDF invoice
- **Wishlist** — heart button on every tool card, synced to DB
- **Reviews & Ratings** — 1–5 stars, write/edit, helpful votes, distribution bar
- **Referral System** — unique `APKAAI10`-style code, share link with `?ref=`, referral banner on signup
- **User Dashboard** — orders, total spent, wishlist count, review count
- **Cloud Cost Intelligence** — 5 providers, multi-service bill builder
- **Newsletter** — subscribe in footer, admin view of subscribers
- **Admin Panel** — orders tab (status updates), users, contacts, Grafana monitoring
- **Email** — order confirmation (nodemailer + HTML template), password reset
- **Deals Pages** — `/deals/[slug]` for every tool with real copy-to-clipboard coupons

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

# Email (password reset + order confirmation)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here
SMTP_FROM=ApkaAI <your_email@gmail.com>

# Razorpay (https://dashboard.razorpay.com → Settings → API Keys)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

### Frontend (`frontend/.env.production`)

```env
NEXT_PUBLIC_API_URL=https://apkaai.com/api
```

---

## 🚀 Deployment

### One-command deploy (from local machine)

```bash
bash deploy/deploy.sh
```

This runs 6 steps on EC2:
1. `git pull origin main`
2. Run `schema.sql` migrations (idempotent — safe every deploy)
3. `npm install --omit=dev` (backend, includes pdfkit + razorpay)
4. `npm install && npm run build` (frontend, clears `.next` cache)
5. `pm2 restart apkaai-api && pm2 restart apkaai-frontend --update-env`
6. Health checks on ports 4000 and 3000

### Manual deploy (SSH)

```bash
ssh -i deploy/apkaai-key.pem ec2-user@3.6.107.51

cd /home/ec2-user/apkaai
git pull origin main

# DB migration (idempotent)
psql $DATABASE_URL -f backend/src/lib/schema.sql

# Backend
cd backend && npm install --omit=dev && pm2 restart apkaai-api --update-env

# Frontend
cd ../frontend && npm install && rm -rf .next && npm run build
pm2 restart apkaai-frontend --update-env

pm2 status
```

### Razorpay webhook setup
1. Go to [dashboard.razorpay.com](https://dashboard.razorpay.com) → Settings → Webhooks
2. Add URL: `https://apkaai.com/api/payment/webhook`
3. Events: `payment.captured`, `payment.failed`
4. Copy the webhook secret into `.env` as `RAZORPAY_WEBHOOK_SECRET`

### SSL (after DNS is live)
```bash
ssh -i deploy/apkaai-key.pem ec2-user@3.6.107.51
sudo certbot --nginx -d apkaai.com -d www.apkaai.com \
  --email ashutoshkumarpandey@apkaai.com --agree-tos --non-interactive
```

---

## 📋 Pending Tasks

| # | Task | Status |
|---|------|--------|
| 1 | GoDaddy DNS: A record `@` → `3.6.107.51` | ⏳ Manual action |
| 2 | GoDaddy DNS: A record `www` → `3.6.107.51` | ⏳ Manual action |
| 3 | SSL via certbot (after DNS) | ⏳ Blocked by DNS |
| 4 | Razorpay live keys in production `.env` | 🔜 Planned |
| 5 | User order cancellation refund flow | 🔜 Planned |
| 6 | Reward users automatically when referral orders | 🔜 Planned |

### DNS setup (2 minutes)
1. Go to https://dcc.godaddy.com/control/portfolio/apkaai.com/settings
2. Click **DNS** tab
3. Edit `A` record `@` → `3.6.107.51`, TTL `600`
4. Add `A` record `www` → `3.6.107.51`, TTL `600`
5. Save — propagates in 30–60 min

---

## 🔑 Access

| Service | Detail |
|---------|--------|
| SSH Key | `deploy/apkaai-key.pem` |
| EC2 IP | `3.6.107.51` |
| EC2 User | `ec2-user` |
| AWS Account | `409154939720` |
| AWS Region | `ap-south-1` (Mumbai) |
| GitHub | https://github.com/apkaai/apkaai |
| Domain | apkaai.com (GoDaddy) |

---

## 📅 Timeline

| Date | Milestone |
|------|-----------|
| Sep 1, 2026 | Project started — Next.js + Express + PostgreSQL |
| Sep 1, 2026 | AWS EC2, RDS, S3, IAM provisioned |
| Sep 2, 2026 | Cart, checkout, order system |
| Sep 3, 2026 | Cloud Cost Intelligence (AWS, Azure, GCP, ACE) |
| Sep 5, 2026 | Razorpay payment + order confirmation email |
| Sep 6, 2026 | Wishlist, PDF invoice, order cancellation |
| Sep 7, 2026 | Tool reviews & ratings, real-time search suggestions |
| Sep 8, 2026 | 100+ tools catalog (30 new tools added) |
| Sep 9, 2026 | Referral system, user dashboard, deals pages |
| Sep 10, 2026 | Newsletter, cloud currencies fix, Utho Cloud added |
| Sep 11, 2026 | Grafana monitoring, admin login mobile fix |
| Sep 18, 2026 | Signup referral URL, DealCard fix, deploy.sh rewrite |
| Pending | DNS → SSL → https://apkaai.com live |

---

*Built with ❤️ in India 🇮🇳 — apkaai.com*
