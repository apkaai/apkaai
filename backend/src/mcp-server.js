#!/usr/bin/env node
/**
 * mcp-server.js — ApkaAI MCP Server
 *
 * Exposes ApkaAI DynamoDB data as MCP tools so Kiro (and other MCP clients)
 * can query tools, categories and contacts directly from the AI workspace.
 *
 * Protocol : MCP over stdio (JSON-RPC 2.0)
 * Transport: stdin/stdout
 */
require('dotenv').config()
const readline = require('readline')
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
  QueryCommand,
} = require('@aws-sdk/lib-dynamodb')

// ── DynamoDB client ────────────────────────────────────────────────────────────
const dynamo = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' }),
  { marshallOptions: { removeUndefinedValues: true } }
)

const TOOLS_TABLE      = process.env.DYNAMODB_TOOLS_TABLE      || 'apkaai-tools'
const CATEGORIES_TABLE = process.env.DYNAMODB_CATEGORIES_TABLE || 'apkaai-categories'

// ── MCP Tool definitions ───────────────────────────────────────────────────────
const TOOLS = [
  {
    name: 'list_ai_tools',
    description: 'List AI tools from ApkaAI. Optionally filter by category slug, pricing type, or search query.',
    inputSchema: {
      type: 'object',
      properties: {
        category:  { type: 'string',  description: 'Category slug (e.g. "coding", "ai-chat", "image-generation")' },
        pricing:   { type: 'string',  description: 'Pricing filter: Free | Freemium | Paid | Free Trial' },
        search:    { type: 'string',  description: 'Search text to filter tool names, taglines, or tags' },
        featured:  { type: 'boolean', description: 'If true, return only featured tools' },
      },
    },
  },
  {
    name: 'get_ai_tool',
    description: 'Get full details of a single AI tool by its slug (e.g. "chatgpt", "cursor", "midjourney").',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'The tool slug identifier' },
      },
      required: ['slug'],
    },
  },
  {
    name: 'list_categories',
    description: 'List all 15 AI tool categories available on ApkaAI.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_category',
    description: 'Get details and all tools in a specific category by slug.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'Category slug (e.g. "coding", "music-audio")' },
      },
      required: ['slug'],
    },
  },
  {
    name: 'search_tools',
    description: 'Full-text search across all AI tools by name, tagline, description, or tags.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query string' },
      },
      required: ['query'],
    },
  },
  {
    name: 'compare_tools',
    description: 'Compare two or more AI tools side by side (pricing, rating, features).',
    inputSchema: {
      type: 'object',
      properties: {
        slugs: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of tool slugs to compare (2–4 tools)',
          minItems: 2,
          maxItems: 4,
        },
      },
      required: ['slugs'],
    },
  },
]

// ── Tool handlers ──────────────────────────────────────────────────────────────
async function handleTool(name, args) {
  switch (name) {

    case 'list_ai_tools': {
      let items
      if (args.category) {
        const res = await dynamo.send(new QueryCommand({
          TableName: TOOLS_TABLE,
          IndexName: 'categorySlug-index',
          KeyConditionExpression: 'categorySlug = :cat',
          ExpressionAttributeValues: { ':cat': args.category },
        }))
        items = res.Items || []
      } else {
        const res = await dynamo.send(new ScanCommand({ TableName: TOOLS_TABLE }))
        items = res.Items || []
      }

      if (args.pricing)  items = items.filter(t => t.pricing === args.pricing)
      if (args.featured) items = items.filter(t => t.featured === true)
      if (args.search) {
        const q = args.search.toLowerCase()
        items = items.filter(t =>
          t.name?.toLowerCase().includes(q) ||
          t.tagline?.toLowerCase().includes(q) ||
          t.tags?.some(tag => tag.toLowerCase().includes(q))
        )
      }

      items.sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
      return { tools: items, count: items.length }
    }

    case 'get_ai_tool': {
      const res = await dynamo.send(new GetCommand({
        TableName: TOOLS_TABLE,
        Key: { slug: args.slug },
      }))
      if (!res.Item) return { error: `Tool "${args.slug}" not found` }
      return { tool: res.Item }
    }

    case 'list_categories': {
      const res = await dynamo.send(new ScanCommand({ TableName: CATEGORIES_TABLE }))
      const sorted = (res.Items || []).sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      return { categories: sorted, count: sorted.length }
    }

    case 'get_category': {
      const [catRes, toolsRes] = await Promise.all([
        dynamo.send(new GetCommand({ TableName: CATEGORIES_TABLE, Key: { slug: args.slug } })),
        dynamo.send(new QueryCommand({
          TableName: TOOLS_TABLE,
          IndexName: 'categorySlug-index',
          KeyConditionExpression: 'categorySlug = :cat',
          ExpressionAttributeValues: { ':cat': args.slug },
        })),
      ])
      if (!catRes.Item) return { error: `Category "${args.slug}" not found` }
      return { category: catRes.Item, tools: toolsRes.Items || [], toolCount: toolsRes.Count }
    }

    case 'search_tools': {
      const res = await dynamo.send(new ScanCommand({ TableName: TOOLS_TABLE }))
      const q = args.query.toLowerCase()
      const matches = (res.Items || []).filter(t =>
        t.name?.toLowerCase().includes(q) ||
        t.tagline?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.tags?.some(tag => tag.toLowerCase().includes(q))
      )
      return { results: matches, count: matches.length, query: args.query }
    }

    case 'compare_tools': {
      const results = await Promise.all(
        args.slugs.map(slug =>
          dynamo.send(new GetCommand({ TableName: TOOLS_TABLE, Key: { slug } }))
        )
      )
      const tools = results.map((r, i) => r.Item || { slug: args.slugs[i], error: 'not found' })
      const comparison = tools.map(t => ({
        name:          t.name,
        slug:          t.slug,
        pricing:       t.pricing,
        startingPrice: t.startingPrice,
        rating:        t.rating,
        reviews:       t.reviews,
        category:      t.category,
        tags:          t.tags,
        featured:      t.featured,
        website:       t.website,
      }))
      return { comparison, count: comparison.length }
    }

    default:
      return { error: `Unknown tool: ${name}` }
  }
}

// ── MCP JSON-RPC stdio transport ──────────────────────────────────────────────
const rl = readline.createInterface({ input: process.stdin, terminal: false })

function send(obj) {
  process.stdout.write(JSON.stringify(obj) + '\n')
}

rl.on('line', async (line) => {
  let msg
  try {
    msg = JSON.parse(line.trim())
  } catch {
    return // ignore malformed input
  }

  const { id, method, params } = msg

  try {
    // ── Capability negotiation ─────────────────────────────────────────────────
    if (method === 'initialize') {
      return send({
        jsonrpc: '2.0', id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: { name: 'apkaai-tools-api', version: '1.0.0' },
        },
      })
    }

    if (method === 'notifications/initialized') return // no response needed

    // ── List available tools ───────────────────────────────────────────────────
    if (method === 'tools/list') {
      return send({ jsonrpc: '2.0', id, result: { tools: TOOLS } })
    }

    // ── Execute a tool ─────────────────────────────────────────────────────────
    if (method === 'tools/call') {
      const result = await handleTool(params.name, params.arguments || {})
      return send({
        jsonrpc: '2.0', id,
        result: {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          isError: !!result.error,
        },
      })
    }

    // ── Unknown method ─────────────────────────────────────────────────────────
    send({
      jsonrpc: '2.0', id,
      error: { code: -32601, message: `Method not found: ${method}` },
    })
  } catch (err) {
    send({
      jsonrpc: '2.0', id,
      error: { code: -32603, message: err.message },
    })
  }
})

process.stderr.write('ApkaAI MCP server started (stdio)\n')
