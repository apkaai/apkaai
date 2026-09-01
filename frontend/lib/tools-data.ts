export interface AITool {
  id: string
  name: string
  slug: string
  tagline: string
  description: string
  category: string
  categorySlug: string
  logo: string
  website: string
  pricing: 'Free' | 'Freemium' | 'Paid' | 'Free Trial'
  startingPrice: string
  rating: number
  reviews: number
  tags: string[]
  featured: boolean
  new: boolean
  badge?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  emoji: string
  description: string
  count: number
}

export const categories: Category[] = [
  { id: '1', name: 'AI Chat & Research', slug: 'ai-chat', emoji: '💬', description: 'Conversational AI and research assistants', count: 5 },
  { id: '2', name: 'Writing & Content', slug: 'writing', emoji: '✍️', description: 'AI-powered writing and content creation', count: 5 },
  { id: '3', name: 'Image Generation', slug: 'image-generation', emoji: '🎨', description: 'Create stunning visuals with AI', count: 5 },
  { id: '4', name: 'Video Generation', slug: 'video-generation', emoji: '🎬', description: 'Generate and edit videos with AI', count: 6 },
  { id: '5', name: 'Music & Audio', slug: 'music-audio', emoji: '🎵', description: 'AI music composition and audio tools', count: 4 },
  { id: '6', name: 'Coding', slug: 'coding', emoji: '💻', description: 'AI-powered coding assistants', count: 5 },
  { id: '7', name: 'Presentations', slug: 'presentations', emoji: '📊', description: 'Create beautiful presentations with AI', count: 4 },
  { id: '8', name: 'Research & Productivity', slug: 'research', emoji: '📚', description: 'AI research and productivity tools', count: 4 },
  { id: '9', name: 'Design', slug: 'design', emoji: '🖼️', description: 'AI design and creative tools', count: 4 },
  { id: '10', name: 'Voice & Avatars', slug: 'voice-avatars', emoji: '🗣️', description: 'AI voice cloning and avatar creation', count: 4 },
  { id: '11', name: 'Automation', slug: 'automation', emoji: '🤖', description: 'AI workflow automation tools', count: 4 },
  { id: '12', name: 'Business & Marketing', slug: 'business', emoji: '📈', description: 'AI tools for business and marketing', count: 4 },
  { id: '13', name: 'Meetings & Transcription', slug: 'meetings', emoji: '📝', description: 'AI meeting assistants and transcription', count: 4 },
  { id: '14', name: 'Learning', slug: 'learning', emoji: '🧠', description: 'AI-powered learning platforms', count: 4 },
  { id: '15', name: 'AI Search', slug: 'ai-search', emoji: '🔍', description: 'Next-gen AI search engines', count: 4 },
]

export const tools: AITool[] = [
  // AI Chat & Research
  {
    id: '1', name: 'ChatGPT', slug: 'chatgpt', tagline: 'The world\'s most popular AI assistant',
    description: 'ChatGPT by OpenAI is an advanced conversational AI capable of writing, coding, analysis, and much more. With GPT-4o, it understands text, images, and voice.',
    category: 'AI Chat & Research', categorySlug: 'ai-chat', logo: '🤖',
    website: 'https://chat.openai.com', pricing: 'Freemium', startingPrice: '₹1,650/mo',
    rating: 4.8, reviews: 12400, tags: ['Chat', 'Writing', 'Coding', 'GPT-4o'], featured: true, new: false, badge: 'Most Popular'
  },
  {
    id: '2', name: 'Claude', slug: 'claude', tagline: 'Anthropic\'s thoughtful AI assistant',
    description: 'Claude by Anthropic is known for long-context understanding, nuanced reasoning, and safety. Claude 3.5 Sonnet is one of the most capable AI models available.',
    category: 'AI Chat & Research', categorySlug: 'ai-chat', logo: '🧡',
    website: 'https://claude.ai', pricing: 'Freemium', startingPrice: '₹1,650/mo',
    rating: 4.7, reviews: 8200, tags: ['Chat', 'Long Context', 'Coding', 'Analysis'], featured: true, new: false, badge: 'Editor\'s Choice'
  },
  {
    id: '3', name: 'Gemini', slug: 'gemini', tagline: 'Google\'s most capable AI model',
    description: 'Gemini by Google is a multimodal AI that understands text, images, audio, video, and code. Deeply integrated with Google Workspace.',
    category: 'AI Chat & Research', categorySlug: 'ai-chat', logo: '💎',
    website: 'https://gemini.google.com', pricing: 'Freemium', startingPrice: '₹1,950/mo',
    rating: 4.6, reviews: 7100, tags: ['Multimodal', 'Google', 'Search', 'Workspace'], featured: true, new: false
  },
  {
    id: '4', name: 'Perplexity', slug: 'perplexity', tagline: 'AI-powered answer engine',
    description: 'Perplexity is an AI search engine that provides accurate, cited answers in real time. Great for research and fact-checking with live web access.',
    category: 'AI Chat & Research', categorySlug: 'ai-chat', logo: '🔵',
    website: 'https://perplexity.ai', pricing: 'Freemium', startingPrice: '₹1,660/mo',
    rating: 4.6, reviews: 5300, tags: ['Search', 'Research', 'Citations', 'Real-time'], featured: true, new: false
  },
  {
    id: '5', name: 'Microsoft Copilot', slug: 'microsoft-copilot', tagline: 'AI built into Microsoft 365',
    description: 'Microsoft Copilot integrates GPT-4 into Word, Excel, PowerPoint, Teams and Outlook for productivity supercharge.',
    category: 'AI Chat & Research', categorySlug: 'ai-chat', logo: '🪟',
    website: 'https://copilot.microsoft.com', pricing: 'Freemium', startingPrice: 'Free',
    rating: 4.4, reviews: 4100, tags: ['Microsoft', 'Office', 'Productivity'], featured: false, new: false
  },

  // Coding
  {
    id: '6', name: 'Cursor', slug: 'cursor', tagline: 'The AI-first code editor',
    description: 'Cursor is a VS Code fork supercharged with AI. Chat with your entire codebase, generate code with Composer, and get context-aware completions.',
    category: 'Coding', categorySlug: 'coding', logo: '⚡',
    website: 'https://cursor.sh', pricing: 'Freemium', startingPrice: '₹1,660/mo',
    rating: 4.9, reviews: 9800, tags: ['Code Editor', 'AI Completion', 'Chat', 'VSCode'], featured: true, new: false, badge: 'Top Rated'
  },
  {
    id: '7', name: 'GitHub Copilot', slug: 'github-copilot', tagline: 'AI pair programmer by GitHub',
    description: 'GitHub Copilot uses OpenAI Codex to suggest code and complete functions in real-time. Available in VS Code, JetBrains, Neovim and more.',
    category: 'Coding', categorySlug: 'coding', logo: '🐙',
    website: 'https://github.com/features/copilot', pricing: 'Paid', startingPrice: '₹830/mo',
    rating: 4.7, reviews: 11200, tags: ['Code', 'GitHub', 'Autocomplete', 'VS Code'], featured: true, new: false
  },
  {
    id: '8', name: 'Windsurf', slug: 'windsurf', tagline: 'Agentic AI IDE by Codeium',
    description: 'Windsurf is an AI IDE that can understand your entire codebase and make multi-file edits autonomously. Features Cascade, an agentic coding flow.',
    category: 'Coding', categorySlug: 'coding', logo: '🏄',
    website: 'https://codeium.com/windsurf', pricing: 'Freemium', startingPrice: '₹830/mo',
    rating: 4.6, reviews: 3200, tags: ['IDE', 'Agentic', 'Codeium', 'Multi-file'], featured: false, new: true
  },
  {
    id: '9', name: 'Replit', slug: 'replit', tagline: 'Build software with AI in your browser',
    description: 'Replit is a cloud-based IDE with an AI agent that can build full-stack apps from a description. No setup needed — code, run, and deploy in one place.',
    category: 'Coding', categorySlug: 'coding', logo: '🔁',
    website: 'https://replit.com', pricing: 'Freemium', startingPrice: '₹1,250/mo',
    rating: 4.4, reviews: 6700, tags: ['Cloud IDE', 'Deploy', 'Full-Stack', 'Agent'], featured: false, new: false
  },
  {
    id: '10', name: 'Claude Code', slug: 'claude-code', tagline: 'Agentic coding by Anthropic',
    description: 'Claude Code is Anthropic\'s terminal-based coding agent that can write, test, and commit code across your entire codebase.',
    category: 'Coding', categorySlug: 'coding', logo: '🖥️',
    website: 'https://docs.anthropic.com/claude-code', pricing: 'Paid', startingPrice: 'Usage-based',
    rating: 4.7, reviews: 2100, tags: ['Terminal', 'Agentic', 'Anthropic', 'Git'], featured: false, new: true
  },

  // Image Generation
  {
    id: '11', name: 'Midjourney', slug: 'midjourney', tagline: 'Create stunning AI art',
    description: 'Midjourney produces some of the most aesthetic and photorealistic AI images. Used by artists, designers, and creators worldwide.',
    category: 'Image Generation', categorySlug: 'image-generation', logo: '🎨',
    website: 'https://midjourney.com', pricing: 'Paid', startingPrice: '₹830/mo',
    rating: 4.8, reviews: 15600, tags: ['Art', 'Photorealistic', 'Discord', 'Creative'], featured: true, new: false, badge: 'Best for Art'
  },
  {
    id: '12', name: 'Adobe Firefly', slug: 'adobe-firefly', tagline: 'Generative AI for creatives',
    description: 'Adobe Firefly is commercially safe AI art generation built into Adobe Creative Cloud. Generate images, vectors, and text effects.',
    category: 'Image Generation', categorySlug: 'image-generation', logo: '🔥',
    website: 'https://firefly.adobe.com', pricing: 'Freemium', startingPrice: '₹1,650/mo',
    rating: 4.5, reviews: 4800, tags: ['Adobe', 'Commercial', 'Creative Cloud', 'Vector'], featured: false, new: false
  },
  {
    id: '13', name: 'Ideogram', slug: 'ideogram', tagline: 'AI images with perfect text',
    description: 'Ideogram excels at generating images with accurate text — logos, posters, and typography. One of the best for design-oriented image creation.',
    category: 'Image Generation', categorySlug: 'image-generation', logo: '💡',
    website: 'https://ideogram.ai', pricing: 'Freemium', startingPrice: '₹580/mo',
    rating: 4.6, reviews: 3200, tags: ['Text in Images', 'Logo', 'Design', 'Typography'], featured: false, new: true
  },
  {
    id: '14', name: 'Leonardo AI', slug: 'leonardo-ai', tagline: 'Professional AI image creation',
    description: 'Leonardo AI offers fine-tuned models for game assets, concept art, and product imagery. Features real-time generation and editing tools.',
    category: 'Image Generation', categorySlug: 'image-generation', logo: '🦁',
    website: 'https://leonardo.ai', pricing: 'Freemium', startingPrice: '₹830/mo',
    rating: 4.5, reviews: 5100, tags: ['Game Art', 'Concept Art', 'Fine-tune', 'Real-time'], featured: false, new: false
  },

  // Video Generation
  {
    id: '15', name: 'Runway', slug: 'runway', tagline: 'AI video generation and editing',
    description: 'Runway Gen-3 creates high-quality videos from text or image prompts. Industry standard for AI video in film and content production.',
    category: 'Video Generation', categorySlug: 'video-generation', logo: '🎬',
    website: 'https://runwayml.com', pricing: 'Freemium', startingPrice: '₹1,250/mo',
    rating: 4.6, reviews: 6300, tags: ['Text-to-Video', 'Video Editing', 'Gen-3', 'Professional'], featured: true, new: false
  },
  {
    id: '16', name: 'HeyGen', slug: 'heygen', tagline: 'AI avatar video creation',
    description: 'HeyGen lets you create professional videos with AI avatars. Perfect for marketing, training, and corporate videos without a camera.',
    category: 'Video Generation', categorySlug: 'video-generation', logo: '👤',
    website: 'https://heygen.com', pricing: 'Freemium', startingPrice: '₹2,490/mo',
    rating: 4.7, reviews: 4200, tags: ['Avatar', 'Marketing', 'Corporate', 'Voice Clone'], featured: true, new: false, badge: 'Best for Business'
  },

  // Writing
  {
    id: '17', name: 'Jasper', slug: 'jasper', tagline: 'AI writing for marketing teams',
    description: 'Jasper is an enterprise AI writing platform built for marketing teams. Generate blogs, ads, emails, and social content at scale.',
    category: 'Writing & Content', categorySlug: 'writing', logo: '✍️',
    website: 'https://jasper.ai', pricing: 'Paid', startingPrice: '₹2,900/mo',
    rating: 4.4, reviews: 7200, tags: ['Marketing', 'Blog', 'Copywriting', 'Enterprise'], featured: false, new: false
  },
  {
    id: '18', name: 'Grammarly', slug: 'grammarly', tagline: 'AI writing assistant for everyone',
    description: 'Grammarly uses AI to check grammar, tone, clarity, and plagiarism. Available as a browser extension, app, and API.',
    category: 'Writing & Content', categorySlug: 'writing', logo: '📝',
    website: 'https://grammarly.com', pricing: 'Freemium', startingPrice: '₹1,250/mo',
    rating: 4.6, reviews: 18900, tags: ['Grammar', 'Writing', 'Browser Extension', 'Plagiarism'], featured: true, new: false
  },

  // Music
  {
    id: '19', name: 'Suno', slug: 'suno', tagline: 'Create full songs with AI',
    description: 'Suno generates complete songs with vocals, instruments, and lyrics from a text prompt. The most accessible AI music creation tool.',
    category: 'Music & Audio', categorySlug: 'music-audio', logo: '🎵',
    website: 'https://suno.com', pricing: 'Freemium', startingPrice: '₹830/mo',
    rating: 4.7, reviews: 8900, tags: ['Music', 'Vocals', 'Lyrics', 'Song Generation'], featured: true, new: false, badge: 'Trending'
  },
  {
    id: '20', name: 'ElevenLabs', slug: 'elevenlabs', tagline: 'Most realistic AI voice generation',
    description: 'ElevenLabs creates hyper-realistic AI voices and voice clones. Used for audiobooks, dubbing, and voice-over production.',
    category: 'Music & Audio', categorySlug: 'music-audio', logo: '🔊',
    website: 'https://elevenlabs.io', pricing: 'Freemium', startingPrice: '₹415/mo',
    rating: 4.8, reviews: 11200, tags: ['Voice Clone', 'TTS', 'Dubbing', 'Audiobook'], featured: true, new: false
  },
]

export const featuredTools = tools.filter(t => t.featured)
export const newTools = tools.filter(t => t.new)

export function getToolBySlug(slug: string): AITool | undefined {
  return tools.find(t => t.slug === slug)
}

export function getToolsByCategory(categorySlug: string): AITool[] {
  return tools.filter(t => t.categorySlug === categorySlug)
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find(c => c.slug === slug)
}
