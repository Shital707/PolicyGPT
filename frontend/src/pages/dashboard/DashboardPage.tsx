import { useState, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import {
  Users, FileText, MessageSquare, ThumbsUp, UploadCloud, TrendingUp, ArrowUpRight,
  Sparkles, X, Loader2, Activity
} from 'lucide-react';

const weeklyData = [
  { name: 'Mon', questions: 400, users: 120 },
  { name: 'Tue', questions: 300, users: 98 },
  { name: 'Wed', questions: 550, users: 156 },
  { name: 'Thu', questions: 480, users: 134 },
  { name: 'Fri', questions: 600, users: 178 },
  { name: 'Sat', questions: 200, users: 64 },
  { name: 'Sun', questions: 150, users: 42 },
];

const monthlyData = [
  { name: 'Jan', value: 1200 },
  { name: 'Feb', value: 1900 },
  { name: 'Mar', value: 2400 },
  { name: 'Apr', value: 2100 },
  { name: 'May', value: 3200 },
  { name: 'Jun', value: 2800 },
];

const stats = [
  { title: 'Total Users', value: '2,543', change: '+12.5%', icon: Users, color: 'from-blue-600 to-cyan-500', shadow: 'shadow-blue-500/20' },
  { title: 'Documents', value: '142', change: '+4.1%', icon: FileText, color: 'from-violet-600 to-purple-500', shadow: 'shadow-violet-500/20' },
  { title: 'Questions', value: '12,431', change: '+24.3%', icon: MessageSquare, color: 'from-emerald-600 to-teal-500', shadow: 'shadow-emerald-500/20' },
  { title: 'Satisfaction', value: '4.8/5', change: '+0.2', icon: ThumbsUp, color: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/20' },
];

const customTooltipStyle = {
  backgroundColor: 'rgba(15, 23, 42, 0.95)',
  border: '1px solid rgba(148, 163, 184, 0.1)',
  borderRadius: '12px',
  padding: '12px 16px',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  color: '#e2e8f0',
  fontSize: '13px',
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [showUpload, setShowUpload] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: documents } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const res = await api.get('/documents/');
      return res.data;
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile || !uploadTitle) return;
      const formData = new FormData();
      formData.append('title', uploadTitle);
      formData.append('file', selectedFile);
      return (await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setShowUpload(false);
      setUploadTitle('');
      setSelectedFile(null);
      setUploadError('');
    },
    onError: (err: any) => {
      setUploadError(err.response?.data?.detail || 'Upload failed');
    },
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');
    if (!selectedFile) { setUploadError('Please select a file'); return; }
    if (!uploadTitle.trim()) { setUploadError('Please enter a title'); return; }
    uploadMutation.mutate();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''} <span className="inline-block animate-[wave_2s_ease-in-out_infinite]">👋</span>
          </h1>
          <p className="text-slate-400 mt-1">Here's what's happening with your policies today.</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 group"
        >
          <UploadCloud size={18} />
          Quick Upload
          <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="relative overflow-hidden rounded-2xl bg-[#0a0f1e] border border-white/5 p-5 group hover:border-white/10 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">{stat.title}</p>
                  <p className="text-3xl font-bold text-white mt-2 tracking-tight">{stat.value}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg ${stat.shadow}`}>
                  <Icon size={20} className="text-white" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                <TrendingUp size={14} className="text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400">{stat.change}</span>
                <span className="text-xs text-slate-500">vs last month</span>
              </div>
              {/* Gradient accent */}
              <div className={`absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity blur-xl`} />
            </motion.div>
          );
        })}
      </div>

      {/* Recent Docs & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-1 rounded-2xl bg-[#0a0f1e] border border-white/5 p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Activity size={16} className="text-blue-400" />
              Recent Documents
            </h3>
          </div>
          <div className="space-y-3">
            {documents && documents.length > 0 ? (
              documents.slice(0, 5).map((doc: any) => (
                <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-colors group cursor-pointer">
                  <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <FileText size={16} className="text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{doc.title}</p>
                    <p className="text-xs text-slate-500">{new Date(doc.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText size={32} className="mx-auto text-slate-600 mb-3" />
                <p className="text-sm text-slate-500">No documents yet</p>
                <button
                  onClick={() => setShowUpload(true)}
                  className="mt-3 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Upload your first policy
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 rounded-2xl bg-[#0a0f1e] border border-white/5 p-6"
        >
          <h3 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
            <Sparkles size={16} className="text-blue-400" />
            Questions This Week
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.08)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <RechartsTooltip contentStyle={customTooltipStyle} cursor={{ stroke: 'rgba(59,130,246,0.2)' }} />
              <Area type="monotone" dataKey="questions" stroke="#3b82f6" strokeWidth={2.5} fill="url(#blueGradient)" dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#0a0f1e' }} activeDot={{ r: 6, fill: '#60a5fa' }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="rounded-2xl bg-[#0a0f1e] border border-white/5 p-6"
        >
          <h3 className="text-base font-semibold text-white mb-5">Daily Active Users</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.08)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <RechartsTooltip contentStyle={customTooltipStyle} cursor={{ fill: 'rgba(59,130,246,0.05)' }} />
              <Bar dataKey="users" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl bg-[#0a0f1e] border border-white/5 p-6"
        >
          <h3 className="text-base font-semibold text-white mb-5">Monthly Growth</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.08)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <RechartsTooltip contentStyle={customTooltipStyle} />
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#0a0f1e' }} activeDot={{ r: 6, fill: '#34d399' }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowUpload(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card rounded-2xl p-6 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <UploadCloud size={20} className="text-blue-400" />
                  Upload Policy
                </h2>
                <button onClick={() => setShowUpload(false)} className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
                  <X size={18} />
                </button>
              </div>

              {uploadError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">{uploadError}</div>
              )}

              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g. Employee Leave Policy"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">File (PDF, DOCX, TXT)</label>
                  <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="hidden" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-5 border-2 border-dashed border-white/10 rounded-xl text-center hover:border-blue-500/50 hover:bg-blue-500/5 transition-all"
                  >
                    {selectedFile ? (
                      <p className="text-white font-medium">{selectedFile.name}</p>
                    ) : (
                      <div>
                        <UploadCloud className="mx-auto text-slate-500 mb-2" size={28} />
                        <p className="text-sm text-slate-400">Click to select a file</p>
                      </div>
                    )}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={uploadMutation.isPending}
                  className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-500/25 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {uploadMutation.isPending ? (
                    <><Loader2 size={18} className="animate-spin" /> Uploading...</>
                  ) : (
                    <><UploadCloud size={18} /> Upload Document</>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
