import { Router, Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = Router();

let chatModel: any;
const getChatModel = () => {
  if (!chatModel) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    chatModel = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction:
        "You are FlashSynq AI, a study buddy. You must ONLY respond to questions and topics related to studies, learning, and education. If the user asks about anything else, politely decline and steer the conversation back to studying.",
    });
  }
  return chatModel;
};

router.post("/", async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;

    const chatHistory = history?.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    })) || [];

    const chat = getChatModel().startChat({
      history: chatHistory,
      generationConfig: { maxOutputTokens: 500 },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    res.json({ reply: response.text() });
  } catch (error: any) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
