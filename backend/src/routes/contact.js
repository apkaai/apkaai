const express = require('express')
const router = express.Router()
const rateLimit = require('express-rate-limit')
const { submitContact } = require('../controllers/contactController')

// Strict rate limit on contact form: 5 submissions per hour per IP
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Too many contact requests. Please try again in an hour.' },
})

// POST /api/contact
router.post('/', contactLimiter, submitContact)

module.exports = router
