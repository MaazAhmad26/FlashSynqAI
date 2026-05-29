import { Router, Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = Router();

let genAIInstance: any;
const getGenAI = () => {
  if (!genAIInstance) {
    genAIInstance = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  }
  return genAIInstance;
};

const getChatModel = (modelName: string) => {
  return getGenAI().getGenerativeModel({
    model: modelName,
    systemInstruction:
      "You are FlashSynq AI, a study buddy. You must ONLY respond to questions and topics related to studies, learning, and education. If the user asks about anything else, politely decline and steer the conversation back to studying.",
  });
};

router.post("/", async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;

    const chatHistory = history?.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    })) || [];

    let reply = "";
    try {
      // Primary: Gemini 3.5 Flash
      const chat = getChatModel("gemini-3.5-flash").startChat({
        history: chatHistory,
        generationConfig: { maxOutputTokens: 500 },
      });
      const result = await chat.sendMessage(message);
      const response = await result.response;
      reply = response.text();
    } catch (primaryError) {
      console.warn("Primary chat model (gemini-3.5-flash) failed, attempting fallback to gemini-2.5-flash:", primaryError);
      // Secondary Fallback: Gemini 2.5 Flash
      const chatFallback = getChatModel("gemini-2.5-flash").startChat({
        history: chatHistory,
        generationConfig: { maxOutputTokens: 500 },
      });
      const resultFallback = await chatFallback.sendMessage(message);
      const responseFallback = await resultFallback.response;
      reply = responseFallback.text();
    }

    res.json({ reply });
  } catch (error: any) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
