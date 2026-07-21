import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { api } from "../api/client";

type LogEntry = { id: number; user_id: number | null; action: string; detail: string; created_at: string };

export default function AuditLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    api.get("/audit-logs").then((res) => setLogs(res.data)).catch(() => {});
  }, []);

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 h-screen overflow-y-auto px-8 py-8">
        <p className="font-display text-xl text-ink mb-1">Audit logs</p>
        <p className="text-slate text-sm mb-6">A record of logins, uploads, and deletions across the system.</p>

        <div className="bg-white border border-ink/10 rounded-xl overflow-hidden max-w-3xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-widest text-slate border-b border-ink/10">
                <th className="px-4 py-2">Action</th>
                <th className="px-4 py-2">Detail</th>
                <th className="px-4 py-2">User ID</th>
                <th className="px-4 py-2">When</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b border-ink/5">
                  <td className="px-4 py-2 text-ink">{l.action}</td>
                  <td className="px-4 py-2 text-slate">{l.detail}</td>
                  <td className="px-4 py-2 text-slate">{l.user_id ?? "—"}</td>
                  <td className="px-4 py-2 text-slate text-xs">{new Date(l.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-4 text-slate text-sm">No activity recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
