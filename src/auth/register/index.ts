import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

const USERS_TABLE = process.env.USERS_TABLE!;

export const handler = async (event: any) => {
  try {
    const body = JSON.parse(event.body || '{}');

    const { email, userName, password } = body;

    if (!email || !userName || !password) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          message: 'Missing required fields',
        }),
      };
    }

    // Check if user exists
    const existingUser = await dynamo.send(
      new GetCommand({
        TableName: USERS_TABLE,
        Key: {
          email,
        },
      })
    );

    if (existingUser.Item) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          message: 'User already exists',
        }),
      };
    }

    // Save user
    await dynamo.send(
      new PutCommand({
        TableName: USERS_TABLE,
        Item: {
          email,
          userName,
          password,
        },
      })
    );

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        email,
        userName,
      }),
    };
  } catch (error) {
    console.error('REGISTER ERROR:', error);

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        message: 'Internal server error',
      }),
    };
  }
};