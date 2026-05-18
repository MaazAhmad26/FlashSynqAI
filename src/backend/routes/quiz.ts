import { Router, Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const { content } = req.body;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: content },
            {
              text: 'Create a quiz based on the provided material. Include 5 varied multiple-choice questions with 4 options each, the correct answer index, and a detailed explanation for each answer. IMPORTANT: Return ONLY a valid JSON object matching this schema: { "title": "string", "questions": [{ "question": "string", "options": ["string"], "correctAnswerIndex": 0, "explanation": "string" }] }. Do not include markdown formatting or backticks.',
            },
          ],
        },
      ],
    });

    const resultText = result.response.text();
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    const cleanedJson = jsonMatch ? jsonMatch[0] : resultText;
    const resultJson = JSON.parse(cleanedJson || "{}");
    res.json(resultJson);
  } catch (error: any) {
    console.error("Quiz Generation Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
