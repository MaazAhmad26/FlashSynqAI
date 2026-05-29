import { Router, Request, Response } from "express";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    nodeVersion: process.version,
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    vercelEnv: process.env.VERCEL || "local",
    nodeEnv: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString()
  });
});

export default router;
