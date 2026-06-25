import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";

import {
  GenerateRequest,
  QuestionOutput,
} from "../model/quesGen.model";

// Bedrock Client
const client = new BedrockRuntimeClient({
  region: "us-east-1",
});

// Logger
export const logger = {
  info: (...args: any[]) => console.log("[INFO]", ...args),
  error: (...args: any[]) => console.error("[ERROR]", ...args),
  warn: (...args: any[]) => console.warn("[WARN]", ...args),
};

// API Headers
export function getAPIHeaders(headers: any) {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "OPTIONS,POST",
  };
}

// Main Function
export async function generateQuestionsFromJD(
  input: GenerateRequest
): Promise<QuestionOutput[]> {

  logger.info("Generating questions from JD");

  // Prompt
  const prompt = `
You are an expert technical interviewer.

Generate exactly 5 realistic technical interview questions 
based ONLY on the following job description.

Each question must include:
- A technical interview question
- An expected answer

Strict format:

1. Question text
Expected Answer: Answer text

2. Question text
Expected Answer: Answer text

Job Description:
${input.hrsJobDesc}
`;

  // Bedrock Command
  const command = new ConverseCommand({
    modelId: "us.amazon.nova-micro-v1:0",

    messages: [
      {
        role: "user",
        content: [
          {
            text: prompt,
          },
        ],
      },
    ],

    inferenceConfig: {
      maxTokens: 1000,
      temperature: 0.7,
    },
  });

  try {

    logger.info("Calling Bedrock model...");

    const response = await client.send(command);

    const outputText =
      response.output?.message?.content?.[0]?.text || "";

    logger.info("Raw Bedrock Output:");
    logger.info(outputText);

    const questions: QuestionOutput[] = [];

    // REGEX PARSER
    const regex =
      /\d+\.\s*(.*?)\s*Expected Answer:\s*(.*?)(?=\n\d+\.|$)/gs;

    let match;

    let id = 1;

    while ((match = regex.exec(outputText)) !== null) {

      questions.push({
        hrsQuesId: id.toString(),
        hrsQuesText: match[1].trim(),
        hrsExpAns: match[2].trim(),
      });

      id++;
    }

    logger.info("Parsed Questions:", questions);

    return questions;

  } catch (error: any) {

    logger.error("Bedrock Error:", error);

    throw new Error(
      "Failed to generate interview questions"
    );
  }
}