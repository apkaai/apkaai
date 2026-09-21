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

**ApkaAI** is an India-first AI tools marketplace where users can discover, compare, and subscribe to the best AI tools. It lists 70+ AI tools across 16 categories, with pricing shown in INR, a cloud cost intelligence platform, a full cart system, and an admin panel.

**Key metrics (as of Sep 2026):**
- 70+ AI tools listed
- 16 categories
- 5 cloud providers (AWS, Azure, GCP, ACE Cloud, Utho 🇮🇳)
- 7 backup & data protection vendors
- 22,000+ Utho customers referenced
- Deployed on AWS EC2 (Mumbai region)

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14.2.5, React 18, TypeScript 5.5 |
| **Styling** | Tailwind CSS 3.4.6 |
| **Animations** | Framer Motion 11 |
| **Icons** | Lucide React 0.408 |
| **HTTP Client** | Axios 1.7 |
| **Backend** | Node.js, Express 4.19 |
| **Database** | PostgreSQL 15 (AWS RDS, ap-south-1) |
| **AWS SDK** | @aws-sdk/client-dynamodb (DynamoDB for legacy data) |
| **Email** | Nodemailer 6.9 |
| **Auth** | Custom HMAC token (SHA-256) |
| **Process Manager** | PM2 |
| **Web Server** | Nginx (reverse proxy) |
| **Cloud** | AWS EC2 (t2/t3), AWS RDS PostgreSQL, AWS S3 + CloudFront |
| **Domain** | GoDaddy DNS → apkaai.com |
| **SSL** | Let's Encrypt (Certbot) |

---

## 3. Repository Structure

```
apkaai/
├── frontend/                  # Next.js 14 app
│   ├── app/                   # App router pages
│   │   ├── page.tsx           # Homepage
│   │   ├── layout.tsx         # Root layout (CartProvider, Navbar, Footer)
│   │   ├── globals.css        # Global styles + Tailwind
│   │   ├── tools/             # /tools — all tools listing
│   │   │   └── [slug]/        # /tools/[slug] — tool detail page
│   │   ├── category/[slug]/   # /category/[slug] — category page
│   │   ├── compare/           # /compare — comparison tool
│   │   ├── pricing/           # /pricing — pricing guide
│   │   ├── cart/              # /cart — cart page
│   │   ├── cloud/             # Cloud Intelligence Platform
│   │   │   ├── page.tsx       # /cloud — landing
│   │   │   ├── calculator/    # /cloud/calculator
│   │   │   ├── compare/       # /cloud/compare
│   │   │   ├── bill/          # /cloud/bill
│   │   │   ├── saved/         # /cloud/saved
│   │   │   └── backup/        # /cloud/backup — backup vendors
│   │   ├── admin/             # Admin panel
│   │   │   ├── page.tsx       # /admin — dashboard
│   │   │   └── login/         # /admin/login
│   │   ├── signin/            # /signin — user login
│   │   ├── profile/           # /profile — user profile
│   │   ├── reset-password/    # /reset-password
│   │   ├── blog/              # /blog
│   │   ├── about/             # /about
│   │   ├── contact/           # /contact
│   │   ├── pricing/           # /pricing
│   │   └── ...                # careers, help, cookies, privacy etc.
│   ├── components/
│   │   ├── Navbar.tsx         # Global navigation (cart icon, auth)
│   │   ├── Footer.tsx
│   │   ├── ToolCard.tsx       # AI tool card with Add to Cart
│   │   ├── CategoryCard.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── AIChatbot.tsx      # Floating AI chatbot
│   │   ├── FloatingSocialWidget.tsx
│   │   ├── StarryBackground.tsx
│   │   ├── HoverPreview.tsx
│   │   ├── GaneshaFloat.tsx
│   │   ├── cart/
│   │   │   ├── AddToCartButton.tsx
│   │   │   ├── CartDrawer.tsx
│   │   │   └── PlanModal.tsx
│   │   └── landing/
│   │       ├── HeroSection.tsx
│   │       ├── StatsBar.tsx
│   │       ├── FeaturedToolsSection.tsx
│   │       ├── FeaturesSection.tsx
│   │       ├── FinalCTASection.tsx
│   │       └── HowItWorksSection.tsx
│   └── lib/
│       ├── tools-data.ts      # All 70+ AI tools + 16 categories (source of truth)
│       ├── cloud-pricing.ts   # Cloud pricing engine (AWS/Azure/GCP/ACE/Utho)
│       └── cart-context.tsx   # React Context for cart state (localStorage)
│
├── backend/                   # Express API
│   └── src/
│       ├── index.js           # Express app entry, routes, CORS, rate limiting
│       ├── routes/
│       │   ├── auth.js        # /api/auth/* (login, register, forgot/reset password)
│       │   ├── tools.js       # /api/tools/*
│       │   ├── categories.js  # /api/categories/*
│       │   ├── contact.js     # /api/contact
│       │   ├── admin.js       # /api/admin/*
│       │   ├── analytics.js   # /api/analytics/*
│       │   └── cloud.js       # /api/cloud/*
│       └── lib/
│           ├── db.js          # PostgreSQL pool (pg)
│           ├── dynamo.js      # DynamoDB client (legacy)
│           ├── createTables.js
│           ├── createUsersTable.js
│           └── seed.js
│
└── deploy/                    # Deployment scripts
    ├── 01-setup-ec2.sh
    ├── 02-nginx.sh
    ├── 03-ssl.sh
    ├── 04-s3-cloudfront.sh
    ├── 05-godaddy-dns-guide.md
    └── deploy.sh
```

---

## 4. Frontend Architecture

### Framework
Next.js 14 with App Router. All pages use the `app/` directory. Client components are explicitly marked `'use client'`.

### State Management
- **Cart:** React Context (`lib/cart-context.tsx`) — `CartProvider` wraps the entire app in `layout.tsx`. Persists to `localStorage` under key `apkaai_cart`.
- **Auth:** `localStorage` / `sessionStorage` — keys `apkaai_token`, `apkaai_user`. No global state manager.
- **Theme:** CSS class on `<html>` (`light-mode` / default dark). `ThemeToggle` component.

### Design System
- **Background:** `#08051A` (darker), `#0F0A1E` (card)
- **Primary accent:** Purple `#7C3AED`
- **Secondary accent:** Sky blue (cloud section)
- **Font:** Inter (Google Fonts)
- **CSS classes:** `.glow-border`, `.ai-card`, `.btn-primary`, `.badge-new`, `.gradient-text`
- **Tailwind config:** custom brand colors, boxShadow glow variants, float/glow-pulse animations

### Key Components
| Component | Purpose |
|---|---|
| `Navbar.tsx` | Sticky top bar — logo, nav links, cart icon + badge, search, auth |
| `CartDrawer.tsx` | Slide-in mini cart (right side) |
| `AddToCartButton.tsx` | Universal reusable cart button (sm/md/lg, 3 variants) |
| `PlanModal.tsx` | Plan selection modal for multi-plan tools |
| `ToolCard.tsx` | AI tool card with Add to Cart for non-free tools |
| `AIChatbot.tsx` | Floating bottom-right chatbot |
| `FloatingSocialWidget.tsx` | YouTube, Instagram, Facebook links (bottom-right) |
| `HoverPreview.tsx` | Tooltip on hover (desktop only) |
| `GaneshaFloat.tsx` | Floating Ganesha animation |
| `StarryBackground.tsx` | Animated starry canvas background |

---

## 5. Backend Architecture

### Framework
Express 4.x, Node.js 20.

### API Base URL
- **Production:** `https://apkaai.com/api` (proxied by Nginx from port 4000)
- **Non-Prod:** `http://apkaai.com:8080/api` (port 4001 via PM2)

### Routes
| Route | Description |
|---|---|
| `GET  /health` | Health check |
| `POST /api/auth/register` | User registration |
| `POST /api/auth/login` | Login (returns HMAC token + user) |
| `GET  /api/auth/me` | Get current user (Bearer token) |
| `POST /api/auth/forgot-password` | Send password reset email |
| `GET  /api/auth/verify-reset-token` | Validate reset token |
| `POST /api/auth/reset-password` | Set new password |
| `GET  /api/tools` | All tools |
| `GET  /api/tools/:slug` | Tool by slug |
| `GET  /api/categories` | All categories |
| `POST /api/contact` | Contact form submission |
| `GET  /api/admin/*` | Admin panel endpoints |
| `GET  /api/analytics/*` | Analytics data |
| `GET  /api/cloud/*` | Cloud pricing data |

### Security
- `helmet` — security headers
- `express-rate-limit` — global 100 req/15min; auth endpoints 5–10 req/15min
- CORS — allows `https://apkaai.com` and `localhost:3000`
- Passwords: SHA-256 + static salt (`apkaai2026secure`)
- Tokens: HMAC-SHA256 base64url payload

---

## 6. Database

### PostgreSQL (AWS RDS)
- **Host:** `apkaai-db.cl8qcg44s0p7.ap-south-1.rds.amazonaws.com`
- **Port:** `5432`
- **Database:** `apkaai`
- **User:** `apkaai_admin`
- **SSL:** enabled (`rejectUnauthorized: false`)
- **Region:** ap-south-1 (Mumbai)

### Users Table Schema
```sql
CREATE TABLE users (
  user_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email               VARCHAR(255) UNIQUE NOT NULL,
  name                VARCHAR(255) NOT NULL,
  password            VARCHAR(255) NOT NULL,       -- SHA-256 hash
  role                VARCHAR(50) DEFAULT 'user',  -- 'user' | 'admin'
  reset_token         VARCHAR(255),                -- SHA-256 of raw token
  reset_token_expires TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
```

### DynamoDB (Legacy)
Still referenced in `lib/dynamo.js` for legacy data. Table: `apkaai-users` (Email GSI). Not used for auth.

---

## 7. Infrastructure & Deployment

### EC2 Instance
- **IP:** `3.6.107.51`
- **User:** `ec2-user`
- **Key:** `apkaai-key.pem`
- **Region:** ap-south-1 (Mumbai)
- **OS:** Amazon Linux 2

### PM2 Processes
| ID | Name | Port | Description |
|---|---|---|---|
| 0 | `apkaai-frontend` | 3000 | Next.js production frontend |
| 1 | `apkaai-api` | 4000 | Express backend API |
| 3 | `apkaai-np-api` | 4001 | Non-prod backend |
| 5 | `apkaai-np-frontend` | 3001 | Non-prod frontend |

### Nginx
- Port 80/443 → `apkaai-frontend` (3000) for frontend routes
- `/api/*` → `apkaai-api` (4000) reverse proxy
- Port 8080 → Non-prod environment

### SSL
Let's Encrypt via Certbot. Auto-renews.

### DNS
GoDaddy DNS:
- `A` record: `apkaai.com` → `3.6.107.51`
- `CNAME`: `www` → `apkaai.com`

### Build Command (EC2)
```bash
cd /home/ec2-user/apkaai/frontend
export NODE_OPTIONS='--max-old-space-size=512'
npm run build
pm2 restart apkaai-frontend
```

---

## 8. Environment Variables

### Backend (`/home/ec2-user/apkaai/backend/.env`)
```env
# Server
PORT=4000
NODE_ENV=production
FRONTEND_URL=https://apkaai.com

# PostgreSQL (AWS RDS)
DB_HOST=apkaai-db.cl8qcg44s0p7.ap-south-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=apkaai
DB_USER=apkaai_admin
DB_PASS=<see .env on EC2>
DB_SSL=true

# Auth
JWT_SECRET=<see .env on EC2>
PASSWORD_SALT=apkaai2026secure

# SMTP (email)
SMTP_HOST=<host>
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<user>
SMTP_PASS=<see .env on EC2>
SMTP_FROM=noreply@apkaai.com

# AWS
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=<see .env on EC2>
AWS_SECRET_ACCESS_KEY=<see .env on EC2>
```

### Frontend
No `.env` file required — Next.js uses relative `/api/*` paths which Nginx proxies to the backend.

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

## 12. Git Workflow

### Branches
| Branch | Purpose |
|---|---|
| `Navkirat` | Active development branch |
| `main` | Production branch (deployed to apkaai.com) |
| `non-prod` | Old branch — do NOT use |

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

### GitHub Token
Generate a new token at GitHub → Settings → Developer settings → Personal access tokens when needed.

---

## 13. Admin Access

| Field | Value |
|---|---|
| **URL** | https://apkaai.com/admin/login |
| **Email** | `admin@apkaai.com` |
| **Password** | `ApkaAI@Admin2026` |
| **Role** | `admin` |
| **DB user_id** | `ef37ac6e-e060-41e8-9c29-f0104aec8a92` |

The admin user exists in the PostgreSQL database with `role = 'admin'`. Login works via the backend API on all devices including mobile.

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
