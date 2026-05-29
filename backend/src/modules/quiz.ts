import { Router, Request, Response } from "express";
import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";

const router = Router();

let genAI: GoogleGenerativeAI;
const getGenAI = () => {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  }
  return genAI;
};

// Define schema for structural validation of quiz output
const quizSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    title: { 
      type: SchemaType.STRING, 
      description: "The title or topic of the quiz." 
    },
    questions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          question: { 
            type: SchemaType.STRING, 
            description: "The multiple choice question text." 
          },
          options: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "A list of exactly 4 potential answer options."
          },
          correctAnswerIndex: { 
            type: SchemaType.INTEGER, 
            description: "The 0-based index of the correct answer within the options array." 
          },
          explanation: { 
            type: SchemaType.STRING, 
            description: "A detailed explanation explaining why the correct answer is correct." 
          }
        },
        required: ["question", "options", "correctAnswerIndex", "explanation"]
      },
      description: "A list of 5 multiple choice questions."
    }
  },
  required: ["title", "questions"]
};

// Get the globally optimized model config
const getModel = () => {
  return getGenAI().getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: quizSchema,
    }
  });
};

router.post("/", async (req: Request, res: Response) => {
  try {
    const { content } = req.body;

    const model = getModel();
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: content },
            {
              text: "Create a quiz based on the provided material. Include 5 varied multiple-choice questions with 4 options each, the correct answer index, and a detailed explanation for each answer.",
            },
          ],
        },
      ],
    });

    const resultText = result.response.text();
    const resultJson = JSON.parse(resultText || "{}");
    res.json(resultJson);
  } catch (error: any) {
    console.error("Quiz Generation Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
