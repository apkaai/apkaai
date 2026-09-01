/**
 * seed.js — Populate DynamoDB with all AI tools and categories
 * Usage: node src/lib/seed.js
 */
require('dotenv').config()
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, PutCommand, BatchWriteCommand } = require('@aws-sdk/lib-dynamodb')

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' })
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
})

const TOOLS_TABLE      = process.env.DYNAMODB_TOOLS_TABLE      || 'apkaai-tools'
const CATEGORIES_TABLE = process.env.DYNAMODB_CATEGORIES_TABLE || 'apkaai-categories'

// ── Categories ────────────────────────────────────────────────────────────────
const categories = [
  { slug: 'ai-chat',          name: 'AI Chat & Research',      emoji: '💬', description: 'Conversational AI and research assistants',    count: 5 },
  { slug: 'writing',          name: 'Writing & Content',       emoji: '✍️', description: 'AI-powered writing and content creation',      count: 5 },
  { slug: 'image-generation', name: 'Image Generation',        emoji: '🎨', description: 'Create stunning visuals with AI',              count: 5 },
  { slug: 'video-generation', name: 'Video Generation',        emoji: '🎬', description: 'Generate and edit videos with AI',             count: 6 },
  { slug: 'music-audio',      name: 'Music & Audio',           emoji: '🎵', description: 'AI music composition and audio tools',         count: 4 },
  { slug: 'coding',           name: 'Coding',                  emoji: '💻', description: 'AI-powered coding assistants',                 count: 5 },
  { slug: 'presentations',    name: 'Presentations',           emoji: '📊', description: 'Create beautiful presentations with AI',       count: 4 },
  { slug: 'research',         name: 'Research & Productivity', emoji: '📚', description: 'AI research and productivity tools',           count: 4 },
  { slug: 'design',           name: 'Design',                  emoji: '🖼️', description: 'AI design and creative tools',                count: 4 },
  { slug: 'voice-avatars',    name: 'Voice & Avatars',         emoji: '🗣️', description: 'AI voice cloning and avatar creation',        count: 4 },
  { slug: 'automation',       name: 'Automation',              emoji: '🤖', description: 'AI workflow automation tools',                 count: 4 },
  { slug: 'business',         name: 'Business & Marketing',    emoji: '📈', description: 'AI tools for business and marketing',          count: 4 },
  { slug: 'meetings',         name: 'Meetings & Transcription',emoji: '📝', description: 'AI meeting assistants and transcription',      count: 4 },
  { slug: 'learning',         name: 'Learning',                emoji: '🧠', description: 'AI-powered learning platforms',                count: 4 },
  { slug: 'ai-search',        name: 'AI Search',               emoji: '🔍', description: 'Next-gen AI search engines',                  count: 4 },
]

// ── Tools ─────────────────────────────────────────────────────────────────────
const tools = [
  // AI Chat & Research
  { slug: 'chatgpt',           name: 'ChatGPT',            tagline: "The world's most popular AI assistant",      description: 'ChatGPT by OpenAI is an advanced conversational AI capable of writing, coding, analysis, and much more. With GPT-4o, it understands text, images, and voice.', category: 'AI Chat & Research', categorySlug: 'ai-chat',          logo: '🤖', website: 'https://chat.openai.com',                         pricing: 'Freemium', startingPrice: '₹1,650/mo',   rating: 4.8, reviews: 12400, tags: ['Chat','Writing','Coding','GPT-4o'],                    featured: true,  new: false, badge: 'Most Popular' },
  { slug: 'claude',            name: 'Claude',             tagline: "Anthropic's thoughtful AI assistant",        description: 'Claude by Anthropic is known for long-context understanding, nuanced reasoning, and safety. Claude 3.5 Sonnet is one of the most capable AI models available.', category: 'AI Chat & Research', categorySlug: 'ai-chat',          logo: '🧡', website: 'https://claude.ai',                               pricing: 'Freemium', startingPrice: '₹1,650/mo',   rating: 4.7, reviews:  8200, tags: ['Chat','Long Context','Coding','Analysis'],            featured: true,  new: false, badge: "Editor's Choice" },
  { slug: 'gemini',            name: 'Gemini',             tagline: "Google's most capable AI model",             description: 'Gemini by Google is a multimodal AI that understands text, images, audio, video, and code. Deeply integrated with Google Workspace.',                          category: 'AI Chat & Research', categorySlug: 'ai-chat',          logo: '💎', website: 'https://gemini.google.com',                       pricing: 'Freemium', startingPrice: '₹1,950/mo',   rating: 4.6, reviews:  7100, tags: ['Multimodal','Google','Search','Workspace'],           featured: true,  new: false },
  { slug: 'perplexity',        name: 'Perplexity',         tagline: 'AI-powered answer engine',                   description: 'Perplexity is an AI search engine that provides accurate, cited answers in real time. Great for research and fact-checking with live web access.',               category: 'AI Chat & Research', categorySlug: 'ai-chat',          logo: '🔵', website: 'https://perplexity.ai',                           pricing: 'Freemium', startingPrice: '₹1,660/mo',   rating: 4.6, reviews:  5300, tags: ['Search','Research','Citations','Real-time'],          featured: true,  new: false },
  { slug: 'microsoft-copilot', name: 'Microsoft Copilot',  tagline: 'AI built into Microsoft 365',                description: 'Microsoft Copilot integrates GPT-4 into Word, Excel, PowerPoint, Teams and Outlook for productivity supercharge.',                                              category: 'AI Chat & Research', categorySlug: 'ai-chat',          logo: '🪟', website: 'https://copilot.microsoft.com',                   pricing: 'Freemium', startingPrice: 'Free',        rating: 4.4, reviews:  4100, tags: ['Microsoft','Office','Productivity'],                  featured: false, new: false },

  // Coding
  { slug: 'cursor',            name: 'Cursor',             tagline: 'The AI-first code editor',                   description: 'Cursor is a VS Code fork supercharged with AI. Chat with your entire codebase, generate code with Composer, and get context-aware completions.',               category: 'Coding',             categorySlug: 'coding',           logo: '⚡', website: 'https://cursor.sh',                               pricing: 'Freemium', startingPrice: '₹1,660/mo',   rating: 4.9, reviews:  9800, tags: ['Code Editor','AI Completion','Chat','VSCode'],        featured: true,  new: false, badge: 'Top Rated' },
  { slug: 'github-copilot',    name: 'GitHub Copilot',     tagline: 'AI pair programmer by GitHub',               description: 'GitHub Copilot uses OpenAI Codex to suggest code and complete functions in real-time. Available in VS Code, JetBrains, Neovim and more.',                     category: 'Coding',             categorySlug: 'coding',           logo: '🐙', website: 'https://github.com/features/copilot',             pricing: 'Paid',     startingPrice: '₹830/mo',    rating: 4.7, reviews: 11200, tags: ['Code','GitHub','Autocomplete','VS Code'],             featured: true,  new: false },
  { slug: 'windsurf',          name: 'Windsurf',           tagline: 'Agentic AI IDE by Codeium',                  description: 'Windsurf is an AI IDE that can understand your entire codebase and make multi-file edits autonomously. Features Cascade, an agentic coding flow.',              category: 'Coding',             categorySlug: 'coding',           logo: '🏄', website: 'https://codeium.com/windsurf',                    pricing: 'Freemium', startingPrice: '₹830/mo',    rating: 4.6, reviews:  3200, tags: ['IDE','Agentic','Codeium','Multi-file'],               featured: false, new: true  },
  { slug: 'replit',            name: 'Replit',             tagline: 'Build software with AI in your browser',     description: 'Replit is a cloud-based IDE with an AI agent that can build full-stack apps from a description. No setup needed.',                                              category: 'Coding',             categorySlug: 'coding',           logo: '🔁', website: 'https://replit.com',                              pricing: 'Freemium', startingPrice: '₹1,250/mo',   rating: 4.4, reviews:  6700, tags: ['Cloud IDE','Deploy','Full-Stack','Agent'],            featured: false, new: false },
  { slug: 'claude-code',       name: 'Claude Code',        tagline: 'Agentic coding by Anthropic',                description: "Claude Code is Anthropic's terminal-based coding agent that can write, test, and commit code across your entire codebase.",                                   category: 'Coding',             categorySlug: 'coding',           logo: '🖥️', website: 'https://docs.anthropic.com/claude-code',          pricing: 'Paid',     startingPrice: 'Usage-based', rating: 4.7, reviews:  2100, tags: ['Terminal','Agentic','Anthropic','Git'],               featured: false, new: true  },

  // Image Generation
  { slug: 'midjourney',        name: 'Midjourney',         tagline: 'Create stunning AI art',                     description: 'Midjourney produces some of the most aesthetic and photorealistic AI images. Used by artists, designers, and creators worldwide.',                              category: 'Image Generation',   categorySlug: 'image-generation', logo: '🎨', website: 'https://midjourney.com',                          pricing: 'Paid',     startingPrice: '₹830/mo',    rating: 4.8, reviews: 15600, tags: ['Art','Photorealistic','Discord','Creative'],          featured: true,  new: false, badge: 'Best for Art' },
  { slug: 'adobe-firefly',     name: 'Adobe Firefly',      tagline: 'Generative AI for creatives',                description: 'Adobe Firefly is commercially safe AI art generation built into Adobe Creative Cloud. Generate images, vectors, and text effects.',                             category: 'Image Generation',   categorySlug: 'image-generation', logo: '🔥', website: 'https://firefly.adobe.com',                       pricing: 'Freemium', startingPrice: '₹1,650/mo',   rating: 4.5, reviews:  4800, tags: ['Adobe','Commercial','Creative Cloud','Vector'],       featured: false, new: false },
  { slug: 'ideogram',          name: 'Ideogram',           tagline: 'AI images with perfect text',                description: 'Ideogram excels at generating images with accurate text — logos, posters, and typography.',                                                                  category: 'Image Generation',   categorySlug: 'image-generation', logo: '💡', website: 'https://ideogram.ai',                             pricing: 'Freemium', startingPrice: '₹580/mo',    rating: 4.6, reviews:  3200, tags: ['Text in Images','Logo','Design','Typography'],        featured: false, new: true  },
  { slug: 'leonardo-ai',       name: 'Leonardo AI',        tagline: 'Professional AI image creation',             description: 'Leonardo AI offers fine-tuned models for game assets, concept art, and product imagery.',                                                                    category: 'Image Generation',   categorySlug: 'image-generation', logo: '🦁', website: 'https://leonardo.ai',                             pricing: 'Freemium', startingPrice: '₹830/mo',    rating: 4.5, reviews:  5100, tags: ['Game Art','Concept Art','Fine-tune','Real-time'],     featured: false, new: false },

  // Video Generation
  { slug: 'runway',            name: 'Runway',             tagline: 'AI video generation and editing',            description: 'Runway Gen-3 creates high-quality videos from text or image prompts. Industry standard for AI video in film and content production.',                         category: 'Video Generation',   categorySlug: 'video-generation', logo: '🎬', website: 'https://runwayml.com',                             pricing: 'Freemium', startingPrice: '₹1,250/mo',   rating: 4.6, reviews:  6300, tags: ['Text-to-Video','Video Editing','Gen-3','Professional'],featured: true,  new: false },
  { slug: 'heygen',            name: 'HeyGen',             tagline: 'AI avatar video creation',                   description: 'HeyGen lets you create professional videos with AI avatars. Perfect for marketing, training, and corporate videos without a camera.',                         category: 'Video Generation',   categorySlug: 'video-generation', logo: '👤', website: 'https://heygen.com',                              pricing: 'Freemium', startingPrice: '₹2,490/mo',   rating: 4.7, reviews:  4200, tags: ['Avatar','Marketing','Corporate','Voice Clone'],       featured: true,  new: false, badge: 'Best for Business' },

  // Writing
  { slug: 'jasper',            name: 'Jasper',             tagline: 'AI writing for marketing teams',             description: 'Jasper is an enterprise AI writing platform built for marketing teams. Generate blogs, ads, emails, and social content at scale.',                             category: 'Writing & Content',  categorySlug: 'writing',          logo: '✍️', website: 'https://jasper.ai',                               pricing: 'Paid',     startingPrice: '₹2,900/mo',   rating: 4.4, reviews:  7200, tags: ['Marketing','Blog','Copywriting','Enterprise'],        featured: false, new: false },
  { slug: 'grammarly',         name: 'Grammarly',          tagline: 'AI writing assistant for everyone',          description: 'Grammarly uses AI to check grammar, tone, clarity, and plagiarism. Available as a browser extension, app, and API.',                                        category: 'Writing & Content',  categorySlug: 'writing',          logo: '📝', website: 'https://grammarly.com',                           pricing: 'Freemium', startingPrice: '₹1,250/mo',   rating: 4.6, reviews: 18900, tags: ['Grammar','Writing','Browser Extension','Plagiarism'], featured: true,  new: false },

  // Music & Audio
  { slug: 'suno',              name: 'Suno',               tagline: 'Create full songs with AI',                  description: 'Suno generates complete songs with vocals, instruments, and lyrics from a text prompt. The most accessible AI music creation tool.',                           category: 'Music & Audio',      categorySlug: 'music-audio',      logo: '🎵', website: 'https://suno.com',                                pricing: 'Freemium', startingPrice: '₹830/mo',    rating: 4.7, reviews:  8900, tags: ['Music','Vocals','Lyrics','Song Generation'],          featured: true,  new: false, badge: 'Trending' },
  { slug: 'elevenlabs',        name: 'ElevenLabs',         tagline: 'Most realistic AI voice generation',         description: 'ElevenLabs creates hyper-realistic AI voices and voice clones. Used for audiobooks, dubbing, and voice-over production.',                                   category: 'Music & Audio',      categorySlug: 'music-audio',      logo: '🔊', website: 'https://elevenlabs.io',                           pricing: 'Freemium', startingPrice: '₹415/mo',    rating: 4.8, reviews: 11200, tags: ['Voice Clone','TTS','Dubbing','Audiobook'],            featured: true,  new: false },

  // Automation
  { slug: 'zapier-ai',         name: 'Zapier AI',          tagline: 'Automate workflows with AI',                 description: 'Zapier AI lets you build powerful automations using natural language. Connect 6,000+ apps and automate repetitive tasks without code.',                       category: 'Automation',         categorySlug: 'automation',       logo: '⚡', website: 'https://zapier.com/ai',                           pricing: 'Freemium', startingPrice: '₹1,990/mo',   rating: 4.5, reviews:  9200, tags: ['Automation','No-Code','Workflows','Integration'],     featured: false, new: false },
  { slug: 'make',              name: 'Make',               tagline: 'Visual automation platform',                 description: 'Make (formerly Integromat) provides a visual drag-and-drop automation builder. More powerful than Zapier for complex workflows.',                             category: 'Automation',         categorySlug: 'automation',       logo: '🔧', website: 'https://make.com',                                pricing: 'Freemium', startingPrice: 'Free',        rating: 4.5, reviews:  5400, tags: ['Visual','Automation','Integrations','Webhooks'],      featured: false, new: false },

  // Business & Marketing
  { slug: 'copy-ai',           name: 'Copy.ai',            tagline: 'AI-powered marketing copy',                  description: 'Copy.ai helps marketing teams generate high-converting copy for ads, emails, landing pages, and social media at scale.',                                     category: 'Business & Marketing',categorySlug: 'business',         logo: '📣', website: 'https://copy.ai',                                pricing: 'Freemium', startingPrice: '₹3,300/mo',   rating: 4.3, reviews:  6100, tags: ['Copywriting','Marketing','Ads','Email'],              featured: false, new: false },

  // Meetings
  { slug: 'otter-ai',          name: 'Otter.ai',           tagline: 'AI meeting notes and transcription',         description: 'Otter.ai automatically transcribes meetings, generates summaries, and captures action items from Zoom, Google Meet, and in-person conversations.',           category: 'Meetings & Transcription', categorySlug: 'meetings',    logo: '🦦', website: 'https://otter.ai',                               pricing: 'Freemium', startingPrice: '₹830/mo',    rating: 4.5, reviews:  7800, tags: ['Transcription','Meeting Notes','Zoom','Summaries'],  featured: false, new: false },

  // Presentations
  { slug: 'gamma',             name: 'Gamma',              tagline: 'Beautiful AI presentations in seconds',      description: 'Gamma uses AI to create stunning presentations, documents, and websites. Just type a prompt and get a fully designed deck instantly.',                        category: 'Presentations',      categorySlug: 'presentations',    logo: '✨', website: 'https://gamma.app',                              pricing: 'Freemium', startingPrice: 'Free',        rating: 4.6, reviews:  4500, tags: ['Presentations','Slides','Design','Quick'],            featured: false, new: true  },

  // Learning
  { slug: 'notebooklm',        name: 'NotebookLM',         tagline: 'AI research assistant by Google',            description: 'NotebookLM by Google lets you upload documents, PDFs, and URLs, then ask questions and get cited answers from your own source material.',                      category: 'Learning',           categorySlug: 'learning',         logo: '📓', website: 'https://notebooklm.google.com',                  pricing: 'Free',     startingPrice: 'Free',        rating: 4.7, reviews:  3200, tags: ['Research','Documents','Google','Citations'],          featured: false, new: false },

  // AI Search
  { slug: 'youcom',            name: 'You.com',            tagline: 'AI search engine with privacy',              description: 'You.com is an AI-powered search engine that lets you chat, search, and create without being tracked. Features multiple AI modes and integrations.',            category: 'AI Search',          categorySlug: 'ai-search',        logo: '🔍', website: 'https://you.com',                                pricing: 'Freemium', startingPrice: 'Free',        rating: 4.3, reviews:  2800, tags: ['Search','Privacy','AI Chat','No Tracking'],          featured: false, new: false },
]

// ── Seed function ─────────────────────────────────────────────────────────────
async function seedTable(tableName, items, label) {
  console.log(`\n📦 Seeding ${label} (${items.length} items) → ${tableName}`)

  // DynamoDB BatchWrite supports max 25 items per call
  const chunks = []
  for (let i = 0; i < items.length; i += 25) {
    chunks.push(items.slice(i, i + 25))
  }

  for (const chunk of chunks) {
    const requests = chunk.map(item => ({ PutRequest: { Item: item } }))
    try {
      await docClient.send(new BatchWriteCommand({
        RequestItems: { [tableName]: requests },
      }))
      console.log(`  ✅ Wrote ${chunk.length} items`)
    } catch (err) {
      console.error(`  ❌ Batch write failed: ${err.message}`)
      // Fall back to individual puts
      for (const item of chunk) {
        try {
          await docClient.send(new PutCommand({ TableName: tableName, Item: item }))
          console.log(`  ↩️  Fallback put: ${item.slug || item.id}`)
        } catch (e) {
          console.error(`  ❌ Failed to seed: ${item.slug || item.id} — ${e.message}`)
        }
      }
    }
  }
}

async function main() {
  console.log('🌱 Starting ApkaAI DynamoDB seed...')
  console.log(`   Region: ${process.env.AWS_REGION || 'ap-south-1'}`)

  await seedTable(CATEGORIES_TABLE, categories, 'Categories')
  await seedTable(TOOLS_TABLE, tools, 'AI Tools')

  console.log('\n🎉 Seed complete! All data is in DynamoDB.')
}

main().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
