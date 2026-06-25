import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as path from 'path';

export class QuestionGeneratorApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Table
    const usersTable = new dynamodb.Table(this, 'UsersTable', {
      partitionKey: {
        name: 'email',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Register Lambda
    const registerLambda = new NodejsFunction(this, 'RegisterLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: path.join(__dirname, '../src/auth/register/index.ts'),
      timeout: cdk.Duration.seconds(30),
      environment: {
        USERS_TABLE: usersTable.tableName,
      },
      bundling: {
        minify: true,
        target: 'node20',
      },
    });

    // Login Lambda
    const loginLambda = new NodejsFunction(this, 'LoginLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: path.join(__dirname, '../src/auth/login/index.ts'),
      timeout: cdk.Duration.seconds(30),
      environment: {
        USERS_TABLE: usersTable.tableName,
      },
      bundling: {
        minify: true,
        target: 'node20',
      },
    });

    // Question Generator Lambda
    const questionLambda = new NodejsFunction(this, 'GenerateQuestionsLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: path.join(__dirname, '../src/function/handler.ts'),
      timeout: cdk.Duration.minutes(2),
      memorySize: 512,
      bundling: {
        minify: true,
        target: 'node20',
      },
    });

    // Bedrock Permissions
    questionLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['bedrock:*'],
        resources: ['*'],
      })
    );

    // DynamoDB Permissions
    usersTable.grantReadWriteData(registerLambda);
    usersTable.grantReadData(loginLambda);

    // API Gateway
    const api = new apigateway.RestApi(this, 'QuestionsApi', {
      restApiName: 'Generate Interview Questions API',

      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type'],
      },
    });

    // Register API
    const registerResource = api.root.addResource('register');

    registerResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(registerLambda)
    );

    // Login API
    const loginResource = api.root.addResource('login');

    loginResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(loginLambda)
    );

    // Generate Questions API
    const generateQuestionsResource =
      api.root.addResource('generateQuestions');

    generateQuestionsResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(questionLambda),
      {
        methodResponses: [
          {
            statusCode: '200',
            responseParameters: {
              'method.response.header.Access-Control-Allow-Origin': true,
            },
          },
        ],
      }
    );

    // Outputs
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: api.url,
    });

    new cdk.CfnOutput(this, 'UsersTableName', {
      value: usersTable.tableName,
    });
  }
}