import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { LogOut, LayoutDashboard, FileText, MessageSquare, Settings, Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Policies', path: '/policies', icon: FileText },
    { name: 'AI Chat', path: '/chat', icon: MessageSquare },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#030712]">
      {/* Sidebar */}
      <div className="w-72 flex flex-col border-r border-white/5 bg-[#0a0f1e]">
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">PolicyGPT</h1>
            <p className="text-[11px] text-slate-500 font-medium">Enterprise AI Assistant</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 mt-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/20 to-violet-600/10 text-white shadow-inner'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-400 to-violet-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon size={18} className={isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'} />
                <span>{item.name}</span>
                {isActive && <ChevronRight size={14} className="ml-auto text-blue-400/60" />}
              </Link>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="p-3 mx-3 mb-4 rounded-xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
              {user?.email?.[0].toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-semibold text-white truncate">{user?.email || 'User'}</p>
              <p className="text-[11px] text-slate-500 font-medium">{user?.role || 'Role'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-[#030712]">
        <main className="p-8 max-w-[1400px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
