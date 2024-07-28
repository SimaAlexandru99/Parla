import { NextApiRequest, NextApiResponse } from "next";
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
  responseMimeType: "text/plain",
};

interface ChatPart {
  text: string;
}

interface ChatHistoryEntry {
  role: "user" | "model";
  parts: ChatPart[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { message, chatHistory: clientChatHistory, language = "en" }: {
    message: string;
    chatHistory: ChatHistoryEntry[];
    language: "en" | "ro";
  } = req.body;

  if (!message || typeof message !== "string") {
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

    const { name } = assistantModel;

    if (name !== "Gemini") {
      return res.status(400).json({ message: "Invalid assistant name" });
    }

    // Get the appropriate translations
    const texts = getTranslations(language);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      systemInstruction: texts.gemini.assistant_instruction,
    });

    // Combine server and client chat history
    let chatHistory: ChatHistoryEntry[] = [
      { role: "user", parts: [{ text: texts.gemini.example_questions.question1 }] },
      { role: "model", parts: [{ text: texts.gemini.example_answers.answer1 }] },
      { role: "user", parts: [{ text: texts.gemini.example_questions.question2 }] },
      { role: "model", parts: [{ text: texts.gemini.example_answers.answer2 }] },
      { role: "user", parts: [{ text: texts.gemini.example_questions.question3 }] },
      { role: "model", parts: [{ text: texts.gemini.example_answers.answer3 }] },
    ];

    chatHistory = [...chatHistory, ...clientChatHistory];

    const chatSession = model.startChat({
      generationConfig,
      history: chatHistory,
    });

    const result = await chatSession.sendMessage(message);
    const responseText = await result.response.text();

    chatHistory.push({ role: "model", parts: [{ text: responseText }] });

    res.status(200).json({ response: responseText });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
