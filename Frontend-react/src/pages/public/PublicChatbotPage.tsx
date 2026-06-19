
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Send,
  Bot,
  User,
  Sparkles,
  BrainCircuit,
  AlertCircle,
  ShieldCheck,
  LogIn,
} from 'lucide-react';
import { api, endpoints } from '@/services/api';
import { sanitizeAIRoute, requiresAuth } from '@/utils/chatRoutes';

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

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Bonjour ! Je suis l'assistant santé Hopitel. Posez-moi vos questions médicales générales — je suis disponible sans connexion. Pour un suivi personnalisé (RDV, résultats), connectez-vous.",
  timestamp: new Date(),
  actions: [
    { label: 'Trouver un hôpital', type: 'route', payload: '/hospitals' },
    { label: "Numéros d'urgence", type: 'route', payload: '/emergency' },
    { label: 'Conseils santé', type: 'route', payload: '/tips' },
  ],
};

export default function PublicChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Auto-scroll vers le bas à chaque nouveau message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() },
    ]);
    setIsTyping(true);
    setInput('');

    try {
      const data = await api.post<any>(endpoints.chatbot, { message: text });

      // Extraire le contenu texte
      let content =
        data?.message?.content ??
        data?.content ??
        "Désolé, je n'ai pas pu traiter votre demande.";

      // Nettoyer les artefacts JSON résiduels dans le texte
      content = content.replace(/```json[\s\S]*?```/g, '').trim();
      content = content.replace(/```[\s\S]*?```/g, '').trim();

      // Les actions viennent du backend (déjà extraites par extract_actions_and_clean_message)
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
          id: Date.now().toString(),
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
          content: 'Une erreur est survenue. Veuillez réessayer.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAction = (action: Action) => {
    const raw = action.payload || action.url;
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

    const target = sanitizeAIRoute(raw);

    // Routes nécessitant une connexion → rediriger vers login
    if (requiresAuth(target)) {
      navigate('/login', {
        state: { message: 'Connectez-vous pour accéder à cette fonctionnalité.' },
      });
      return;
    }

    navigate(target);
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col" style={{ height: 'calc(100dvh - 8rem)' }}>

      {/* ── En-tête ── */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">Assistant Hopitel</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs text-slate-500 font-medium">Disponible sans connexion</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-sm font-semibold text-primary border-2 border-primary/20 px-3 py-2 rounded-xl hover:bg-primary/5 transition-all"
        >
          <LogIn className="w-4 h-4" />
          <span className="hidden sm:inline">Se connecter</span>
        </button>
      </div>

      {/* ── Bannière info ── */}
      <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-2xl mb-4 shrink-0">
        <ShieldCheck className="w-5 h-5 shrink-0 text-blue-500" />
        <p className="text-xs font-medium text-blue-700">
          Informations générales uniquement. Pour un suivi personnalisé,{' '}
          <button onClick={() => navigate('/register')} className="underline font-bold">
            créez un compte
          </button>
          .
        </p>
      </div>

      {/* ── Messages ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4 min-h-0"
        style={{ scrollbarWidth: 'thin' }}
      >
        {messages.map(msg => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-2.5 max-w-[88%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1 ${
                  msg.role === 'assistant'
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div className="flex flex-col gap-2">
                {/* Bulle */}
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span className={`text-[10px] mt-1.5 block opacity-40 ${msg.role === 'user' ? 'text-right' : ''}`}>
                    {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Boutons d'action */}
                {msg.role === 'assistant' && msg.actions && msg.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {msg.actions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAction(action)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/20 bg-white px-3 py-2 rounded-xl hover:bg-primary/5 active:scale-95 transition-all shadow-sm"
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
        ))}

        {/* Indicateur de frappe */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2.5 bg-white border border-slate-200 px-4 py-3 rounded-2xl shadow-sm ml-10">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>
              <span className="text-xs text-slate-400 font-medium">L'assistant réfléchit...</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Zone de saisie ── */}
      <div className="pt-3 border-t border-slate-200 shrink-0">
        <form
          onSubmit={e => { e.preventDefault(); sendMessage(input); }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Posez votre question santé..."
            className="flex-1 h-12 px-4 bg-white border-2 border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:border-primary focus:outline-none transition-all placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-center text-xs text-slate-400 mt-2 flex items-center justify-center gap-1.5">
          <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
          Consultez un médecin pour tout diagnostic.
        </p>
      </div>
    </div>
  );
}
