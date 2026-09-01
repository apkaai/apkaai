const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb')

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-south-1',
  // Credentials are picked up automatically from:
  //  1. Environment variables (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY)
  //  2. EC2 instance IAM role (preferred in production)
  //  3. ~/.aws/credentials on local dev
})

const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: false,
  },
})

module.exports = { docClient }
