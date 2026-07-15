import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { User, Shield, Key, Mail, Fingerprint, Calendar, Bell, Smartphone } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-slate-400 mt-2">Manage your account settings, security preferences, and roles.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Profile & Quick Info */}
        <div className="space-y-8 lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-[#0a0f1e] border border-white/5 p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
            
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 p-[2px] mb-4 shadow-xl shadow-blue-500/20">
                <div className="w-full h-full bg-[#0a0f1e] rounded-[14px] flex items-center justify-center">
                  <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-violet-400">
                    {user?.email?.[0].toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              <h2 className="text-lg font-bold text-white">{user?.email?.split('@')[0] || 'User'}</h2>
              <div className="flex items-center justify-center gap-1.5 mt-1.5">
                <Shield size={14} className="text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">{user?.role || 'Role'}</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <Mail size={16} className="text-slate-400" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-slate-500 text-xs">Email Address</p>
                  <p className="text-white font-medium truncate">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <Calendar size={16} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Joined Date</p>
                  <p className="text-white font-medium">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Detailed Settings */}
        <div className="space-y-6 lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-[#0a0f1e] border border-white/5 overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02]">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Fingerprint size={18} className="text-blue-400" /> 
                System Identity
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">User ID (UUID)</label>
                <div className="flex items-center gap-3">
                  <code className="flex-1 px-4 py-2.5 bg-black/20 border border-white/5 rounded-xl text-slate-300 text-sm font-mono tracking-tight">
                    {user?.id || 'N/A'}
                  </code>
                  <button className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-sm font-medium transition-colors">
                    Copy
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">Unique identifier for API access and system audit logs.</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-[#0a0f1e] border border-white/5 overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02]">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Key size={18} className="text-blue-400" /> 
                Security & Authentication
              </h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
                <div>
                  <h3 className="text-white font-medium mb-1">Account Password</h3>
                  <p className="text-sm text-slate-500">Update your password or enable Two-Factor Authentication.</p>
                </div>
                <button className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-blue-500/20">
                  Update Password
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
                <div>
                  <h3 className="text-white font-medium mb-1 flex items-center gap-2">
                    <Smartphone size={16} className="text-slate-400" />
                    Two-Factor Authentication
                  </h3>
                  <p className="text-sm text-slate-500">Add an extra layer of security to your account.</p>
                </div>
                <button className="shrink-0 bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors border border-white/10">
                  Enable 2FA
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl bg-[#0a0f1e] border border-white/5 overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02]">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Bell size={18} className="text-blue-400" /> 
                Notifications
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {[
                { title: 'Policy Updates', desc: 'Get notified when new policies are uploaded or updated.', active: true },
                { title: 'Security Alerts', desc: 'Important notifications about your account security.', active: true },
                { title: 'Weekly Digest', desc: 'Summary of the most asked questions and activity.', active: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                  <div>
                    <h3 className="text-sm font-medium text-white mb-0.5">{item.title}</h3>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  <button className={`w-11 h-6 rounded-full transition-colors relative ${item.active ? 'bg-blue-600' : 'bg-slate-700'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${item.active ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
