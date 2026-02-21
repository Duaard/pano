# pano

OpenClaw session log viewer. A local web app to browse session JSONL files with full tool call details, thinking blocks, and conversation flow.

## Setup

```bash
npm install
```

## Development

Run both the backend API and Vite dev server:

```bash
npm run dev
```

Or run them separately:

```bash
npm run dev:server   # Express API on port 3800
npm run dev:client   # Vite dev server on port 5173
```

## Stack

- **Frontend:** React + TypeScript + Tailwind CSS v4 (Vite)
- **Backend:** Express (tsx) serving session data from `~/.openclaw/agents/`

## API

| Endpoint | Description |
|---|---|
| `GET /api/agents` | List agent directories |
| `GET /api/agents/:agent/sessions` | List sessions with timestamps and message counts |
| `GET /api/agents/:agent/sessions/:id` | Full parsed JSONL session as JSON array |

## Features

- Browse sessions by agent (main, coder, trainer)
- View conversation timeline with user/assistant message bubbles
- Expandable thinking blocks (collapsed by default)
- Expandable tool calls with arguments and results
- Per-message token usage badges (input/output/cache)
- Session cost totals in USD

## Notes

- Local-only, no auth required
- Read-only — no mutations
- Expects JSONL files at `~/.openclaw/agents/{agent}/sessions/*.jsonl`
