import { useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import { streamChat, api } from "../api/client";

type Citation = { document_id: number; title: string; confidence: number };
type Message = {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  messageId?: number;
  responseMs?: number;
  feedback?: 1 | -1 | null;
};

function confidenceLabel(score: number): { label: string; color: string } {
  if (score >= 0.75) return { label: "High confidence", color: "text-sage border-sage" };
  if (score >= 0.5) return { label: "Medium confidence", color: "text-amber border-amber" };
  return { label: "Low confidence", color: "text-red-500 border-red-400" };
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function handleSend() {
    if (!input.trim() || sending) return;
    const question = input.trim();
    setInput("");
    setSending(true);
    setMessages((m) => [...m, { role: "user", content: question }, { role: "assistant", content: "" }]);

    await streamChat(
      question,
      sessionId,
      (token) => {
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { ...copy[copy.length - 1], content: copy[copy.length - 1].content + token };
          return copy;
        });
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      },
      (payload) => {
        setSessionId(payload.session_id ?? sessionId);
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = {
            ...copy[copy.length - 1],
            citations: payload.citations,
            messageId: payload.message_id,
            responseMs: payload.response_ms,
            feedback: null,
          };
          return copy;
        });
        setSending(false);
      }
    );
  }

  async function handleFeedback(index: number, rating: 1 | -1) {
    const msg = messages[index];
    if (!msg.messageId) return;
    setMessages((m) => {
      const copy = [...m];
      copy[index] = { ...copy[index], feedback: rating };
      return copy;
    });
    try {
      await api.post("/feedback", { message_id: msg.messageId, rating });
    } catch {
      // non-critical, fail silently
    }
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen">
        <header className="border-b border-ink/10 px-8 py-4">
          <p className="font-display text-xl text-ink">Ask a question</p>
          <p className="text-slate text-sm">Answers are grounded in your organization's uploaded policy documents.</p>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
          {messages.length === 0 && (
            <div className="text-slate text-sm max-w-md">
              Try asking things like <span className="italic">"How many paid leave days do I get?"</span> or{" "}
              <span className="italic">"What's the travel reimbursement policy?"</span>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xl rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user" ? "bg-amber/20 text-ink" : "bg-white border border-ink/10 text-ink"
                }`}
              >
                {m.content || (m.role === "assistant" && <span className="text-slate">Thinking…</span>)}

                {m.citations && m.citations.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-ink/10 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {m.citations.map((c, idx) => {
                        const conf = confidenceLabel(c.confidence);
                        return (
                          <span
                            key={idx}
                            title={`${conf.label} (${Math.round(c.confidence * 100)}%)`}
                            className={`text-[10px] uppercase tracking-widest font-display border px-2 py-1 rounded-sm -rotate-1 ${conf.color}`}
                          >
                            {c.title} · {Math.round(c.confidence * 100)}%
                          </span>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between">
                      {m.responseMs !== undefined && (
                        <span className="text-[10px] text-slate/70">Answered in {(m.responseMs / 1000).toFixed(1)}s</span>
                      )}
                      <div className="flex gap-2 ml-auto">
                        <button
                          onClick={() => handleFeedback(i, 1)}
                          className={`text-xs px-2 py-0.5 rounded border ${m.feedback === 1 ? "bg-sage text-white border-sage" : "border-ink/15 text-slate hover:border-sage"}`}
                        >
                          👍 Helpful
                        </button>
                        <button
                          onClick={() => handleFeedback(i, -1)}
                          className={`text-xs px-2 py-0.5 rounded border ${m.feedback === -1 ? "bg-red-500 text-white border-red-500" : "border-ink/15 text-slate hover:border-red-400"}`}
                        >
                          👎 Not helpful
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-ink/10 px-8 py-4">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about leave, travel, IT, procurement…"
              className="flex-1 border border-ink/15 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
            />
            <button
              onClick={handleSend}
              disabled={sending}
              className="bg-ink text-parchment px-5 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
