import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, UploadCloud, Search, X, Loader2, ArrowDownToLine, MoreVertical, Shield } from 'lucide-react';

export default function PoliciesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: policies, isLoading } = useQuery({
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
      const res = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
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
    if (!selectedFile) {
      setUploadError('Please select a file');
      return;
    }
    if (!uploadTitle.trim()) {
      setUploadError('Please enter a title');
      return;
    }
    uploadMutation.mutate();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            Company Policies
            <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20">
              {policies?.length || 0} Total
            </span>
          </h1>
          <p className="text-slate-400 mt-2">Manage and search through all enterprise policy documents.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search policies..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-[#0a0f1e] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-white placeholder:text-slate-500 text-sm shadow-inner"
            />
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="shrink-0 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
          >
            <UploadCloud size={18} />
            <span className="hidden sm:inline">Upload Policy</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          [1,2,3,4,5,6].map((i) => (
            <div key={i} className="animate-pulse bg-[#0a0f1e] border border-white/5 h-48 rounded-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
            </div>
          ))
        ) : policies?.length === 0 ? (
          <div className="col-span-full py-20 text-center glass-card rounded-2xl border-dashed border-2 border-white/10">
            <FileText size={48} className="mx-auto text-slate-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No policies found</h3>
            <p className="text-slate-400 max-w-md mx-auto mb-6">There are currently no policy documents in the system. Upload a document to get started.</p>
            <button
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl font-medium transition-all"
            >
              <UploadCloud size={18} />
              Upload First Policy
            </button>
          </div>
        ) : (
          <AnimatePresence>
            {policies
              ?.filter((p: any) => p.title.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((policy: any, i: number) => (
                <motion.div 
                  key={policy.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative overflow-hidden rounded-2xl bg-[#0a0f1e] border border-white/5 hover:border-white/10 p-6 transition-all hover:shadow-2xl hover:shadow-blue-500/10 cursor-pointer"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 transition-colors backdrop-blur-sm">
                      <MoreVertical size={16} />
                    </button>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <FileText size={24} className="text-blue-400" />
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 text-slate-300 text-[10px] font-bold uppercase tracking-wider mb-2">
                        <Shield size={12} className="text-emerald-400" />
                        Active
                      </span>
                      <h3 className="text-lg font-bold text-white line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
                        {policy.title}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white">
                        A
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        Added {new Date(policy.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <button className="text-slate-400 hover:text-white transition-colors" title="Download Policy">
                      <ArrowDownToLine size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowUpload(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card rounded-2xl p-8 w-full max-w-lg shadow-2xl relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Background Glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex justify-between items-center mb-8 relative">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <UploadCloud size={24} className="text-blue-400" />
                  </div>
                  Upload Policy
                </h2>
                <button onClick={() => setShowUpload(false)} className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10">
                  <X size={20} />
                </button>
              </div>

              {uploadError && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium flex items-start gap-3">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  {uploadError}
                </div>
              )}

              <form onSubmit={handleUpload} className="space-y-6 relative">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Document Title</label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g., Q3 Employee Remote Work Policy"
                    className="w-full px-4 py-3.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Document File</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-300 ${
                      selectedFile 
                        ? 'border-emerald-500/50 bg-emerald-500/5' 
                        : 'border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 bg-black/20'
                    }`}
                  >
                    {selectedFile ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <FileText className="text-emerald-400" size={24} />
                        </div>
                        <div>
                          <p className="text-emerald-400 font-medium">{selectedFile.name}</p>
                          <p className="text-xs text-emerald-500/70 mt-1">Ready to upload</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                          <UploadCloud className="text-slate-400" size={24} />
                        </div>
                        <div>
                          <p className="text-slate-300 font-medium mb-1">Click to browse files</p>
                          <p className="text-xs text-slate-500">Supports PDF, DOCX, TXT up to 10MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={uploadMutation.isPending || !selectedFile || !uploadTitle}
                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center gap-2 group"
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Processing Document...
                      </>
                    ) : (
                      <>
                        <UploadCloud size={20} className="group-hover:-translate-y-0.5 transition-transform" />
                        Secure Upload
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
