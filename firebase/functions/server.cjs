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

// backend/src/server.ts
var server_exports = {};
__export(server_exports, {
  app: () => app
});
module.exports = __toCommonJS(server_exports);
var import_path2 = __toESM(require("path"));
var import_express6 = __toESM(require("express"));

// backend/src/app.ts
var import_express5 = __toESM(require("express"));
var import_path = __toESM(require("path"));
var import_dotenv = __toESM(require("dotenv"));
var import_compression = __toESM(require("compression"));
var import_express_rate_limit = __toESM(require("express-rate-limit"));

// backend/src/modules/analyze.ts
var import_express = require("express");
var import_generative_ai = require("@google/generative-ai");
var router = (0, import_express.Router)();
var genAI;
var getGenAI = () => {
  if (!genAI) {
    genAI = new import_generative_ai.GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  }
  return genAI;
};
var analyzeSchema = {
  type: import_generative_ai.SchemaType.OBJECT,
  properties: {
    summary: {
      type: import_generative_ai.SchemaType.STRING,
      description: "A concise summary of the provided study material."
    },
    keyPoints: {
      type: import_generative_ai.SchemaType.ARRAY,
      items: { type: import_generative_ai.SchemaType.STRING },
      description: "A list of key points extracted from the material with memory aids/mnemonics."
    },
    tags: {
      type: import_generative_ai.SchemaType.ARRAY,
      items: { type: import_generative_ai.SchemaType.STRING },
      description: "Relevant study tags for sorting and categorizing the material."
    }
  },
  required: ["summary", "keyPoints", "tags"]
};
var getModel = () => {
  return getGenAI().getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: analyzeSchema
    }
  });
};
router.post("/", async (req, res) => {
  try {
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
    const model = getModel();
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            ...contentParts,
            {
              text: "Analyze this study material. Provide a concise summary, a list of key points with memory aids (like mnemonics), and relevant study tags."
            }
          ]
        }
      ]
    });
    const resultText = result.response.text();
    const resultJson = JSON.parse(resultText || "{}");
    res.json(resultJson);
  } catch (error) {
    console.error("Analysis Error:", error);
    res.status(500).json({ error: error.message });
  }
});
var analyze_default = router;

// backend/src/modules/chat.ts
var import_express2 = require("express");
var import_generative_ai2 = require("@google/generative-ai");
var router2 = (0, import_express2.Router)();
var chatModel;
var getChatModel = () => {
  if (!chatModel) {
    const genAI3 = new import_generative_ai2.GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    chatModel = genAI3.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: "You are FlashSynq AI, a study buddy. You must ONLY respond to questions and topics related to studies, learning, and education. If the user asks about anything else, politely decline and steer the conversation back to studying."
    });
  }
  return chatModel;
};
router2.post("/", async (req, res) => {
  try {
    const { message, history } = req.body;
    const chatHistory = history?.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    })) || [];
    const chat = getChatModel().startChat({
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

// backend/src/modules/quiz.ts
var import_express3 = require("express");
var import_generative_ai3 = require("@google/generative-ai");
var router3 = (0, import_express3.Router)();
var genAI2;
var getGenAI2 = () => {
  if (!genAI2) {
    genAI2 = new import_generative_ai3.GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  }
  return genAI2;
};
var quizSchema = {
  type: import_generative_ai3.SchemaType.OBJECT,
  properties: {
    title: {
      type: import_generative_ai3.SchemaType.STRING,
      description: "The title or topic of the quiz."
    },
    questions: {
      type: import_generative_ai3.SchemaType.ARRAY,
      items: {
        type: import_generative_ai3.SchemaType.OBJECT,
        properties: {
          question: {
            type: import_generative_ai3.SchemaType.STRING,
            description: "The multiple choice question text."
          },
          options: {
            type: import_generative_ai3.SchemaType.ARRAY,
            items: { type: import_generative_ai3.SchemaType.STRING },
            description: "A list of exactly 4 potential answer options."
          },
          correctAnswerIndex: {
            type: import_generative_ai3.SchemaType.INTEGER,
            description: "The 0-based index of the correct answer within the options array."
          },
          explanation: {
            type: import_generative_ai3.SchemaType.STRING,
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
var getModel2 = () => {
  return getGenAI2().getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: quizSchema
    }
  });
};
router3.post("/", async (req, res) => {
  try {
    const { content } = req.body;
    const model = getModel2();
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: content },
            {
              text: "Create a quiz based on the provided material. Include 5 varied multiple-choice questions with 4 options each, the correct answer index, and a detailed explanation for each answer."
            }
          ]
        }
      ]
    });
    const resultText = result.response.text();
    const resultJson = JSON.parse(resultText || "{}");
    res.json(resultJson);
  } catch (error) {
    console.error("Quiz Generation Error:", error);
    res.status(500).json({ error: error.message });
  }
});
var quiz_default = router3;

// backend/src/modules/health.ts
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

// backend/src/app.ts
import_dotenv.default.config({ path: import_path.default.resolve(process.cwd(), ".env") });
var app = (0, import_express5.default)();
app.use((0, import_compression.default)());
app.use(import_express5.default.json({ limit: "10mb" }));
app.use(import_express5.default.urlencoded({ limit: "10mb", extended: true }));
var aiLimiter = (0, import_express_rate_limit.default)({
  windowMs: 15 * 60 * 1e3,
  max: 30,
  message: { error: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false
});
app.use("/api/analyze", aiLimiter, analyze_default);
app.use("/api/chat", aiLimiter, chat_default);
app.use("/api/generate-quiz", aiLimiter, quiz_default);
app.use("/api/health", health_default);

// backend/src/server.ts
var PORT = Number(process.env.PORT) || 3e3;
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      root: import_path2.default.resolve(process.cwd(), "frontend"),
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
if (!process.env.FIREBASE_CONFIG) {
  startServer();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  app
});
//# sourceMappingURL=server.cjs.map
