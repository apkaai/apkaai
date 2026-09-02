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
         DynamoDB        S3 Bucket    IAM Role
        (3 tables)    (apkaai-assets) (apkaai-ec2-role)
```

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js (App Router) | 14.2.5 |
| UI | Tailwind CSS | 3.4.6 |
| Backend | Node.js + Express | 20 LTS |
| Database | AWS DynamoDB | — |
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
| IAM Role | `apkaai-ec2-role` | DynamoDB + S3 access |
| IAM Policy | `apkaai-ec2-policy` | `arn:aws:iam::409154939720:policy/apkaai-ec2-policy` |
| DynamoDB | `apkaai-tools` | 27 AI tools seeded, GSI on categorySlug |
| DynamoDB | `apkaai-categories` | 15 categories seeded |
| DynamoDB | `apkaai-contacts` | Contact form submissions |
| AWS Region | `ap-south-1` | Mumbai |
| AWS Account | `409154939720` | Free tier |

---

## 📁 Project Structure

```
apkaai/
├── PROJECT.md                    ← This file
├── README.md                     ← Setup & deployment guide
├── .gitignore
│
├── frontend/                     ← Next.js 14 App
│   ├── app/
│   │   ├── page.tsx              ← Homepage
│   │   ├── layout.tsx            ← Root layout
│   │   ├── globals.css           ← Dark purple theme
│   │   ├── tools/
│   │   │   ├── page.tsx          ← All tools catalog
│   │   │   └── [slug]/page.tsx   ← Tool detail page
│   │   └── category/
│   │       └── [slug]/page.tsx   ← Category page
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── ToolCard.tsx
│   │   └── CategoryCard.tsx
│   ├── lib/
│   │   └── tools-data.ts         ← Static data (fallback)
│   ├── package.json
│   ├── package-lock.json
│   ├── tailwind.config.ts
│   ├── next.config.js
│   └── tsconfig.json
│
├── backend/                      ← Node.js + Express API
│   ├── src/
│   │   ├── index.js              ← Express server (port 4000)
│   │   ├── mcp-server.js         ← MCP server (stdio)
│   │   ├── routes/
│   │   │   ├── tools.js
│   │   │   ├── categories.js
│   │   │   └── contact.js
│   │   ├── controllers/
│   │   │   ├── toolsController.js
│   │   │   ├── categoriesController.js
│   │   │   └── contactController.js
│   │   └── lib/
│   │       ├── dynamo.js         ← DynamoDB client
│   │       ├── createTables.js   ← One-time table setup
│   │       └── seed.js           ← Seed all data
│   ├── package.json
│   ├── package-lock.json
│   └── .env.example
│
├── deploy/                       ← Deployment scripts & config
│   ├── apkaai-key.pem            ← SSH key (DO NOT COMMIT)
│   ├── iam-policy.json           ← AWS IAM policy
│   ├── trust-policy.json         ← IAM trust policy
│   ├── gsi.json                  ← DynamoDB GSI definition
│   ├── 01-setup-ec2.sh           ← EC2 bootstrap
│   ├── 02-nginx.sh               ← Nginx config
│   ├── 03-ssl.sh                 ← SSL certificate
│   ├── 04-s3-cloudfront.sh       ← S3 + CloudFront CDN
│   ├── 05-godaddy-dns-guide.md   ← DNS setup guide
│   └── deploy.sh                 ← Re-deploy from Git
│
└── .kiro/
    └── settings/
        └── mcp.json              ← MCP server config
```

---

## 🔌 API Endpoints

Base URL: `http://3.6.107.51/api` (will be `https://apkaai.com/api` after DNS)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/tools` | List all tools |
| GET | `/api/tools/featured` | Featured tools only |
| GET | `/api/tools/:slug` | Single tool by slug |
| GET | `/api/categories` | All 15 categories |
| GET | `/api/categories/:slug` | Single category |
| POST | `/api/contact` | Submit contact form |

### Query Parameters for `/api/tools`

| Param | Values | Example |
|-------|--------|---------|
| `category` | category slug | `?category=coding` |
| `pricing` | Free, Freemium, Paid | `?pricing=Freemium` |
| `search` | any text | `?search=image` |
| `sort` | popular, rating, new, name | `?sort=rating` |

---

## 🤖 AI Tools Categories (15)

| Emoji | Category | Example Tools |
|-------|----------|---------------|
| 💬 | AI Chat & Research | ChatGPT, Claude, Gemini, Perplexity |
| ✍️ | Writing & Content | Jasper, Grammarly, Copy.ai |
| 🎨 | Image Generation | Midjourney, Adobe Firefly, Ideogram |
| 🎬 | Video Generation | Runway, HeyGen, Pika |
| 🎵 | Music & Audio | Suno, ElevenLabs, Udio |
| 💻 | Coding | Cursor, GitHub Copilot, Windsurf |
| 📊 | Presentations | Gamma, Canva, Beautiful.ai |
| 📚 | Research & Productivity | NotebookLM, Notion AI |
| 🖼️ | Design | Figma AI, Adobe Firefly |
| 🗣️ | Voice & Avatars | ElevenLabs, HeyGen, PlayHT |
| 🤖 | Automation | Zapier AI, Make, n8n |
| 📈 | Business & Marketing | HubSpot AI, Salesforce Einstein |
| 📝 | Meetings & Transcription | Otter.ai, Fireflies.ai |
| 🧠 | Learning | Khanmigo, NotebookLM, Quizlet AI |
| 🔍 | AI Search | Perplexity, You.com, ChatGPT Search |

---

## 🧩 MCP Server

The backend includes an MCP server (`backend/src/mcp-server.js`) that exposes the AI tools database as tools for AI IDEs like Kiro.

**Available MCP Tools:**

| Tool | Description |
|------|-------------|
| `list_ai_tools` | List/filter/search tools |
| `get_ai_tool` | Get a single tool by slug |
| `list_categories` | All 15 categories |
| `get_category` | Category + its tools |
| `search_tools` | Full-text search |
| `compare_tools` | Side-by-side comparison |

**Config:** `.kiro/settings/mcp.json`

---

## 🚀 Deployment Guide

### First-time setup (already done)

```bash
# 1. AWS resources provisioned via deploy/provision.ps1
# 2. EC2 bootstrapped with Node.js 20, Nginx, PM2
# 3. DynamoDB tables created and seeded
# 4. S3 bucket: apkaai-assets

# SSH into server
ssh -i deploy/apkaai-key.pem ec2-user@3.6.107.51
```

### Re-deploy after code changes

```bash
# Push code to GitHub, then on EC2:
ssh -i deploy/apkaai-key.pem ec2-user@3.6.107.51

cd /home/ec2-user/apkaai
git pull origin main

# Backend
cd backend && npm install --omit=dev
pm2 restart apkaai-api

# Frontend
cd ../frontend && npm install && npm run build
pm2 restart apkaai-frontend
```

### Re-seed DynamoDB

```bash
ssh -i deploy/apkaai-key.pem ec2-user@3.6.107.51
cd /home/ec2-user/apkaai/backend
node src/lib/seed.js
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
PORT=4000
NODE_ENV=production
AWS_REGION=ap-south-1
DYNAMODB_TOOLS_TABLE=apkaai-tools
DYNAMODB_CATEGORIES_TABLE=apkaai-categories
DYNAMODB_CONTACTS_TABLE=apkaai-contacts
FRONTEND_URL=https://apkaai.com
```

> AWS credentials are NOT needed in `.env` — the EC2 instance uses its IAM role (`apkaai-ec2-role`) automatically.

### Frontend (`frontend/.env.production`)

```env
NEXT_PUBLIC_API_URL=https://apkaai.com/api
```

---

## 📋 Pending Tasks

| # | Task | Status |
|---|------|--------|
| 1 | GoDaddy DNS: A record `@` → `3.6.107.51` | ⏳ Manual action needed |
| 2 | GoDaddy DNS: A record `www` → `3.6.107.51` | ⏳ Manual action needed |
| 3 | SSL certificate via certbot | ⏳ Blocked by DNS |
| 4 | Verify https://apkaai.com live | ⏳ After SSL |

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
| GitHub Repo | https://github.com/AshutoshPanday/apkaai |
| GoDaddy Domain | apkaai.com |

---

## 📅 Timeline

| Date | Milestone |
|------|-----------|
| Sep 1, 2026 | Project started |
| Sep 1, 2026 | Full codebase built (Next.js + Express + DynamoDB) |
| Sep 1, 2026 | GitHub repo created: AshutoshPanday/apkaai |
| Sep 1, 2026 | AWS infrastructure provisioned (EC2, DynamoDB, S3, IAM) |
| Sep 1, 2026 | DynamoDB seeded with 27 tools + 15 categories |
| Sep 1, 2026 | Website live at http://3.6.107.51 |
| Sep 2, 2026 | package-lock.json generated and pushed |
| Pending | DNS update → SSL → https://apkaai.com live |

---

*Built with ❤️ in India 🇮🇳 — apkaai.com*
