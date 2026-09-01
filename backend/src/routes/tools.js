const express = require('express')
const router = express.Router()
const { listTools, getFeatured, getToolBySlug } = require('../controllers/toolsController')

// GET /api/tools           — list all tools (with optional ?category=&pricing=&search=&sort=)
router.get('/', listTools)

// GET /api/tools/featured  — get featured tools only
router.get('/featured', getFeatured)

// GET /api/tools/:slug     — get a single tool by slug
router.get('/:slug', getToolBySlug)

module.exports = router
