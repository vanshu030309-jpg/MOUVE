import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      name: "MOUVE API",
      version: "1.0.0",
      timestamp: new Date().toISOString()
    });
  });

  // Movie API proxy endpoints (prepared for TMDB / movie providers)
  app.get("/api/movies/config", (req, res) => {
    res.json({
      provider: "MOUVE Meta Engine",
      features: {
        aiRecommendations: true,
        trailers: true,
        watchlists: true,
        realtimeSearch: true
      }
    });
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MOUVE Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start MOUVE server:", err);
});
