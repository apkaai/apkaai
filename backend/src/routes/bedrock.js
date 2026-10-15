// backend/src/routes/bedrock.js
// apkaAI Agent — AWS Bedrock chat/summarise/analyse/generate
'use strict'

const express = require('express')
const router  = express.Router()
const multer  = require('multer')
const fs      = require('fs')
const path    = require('path')

// ── AWS Bedrock client ────────────────────────────────────────────────────────
let BedrockRuntimeClient, InvokeModelCommand
try {
  const sdk = require('@aws-sdk/client-bedrock-runtime')
  BedrockRuntimeClient = sdk.BedrockRuntimeClient
  InvokeModelCommand   = sdk.InvokeModelCommand
} catch (e) {
  console.warn('[bedrock] @aws-sdk/client-bedrock-runtime not installed:', e.message)
}

const bedrockClient = BedrockRuntimeClient
  ? new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' })
  : null

// ── File upload (memory, max 20 MB) ──────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv',
      'application/json',
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    ]
    if (allowed.includes(file.mimetype)) return cb(null, true)
    cb(new Error('Unsupported file type: ' + file.mimetype))
  },
})

// ── Auth helper ───────────────────────────────────────────────────────────────
function verifyToken (req) {
  try {
    const auth = req.headers.authorization || ''
    if (!auth.startsWith('Bearer ')) return null
    const token = auth.slice(7)
    const [payload] = token.split('.')
    return JSON.parse(Buffer.from(payload, 'base64url').toString())
  } catch { return null }
}

function requireAuth (req, res, next) {
  const user = verifyToken(req)
  if (!user) return res.status(401).json({ error: 'Sign in required' })
  req.user = user
  next()
}

// ── Model configs ─────────────────────────────────────────────────────────────
const MODELS = {
  'amazon.nova-micro-v1:0':  { name: 'Amazon Nova Micro',  maxTokens: 5120  },
  'amazon.nova-lite-v1:0':   { name: 'Amazon Nova Lite',   maxTokens: 5120  },
  'amazon.nova-pro-v1:0':    { name: 'Amazon Nova Pro',    maxTokens: 5120  },
  'anthropic.claude-3-haiku-20240307-v1:0':   { name: 'Claude 3 Haiku',   maxTokens: 4096 },
  'anthropic.claude-3-5-sonnet-20240620-v1:0':{ name: 'Claude 3.5 Sonnet',maxTokens: 4096 },
}
const DEFAULT_MODEL = 'amazon.nova-lite-v1:0'

// ── Invoke Bedrock ─────────────────────────────────────────────────────────────
async function invokeModel (modelId, systemPrompt, userContent, maxTokens = 2048) {
  if (!bedrockClient) throw new Error('AWS Bedrock SDK not installed on this server.')

  const isNova      = modelId.startsWith('amazon.nova')
  const isClaude    = modelId.startsWith('anthropic.claude')

  let body
  if (isNova) {
    body = JSON.stringify({
      messages:           [{ role: 'user', content: userContent }],
      system:             [{ text: systemPrompt }],
      inferenceConfig:    { max_new_tokens: maxTokens, temperature: 0.7, top_p: 0.9 },
    })
  } else if (isClaude) {
    body = JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens:        maxTokens,
      system:            systemPrompt,
      messages:          [{ role: 'user', content: userContent }],
    })
  } else {
    throw new Error('Unsupported model: ' + modelId)
  }

  const cmd  = new InvokeModelCommand({ modelId, contentType: 'application/json', accept: 'application/json', body })
  const resp = await bedrockClient.send(cmd)
  const out  = JSON.parse(Buffer.from(resp.body).toString())

  if (isNova)   return out?.output?.message?.content?.[0]?.text || ''
  if (isClaude) return out?.content?.[0]?.text || ''
  return ''
}

// ── Extract text from uploaded file ──────────────────────────────────────────
function extractText (file) {
  const mime = file.mimetype
  if (mime.startsWith('text/') || mime === 'application/json') {
    return file.buffer.toString('utf-8').slice(0, 15000)
  }
  if (mime.startsWith('image/')) {
    return null // images handled separately as base64
  }
  // For PDF/DOCX/XLSX — return raw buffer as base64 hint
  return `[Attached file: ${file.originalname} (${mime}, ${Math.round(file.size / 1024)} KB). Please analyse based on filename and context.]`
}

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/bedrock/chat
// ─────────────────────────────────────────────────────────────────────────────
router.post('/chat', requireAuth, upload.single('file'), async (req, res) => {
  try {
    const { message, modelId = DEFAULT_MODEL, history = '[]' } = req.body
    if (!message && !req.file) return res.status(400).json({ error: 'message or file required' })
    if (!MODELS[modelId]) return res.status(400).json({ error: 'Invalid model' })

    const system = `You are apkaAI Agent, an intelligent AI assistant powered by RAH Infotech. 
You help users with questions, document analysis, code generation, and more.
Be concise, helpful, and professional. If you don't know something, say so.`

    let userContent
    if (req.file && req.file.mimetype.startsWith('image/')) {
      // Vision — pass image as base64
      const b64 = req.file.buffer.toString('base64')
      userContent = [
        { image: { format: req.file.mimetype.split('/')[1], source: { bytes: b64 } } },
        { text: message || 'Describe this image.' },
      ]
    } else {
      let text = message || ''
      if (req.file) {
        const extracted = extractText(req.file)
        if (extracted) text = `File content:\n${extracted}\n\nUser question: ${text || 'Summarise this.'}`
      }
      userContent = [{ text }]
    }

    const reply = await invokeModel(modelId, system, userContent)
    res.json({ success: true, reply, model: modelId })
  } catch (err) {
    console.error('[bedrock/chat]', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/bedrock/summarise
// ─────────────────────────────────────────────────────────────────────────────
router.post('/summarise', requireAuth, upload.single('file'), async (req, res) => {
  try {
    const { text = '', modelId = DEFAULT_MODEL, length = 'medium' } = req.body
    const lengthGuide = { short: '2-3 sentences', medium: '1 paragraph', long: '3-4 paragraphs' }

    let content = text
    if (req.file) {
      const extracted = extractText(req.file)
      if (extracted) content = extracted
    }
    if (!content.trim()) return res.status(400).json({ error: 'text or file required' })

    const system = `You are apkaAI Agent, a document summarisation expert powered by RAH Infotech.
Summarise the provided text in ${lengthGuide[length] || '1 paragraph'}. 
Be clear, accurate, and preserve all key information.`

    const summary = await invokeModel(modelId, system, [{ text: content }], 1024)
    res.json({ success: true, summary, model: modelId })
  } catch (err) {
    console.error('[bedrock/summarise]', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/bedrock/analyse
// ─────────────────────────────────────────────────────────────────────────────
router.post('/analyse', requireAuth, upload.single('file'), async (req, res) => {
  try {
    const { text = '', modelId = DEFAULT_MODEL, mode = 'general' } = req.body

    let content = text
    if (req.file) {
      const extracted = extractText(req.file)
      if (extracted) content = extracted
    }
    if (!content.trim()) return res.status(400).json({ error: 'text or file required' })

    const modePrompts = {
      general:   'Provide a comprehensive analysis covering main themes, key insights, and important points.',
      sentiment: 'Analyse the sentiment. Return JSON: {"sentiment":"positive|negative|neutral","score":0.0-1.0,"reasoning":"..."}',
      topics:    'Extract the main topics as a JSON array of strings.',
      entities:  'Extract named entities as JSON: {"people":[],"organisations":[],"locations":[],"dates":[],"other":[]}',
    }

    const system = `You are apkaAI Agent, a content analysis expert powered by RAH Infotech.
${modePrompts[mode] || modePrompts.general}`

    const analysis = await invokeModel(modelId, system, [{ text: content }], 2048)

    // For JSON modes, try to parse
    let result = analysis
    if (['sentiment', 'topics', 'entities'].includes(mode)) {
      try {
        const jsonMatch = analysis.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
        if (jsonMatch) result = JSON.parse(jsonMatch[0])
      } catch { /* return raw string if JSON parse fails */ }
    }

    res.json({ success: true, analysis: result, mode, model: modelId })
  } catch (err) {
    console.error('[bedrock/analyse]', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/bedrock/generate
// ─────────────────────────────────────────────────────────────────────────────
router.post('/generate', requireAuth, async (req, res) => {
  try {
    const { prompt = '', modelId = DEFAULT_MODEL, type = 'text' } = req.body
    if (!prompt.trim()) return res.status(400).json({ error: 'prompt required' })

    const typePrompts = {
      text:  'Generate high-quality, well-structured text content based on the prompt.',
      code:  'Generate clean, well-commented, production-ready code. Include error handling.',
      email: 'Write a professional email based on the given topic/context. Include Subject line.',
      blog:  'Write an engaging blog post with title, introduction, sections, and conclusion.',
    }

    const system = `You are apkaAI Agent, a content generation expert powered by RAH Infotech.
${typePrompts[type] || typePrompts.text}
Be creative, accurate, and deliver exceptional quality.`

    const generated = await invokeModel(modelId, system, [{ text: prompt }], 3000)
    res.json({ success: true, generated, type, model: modelId })
  } catch (err) {
    console.error('[bedrock/generate]', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/bedrock/models
// ─────────────────────────────────────────────────────────────────────────────
router.get('/models', (_req, res) => {
  res.json({
    success: true,
    models: Object.entries(MODELS).map(([id, cfg]) => ({ id, name: cfg.name })),
    default: DEFAULT_MODEL,
  })
})

module.exports = router
