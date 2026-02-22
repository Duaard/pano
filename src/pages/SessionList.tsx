import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAgents, fetchSessions, type SessionSummary } from "../lib/api";

export default function SessionList() {
  const [agents, setAgents] = useState<string[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAgents().then((a) => {
      setAgents(a);
      if (a.length > 0) setSelectedAgent(a[0]);
    });
  }, []);

  function refreshSessions() {
    if (!selectedAgent) return;
    setRefreshing(true);
    fetchSessions(selectedAgent).then((s) => {
      setSessions(s);
      setLoading(false);
      setRefreshing(false);
    });
  }

  useEffect(() => {
    if (!selectedAgent) return;
    setLoading(true);
    refreshSessions();
  }, [selectedAgent]);

  function formatTimestamp(ts: string | null): string {
    if (!ts) return "Unknown";
    const d = new Date(ts);
    return d.toLocaleString();
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-56 border-r border-gray-200 flex flex-col bg-white">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold tracking-tight">pano</h1>
          <p className="text-xs text-gray-400 mt-1">session log viewer</p>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {agents.map((agent) => (
            <button
              key={agent}
              onClick={() => setSelectedAgent(agent)}
              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                selectedAgent === agent
                  ? "bg-gray-100 text-gray-900 font-medium"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
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
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-600">
              {selectedAgent ? `${selectedAgent} sessions` : "Select an agent"}
            </h2>
            {selectedAgent && (
              <button
                onClick={refreshSessions}
                disabled={refreshing}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 text-sm"
                title="Refresh sessions"
              >
                <span className={refreshing ? "animate-spin inline-block" : ""}>↻</span>
              </button>
            )}
          </div>
          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : sessions.length === 0 ? (
            <p className="text-gray-400">No sessions found.</p>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <Link
                  key={session.id}
                  to={`/session/${selectedAgent}/${session.id}`}
                  className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-400 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-mono text-gray-700 truncate max-w-md">
                        {session.id}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTimestamp(session.timestamp)}
                      </p>
                    </div>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">
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
