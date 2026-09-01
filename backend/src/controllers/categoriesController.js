const { docClient } = require('../lib/dynamo')
const { ScanCommand, GetCommand } = require('@aws-sdk/lib-dynamodb')

const TABLE = process.env.DYNAMODB_CATEGORIES_TABLE || 'apkaai-categories'

// ── GET /api/categories ───────────────────────────────────────────────────────
async function listCategories(req, res, next) {
  try {
    const result = await docClient.send(new ScanCommand({ TableName: TABLE }))
    const sorted = (result.Items || []).sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    res.json({ categories: sorted, count: sorted.length })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/categories/:slug ─────────────────────────────────────────────────
async function getCategoryBySlug(req, res, next) {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: TABLE,
      Key: { slug: req.params.slug },
    }))

    if (!result.Item) {
      return res.status(404).json({ error: 'Category not found' })
    }

    res.json({ category: result.Item })
  } catch (err) {
    next(err)
  }
}

module.exports = { listCategories, getCategoryBySlug }
