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

// Define schema for structural validation of analytical output
const analyzeSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    summary: { 
      type: SchemaType.STRING,
      description: "A concise summary of the provided study material."
    },
    keyPoints: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "A list of key points extracted from the material with memory aids/mnemonics."
    },
    tags: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Relevant study tags for sorting and categorizing the material."
    }
  },
  required: ["summary", "keyPoints", "tags"]
};

// Get the globally optimized model config
const getModel = () => {
  return getGenAI().getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: analyzeSchema,
    }
  });
};

router.post("/", async (req: Request, res: Response) => {
  try {
    const { fileData, fileType, textContent } = req.body;
    let contentParts: any[] = [];

    if (fileData) {
      const buffer = Buffer.from(fileData, "base64");
      
      if (fileType === "application/pdf") {
        contentParts.push({
          inlineData: {
            mimeType: fileType,
            data: fileData,
          },
        });
      } else if (
        fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const mammoth = (await import("mammoth")).default;
        const result = await mammoth.extractRawText({ buffer });
        contentParts.push({ text: result.value });
      } else {
        contentParts.push({ text: buffer.toString("utf-8") });
      }
    }

    if (textContent) {
      contentParts.push({ text: textContent });
    }

    if (contentParts.length === 0) {
      return res.status(400).json({ error: "No content provided" });
    }

    const model = getModel();
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            ...contentParts,
            {
              text: "Analyze this study material. Provide a concise summary, a list of key points with memory aids (like mnemonics), and relevant study tags.",
            },
          ],
        },
      ],
    });

    const resultText = result.response.text();
    const resultJson = JSON.parse(resultText || "{}");
    res.json(resultJson);
  } catch (error: any) {
    console.error("Analysis Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
