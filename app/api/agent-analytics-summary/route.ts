import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from "@/lib/dbUtils";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getTranslations } from "@/lib/translations";

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

export async function POST(request: NextRequest) {
  const {
    agentName,
    agentUsername,
    language = "en",
    recordingCount,
    percentageChange,
    averageAudioDuration,
    averageScore,
    averageProcessingTime,
  } = await request.json();

  if (!agentUsername) {
    return NextResponse.json({ message: "Invalid request payload" }, { status: 400 });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db("config_assistant");
    const collection = db.collection("assistant");

    const assistantModel = await collection.findOne({});

    if (!assistantModel) {
      return NextResponse.json({ message: "No assistant model found" }, { status: 404 });
    }

    const { name } = assistantModel;

    if (name !== "Gemini") {
      return NextResponse.json({ message: "Invalid assistant name" }, { status: 400 });
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

    return NextResponse.json({ summary: responseText });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}