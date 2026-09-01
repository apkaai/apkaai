# ApkaAI — AI Products Marketplace

India's #1 marketplace to discover, compare and access the best AI tools.
**apkaai.com** — Built on Next.js · Node.js · DynamoDB · AWS EC2 · S3 · CloudFront

---

## Project Structure

```
apkaai/
├── frontend/                  # Next.js 14 (App Router)
│   ├── app/
│   │   ├── page.tsx           # Homepage — hero, featured tools, categories
│   │   ├── tools/
│   │   │   ├── page.tsx       # All tools catalog with search + filter
│   │   │   └── [slug]/page.tsx# Individual tool detail page
│   │   ├── category/
│   │   │   └── [slug]/page.tsx# Category browsing page
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── ToolCard.tsx
│   │   └── CategoryCard.tsx
│   └── lib/
│       └── tools-data.ts      # Static data (25 tools, 15 categories)
│
├── backend/                   # Node.js + Express API
│   ├── src/
│   │   ├── index.js           # Express server (port 4000)
│   │   ├── mcp-server.js      # MCP server (stdio, 6 tools)
│   │   ├── routes/            # tools, categories, contact
│   │   ├── controllers/       # toolsController, categoriesController, contactController
│   │   └── lib/
│   │       ├── dynamo.js      # DynamoDB document client
│   │       ├── createTables.js# One-time table setup
│   │       └── seed.js        # Seed all tools + categories
│   └── .env.example
│
├── deploy/                    # AWS deployment scripts
│   ├── 01-setup-ec2.sh        # Bootstrap EC2 (Node, Nginx, PM2)
│   ├── 02-nginx.sh            # Reverse proxy config
│   ├── 03-ssl.sh              # Let's Encrypt SSL
│   ├── 04-s3-cloudfront.sh    # S3 bucket + CloudFront CDN
│   ├── 05-godaddy-dns-guide.md# DNS setup guide
│   ├── deploy.sh              # Re-deploy from Git
│   └── iam-policy.json        # Least-privilege IAM policy
│
└── .kiro/settings/mcp.json    # MCP server config for Kiro IDE
```

---

## Tech Stack

| Layer     | Technology              | AWS Service     |
|-----------|------------------------|-----------------|
| Frontend  | Next.js 14 + Tailwind  | EC2 t2.micro    |
| Backend   | Node.js + Express      | EC2 t2.micro    |
| Database  | DynamoDB               | DynamoDB (free) |
| Static    | S3 + CloudFront        | S3 + CF         |
| SSL       | Let's Encrypt          | —               |
| Process   | PM2                    | —               |
| DNS       | GoDaddy → Route 53     | Route 53        |

All services run within **AWS Free Tier** (ap-south-1, Mumbai).

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- AWS CLI configured (`aws configure`)
- AWS account with DynamoDB access in `ap-south-1`

### 1. Set up backend

```bash
cd backend
cp .env.example .env
# Edit .env with your AWS credentials (or use IAM role on EC2)
npm install
node src/lib/createTables.js   # Create DynamoDB tables (run once)
node src/lib/seed.js           # Seed tools + categories (run once)
npm run dev                    # Start API on http://localhost:4000
```

### 2. Set up frontend

```bash
cd frontend
npm install
npm run dev                    # Start on http://localhost:3000
```

### 3. Test the API

```bash
# Health check
curl http://localhost:4000/health

# List all tools
curl http://localhost:4000/api/tools

# Get a specific tool
curl http://localhost:4000/api/tools/chatgpt

# Filter by category
curl "http://localhost:4000/api/tools?category=coding"

# Search
curl "http://localhost:4000/api/tools?search=image"

# List categories
curl http://localhost:4000/api/categories
```

---

## API Reference

### Tools

| Method | Endpoint                  | Description                        |
|--------|---------------------------|------------------------------------|
| GET    | `/api/tools`              | List tools (filter: category, pricing, search, sort) |
| GET    | `/api/tools/featured`     | Featured tools only                |
| GET    | `/api/tools/:slug`        | Single tool by slug                |
| GET    | `/api/categories`         | All categories                     |
| GET    | `/api/categories/:slug`   | Single category                    |
| POST   | `/api/contact`            | Submit contact form                |

### Query Parameters for `/api/tools`

| Param      | Example             | Description              |
|------------|---------------------|--------------------------|
| `category` | `coding`            | Filter by category slug  |
| `pricing`  | `Freemium`          | Free / Freemium / Paid   |
| `search`   | `image generation`  | Text search              |
| `sort`     | `rating`            | popular / rating / new / name |

---

## Deployment (AWS)

Run scripts in order on your EC2 instance:

```bash
# 1. Launch EC2 t2.micro (Amazon Linux 2023, ap-south-1)
#    — Assign an Elastic IP
#    — Open ports 22, 80, 443 in Security Group

# 2. SSH into EC2
ssh -i your-key.pem ec2-user@YOUR_ELASTIC_IP

# 3. Upload and run setup scripts
bash 01-setup-ec2.sh      # Install Node, Nginx, PM2, clone repo
bash 02-nginx.sh          # Configure reverse proxy
bash 03-ssl.sh            # Install SSL (after DNS is pointing here)

# 4. From your local machine
bash 04-s3-cloudfront.sh  # Create S3 bucket + CloudFront CDN

# 5. Seed DynamoDB (from EC2)
cd backend && node src/lib/createTables.js && node src/lib/seed.js
```

See `deploy/05-godaddy-dns-guide.md` for DNS setup.

---

## MCP Server (Kiro IDE)

The MCP server lets Kiro query your ApkaAI database directly.

**Available tools:**
- `list_ai_tools` — list/filter/search tools
- `get_ai_tool` — get a single tool by slug
- `list_categories` — all 15 categories
- `get_category` — category + its tools
- `search_tools` — full-text search
- `compare_tools` — side-by-side comparison

Config is in `.kiro/settings/mcp.json`. Start the MCP server:

```bash
cd backend
node src/mcp-server.js
```

---

## AI Tool Categories

| Emoji | Category                 | Example Tools                          |
|-------|--------------------------|----------------------------------------|
| 💬    | AI Chat & Research       | ChatGPT, Claude, Gemini, Perplexity    |
| 💻    | Coding                   | Cursor, GitHub Copilot, Windsurf       |
| 🎨    | Image Generation         | Midjourney, Adobe Firefly, Ideogram    |
| 🎬    | Video Generation         | Runway, HeyGen, Pika                   |
| 🎵    | Music & Audio            | Suno, ElevenLabs, Udio                 |
| ✍️    | Writing & Content        | Jasper, Grammarly, Copy.ai             |
| 📊    | Presentations            | Gamma, Canva, Beautiful.ai             |
| 📚    | Research & Productivity  | NotebookLM, Notion AI, Elicit          |
| 🖼️   | Design                   | Figma AI, Adobe Firefly, Canva         |
| 🗣️   | Voice & Avatars          | ElevenLabs, HeyGen, PlayHT             |
| 🤖    | Automation               | Zapier AI, Make, n8n                   |
| 📈    | Business & Marketing     | HubSpot AI, Jasper, Salesforce         |
| 📝    | Meetings & Transcription | Otter.ai, Fireflies, Fathom            |
| 🧠    | Learning                 | Khanmigo, NotebookLM, Quizlet AI       |
| 🔍    | AI Search                | Perplexity, You.com, ChatGPT Search    |

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in:

```env
PORT=4000
NODE_ENV=production
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=...        # Not needed if using EC2 IAM role
AWS_SECRET_ACCESS_KEY=...    # Not needed if using EC2 IAM role
DYNAMODB_TOOLS_TABLE=apkaai-tools
DYNAMODB_CATEGORIES_TABLE=apkaai-categories
DYNAMODB_CONTACTS_TABLE=apkaai-contacts
FRONTEND_URL=https://apkaai.com
```

> On EC2, attach the IAM role from `deploy/iam-policy.json` to your instance
> instead of storing credentials in .env — this is the recommended approach.

---

Built with ❤️ in India 🇮🇳 | apkaai.com
