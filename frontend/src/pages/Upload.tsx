import { FormEvent, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { api } from "../api/client";

type Doc = { id: number; title: string; category: string; version: number; created_at: string };
type VersionInfo = { current_version: number; previous_versions: { id: number; version_number: number; created_at: string }[] };

export default function Upload() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [panel, setPanel] = useState<{ docId: number; type: "summary" | "diff"; content: string } | null>(null);
  const [panelLoading, setPanelLoading] = useState(false);

  async function loadDocs() {
    const res = await api.get("/documents/");
    setDocs(res.data);
  }

  useEffect(() => { loadDocs(); }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) return;
    setStatus("Uploading and indexing…");
    const form = new FormData();
    form.append("title", title);
    form.append("category", category);
    form.append("file", file);
    try {
      const res = await api.post("/documents/upload", form);
      setStatus(`Indexed successfully as version ${res.data.version}.`);
      setTitle(""); setFile(null);
      loadDocs();
    } catch (err: any) {
      setStatus(err?.response?.data?.detail || "Upload failed.");
    }
  }

  async function handleDelete(id: number) {
    await api.delete(`/documents/${id}`);
    loadDocs();
  }

  async function handleSummarize(docId: number) {
    setPanel({ docId, type: "summary", content: "" });
    setPanelLoading(true);
    try {
      const res = await api.post(`/documents/${docId}/summarize`);
      setPanel({ docId, type: "summary", content: res.data.summary });
    } catch {
      setPanel({ docId, type: "summary", content: "Could not generate a summary." });
    } finally {
      setPanelLoading(false);
    }
  }

  async function handleCompare(docId: number) {
    setPanelLoading(true);
    try {
      const versions: VersionInfo = (await api.get(`/documents/${docId}/versions`)).data;
      if (versions.previous_versions.length === 0) {
        setPanel({ docId, type: "diff", content: "This document has no previous versions to compare against yet." });
        return;
      }
      const latestPrevious = versions.previous_versions[0].version_number;
      const res = await api.post(`/documents/${docId}/compare/${latestPrevious}`);
      setPanel({ docId, type: "diff", content: res.data.diff });
    } catch {
      setPanel({ docId, type: "diff", content: "Could not compare versions." });
    } finally {
      setPanelLoading(false);
    }
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 h-screen overflow-y-auto px-8 py-8">
        <p className="font-display text-xl text-ink mb-1">Manage policies</p>
        <p className="text-slate text-sm mb-6">
          Upload PDF, DOCX, or TXT policy documents. Uploading a file with an existing title creates a new version.
        </p>

        <form onSubmit={handleSubmit} className="bg-white border border-ink/10 rounded-xl p-6 max-w-lg space-y-4 mb-8">
          <div>
            <label className="text-xs uppercase tracking-widest text-slate">Title</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full border border-ink/15 rounded-md px-3 py-2 text-sm" placeholder="Leave & Time Off Policy" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-slate">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full border border-ink/15 rounded-md px-3 py-2 text-sm">
              <option value="general">General</option>
              <option value="hr">HR</option>
              <option value="it">IT</option>
              <option value="finance">Finance</option>
              <option value="travel">Travel</option>
              <option value="procurement">Procurement</option>
              <option value="compliance">Compliance</option>
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-slate">File</label>
            <input required type="file" accept=".pdf,.docx,.txt"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-1 w-full text-sm" />
          </div>
          <button type="submit" className="bg-ink text-parchment px-5 py-2 rounded-md text-sm font-medium">
            Upload & index
          </button>
          {status && <p className="text-sm text-sage">{status}</p>}
        </form>

        <p className="font-display text-lg text-ink mb-3">Indexed documents</p>
        <div className="space-y-2 max-w-2xl">
          {docs.map((d) => (
            <div key={d.id} className="bg-white border border-ink/10 rounded-md px-4 py-3 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ink font-medium">{d.title} <span className="text-slate/60 text-xs">v{d.version}</span></p>
                  <p className="text-slate text-xs uppercase tracking-widest">{d.category}</p>
                </div>
                <div className="flex gap-3 items-center">
                  <button onClick={() => handleSummarize(d.id)} className="text-ink text-xs hover:underline">Summarize</button>
                  <button onClick={() => handleCompare(d.id)} className="text-ink text-xs hover:underline">What's changed?</button>
                  <button onClick={() => handleDelete(d.id)} className="text-red-500 text-xs hover:underline">Remove</button>
                </div>
              </div>
              {panel && panel.docId === d.id && (
                <div className="mt-3 pt-3 border-t border-ink/10 text-xs text-ink whitespace-pre-wrap leading-relaxed">
                  {panelLoading ? "Generating…" : panel.content}
                </div>
              )}
            </div>
          ))}
          {docs.length === 0 && <p className="text-slate text-sm">No documents uploaded yet.</p>}
        </div>
      </main>
    </div>
  );
}
