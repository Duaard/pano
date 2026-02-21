import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAgents, fetchSessions, type SessionSummary } from "../lib/api";

export default function SessionList() {
  const [agents, setAgents] = useState<string[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents().then((a) => {
      setAgents(a);
      if (a.length > 0) setSelectedAgent(a[0]);
    });
  }, []);

  useEffect(() => {
    if (!selectedAgent) return;
    setLoading(true);
    fetchSessions(selectedAgent).then((s) => {
      setSessions(s);
      setLoading(false);
    });
  }, [selectedAgent]);

  function formatTimestamp(ts: string | null): string {
    if (!ts) return "Unknown";
    const d = new Date(ts);
    return d.toLocaleString();
  }

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      {/* Sidebar */}
      <aside className="w-56 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold tracking-tight">pano</h1>
          <p className="text-xs text-gray-500 mt-1">session log viewer</p>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {agents.map((agent) => (
            <button
              key={agent}
              onClick={() => setSelectedAgent(agent)}
              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                selectedAgent === agent
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-900 hover:text-gray-200"
              }`}
            >
              {agent}
            </button>
          ))}
        </nav>
      </aside>

      {/* Session list */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-300">
            {selectedAgent ? `${selectedAgent} sessions` : "Select an agent"}
          </h2>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : sessions.length === 0 ? (
            <p className="text-gray-500">No sessions found.</p>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <Link
                  key={session.id}
                  to={`/session/${selectedAgent}/${session.id}`}
                  className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-mono text-gray-300 truncate max-w-md">
                        {session.id}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimestamp(session.timestamp)}
                      </p>
                    </div>
                    <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400">
                      {session.messageCount} msgs
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
