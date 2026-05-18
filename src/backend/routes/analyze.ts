import { Router, Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            ...contentParts,
            {
              text: 'Analyze this study material. Provide a concise summary, a list of key points with memory aids (like mnemonics), and relevant study tags. IMPORTANT: Return ONLY a valid JSON object matching this schema: { "summary": "string", "keyPoints": ["string"], "tags": ["string"] }. Do not include markdown formatting or backticks.',
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
    console.error("Analysis Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
