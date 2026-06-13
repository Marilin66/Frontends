import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Bot,
  User,
  Sparkles,
  BrainCircuit,
  Plus,
  MessageSquare,
  Menu,
  X,
  ChevronRight,
  AlertCircle,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { api, endpoints } from '@/services/api';
import { sanitizeAIRoute } from '@/utils/chatRoutes';

interface Action {
  label: string;
  type: 'route' | 'message' | 'redirect';
  payload?: string;
  url?: string;
  target?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: Action[];
}

interface Session {
  id: number;
  title: string;
  created_at?: string;
  date?: string;
}

const WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  content: "Bonjour ! Je suis l'intelligence Hopitel. Comment puis-je vous aider aujourd'hui ?",
  timestamp: new Date(),
};

export default function AIAgentPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([fetchSessions(), loadLastHistory()]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const fetchSessions = async () => {
    try {
      const response = await api.get<any>(endpoints.chatbotSessions);
      const data = Array.isArray(response) ? response : (response?.results ?? response?.data ?? response?.sessions ?? []);
      setSessions(data);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
      setSessions([]);
    }
  };

  const loadLastHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await api.get<any>(endpoints.chatbotHistory());
      if (response?.messages?.length > 0) {
        setCurrentSessionId(response.session_id ?? null);
        setMessages(
          response.messages.map((m: any) => ({
            ...m,
            timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
          }))
        );
      } else {
        setMessages([WELCOME]);
      }
    } catch {
      setMessages([WELCOME]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const selectSession = async (id: number) => {
    try {
      const response = await api.get<any>(endpoints.chatbotHistory(id));
      setCurrentSessionId(response.session_id ?? id);
      setMessages(
        (response.messages ?? []).map((m: any) => ({
          ...m,
          timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
        }))
      );
      if (window.innerWidth < 1024) setSidebarOpen(false);
    } catch {
      // Ignore
    }
  };

  const startNewChat = async () => {
    try {
      const response = await api.post<any>(endpoints.chatbotSessions);
      setCurrentSessionId(response.id ?? null);
      setMessages([{
        id: 'new-' + Date.now(),
        role: 'assistant',
        content: 'Nouvelle discussion lancée. En quoi puis-je vous aider ?',
        timestamp: new Date(),
      }]);
      fetchSessions();
    } catch {
      setCurrentSessionId(null);
      setMessages([WELCOME]);
    }
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() },
    ]);
    setIsTyping(true);
    setInput('');

    try {
      const data = await api.post<any>(endpoints.chatbot, {
        message: text,
        session_id: currentSessionId,
      });

      if (data.session_id && data.session_id !== currentSessionId) {
        setCurrentSessionId(data.session_id);
        fetchSessions();
      } else if (!currentSessionId && data.session_id) {
         setCurrentSessionId(data.session_id);
         fetchSessions();
      } else {
        // Rafraîchir quand même pour mettre à jour le titre si c'est le premier message
        if (messages.length <= 2) fetchSessions();
      }

      let content = data?.message?.content ?? data?.content ?? '...';
      content = content.replace(/```json[\s\S]*?```/g, '').trim();
      content = content.replace(/```[\s\S]*?```/g, '').trim();
      content = content.replace(/<function[\s\S]*?<\/function>/g, '').trim();

      let actions: Action[] = data?.actions ?? [];

      if (actions.length === 0) {
        const lastBracket = content.lastIndexOf('[');
        if (lastBracket !== -1) {
          const candidate = content.slice(lastBracket);
          const closeIdx = candidate.indexOf(']');
          if (closeIdx !== -1) {
            try {
              const parsed = JSON.parse(candidate.slice(0, closeIdx + 1));
              if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.label) {
                actions = parsed;
                content = content.slice(0, lastBracket).trim();
              }
            } catch { }
          }
        }
      }

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content,
          timestamp: new Date(),
          actions,
        },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          role: 'assistant',
          content: 'Une erreur technique est survenue. Veuillez réessayer.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAction = (action: Action) => {
    const raw = action.payload ?? action.url ?? (action as any).target;
    if (!raw) return;

    if (action.type === 'message') {
      sendMessage(raw);
      return;
    }

    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      window.open(raw, '_blank', 'noopener,noreferrer');
      return;
    }

    const target = sanitizeAIRoute(raw);
    navigate(target);
  };

  const currentTitle = sessions.find(s => s.id === currentSessionId)?.title ?? 'Assistant Hopitel';

  return (
    <div
      className="flex overflow-hidden bg-white rounded-3xl border border-slate-200 relative"
      style={{ height: 'calc(100dvh - 8rem)' }}
    >
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            key="sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="bg-slate-50 border-r border-slate-200 flex flex-col overflow-hidden
                       fixed left-0 top-0 h-full z-30
                       lg:relative lg:z-auto lg:h-auto"
          >
            <div className="p-6 flex items-center gap-2 border-b border-slate-100">
              <Button
                onClick={startNewChat}
                className="flex-1 h-12 rounded-2xl bg-primary text-white font-bold shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 mr-2" /> Nouveau chat
              </Button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-slate-200 text-slate-500 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2 no-scrollbar">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-4">
                Conversations récentes
              </p>
              {sessions.length === 0 ? (
                <div className="text-center py-12">
                   <MessageSquare className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                   <p className="text-xs text-slate-400 font-medium">Aucun historique</p>
                </div>
              ) : (
                sessions.map(session => (
                  <button
                    key={session.id}
                    onClick={() => selectSession(session.id)}
                    className={`w-full p-4 rounded-2xl text-left group transition-all flex items-center gap-3 ${
                      currentSessionId === session.id
                        ? 'bg-white border-primary/20 shadow-sm'
                        : 'hover:bg-white/50 border-transparent'
                    } border-2`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        currentSessionId === session.id
                          ? 'bg-primary text-white shadow-lg shadow-primary/20'
                          : 'bg-white text-slate-400 shadow-sm'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {session.title || 'Discussion'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {session.created_at || session.date
                          ? new Date(session.created_at || session.date).toLocaleDateString('fr-FR')
                          : "Aujourd'hui"}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="p-6 border-t border-slate-100 flex items-center justify-center">
               <Badge className="bg-primary/5 text-primary border-transparent font-bold text-[9px] uppercase tracking-wider">Hopitel Intelligence v2</Badge>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main Chat Area ── */}
      <main className="flex-1 flex flex-col bg-white overflow-hidden min-w-0">
        {/* Header */}
        <div className="h-20 border-b border-slate-100 px-6 flex items-center justify-between bg-white/80 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 truncate">
                <Bot className="w-5 h-5 text-primary shrink-0" />
                <span className="truncate">{currentTitle}</span>
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Connecté
                </span>
              </div>
            </div>
          </div>
          <div className="w-10 h-10 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-slate-300 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Chat Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8 no-scrollbar bg-white min-h-0"
        >
          {loadingHistory ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                 <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Chargement...</p>
            </div>
          ) : (
            messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex gap-4 max-w-[90%] lg:max-w-[75%] ${
                    msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-1 shadow-sm ${
                      msg.role === 'assistant'
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <BrainCircuit className="w-5 h-5" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>

                  <div className={`flex flex-col gap-3 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-6 py-4 rounded-[2rem] shadow-sm text-sm leading-relaxed font-medium ${
                        msg.role === 'user'
                          ? 'bg-primary text-white rounded-tr-none'
                          : 'bg-slate-50 text-slate-900 rounded-tl-none border border-slate-100'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>

                    {msg.role === 'assistant' && msg.actions && msg.actions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {msg.actions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleAction(action)}
                            className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/5 border border-primary/10 px-4 py-2 rounded-xl hover:bg-primary/10 active:scale-95 transition-all"
                          >
                            <Sparkles className="w-3 h-3" />
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest px-2">
                      {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          )}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-4 items-center bg-slate-50 border border-slate-100 px-6 py-4 rounded-[2rem] ml-14">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  L'intelligence analyse votre demande...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 lg:p-10 border-t border-slate-100 bg-white shrink-0">
          <form
            onSubmit={e => { e.preventDefault(); sendMessage(input); }}
            className="flex gap-4 max-w-4xl mx-auto"
          >
            <div className="relative flex-1">
              <input
                placeholder="Posez une question santé..."
                value={input}
                onChange={e => setInput(e.target.value)}
                className="w-full h-16 pl-6 pr-16 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-medium text-slate-900 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <Sparkles className="w-5 h-5 text-slate-300" />
              </div>
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="w-16 h-16 bg-primary text-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-6 h-6" />
            </button>
          </form>
          <div className="flex items-center justify-center gap-2 mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            Assistant IA : Informations indicatives uniquement.
          </div>
        </div>
      </main>
    </div>
  );
}
