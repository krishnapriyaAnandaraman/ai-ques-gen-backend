import { APIGatewayProxyHandler } from "aws-lambda";
import {
  BedrockRuntimeClient,
  ConverseCommand,
  ConversationRole
} from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
  region: "us-east-1",
});

export const handler: APIGatewayProxyHandler = async (event: any) => {
  try {
    const body = JSON.parse(event.body || "{}");

    const hrsJobDesc = body.hrsJobDesc;

    if (!hrsJobDesc) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          error: "Missing hrsJobDesc",
        }),
      };
    }

    const prompt = `
Generate exactly 5 interview questions with expected answers.

Return ONLY valid JSON array format.

Format:
[
 {
   "hrsQuesId":"1",
   "hrsQuesText":"Question here",
   "hrsExpAns":"Answer here"
 }
]

Job Description:
${hrsJobDesc}
`;

    const command = new ConverseCommand({
      modelId: "us.amazon.nova-micro-v1:0",
      messages: [
        {
          role: ConversationRole.USER,
          content: [{ text: prompt }],
        },
      ],
      inferenceConfig: {
        maxTokens: 1000,
        temperature: 0.7,
      },
    });

    const response = await client.send(command);

    const output =
      response.output?.message?.content?.[0]?.text || "[]";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: output,
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: error.message,
      }),
    };
  }
};