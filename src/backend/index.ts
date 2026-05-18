import path from "path";
import express from "express";
import { app } from "./app";

const PORT = Number(process.env.PORT) || 3000;

// Serve frontend
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      root: path.resolve(process.cwd(), "src/frontend"),
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 FlashSynqAI server running on http://localhost:${PORT}`);
  });
}

if (!process.env.FIREBASE_CONFIG) {
  startServer();
}

export { app };
