import express from "express";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import analyzeRouter from "./routes/analyze";
import chatRouter from "./routes/chat";
import quizRouter from "./routes/quiz";
import healthRouter from "./routes/health";

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Mount API routes
app.use("/api/analyze",       analyzeRouter);
app.use("/api/chat",          chatRouter);
app.use("/api/generate-quiz", quizRouter);
app.use("/api/health",        healthRouter);

export { app };
