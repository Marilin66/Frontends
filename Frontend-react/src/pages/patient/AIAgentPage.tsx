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
  Clock, 
  Menu, 
  X,
  Trash,
  ChevronRight,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { Card, Button, Input, Avatar } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { api, endpoints } from '@/services/api';

interface Action {
  label: string;
  type: 'route' | 'message' | 'redirect';
  payload?: string;
  url?: string;
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
  date: string;
}

export default function AIAgentPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchSessions();
    loadLastHistory();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const fetchSessions = async () => {
    try {
      const response = await api.get<any>(endpoints.chatbotSessions);
      // api.get returns data directly, not {data: ...}
      const data = Array.isArray(response) ? response : (response?.results || response?.data || []);
      setSessions(data);
    } catch (error) {
      console.error('Failed to fetch sessions');
      setSessions([]);
    }
  };

  const loadLastHistory = async () => {
    try {
      const response = await api.get<any>(endpoints.chatbotHistory());
      if (response && response.messages) {
        setCurrentSessionId(response.session_id);
        const history = response.messages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
        setMessages(history);
      } else {
        // First time
        setMessages([{
          id: '1',
          role: 'assistant',
          content: "Bonjour ! Je suis l'intelligence Hopitel. Comment puis-je vous aider ?",
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Failed to load history');
    }
  };

  const selectSession = async (id: number) => {
    try {
      const response = await api.get<any>(endpoints.chatbotHistory(id));
      setCurrentSessionId(response.session_id);
      const history = response.messages.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }));
      setMessages(history);
      if (window.innerWidth < 1024) setSidebarOpen(false);
    } catch (error) {
      console.error('Failed to load session');
    }
  };

  const startNewChat = async () => {
    try {
      const response = await api.post<any>(endpoints.chatbotSessions);
      setCurrentSessionId(response.id);
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: "Nouvelle discussion lancée. En quoi puis-je vous aider ?",
        timestamp: new Date()
      }]);
      fetchSessions();
      if (window.innerWidth < 1024) setSidebarOpen(false);
    } catch (error) {
      console.error('Failed to start new chat');
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    setInput('');

    try {
      const response = await api.post<any>(endpoints.chatbot, { 
        message: text,
        session_id: currentSessionId
      });
      
      const data = response;
      if (data.session_id && !currentSessionId) {
        setCurrentSessionId(data.session_id);
        fetchSessions();
      }

      let content = data?.message?.content ?? data?.content ?? '...';
      
      // Cleanup technical tags
      content = content.replace(/<function[\s\S]*?<\/function>/g, '').trim();
      const jsonRegex = /({[\s\S]*?"buttons"[\s\S]*?}|\[[\s\S]*?\])/g;
      const jsonMatches = content.match(jsonRegex);
      let actions = data?.actions ?? [];

      if (jsonMatches) {
        const lastJson = jsonMatches[jsonMatches.length - 1];
        try {
          const parsed = JSON.parse(lastJson);
          const raw = Array.isArray(parsed) ? parsed : (parsed.buttons || parsed.actions || []);
          if (raw.length > 0) {
            content = content.replace(lastJson, '').trim();
            actions = raw;
          }
        } catch (_) {}
      }
      content = content.replace(/```json|```/g, '').trim();

      const assistantMsg = {
        id: Date.now().toString(),
        role: 'assistant',
        content,
        timestamp: new Date(),
        actions
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: 'err',
        role: 'assistant',
        content: "Erreur technique.",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex overflow-hidden bg-slate-50/50 rounded-3xl border border-slate-200">
      {/* Sidebar Architecture */}
      <motion.aside 
        initial={sidebarOpen ? { width: 320 } : { width: 0 }}
        animate={sidebarOpen ? { width: 320 } : { width: 0 }}
        className="bg-white border-r border-slate-200 flex flex-col relative"
      >
        <div className="p-6">
          <Button 
            onClick={startNewChat}
            className="w-full h-12 rounded-xl flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20 text-white font-bold italic"
          >
            <Plus className="w-5 h-5" /> NOUVELLE BULLE IA
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-2 no-scrollbar">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-4">RECENTS</div>
          {(sessions || []).map(session => (
            <button
              key={session.id}
              onClick={() => selectSession(session.id)}
              className={`w-full p-4 rounded-xl text-left group transition-all flex items-center gap-3 relative ${
                currentSessionId === session.id 
                  ? 'bg-primary/5 border-2 border-primary/20' 
                  : 'hover:bg-slate-50 border-2 border-transparent'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentSessionId === session.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-900 truncate uppercase italic">{session.title || 'Session active'}</p>
                <p className="text-[9px] text-slate-400 font-bold">{session.created_at || session.date ? new Date(session.created_at || session.date).toLocaleDateString() : 'Aujourd\'hui'}</p>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${currentSessionId === session.id ? 'text-primary' : 'text-slate-200 group-hover:translate-x-1'}`} />
            </button>
          ))}
        </div>

        <div className="p-6 border-t border-slate-100 italic text-[10px] font-black text-slate-400 text-center uppercase tracking-tighter">
          Hopitel Core Intelligence v4.6
        </div>
      </motion.aside>

      {/* Main Chat Core */}
      <main className="flex-1 flex flex-col bg-white overflow-hidden relative">
        {/* Chat Header */}
        <div className="h-20 border-b border-slate-100 px-8 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-500"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-sm font-black text-slate-900 tracking-tight uppercase italic flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                {currentSessionId ? sessions.find(s => s.id === currentSessionId)?.title : "Agent Hopitel"}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[9px] text-slate-400 font-black uppercase italic tracking-widest px-1">Synchronisé</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-slate-300">
               <ShieldCheck className="w-5 h-5" />
             </div>
          </div>
        </div>

        {/* Messages Architecture */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 lg:p-12 space-y-10 no-scrollbar bg-[radial-gradient(#f1f5f9_1px,transparent_1px)] [background-size:20px_20px]"
        >
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-5 max-w-[85%] lg:max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                  msg.role === 'assistant' ? 'bg-primary text-white' : 'bg-white border-2 border-slate-100 text-slate-400'
                }`}>
                  {msg.role === 'assistant' ? <BrainCircuit className="w-6 h-6" /> : <User className="w-6 h-6" />}
                </div>
                
                <div className="flex flex-col gap-4">
                  <div className={`relative p-6 rounded-2xl shadow-sm border-2 ${
                    msg.role === 'user' 
                      ? 'bg-primary border-primary text-white rounded-tr-none' 
                      : 'bg-white border-slate-100 text-slate-900 rounded-tl-none'
                  }`}>
                    <p className="text-sm leading-relaxed font-bold italic whitespace-pre-wrap">{msg.content}</p>
                    <span className={`text-[8px] font-black mt-4 block uppercase tracking-widest opacity-40 ${msg.role === 'user' ? 'text-right' : ''}`}>
                      {msg.timestamp.toLocaleTimeString()} SYNC
                    </span>
                  </div>

                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                       {msg.actions.map((action, idx) => (
                         <Button
                           key={idx}
                           variant="outline"
                           size="sm"
                           onClick={() => {
                              const target = action.payload || action.url || action.target;
                              if (!target) return;

                              if (action.type === 'message') {
                                sendMessage(target);
                              } else if (action.type === 'redirect' || target.startsWith('http')) {
                                window.open(target, '_blank');
                              } else {
                                navigate(target);
                              }
                           }}
                           className="h-10 px-4 rounded-xl border-2 border-primary/20 text-[10px] font-black uppercase text-primary hover:bg-primary/5 transition-all"
                         >
                           <Sparkles className="w-3 h-3 mr-2" />
                           {action.label}
                         </Button>
                       ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-4 items-center bg-white border-2 border-slate-100 p-4 px-6 rounded-2xl shadow-xl animate-pulse">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Core Engine Analysing...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Architecture */}
        <div className="p-8 border-t border-slate-100 bg-white">
          <form 
            onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
            className="relative flex gap-4 max-w-5xl mx-auto"
          >
            <div className="relative flex-1 group">
              <input
                placeholder="Posez votre question à l'intelligence Hopitel..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-16 pl-8 pr-16 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-black text-slate-900 focus:border-primary transition-all outline-none italic placeholder:text-slate-300"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                <Sparkles className="w-5 h-5 text-primary/50 group-focus-within:text-primary transition-colors" />
              </div>
            </div>
            <Button 
              type="submit" 
              variant="secondary"
              disabled={!input.trim() || isTyping}
              className="w-16 h-16 !p-0 shadow-2xl shadow-primary/20 rounded-2xl flex items-center justify-center transition-all active:scale-95"
            >
              <div className="flex items-center justify-center w-full h-full">
                <Send className="w-7 h-7 text-white" />
              </div>
            </Button>
          </form>
          <div className="flex items-center justify-center gap-3 mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
            <AlertCircle className="w-4 h-4 text-amber-500 animate-pulse" />
            Vérifiez toujours les informations médicales critiques.
          </div>
        </div>
      </main>
    </div>
  );
}
