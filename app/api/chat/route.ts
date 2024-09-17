import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/dbUtils";
import { getTranslations } from "@/lib/translations";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("API key is not configured");
}

const genAI = new GoogleGenerativeAI(apiKey);

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
};

interface ChatPart {
  text: string;
}

interface ChatHistoryEntry {
  role: "user" | "model";
  parts: ChatPart[];
}

export async function POST(request: NextRequest) {
  try {
    const {
      message,
      chatHistory: clientChatHistory,
      language = "en",
    } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 }
      );
    }

    const client = await connectToDatabase();
    const db = client.db("config_assistant");
    const collection = db.collection("assistant");

    const assistantModel = await collection.findOne({});

    if (!assistantModel) {
      return NextResponse.json(
        { error: "No assistant model found" },
        { status: 404 }
      );
    }

    if (assistantModel.name !== "Gemini") {
      return NextResponse.json(
        { error: "Invalid assistant name" },
        { status: 400 }
      );
    }

    const texts = getTranslations(language);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const initialChatHistory: ChatHistoryEntry[] = [
      {
        role: "user",
        parts: [{ text: texts.gemini.example_questions.question1 }],
      },
      {
        role: "model",
        parts: [{ text: texts.gemini.example_answers.answer1 }],
      },
      {
        role: "user",
        parts: [{ text: texts.gemini.example_questions.question2 }],
      },
      {
        role: "model",
        parts: [{ text: texts.gemini.example_answers.answer2 }],
      },
      {
        role: "user",
        parts: [{ text: texts.gemini.example_questions.question3 }],
      },
      {
        role: "model",
        parts: [{ text: texts.gemini.example_answers.answer3 }],
      },
    ];

    const chatHistory = [...initialChatHistory, ...clientChatHistory];

    const chatSession = model.startChat({
      generationConfig,
      history: chatHistory,
    });

    const result = await chatSession.sendMessage(
      texts.gemini.assistant_instruction + "\n\n" + message
    );
    const responseText = await result.response.text();

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
