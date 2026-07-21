import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { api } from "../api/client";

type Dashboard = {
  total_documents: number;
  total_users: number;
  questions_asked: number;
  avg_response_ms: number;
  feedback_helpful: number;
  feedback_not_helpful: number;
  accuracy_pct: number | null;
  popular_policies: { document_id: number; title: string; citation_count: number }[];
};

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border border-ink/10 rounded-xl p-5">
      <p className="text-xs uppercase tracking-widest text-slate mb-1">{label}</p>
      <p className="font-display text-3xl text-ink">{value}</p>
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState<Dashboard | null>(null);

  useEffect(() => {
    api.get("/analytics/dashboard").then((res) => setData(res.data)).catch(() => {});
  }, []);

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 h-screen overflow-y-auto px-8 py-8">
        <p className="font-display text-xl text-ink mb-1">Analytics</p>
        <p className="text-slate text-sm mb-6">Usage and accuracy across your organization's PolicyGPT deployment.</p>

        {!data && <p className="text-slate text-sm">Loading…</p>}

        {data && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Documents" value={data.total_documents} />
              <StatCard label="Users" value={data.total_users} />
              <StatCard label="Questions asked" value={data.questions_asked} />
              <StatCard label="Avg response time" value={`${(data.avg_response_ms / 1000).toFixed(1)}s`} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-white border border-ink/10 rounded-xl p-5">
                <p className="text-xs uppercase tracking-widest text-slate mb-2">Answer accuracy (from feedback)</p>
                <p className="font-display text-3xl text-ink mb-2">
                  {data.accuracy_pct !== null ? `${data.accuracy_pct}%` : "No feedback yet"}
                </p>
                <p className="text-xs text-slate">
                  👍 {data.feedback_helpful} helpful &nbsp;·&nbsp; 👎 {data.feedback_not_helpful} not helpful
                </p>
              </div>

              <div className="bg-white border border-ink/10 rounded-xl p-5">
                <p className="text-xs uppercase tracking-widest text-slate mb-3">Most-cited policies</p>
                {data.popular_policies.length === 0 && <p className="text-slate text-sm">Not enough data yet.</p>}
                <div className="space-y-2">
                  {data.popular_policies.map((p) => (
                    <div key={p.document_id} className="flex items-center justify-between text-sm">
                      <span className="text-ink">{p.title}</span>
                      <span className="text-slate text-xs">{p.citation_count} citations</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
