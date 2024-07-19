import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/dbUtils";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getTranslations } from "@/lib/translations"; // Updated import path

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("API key is not configured");
}

const genAI = new GoogleGenerativeAI(apiKey);

const generationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 1024,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const {
    agentName,
    agentUsername,
    language = "en",
    recordingCount,
    percentageChange,
    averageAudioDuration,
    averageScore,
    averageProcessingTime,
  } = req.body;

  if (!agentUsername) {
    return res.status(400).json({ message: "Invalid request payload" });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db("config_assistant");
    const collection = db.collection("assistant");

    const assistantModel = await collection.findOne({});

    if (!assistantModel) {
      return res.status(404).json({ message: "No assistant model found" });
    }

    const { name, model: modelName } = assistantModel;

    if (name !== "Gemini") {
      return res.status(400).json({ message: "Invalid assistant name" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig,
    });

    const translations = getTranslations(language as "en" | "ro");

    const prompt = `
      ${translations.gemini.assistant_instruction}
      
      Generate a brief summary of the agent's performance based on the following metrics:

      Agent Name: ${agentName}
      Total Calls: ${recordingCount}
      Percentage Change in Calls: ${percentageChange}
      Average Call Duration: ${averageAudioDuration}
      Average Call Score: ${averageScore}
      Average Processing Time: ${averageProcessingTime}

      Provide insights on the agent's performance, areas of strength, and potential areas for improvement. 
      Keep the summary concise, around 3-4 sentences.
      
      Respond in ${language === 'ro' ? 'Romanian' : 'English'}.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    res.status(200).json({ summary: responseText });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}