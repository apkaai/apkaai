const { docClient } = require('../lib/dynamo')
const { PutCommand } = require('@aws-sdk/lib-dynamodb')
const { v4: uuidv4 } = require('uuid')

const TABLE = process.env.DYNAMODB_CONTACTS_TABLE || 'apkaai-contacts'

// ── POST /api/contact ─────────────────────────────────────────────────────────
async function submitContact(req, res, next) {
  try {
    const { name, email, message, subject } = req.body

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'name, email and message are required' })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' })
    }

    if (message.length > 2000) {
      return res.status(400).json({ error: 'Message too long (max 2000 chars)' })
    }

    const item = {
      id: uuidv4(),
      name: name.trim().slice(0, 100),
      email: email.trim().toLowerCase(),
      subject: subject ? subject.trim().slice(0, 200) : 'General Inquiry',
      message: message.trim(),
      sentTo: 'coolakpandey@gmail.com',  // Ashutosh Kumar Pandey
      createdAt: new Date().toISOString(),
      status: 'new',
    }

    await docClient.send(new PutCommand({ TableName: TABLE, Item: item }))

    res.status(201).json({ success: true, message: 'Your message has been received. We\'ll be in touch soon!' })
  } catch (err) {
    next(err)
  }
}

module.exports = { submitContact }
