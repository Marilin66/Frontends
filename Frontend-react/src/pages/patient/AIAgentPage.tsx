// @ts-nocheck
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
} from 'lucide-react';
import { Button } from '@/components/ui';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── Initialisation ─────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([fetchSessions(), loadLastHistory()]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // ── Sessions ───────────────────────────────────────────────────────────────
  const fetchSessions = async () => {
    try {
      const response = await api.get<any>(endpoints.chatbotSessions);
      const data = Array.isArray(response) ? response : (response?.results ?? response?.data ?? []);
      setSessions(data);
    } catch {
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
        // Pas d'historique → message de bienvenue
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
      // Silencieux
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
      // Créer localement si l'API échoue
      setCurrentSessionId(null);
      setMessages([WELCOME]);
    }
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  // ── Envoi de message ───────────────────────────────────────────────────────
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

      // Mettre à jour la session si nouvelle
      if (data.session_id) {
        if (!currentSessionId) {
          setCurrentSessionId(data.session_id);
          fetchSessions();
        }
      }

      // Extraire le contenu texte
      let content = data?.message?.content ?? data?.content ?? '...';

      // Nettoyer les artefacts JSON résiduels (au cas où le backend n'a pas tout nettoyé)
      content = content.replace(/```json[\s\S]*?```/g, '').trim();
      content = content.replace(/```[\s\S]*?```/g, '').trim();
      content = content.replace(/<function[\s\S]*?<\/function>/g, '').trim();

      // Les actions viennent du backend (déjà extraites)
      let actions: Action[] = data?.actions ?? [];

      // Fallback : si le backend n'a pas extrait les actions mais qu'il y a du JSON brut dans le texte
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
            } catch { /* pas du JSON valide */ }
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

  // ── Gestion des actions IA ─────────────────────────────────────────────────
  const handleAction = (action: Action) => {
    const raw = action.payload ?? action.url ?? (action as any).target;
    if (!raw) return;

    // Action de type message → envoyer comme message utilisateur
    if (action.type === 'message') {
      sendMessage(raw);
      return;
    }

    // URL externe
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      window.open(raw, '_blank', 'noopener,noreferrer');
      return;
    }

    // Sanitiser et naviguer
    const target = sanitizeAIRoute(raw);
    navigate(target);
  };

  // ── Titre de la session courante ───────────────────────────────────────────
  const currentTitle =
    sessions.find(s => s.id === currentSessionId)?.title ?? 'Agent Hopitel';

  // ── Rendu ──────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex overflow-hidden bg-slate-50/50 rounded-3xl border border-slate-200 relative"
      style={{ height: 'calc(100dvh - 8rem)' }}
    >
      {/* Overlay mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 bg-black/30 lg:hidden"
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
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="bg-white border-r border-slate-200 flex flex-col overflow-hidden
                       fixed left-0 top-0 h-full z-30
                       lg:relative lg:z-auto lg:h-auto"
          >
            {/* Bouton nouvelle conversation */}
            <div className="p-4 flex items-center gap-2 border-b border-slate-100">
              <button
                onClick={startNewChat}
                className="flex-1 h-11 rounded-xl flex items-center justify-center gap-2 bg-primary text-white text-xs font-black uppercase italic shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
              >
                <Plus className="w-4 h-4" /> Nouvelle conversation
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Liste des sessions */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 no-scrollbar">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">
                Récents
              </p>
              {sessions.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8 italic">Aucune conversation</p>
              ) : (
                sessions.map(session => (
                  <button
                    key={session.id}
                    onClick={() => selectSession(session.id)}
                    className={`w-full p-3 rounded-xl text-left group transition-all flex items-center gap-3 ${
                      currentSessionId === session.id
                        ? 'bg-primary/5 border-2 border-primary/20'
                        : 'hover:bg-slate-50 border-2 border-transparent'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        currentSessionId === session.id
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-slate-900 truncate uppercase italic">
                        {session.title || 'Conversation'}
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold">
                        {session.created_at || session.date
                          ? new Date(session.created_at || session.date).toLocaleDateString('fr-FR')
                          : "Aujourd'hui"}
                      </p>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        currentSessionId === session.id
                          ? 'text-primary'
                          : 'text-slate-200 group-hover:translate-x-0.5'
                      }`}
                    />
                  </button>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-100 text-[9px] font-black text-slate-400 text-center uppercase tracking-widest italic">
              Hopitel Intelligence
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Zone principale ── */}
      <main className="flex-1 flex flex-col bg-white overflow-hidden min-w-0">

        {/* En-tête */}
        <div className="h-16 border-b border-slate-100 px-4 lg:px-6 flex items-center justify-between bg-white/90 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
              title="Historique"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h2 className="text-sm font-black text-slate-900 uppercase italic flex items-center gap-2 truncate">
                <Bot className="w-4 h-4 text-primary shrink-0" />
                <span className="truncate">{currentTitle}</span>
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] text-slate-400 font-black uppercase italic tracking-widest">
                  Synchronisé
                </span>
              </div>
            </div>
          </div>
          <div className="w-9 h-9 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-slate-300 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 no-scrollbar bg-[radial-gradient(#f1f5f9_1px,transparent_1px)] [background-size:20px_20px] min-h-0"
        >
          {loadingHistory ? (
            <div className="flex justify-center items-center h-full">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
          ) : (
            messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex gap-3 max-w-[88%] lg:max-w-[72%] ${
                    msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-sm ${
                      msg.role === 'assistant'
                        ? 'bg-primary text-white'
                        : 'bg-white border-2 border-slate-100 text-slate-400'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <BrainCircuit className="w-5 h-5" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {/* Bulle */}
                    <div
                      className={`px-5 py-4 rounded-2xl border-2 shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-primary border-primary text-white rounded-tr-none'
                          : 'bg-white border-slate-100 text-slate-900 rounded-tl-none'
                      }`}
                    >
                      <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap">
                        {msg.content}
                      </p>
                      <span
                        className={`text-[9px] font-black mt-3 block uppercase tracking-widest opacity-40 ${
                          msg.role === 'user' ? 'text-right' : ''
                        }`}
                      >
                        {msg.timestamp.toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Boutons d'action */}
                    {msg.role === 'assistant' && msg.actions && msg.actions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {msg.actions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleAction(action)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-primary border-2 border-primary/20 bg-white px-3 py-2 rounded-xl hover:bg-primary/5 active:scale-95 transition-all shadow-sm"
                          >
                            <Sparkles className="w-3 h-3 shrink-0" />
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}

          {/* Indicateur de frappe */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-3 items-center bg-white border-2 border-slate-100 px-5 py-3 rounded-2xl shadow-sm ml-12">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                  Analyse en cours...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Zone de saisie */}
        <div className="p-4 lg:p-6 border-t border-slate-100 bg-white shrink-0">
          <form
            onSubmit={e => { e.preventDefault(); sendMessage(input); }}
            className="flex gap-3 max-w-4xl mx-auto"
          >
            <div className="relative flex-1 group">
              <input
                placeholder="Posez votre question à l'intelligence Hopitel..."
                value={input}
                onChange={e => setInput(e.target.value)}
                className="w-full h-14 pl-5 pr-14 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium text-slate-900 focus:border-primary transition-all outline-none placeholder:text-slate-300"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                <Sparkles className="w-4 h-4 text-primary/40 group-focus-within:text-primary transition-colors" />
              </div>
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <p className="flex items-center justify-center gap-1.5 mt-3 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            Vérifiez toujours les informations médicales critiques.
          </p>
        </div>
      </main>
    </div>
  );
}
