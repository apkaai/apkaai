/**
 * createTables.js
 * Run once to create all DynamoDB tables for apkaai.com
 * Usage: node src/lib/createTables.js
 */
require('dotenv').config()
const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb')

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' })

const tables = [
  // ── apkaai-tools ─────────────────────────────────────────────────────────────
  {
    TableName: process.env.DYNAMODB_TOOLS_TABLE || 'apkaai-tools',
    // Primary key: slug (String) — e.g. "chatgpt", "cursor"
    KeySchema: [{ AttributeName: 'slug', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'slug',         AttributeType: 'S' },
      { AttributeName: 'categorySlug', AttributeType: 'S' },
      { AttributeName: 'rating',       AttributeType: 'N' },
    ],
    // GSI: query all tools in a category, sorted by rating
    GlobalSecondaryIndexes: [
      {
        IndexName: 'categorySlug-index',
        KeySchema: [
          { AttributeName: 'categorySlug', KeyType: 'HASH' },
          { AttributeName: 'rating',       KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
      },
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
  },

  // ── apkaai-categories ─────────────────────────────────────────────────────────
  {
    TableName: process.env.DYNAMODB_CATEGORIES_TABLE || 'apkaai-categories',
    // Primary key: slug (String) — e.g. "ai-chat", "coding"
    KeySchema: [{ AttributeName: 'slug', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'slug', AttributeType: 'S' },
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
  },

  // ── apkaai-contacts ───────────────────────────────────────────────────────────
  {
    TableName: process.env.DYNAMODB_CONTACTS_TABLE || 'apkaai-contacts',
    // Primary key: id (String, UUID)
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
  },
]

async function tableExists(tableName) {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }))
    return true
  } catch {
    return false
  }
}

async function createTables() {
  console.log('🔧 Creating DynamoDB tables in', process.env.AWS_REGION || 'ap-south-1', '...\n')

  for (const schema of tables) {
    const exists = await tableExists(schema.TableName)
    if (exists) {
      console.log(`  ✅ ${schema.TableName} — already exists, skipping`)
      continue
    }
    try {
      await client.send(new CreateTableCommand(schema))
      console.log(`  ✅ ${schema.TableName} — created`)
    } catch (err) {
      console.error(`  ❌ ${schema.TableName} — failed: ${err.message}`)
    }
  }

  console.log('\n🎉 Table setup complete!')
}

createTables()
