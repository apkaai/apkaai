const express = require('express')
const router = express.Router()
const { listCategories, getCategoryBySlug } = require('../controllers/categoriesController')

// GET /api/categories          — list all categories
router.get('/', listCategories)

// GET /api/categories/:slug    — get a single category
router.get('/:slug', getCategoryBySlug)

module.exports = router
