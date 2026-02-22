const API_BASE = "";

export interface SessionSummary {
  id: string;
  timestamp: string | null;
  messageCount: number;
  filename: string;
}

export async function fetchAgents(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/api/agents`);
  return res.json();
}

export async function fetchSessions(agent: string): Promise<SessionSummary[]> {
  const res = await fetch(`${API_BASE}/api/agents/${agent}/sessions`);
  return res.json();
}

export async function fetchSession(agent: string, id: string): Promise<unknown[]> {
  const res = await fetch(`${API_BASE}/api/agents/${agent}/sessions/${id}`);
  return res.json();
}
