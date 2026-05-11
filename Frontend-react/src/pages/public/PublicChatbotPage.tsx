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
  AlertCircle,
  ShieldCheck,
  Building2,
  Phone,
  LogIn,
} from 'lucide-react';
import { Button } from '@/components/ui';
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

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Bonjour ! Je suis l'assistant santé Hopitel. Posez-moi vos questions médicales générales — je suis disponible sans connexion. Pour un suivi personnalisé (RDV, résultats), connectez-vous.",
  timestamp: new Date(),
  actions: [
    { label: 'Trouver un hôpital', type: 'route', payload: '/hospitals' },
    { label: 'Numéros d\'urgence', type: 'route', payload: '/emergency' },
    { label: 'Conseils santé', type: 'route', payload: '/tips' },
  ],
};

export default function PublicChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    setInput('');

    try {
      const response = await api.post<any>(endpoints.chatbot, { message: text });
      const data = response;

      let content =
        data?.message?.content ?? data?.content ?? 'Désolé, je n\'ai pas pu traiter votre demande.';

      // Nettoyage des blocs JSON techniques
      const jsonRegex = /({[\s\S]*?"buttons"[\s\S]*?}|\[[\s\S]*?\])/g;
      const jsonMatches = content.match(jsonRegex);
      let actions: Action[] = data?.actions ?? [];

      if (jsonMatches) {
        const lastJson = jsonMatches[jsonMatches.length - 1];
        try {
          const parsed = JSON.parse(lastJson);
          const raw = Array.isArray(parsed)
            ? parsed
            : parsed.buttons || parsed.actions || [];
          if (raw.length > 0) {
            content = content.replace(lastJson, '').trim();
            actions = raw;
          }
        } catch (_) {}
      }
      content = content.replace(/```json|```/g, '').trim();

      setMessages((prev) => [
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
      setMessages((prev) => [
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

  // Sanitise les URLs générées par l'IA — l'IA peut générer des noms au lieu d'IDs
  const sanitizeActionTarget = (target: string): string => {
    // Routes valides connues (préfixes)
    const validPrefixes = [
      '/patient/', '/medecin/', '/admin', '/laborantin/', '/super-admin/',
      '/hospitals', '/emergency', '/tips', '/login', '/register',
      '/chatbot', '/track-results', '/hopital/',
    ];

    // Si c'est une URL externe
    if (target.startsWith('http')) return target;

    // Normaliser : supprimer les slashes en double
    target = target.replace(/\/+/g, '/');

    // Vérifier si c'est une route valide avec un ID numérique quand nécessaire
    // Ex: /hopital/123 → valide, /hopital/nom-hopital → invalide
    const hopitalWithId = /^\/hopital\/\d+/.test(target);
    const patientHopitalWithId = /^\/patient\/hopital\/\d+/.test(target);
    const patientMedecinWithId = /^\/patient\/medecin\/\d+/.test(target);

    if (hopitalWithId || patientHopitalWithId || patientMedecinWithId) return target;

    // Vérifier si c'est une route valide (sans paramètre dynamique)
    const isValid = validPrefixes.some(p => target.startsWith(p));

    // Routes avec paramètres dynamiques non numériques → invalides
    if (target.startsWith('/hopital/') && !hopitalWithId) return '/hospitals';
    if (target.startsWith('/patient/hopital/') && !patientHopitalWithId) return '/hospitals';
    if (target.startsWith('/patient/medecin/') && !patientMedecinWithId) return '/patient/search';

    if (isValid) return target;

    // L'IA a généré une URL avec un nom d'hôpital → rediriger vers la liste
    if (target.startsWith('/hopitaux/') || target.includes('hopital') || target.includes('hôpital')) {
      return '/hospitals';
    }
    // L'IA a généré une URL de médecin avec un nom → rediriger vers la recherche
    if (target.startsWith('/medecins/') || target.includes('medecin') || target.includes('médecin')) {
      return '/hospitals';
    }
    // Alias courants générés par l'IA
    if (target === '/nearby' || target === '/map') return '/hospitals';
    if (target === '/appointments' || target === '/rendez-vous' || target === '/rdv') return '/login';
    if (target === '/results' || target === '/resultats') return '/track-results';

    // Route inconnue → page d'accueil
    return '/hospitals';
  };

  const handleAction = (action: Action) => {
    const raw = action.payload || action.url;
    if (!raw) return;

    if (action.type === 'message') {
      sendMessage(raw);
      return;
    }

    // URL externe
    if (raw.startsWith('http')) {
      window.open(raw, '_blank');
      return;
    }

    const target = sanitizeActionTarget(raw);

    // Routes nécessitant une connexion
    const requiresAuth = target.startsWith('/patient/') ||
      target.startsWith('/medecin/') ||
      target.startsWith('/admin') ||
      target.startsWith('/laborantin/') ||
      target.startsWith('/super-admin/');

    if (requiresAuth) {
      navigate('/login', { state: { message: 'Connectez-vous pour accéder à cette fonctionnalité.' } });
    } else {
      navigate(target);
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Assistant Hopitel</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs text-slate-500 font-medium">Disponible sans connexion</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-sm font-semibold text-primary border-2 border-primary/20 px-4 py-2 rounded-xl hover:bg-primary/5 transition-all"
        >
          <LogIn className="w-4 h-4" />
          Se connecter
        </button>
      </div>

      {/* Bannière info */}
      <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl mb-4 text-sm text-blue-700">
        <ShieldCheck className="w-5 h-5 flex-shrink-0 text-blue-500" />
        <p className="font-medium">
          Cet assistant fournit des informations générales. Pour un suivi médical personnalisé,{' '}
          <button onClick={() => navigate('/register')} className="underline font-bold">
            créez un compte
          </button>
          .
        </p>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 pr-2 pb-4"
        style={{ scrollbarWidth: 'thin' }}
      >
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex gap-3 max-w-[85%] ${
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'assistant'
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <Bot className="w-5 h-5" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>

              <div className="flex flex-col gap-3">
                {/* Bulle */}
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span
                    className={`text-[10px] mt-2 block opacity-50 ${
                      msg.role === 'user' ? 'text-right' : ''
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Actions */}
                {msg.actions && msg.actions.length > 0 && msg.role === 'assistant' && (
                  <div className="flex flex-wrap gap-2">
                    {msg.actions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAction(action)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/20 bg-white px-3 py-2 rounded-xl hover:bg-primary/5 transition-all shadow-sm"
                      >
                        <Sparkles className="w-3 h-3" />
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
            <div className="flex items-center gap-3 bg-white border border-slate-200 px-5 py-3 rounded-2xl shadow-sm">
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

      {/* Input */}
      <div className="pt-4 border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez votre question santé..."
            className="flex-1 h-14 px-5 bg-white border-2 border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:border-primary focus:outline-none transition-all placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-center text-xs text-slate-400 mt-3 flex items-center justify-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          Informations générales uniquement — consultez un médecin pour tout diagnostic.
        </p>
      </div>
    </div>
  );
}
