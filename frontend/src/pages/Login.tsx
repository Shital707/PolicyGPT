import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../store/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuth((s) => s.setAuth);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const form = new URLSearchParams();
      form.set("username", email);
      form.set("password", password);
      const res = await api.post("/auth/login", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      setAuth(res.data.access_token, res.data.role);
      navigate("/chat");
    } catch {
      setError("Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-parchment px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-display text-3xl text-ink">PolicyGPT</p>
          <p className="text-slate text-sm mt-2">Sign in to ask about company policy</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white border border-ink/10 rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-slate">Work email</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-ink/15 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-slate">Password</label>
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-ink/15 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="w-full bg-ink text-parchment rounded-md py-2 text-sm font-medium hover:bg-ink/90 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
