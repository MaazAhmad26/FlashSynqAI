var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/backend/index.ts
var index_exports = {};
__export(index_exports, {
  app: () => app
});
module.exports = __toCommonJS(index_exports);
var import_path2 = __toESM(require("path"));
var import_express6 = __toESM(require("express"));

// api/app.ts
var import_express5 = __toESM(require("express"));
var import_path = __toESM(require("path"));
var import_dotenv = __toESM(require("dotenv"));

// api/routes/analyze.ts
var import_express = require("express");
var import_generative_ai = require("@google/generative-ai");
var router = (0, import_express.Router)();
router.post("/", async (req, res) => {
  try {
    const genAI = new import_generative_ai.GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const { fileData, fileType, textContent } = req.body;
    let contentParts = [];
    if (fileData) {
      const buffer = Buffer.from(fileData, "base64");
      if (fileType === "application/pdf") {
        contentParts.push({
          inlineData: {
            mimeType: fileType,
            data: fileData
          }
        });
      } else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        const mammoth = (await import("mammoth")).default;
        const result2 = await mammoth.extractRawText({ buffer });
        contentParts.push({ text: result2.value });
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
              text: 'Analyze this study material. Provide a concise summary, a list of key points with memory aids (like mnemonics), and relevant study tags. IMPORTANT: Return ONLY a valid JSON object matching this schema: { "summary": "string", "keyPoints": ["string"], "tags": ["string"] }. Do not include markdown formatting or backticks.'
            }
          ]
        }
      ]
    });
    const resultText = result.response.text();
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    const cleanedJson = jsonMatch ? jsonMatch[0] : resultText;
    const resultJson = JSON.parse(cleanedJson || "{}");
    res.json(resultJson);
  } catch (error) {
    console.error("Analysis Error:", error);
    res.status(500).json({ error: error.message });
  }
});
var analyze_default = router;

// api/routes/chat.ts
var import_express2 = require("express");
var import_generative_ai2 = require("@google/generative-ai");
var router2 = (0, import_express2.Router)();
router2.post("/", async (req, res) => {
  try {
    const genAI = new import_generative_ai2.GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const { message, history } = req.body;
    const chatHistory = history?.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    })) || [];
    const chatModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: "You are FlashSynq AI, a study buddy. You must ONLY respond to questions and topics related to studies, learning, and education. If the user asks about anything else, politely decline and steer the conversation back to studying."
    });
    const chat = chatModel.startChat({
      history: chatHistory,
      generationConfig: { maxOutputTokens: 500 }
    });
    const result = await chat.sendMessage(message);
    const response = await result.response;
    res.json({ reply: response.text() });
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: error.message });
  }
});
var chat_default = router2;

// api/routes/quiz.ts
var import_express3 = require("express");
var import_generative_ai3 = require("@google/generative-ai");
var router3 = (0, import_express3.Router)();
router3.post("/", async (req, res) => {
  try {
    const genAI = new import_generative_ai3.GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const { content } = req.body;
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: content },
            {
              text: 'Create a quiz based on the provided material. Include 5 varied multiple-choice questions with 4 options each, the correct answer index, and a detailed explanation for each answer. IMPORTANT: Return ONLY a valid JSON object matching this schema: { "title": "string", "questions": [{ "question": "string", "options": ["string"], "correctAnswerIndex": 0, "explanation": "string" }] }. Do not include markdown formatting or backticks.'
            }
          ]
        }
      ]
    });
    const resultText = result.response.text();
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    const cleanedJson = jsonMatch ? jsonMatch[0] : resultText;
    const resultJson = JSON.parse(cleanedJson || "{}");
    res.json(resultJson);
  } catch (error) {
    console.error("Quiz Generation Error:", error);
    res.status(500).json({ error: error.message });
  }
});
var quiz_default = router3;

// api/routes/health.ts
var import_express4 = require("express");
var router4 = (0, import_express4.Router)();
router4.get("/", (req, res) => {
  res.json({
    status: "ok",
    nodeVersion: process.version,
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    vercelEnv: process.env.VERCEL || "local",
    nodeEnv: process.env.NODE_ENV || "development",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
var health_default = router4;

// api/app.ts
import_dotenv.default.config({ path: import_path.default.resolve(process.cwd(), ".env") });
var app = (0, import_express5.default)();
app.use(import_express5.default.json({ limit: "10mb" }));
app.use(import_express5.default.urlencoded({ limit: "10mb", extended: true }));
app.use("/api/analyze", analyze_default);
app.use("/api/chat", chat_default);
app.use("/api/generate-quiz", quiz_default);
app.use("/api/health", health_default);

// src/backend/index.ts
var PORT = Number(process.env.PORT) || 3e3;
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      root: import_path2.default.resolve(process.cwd(), "src/frontend"),
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path2.default.resolve(process.cwd(), "dist");
    app.use(import_express6.default.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(import_path2.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\u{1F680} FlashSynqAI server running on http://localhost:${PORT}`);
  });
}
if (!process.env.FIREBASE_CONFIG && !process.env.VERCEL) {
  startServer();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  app
});
//# sourceMappingURL=server.cjs.map
