import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

const USERS_TABLE = process.env.USERS_TABLE!;

export const handler = async (event: any) => {
  try {
    const body = JSON.parse(event.body || '{}');

    const { email, password } = body;

    if (!email || !password) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          message: 'Missing email or password',
        }),
      };
    }

    const result = await dynamo.send(
      new GetCommand({
        TableName: USERS_TABLE,
        Key: {
          email,
        },
      })
    );

    const user = result.Item;

    if (!user || user.password !== password) {
      return {
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          message: 'Invalid email or password',
        }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        email: user.email,
        userName: user.userName,
      }),
    };
  } catch (error) {
    console.error('LOGIN ERROR:', error);

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