import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../store/auth";

type Notification = { id: number; message: string; created_at: string };

export default function Sidebar() {
  const { role, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = role === "super_admin" || role === "hr_admin";
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    api.get("/notifications").then((res) => setNotifications(res.data)).catch(() => {});
  }, [isAdmin]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-2 rounded-md text-sm tracking-wide transition-colors ${
      isActive ? "bg-amber text-ink font-semibold" : "text-parchment/80 hover:bg-white/10"
    }`;

  return (
    <aside className="w-56 shrink-0 bg-ink flex flex-col h-screen sticky top-0">
      <div className="px-5 py-6 border-b border-white/10 flex items-start justify-between">
        <div>
          <p className="font-display text-parchment text-lg leading-tight">PolicyGPT</p>
          <p className="text-parchment/50 text-xs tracking-widest uppercase mt-1">Policy Assistant</p>
        </div>
        {isAdmin && (
          <div className="relative">
            <button
              onClick={() => setShowNotifications((s) => !s)}
              className="text-parchment/70 hover:text-parchment text-lg relative"
              title="Notifications"
            >
              🔔
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber text-ink text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {notifications.length > 9 ? "9+" : notifications.length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-8 w-64 bg-white border border-ink/10 rounded-md shadow-lg z-10 max-h-80 overflow-y-auto">
                {notifications.length === 0 && (
                  <p className="text-slate text-xs p-3">No notifications yet.</p>
                )}
                {notifications.map((n) => (
                  <div key={n.id} className="px-3 py-2 border-b border-ink/5 text-xs text-ink">
                    <p>{n.message}</p>
                    <p className="text-slate/60 mt-0.5">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        <NavLink to="/chat" className={linkClass}>Ask a question</NavLink>
        {isAdmin && <NavLink to="/upload" className={linkClass}>Manage policies</NavLink>}
        {isAdmin && <NavLink to="/analytics" className={linkClass}>Analytics</NavLink>}
        {isAdmin && <NavLink to="/audit-logs" className={linkClass}>Audit logs</NavLink>}
      </nav>
      <div className="px-3 pb-5">
        <button
          onClick={() => { logout(); navigate("/login"); }}
          className="w-full text-left px-4 py-2 rounded-md text-sm text-parchment/70 hover:bg-white/10"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
