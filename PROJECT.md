# ApkaAI — Project Documentation

> **Last updated:** September 2026
> **Live URL:** https://apkaai.com
> **Repository:** https://github.com/apkaai/apkaai (branch: `main`)
> **Non-Prod Repo:** https://github.com/apkaai/apkaai-non-prod (branch: `main`)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Repository Structure](#3-repository-structure)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Backend Architecture](#5-backend-architecture)
6. [Database](#6-database)
7. [Infrastructure & Deployment](#7-infrastructure--deployment)
8. [Environment Variables](#8-environment-variables)
9. [Pages & Routes](#9-pages--routes)
10. [Key Features](#10-key-features)
11. [Data Models](#11-data-models)
12. [Git Workflow](#12-git-workflow)
13. [Admin Access](#13-admin-access)
14. [Social Links](#14-social-links)
15. [Pricing & Tool Data](#15-pricing--tool-data)
16. [Cloud Intelligence Platform](#16-cloud-intelligence-platform)
17. [Cart System](#17-cart-system)
18. [Authentication](#18-authentication)
19. [Email / SMTP](#19-email--smtp)
20. [Known Limitations](#20-known-limitations)

---

## 1. Project Overview

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

## 2. Tech Stack

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

## 4. Frontend Architecture

### Framework
Next.js 14 with App Router. All pages use the `app/` directory. Client components are explicitly marked `'use client'`.

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

## 8. Environment Variables

### Backend (`/home/ec2-user/apkaai/backend/.env`)
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

---

## 9. Pages & Routes

| URL | Description |
|---|---|
| `/` | Homepage — hero, stats, featured tools, features |
| `/tools` | All 70+ AI tools with search, filters, sort |
| `/tools/[slug]` | Individual AI tool detail page |
| `/category/[slug]` | Tools by category |
| `/compare` | Side-by-side AI tool comparison (up to 4) |
| `/pricing` | AI tools pricing guide (INR) |
| `/cart` | Shopping cart |
| `/blog` | Blog |
| `/about` | About page |
| `/contact` | Contact form |
| `/careers` | Careers |
| `/help` | Help centre |
| `/privacy` | Privacy policy |
| `/cookies` | Cookie policy |
| `/signin` | User login |
| `/profile` | User profile (authenticated) |
| `/forgot-password` | Forgot password form |
| `/reset-password` | Reset password (token from email) |
| `/admin` | Admin panel (admin role required) |
| `/admin/login` | Admin login |
| `/cloud` | Cloud Intelligence Platform home |
| `/cloud/calculator` | Cloud pricing calculator |
| `/cloud/compare` | Cloud provider comparison |
| `/cloud/bill` | Cloud bill builder |
| `/cloud/saved` | Saved cloud estimates |
| `/cloud/backup` | Backup & Data Protection vendors |
| `/deals/[slug]` | Tool deals/discounts page |

---

## 10. Key Features

### AI Tool Marketplace
- 70+ AI tools across 16 categories
- Search, filter by pricing/category, sort
- Tool detail pages with pricing plans
- Comparison tool (up to 4 tools side by side)
- Pricing guide with INR pricing

### Cart System
- Add to Cart on every tool card, detail page, pricing page, comparison page
- Plan selection modal (monthly/yearly billing toggle)
- Cart drawer (mini-cart, slide-in from right)
- Full `/cart` page with order summary, GST (18%), coupon support
- Persistent via `localStorage` (key: `apkaai_cart`)
- Test coupon: `APKAAI10` (10% off)

### Cloud Intelligence Platform
- **5 cloud providers:** AWS, Azure (Microsoft), GCP (Google), ACE Cloud, Utho 🇮🇳
- **Pricing calculator** — real on-demand pricing, region-aware
- **Cloud comparison** — side-by-side across all 5 providers
- **Bill builder** — multi-service bill with GST, PDF export
- **Saved estimates** — persist across sessions
- **Backup vendors** — Commvault, Cohesity, Acronis, Veeam, Dhruva, Veritas/OpenText, Rubrik

### Authentication
- User registration + login
- JWT-style HMAC token stored in `localStorage`
- Forgot password → email with reset link (30 min expiry, single-use)
- Admin login at `/admin/login`

### AI Chatbot
- Floating bottom-right chatbot
- Bouncing animation when idle

### Social Media
- YouTube: https://www.youtube.com/@apkAI2026
- Instagram: https://www.instagram.com/apkaai2k26/
- Facebook: https://www.facebook.com/share/18pUPqwgCz/

---

## 11. Data Models

### AITool (frontend/lib/tools-data.ts)
```typescript
interface AITool {
  id: string             // Unique string ID ('1', '2', ...)
  name: string           // Display name
  slug: string           // URL slug (e.g. 'chatgpt')
  tagline: string
  description: string
  category: string       // Display category name
  categorySlug: string   // URL-safe category slug
  logo: string           // Emoji
  website: string        // Official URL
  pricing: 'Free' | 'Freemium' | 'Paid' | 'Free Trial'
  startingPrice: string  // Display string (e.g. '₹1,650/mo')
  monthlyPrice?: number  // INR integer for comparison
  rating: number
  reviews: number
  tags: string[]
  featured: boolean
  new: boolean
  badge?: string
  pricingPlans?: PricingPlan[]
}

interface PricingPlan {
  name: string           // e.g. 'Free', 'Plus', 'Pro'
  price: string          // Display string (e.g. '₹1,650/mo')
  monthly: number        // INR integer
  features: string[]
  popular?: boolean
}
```

### CartItem (frontend/lib/cart-context.tsx)
```typescript
interface CartItem {
  key: string            // Unique: toolId__planName__billingCycle
  toolId: string
  toolName: string
  toolSlug: string
  toolLogo: string
  toolWebsite: string
  toolCategory: string
  planName: string
  planPrice: string      // Display string
  planMonthly: number    // INR for calculation
  billingCycle: 'monthly' | 'yearly'
  quantity: number
  addedAt: number        // Date.now()
}
```

### User (PostgreSQL)
```typescript
interface User {
  user_id: string        // UUID
  email: string
  name: string
  password: string       // SHA-256 hash
  role: 'user' | 'admin'
  reset_token?: string
  reset_token_expires?: Date
  created_at: Date
  updated_at: Date
}
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

### Repositories
| Repo | URL | Purpose |
|---|---|---|
| `apkaai/apkaai` | github.com/apkaai/apkaai | Production |
| `apkaai/apkaai-non-prod` | github.com/apkaai/apkaai-non-prod | Non-production |

### Workflow
```
Feature development (Navkirat branch)
    ↓
Test in non-prod environment (port 3001 / 8080)
    ↓
Push Navkirat → origin/Navkirat
    ↓
Merge/push Navkirat → main (production)
    ↓
Push to apkaai-non-prod repo
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

## 13. Admin Access

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

## 14. Social Links

| Platform | URL |
|---|---|
| YouTube | https://www.youtube.com/@apkAI2026 |
| Instagram | https://www.instagram.com/apkaai2k26/ |
| Facebook | https://www.facebook.com/share/18pUPqwgCz/ |

---

## 15. Pricing & Tool Data

All tool and pricing data lives in **`frontend/lib/tools-data.ts`** — this is the single source of truth.

### Categories (16)
AI Chat & Research, Writing & Content, Image Generation, Video Generation, Music & Audio, Coding, Presentations, Research & Productivity, Design, Voice & Avatars, Automation, Business & Marketing, Meetings & Transcription, Learning, AI Search, **Backup & Data Protection** (new)

### Tool Count
- 60 main tools (IDs 1–60)
- 7 backup vendors (IDs 61–67)
- 10 free trial tools (IDs ft1–ft10)
- **Total displayed:** 70+ (display count = 70)

> **Note:** `id: '43'` in tools-data.ts is Figma AI — an internal array ID, not the display count. Do not change it.

---

## 16. Cloud Intelligence Platform

### Providers (`frontend/lib/cloud-pricing.ts`)
| Provider | ID | Region | Color |
|---|---|---|---|
| AWS | `aws` | ap-south-1 (Mumbai) | Orange `#FF9900` |
| Microsoft Azure | `azure` | Central India | Blue `#0078D4` |
| Google Cloud | `gcp` | asia-south1 (Mumbai) | Blue `#4285F4` |
| ACE Cloud | `ace` | India Primary | Teal `#00C4B4` |
| Utho 🇮🇳 | `utho` | Mumbai / Noida / Bangalore / Indore | Orange `#F97316` |

### Pricing Verification
All prices verified from official sources, September 2026:
- AWS: `aws.amazon.com/ec2/pricing/on-demand/` + DoiT verification
- Azure: `azure.microsoft.com/en-in/pricing/details/virtual-machines/linux/` + azurespeed.com
- GCP: `cloud.google.com/products/compute/pricing` + gcloud-compute.com
- Utho: `utho.com/pricing` + getdeploying.com (Sep 18, 2026)

### Backup Vendors (`/cloud/backup`)
Commvault, Cohesity, Acronis, Veeam, Dhruva (India), Veritas/OpenText, Rubrik

---

## 17. Cart System

### How it works
1. User clicks **Add to Cart** on any tool
2. If multi-plan tool → `PlanModal` opens for plan selection
3. Item added to `CartContext` → `CartDrawer` opens
4. Items persist in `localStorage` (key: `apkaai_cart`)
5. Cart icon in Navbar shows live badge count
6. `/cart` page shows full order summary with GST + coupon

### Cart Item Key Format
`{toolId}__{planName}__{billingCycle}`

### Yearly Pricing
Yearly = monthly × 10 (2 months free heuristic). Override with actual data when available.

### Checkout
Checkout button is present but shows "coming soon" — ready for Razorpay/Stripe integration.

### Test Coupon
`APKAAI10` → 10% discount

---

## 18. Authentication

### User Auth Flow
1. Register at `/signin` → POST `/api/auth/register`
2. Login → POST `/api/auth/login` → HMAC token stored in `localStorage`
3. Protected pages check `localStorage.getItem('apkaai_user')`
4. Token format: `base64url(payload).hmacSig`

### Password Reset Flow
1. User enters email at `/forgot-password`
2. POST `/api/auth/forgot-password` → generates 32-byte random token
3. SHA-256 hash stored in DB with 30-min expiry
4. Email sent with link: `https://apkaai.com/reset-password?token=<rawToken>`
5. User clicks link → page at `/reset-password` validates token via GET `/api/auth/verify-reset-token`
6. User submits new password → POST `/api/auth/reset-password`
7. Token nulled in DB (single-use)

### Admin Auth
Same flow but with `role: 'admin'` check after login.

---

## 19. Email / SMTP

The backend uses Nodemailer. SMTP config is in the backend `.env`.

- **Known working:** `ashutoshkumarpandey@apkaai.com` (receives emails)
- Password reset emails are sent asynchronously (non-blocking)
- SMTP not configured → emails silently skipped (logged as warning)
- From address: configured via `SMTP_FROM` env var

---

## 20. Known Limitations

| Area | Limitation |
|---|---|
| **Passwords** | SHA-256 + static salt — should migrate to bcrypt/argon2 |
| **Cart checkout** | Not implemented — Razorpay/Stripe integration pending |
| **Cloud prices** | Static data — update manually every quarter |
| **Utho serverless/LB** | Pricing not publicly listed — shows "unavailable" |
| **ACE Cloud prices** | Approximate — verify at acecloud.ai/pricing |
| **Currency rates** | Hardcoded INR=84, EUR=0.92, GBP=0.79 — update periodically |
| **Tool count** | Display shows 70 — actual tool entries are 77 (includes backup vendors) |
| **Non-prod env** | Runs on port 3001/4001/8080 on same EC2 instance |
| **DynamoDB** | Legacy dynamo.js still in codebase — not actively used for auth |
| **GaneshaFloat** | Festival-specific component — may want to toggle off post-event |
