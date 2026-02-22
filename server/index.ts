import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import os from "node:os";

const app = express();
const PORT = 3800;
const AGENTS_DIR = process.env.AGENTS_DIR || path.join(os.homedir(), ".openclaw", "agents");

app.use(cors());

// List agent directories
app.get("/api/agents", (_req, res) => {
  try {
    const entries = fs.readdirSync(AGENTS_DIR, { withFileTypes: true });
    const agents = entries
      .filter((e) => e.isDirectory())
      .map((e) => e.name);
    res.json(agents);
  } catch (err) {
    console.error("Error listing agents:", err);
    res.status(500).json({ error: "Failed to list agents" });
  }
});

// List sessions for an agent
app.get("/api/agents/:agent/sessions", async (req, res) => {
  try {
    const sessionsDir = path.join(AGENTS_DIR, req.params.agent, "sessions");
    if (!fs.existsSync(sessionsDir)) {
      res.json([]);
      return;
    }
    const files = fs.readdirSync(sessionsDir).filter((f) => f.endsWith(".jsonl"));

    const sessions: Array<{
      id: string;
      timestamp: string | null;
      messageCount: number;
      filename: string;
    }> = [];

    for (const file of files) {
      const filePath = path.join(sessionsDir, file);
      let firstTimestamp: string | null = null;
      let messageCount = 0;

      const stream = fs.createReadStream(filePath);
      const rl = readline.createInterface({ input: stream });

      for await (const line of rl) {
        if (!line.trim()) continue;
        try {
          const obj = JSON.parse(line);
          if (!firstTimestamp && obj.timestamp) {
            firstTimestamp = obj.timestamp;
          }
          if (obj.type === "message") {
            messageCount++;
          }
        } catch {
          // skip malformed lines
        }
      }

      sessions.push({
        id: file.replace(".jsonl", ""),
        timestamp: firstTimestamp,
        messageCount,
        filename: file,
      });
    }

    // Sort by timestamp descending (most recent first)
    sessions.sort((a, b) => {
      if (!a.timestamp) return 1;
      if (!b.timestamp) return -1;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    res.json(sessions);
  } catch (err) {
    console.error("Error listing sessions:", err);
    res.status(500).json({ error: "Failed to list sessions" });
  }
});

// Get full parsed session
app.get("/api/agents/:agent/sessions/:id", async (req, res) => {
  try {
    const filePath = path.join(
      AGENTS_DIR,
      req.params.agent,
      "sessions",
      `${req.params.id}.jsonl`
    );

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    const entries: unknown[] = [];
    const stream = fs.createReadStream(filePath);
    const rl = readline.createInterface({ input: stream });

    for await (const line of rl) {
      if (!line.trim()) continue;
      try {
        entries.push(JSON.parse(line));
      } catch {
        // skip malformed lines
      }
    }

    res.json(entries);
  } catch (err) {
    console.error("Error reading session:", err);
    res.status(500).json({ error: "Failed to read session" });
  }
});

// In production, serve the Vite-built frontend
const distPath = path.join(import.meta.dirname, "..", "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("/{*splat}", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`pano server listening on http://localhost:${PORT}`);
});
