import { Router, Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const { message, history } = req.body;

    const chatHistory = history?.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    })) || [];

    const chatModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction:
        "You are FlashSynq AI, a study buddy. You must ONLY respond to questions and topics related to studies, learning, and education. If the user asks about anything else, politely decline and steer the conversation back to studying.",
    });

    const chat = chatModel.startChat({
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
