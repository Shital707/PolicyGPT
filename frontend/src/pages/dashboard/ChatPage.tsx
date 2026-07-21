import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, ShieldAlert, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  confidence?: number;
  source_document_id?: string;
  section_title?: string;
  page_number?: number;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    const createSession = async () => {
      try {
        const res = await api.post('/chat/sessions?title=New+Chat');
        setSessionId(res.data.id);
        setMessages([{
          id: 'welcome',
          role: 'ai',
          content: 'Hello! I am PolicyGPT, your enterprise business policy assistant. How can I help you navigate your corporate policies today?'
        }]);
      } catch (e) {
        console.error("Failed to create chat session", e);
      }
    };
    createSession();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !sessionId || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.post(`/chat/sessions/${sessionId}/message`, {
        question: userMessage.content
      });
      setMessages(prev => [...prev, res.data]);
    } catch (e) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'ai',
        content: 'I encountered an error connecting to the policy service. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-5xl mx-auto rounded-2xl glass-card overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-5 border-b border-white/5 bg-white/5 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20 z-10 relative">
              <Bot size={24} className="text-white" />
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-violet-600 rounded-xl blur opacity-30 animate-pulse"></div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              PolicyGPT Assistant
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold tracking-wider uppercase border border-blue-500/20">Beta</span>
            </h2>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <Sparkles size={12} className="text-violet-400" /> Powered by Gemini 2.5 Flash
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth relative">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end max-w-[85%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                
                {/* Avatar */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-blue-500/20' 
                    : 'bg-[#1e293b] border border-white/10 text-violet-400'
                }`}>
                  {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>

                {/* Message Bubble */}
                <div className={`group relative p-5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm shadow-lg shadow-blue-500/20'
                    : 'bg-[#1e293b] border border-white/5 text-slate-200 rounded-bl-sm shadow-xl'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  
                  {/* Source Citations */}
                  {msg.role === 'ai' && msg.source_document_id && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center gap-3 text-xs"
                    >
                      {msg.confidence !== undefined && (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" title="AI Confidence Score">
                          <ShieldAlert size={14} />
                          <span className="font-medium">{(msg.confidence * 100).toFixed(0)}% Match</span>
                        </div>
                      )}
                      {msg.section_title && (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 text-slate-300 border border-white/5">
                          <AlertCircle size={14} className="text-slate-400" />
                          <span>{msg.section_title}</span>
                        </div>
                      )}
                      {msg.page_number && (
                        <span className="text-slate-500 font-medium">Page {msg.page_number}</span>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading Indicator */}
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-end max-w-[85%] gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1e293b] border border-white/10 text-violet-400 flex items-center justify-center shrink-0">
                <Bot size={18} />
              </div>
              <div className="bg-[#1e293b] border border-white/5 p-5 rounded-2xl rounded-bl-sm">
                <div className="flex gap-2 items-center h-5">
                  <motion.div className="w-2 h-2 bg-blue-400 rounded-full" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                  <motion.div className="w-2 h-2 bg-violet-400 rounded-full" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} />
                  <motion.div className="w-2 h-2 bg-purple-400 rounded-full" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="p-5 border-t border-white/5 bg-white/5 backdrop-blur-md">
        <form onSubmit={handleSend} className="relative max-w-4xl mx-auto flex items-end gap-3">
          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e as unknown as React.FormEvent);
                }
              }}
              placeholder="Ask about company policies, leave rules, or security guidelines..."
              className="w-full pl-5 pr-14 py-4 bg-[#0a0f1e]/80 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all text-white placeholder:text-slate-500 resize-none overflow-hidden text-sm"
              rows={1}
              style={{ minHeight: '56px', maxHeight: '120px' }}
              disabled={isLoading}
            />
            <div className="absolute right-3 bottom-3 text-[10px] text-slate-500 pointer-events-none font-medium">
              Press Enter ↵
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="h-14 w-14 flex items-center justify-center shrink-0 bg-gradient-to-br from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-1" />}
          </button>
        </form>
      </div>
    </div>
  );
}
