const { docClient } = require('../lib/dynamo')
const {
  ScanCommand,
  GetCommand,
  QueryCommand,
  PutCommand,
  DeleteCommand,
} = require('@aws-sdk/lib-dynamodb')

const TABLE = process.env.DYNAMODB_TOOLS_TABLE || 'apkaai-tools'

// ── GET /api/tools ────────────────────────────────────────────────────────────
// Query params: category, pricing, search, sort, limit
async function listTools(req, res, next) {
  try {
    const { category, pricing, search, sort = 'popular', limit = '50' } = req.query

    let params = { TableName: TABLE, Limit: parseInt(limit, 10) }

    // If category is provided, use GSI
    if (category) {
      params = {
        TableName: TABLE,
        IndexName: 'categorySlug-index',
        KeyConditionExpression: 'categorySlug = :cat',
        ExpressionAttributeValues: { ':cat': category },
      }
      const result = await docClient.send(new QueryCommand(params))
      return res.json({ tools: sortTools(result.Items, sort), count: result.Count })
    }

    // Full scan (small dataset, no pagination needed at this scale)
    const result = await docClient.send(new ScanCommand(params))
    let items = result.Items || []

    // Filter by pricing
    if (pricing && pricing !== 'All') {
      items = items.filter(t => t.pricing === pricing)
    }

    // Simple in-memory search
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(t =>
        t.name?.toLowerCase().includes(q) ||
        t.tagline?.toLowerCase().includes(q) ||
        t.tags?.some(tag => tag.toLowerCase().includes(q))
      )
    }

    return res.json({ tools: sortTools(items, sort), count: items.length })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/tools/featured ───────────────────────────────────────────────────
async function getFeatured(req, res, next) {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: TABLE,
      FilterExpression: 'featured = :f',
      ExpressionAttributeValues: { ':f': true },
    }))
    res.json({ tools: result.Items || [], count: result.Count })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/tools/:slug ──────────────────────────────────────────────────────
async function getToolBySlug(req, res, next) {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: TABLE,
      Key: { slug: req.params.slug },
    }))

    if (!result.Item) {
      return res.status(404).json({ error: 'Tool not found' })
    }

    res.json({ tool: result.Item })
  } catch (err) {
    next(err)
  }
}

// ── Helper: sort tools ────────────────────────────────────────────────────────
function sortTools(items, sort) {
  switch (sort) {
    case 'rating':  return [...items].sort((a, b) => (b.rating || 0) - (a.rating || 0))
    case 'new':     return [...items].sort((a, b) => (b.new ? 1 : 0) - (a.new ? 1 : 0))
    case 'name':    return [...items].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    default:        return [...items].sort((a, b) => (b.reviews || 0) - (a.reviews || 0)) // popular
  }
}

module.exports = { listTools, getFeatured, getToolBySlug }
