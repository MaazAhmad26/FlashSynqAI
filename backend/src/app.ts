import express from "express";
import path from "path";
import dotenv from "dotenv";
import compression from "compression";
import rateLimit from "express-rate-limit";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import analyzeRouter from "./modules/analyze";
import chatRouter from "./modules/chat";
import quizRouter from "./modules/quiz";
import healthRouter from "./modules/health";

const app = express();

app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Create a rate limiter for AI endpoints (max 30 requests per 15 minutes)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Mount API routes
app.use("/api/analyze",       aiLimiter, analyzeRouter);
app.use("/api/chat",          aiLimiter, chatRouter);
app.use("/api/generate-quiz", aiLimiter, quizRouter);
app.use("/api/health",        healthRouter);

export { app };
