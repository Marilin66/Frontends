
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Send, Search, User, MessageSquare, Check, CheckCheck,
  ArrowLeft, Paperclip, Mic, MicOff, X, FileText,
  Stethoscope, FlaskConical, ShieldCheck, Wifi, WifiOff,
} from 'lucide-react';
import { api, endpoints } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, Button, PageLoader } from '@/components/ui';
import { useMessagerieWebSocket } from '@/hooks/useMessagerieWebSocket';

// ── Types ──────────────────────────────────────────────────────────────────

interface Contact {
  id: number;
  nom: string;
  role: string;
  hopital_nom?: string;
}

interface Message {
  id: number;
  expediteur: number;
  expediteur_nom?: string;
  destinataire: number;
  contenu: string;
  date_envoi: string;
  lu: boolean;
  type_message?: 'texte' | 'vocal' | 'fichier';
  audio?: string;
  piece_jointe?: string;
}

interface Conversation {
  consultation_id?: number;
  destinataire_id: number;
  titre: string;
  dernier_message: string;
  date_dernier_message: string;
  non_lus: number;
  type: string;
  est_cloture: boolean;
  other_user?: Contact;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function getPresence(lastDate?: string) {
  if (!lastDate) return { label: 'Hors ligne', dot: '', show: false };
  const diff = Date.now() - new Date(lastDate).getTime();
  const min = Math.floor(diff / 60_000);
  const h   = Math.floor(diff / 3_600_000);
  const d   = Math.floor(diff / 86_400_000);
  if (min < 10)  return { label: 'Actif maintenant',        dot: 'bg-emerald-500', show: true  };
  if (min < 60)  return { label: `Actif il y a ${min} min`, dot: 'bg-amber-400',   show: true  };
  if (h   < 24)  return { label: `Actif il y a ${h}h`,      dot: 'bg-slate-300',   show: true  };
  if (d   === 1) return { label: 'Actif hier',               dot: 'bg-slate-300',   show: true  };
  return { label: 'Hors ligne', dot: '', show: false };
}

function getRoleIcon(role: string) {
  if (role === 'medecin')       return <Stethoscope  className="w-3 h-3" />;
  if (role === 'laborantin')    return <FlaskConical className="w-3 h-3" />;
  if (role === 'admin_hopital') return <ShieldCheck  className="w-3 h-3" />;
  return <User className="w-3 h-3" />;
}

function getRoleColor(role: string) {
  if (role === 'medecin')       return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400';
  if (role === 'laborantin')    return 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400';
  if (role === 'admin_hopital') return 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400';
  return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
}

function fmtTime(dateStr: string) {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function isSameDay(a: string, b: string) {
  const da = new Date(a), db = new Date(b);
  return da.getFullYear() === db.getFullYear()
    && da.getMonth() === db.getMonth()
    && da.getDate() === db.getDate();
}

function dateSepLabel(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const now  = new Date();
  const yest = new Date(now);
  yest.setDate(now.getDate() - 1);
  if (isSameDay(dateStr, now.toISOString()))  return "Aujourd'hui";
  if (isSameDay(dateStr, yest.toISOString())) return 'Hier';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ── Composant principal ────────────────────────────────────────────────────

export default function MessagesPage() {
  const { user } = useAuth();
  const isPatient = user?.role === 'patient';

  const [view, setView]                     = useState<'conversations' | 'contacts'>('conversations');
  const [conversations, setConversations]   = useState<Conversation[]>([]);
  const [contacts, setContacts]             = useState<Contact[]>([]);
  const [selectedConv, setSelectedConv]     = useState<Conversation | null>(null);
  const [messages, setMessages]             = useState<Message[]>([]);
  const [newMessage, setNewMessage]         = useState('');
  const [loading, setLoading]               = useState(true);
  const [search, setSearch]                 = useState('');
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);
  const [wsConnected, setWsConnected]       = useState(false);
  const [pendingFile, setPendingFile]       = useState<File | null>(null);
  const [isRecording, setIsRecording]       = useState(false);
  const [recSeconds, setRecSeconds]         = useState(0);

  const scrollRef        = useRef<HTMLDivElement>(null);
  const inputRef         = useRef<HTMLInputElement>(null);
  const fileRef          = useRef<HTMLInputElement>(null);
  const mediaRecRef      = useRef<MediaRecorder | null>(null);
  const recTimerRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioChunksRef   = useRef<Blob[]>([]);

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchConversations = useCallback(async () => {
    try {
      const d = await api.get(endpoints.conversations);
      setConversations(Array.isArray(d) ? d : (d as { results?: Conversation[] }).results ?? []);
    } catch { setConversations([]); }
  }, []);

  const fetchContacts = useCallback(async () => {
    if (!user || isPatient) return;
    const safe = async (url: string) => {
      try { const d = await api.get(url); return Array.isArray(d) ? d : (d as { results?: Contact[] }).results ?? []; }
      catch { return []; }
    };
    const rawHop = ((user as any).hopital_id ?? (user as any).hopital?.id ?? (user as any).hopital ?? '') as string;
    const hopId  = rawHop ? String(rawHop) : null;
    const role   = user.role;
    let res: Contact[] = [];

    if (role === 'admin_general') {
      const list = await safe(endpoints.adminHopitaux);
      res = list.map((u) => ({ id: (u as Record<string, unknown>).user_id ?? u.id, nom: `${(u as Record<string, unknown>).first_name ?? ''} ${(u as Record<string, unknown>).last_name ?? ''}`.trim() || 'Admin', role: 'admin_hopital', hopital_nom: (u as Record<string, unknown>).hopital_nom as string }));
    } else {
      const [admins, meds, labs] = await Promise.all([safe(endpoints.adminHopitaux), safe(endpoints.medecins), safe(endpoints.laborantins)]);
      type ApiUser = { id: number; user_id?: number; first_name?: string; last_name?: string; hopital_nom?: string; hopital_id?: number; hopital?: { id?: number } | number | string };
      const byHop = (u: ApiUser) => !hopId || String(u.hopital_id ?? (typeof u.hopital === 'object' ? u.hopital?.id : u.hopital) ?? '') === hopId;
      res = [
        ...admins.filter(byHop).map((u) => ({ id: u.user_id ?? u.id, nom: `Administration: ${u.first_name ?? ''} ${u.last_name ?? ''}`.trim(), role: 'admin_hopital', hopital_nom: u.hopital_nom })),
        ...meds.filter(byHop).filter((u) => String(u.id) !== String(user.id)).map((u) => ({ id: u.user_id ?? u.id, nom: `Dr. ${u.first_name ?? ''} ${u.last_name ?? ''}`.trim(), role: 'medecin', hopital_nom: u.hopital_nom })),
        ...labs.filter(byHop).filter((u) => String(u.id) !== String(user.id)).map((u) => ({ id: u.user_id ?? u.id, nom: `Lab. ${u.first_name ?? ''} ${u.last_name ?? ''}`.trim(), role: 'laborantin', hopital_nom: u.hopital_nom })),
      ];
      if (res.length === 0) res.push({ id: 999, nom: 'Support Technique Hopitel', role: 'admin_general' });
    }
    setContacts(res);
  }, [user, isPatient]);

  const fetchMessages = useCallback(async (targetId: number, consultationId?: number) => {
    try {
      const url = consultationId
        ? `${endpoints.messages}?consultation=${consultationId}`
        : `${endpoints.messages}?destinataire=${targetId}`;
      const d = await api.get(url);
      setMessages(Array.isArray(d) ? d : (d as { results?: Message[] }).results ?? []);
    } catch { /* silencieux */ }
  }, []);

  useEffect(() => {
    Promise.all([fetchConversations(), fetchContacts()]).finally(() => setLoading(false));
  }, [fetchConversations, fetchContacts]);

  // ── WebSocket ─────────────────────────────────────────────────────────────

  useMessagerieWebSocket({
    isDirect: true,
    enabled: !!user && selectedConv != null && !selectedConv.consultation_id,
    onMessage: (wsMsg: any) => {
      setWsConnected(true);
      const me = user?.id;
      if (selectedConv && (wsMsg.expediteur === selectedConv.destinataire_id || wsMsg.destinataire === selectedConv.destinataire_id)) {
        setMessages(prev => prev.some(m => m.id === wsMsg.id) ? prev : [...prev, wsMsg]);
      }
      setConversations(prev => prev.map(c =>
        String(c.destinataire_id) === String(wsMsg.expediteur === me ? wsMsg.destinataire : wsMsg.expediteur)
          ? { ...c, dernier_message: wsMsg.contenu, date_dernier_message: wsMsg.date_envoi, non_lus: wsMsg.expediteur !== me ? c.non_lus + 1 : c.non_lus }
          : c
      ));
    },
  });

  useMessagerieWebSocket({
    consultationId: selectedConv?.consultation_id,
    enabled: !!selectedConv?.consultation_id,
    onMessage: (wsMsg: any) => {
      setWsConnected(true);
      setMessages(prev => prev.some(m => m.id === wsMsg.id) ? prev : [...prev, wsMsg]);
      setConversations(prev => prev.map(c =>
        c.consultation_id === wsMsg.consultation
          ? { ...c, dernier_message: wsMsg.contenu, date_dernier_message: wsMsg.date_envoi }
          : c
      ));
    },
  });

  // Fallback polling si WS down
  useEffect(() => {
    if (!selectedConv || wsConnected) return;
    const tid = selectedConv.destinataire_id;
    const cid = selectedConv.consultation_id;
    if (!tid) return;
    const t = setInterval(() => fetchMessages(tid, cid), 10_000);
    return () => clearInterval(t);
  }, [selectedConv, wsConnected, fetchMessages]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // ── Envoi ─────────────────────────────────────────────────────────────────

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selectedConv) return;
    const targetId = selectedConv.destinataire_id;
    const cid      = selectedConv.consultation_id;

    if (pendingFile) {
      const form = new FormData();
      form.append('destinataire', String(targetId));
      if (cid) form.append('consultation', String(cid));
      form.append('contenu', pendingFile.name);
      form.append('type_message', 'fichier');
      form.append('piece_jointe', pendingFile);
      setPendingFile(null);
      try {
        const res = await api.post<Message>(endpoints.messages, form);
        setMessages(prev => [...prev, res]);
        fetchConversations();
      } catch { /* silencieux */ }
      return;
    }

    if (!newMessage.trim()) return;
    const content = newMessage.trim();
    setNewMessage('');

    const temp: Message = { id: Date.now(), expediteur: user?.id ?? 0, destinataire: targetId, contenu: content, date_envoi: new Date().toISOString(), lu: false };
    setMessages(prev => [...prev, temp]);
    setConversations(prev => {
      const exists = prev.some(c => String(c.destinataire_id) === String(targetId));
      const upd = prev.map(c => String(c.destinataire_id) === String(targetId) ? { ...c, dernier_message: content, date_dernier_message: temp.date_envoi } : c);
      if (!exists) return [{ destinataire_id: targetId, titre: selectedConv.titre ?? 'Discussion', dernier_message: content, date_dernier_message: temp.date_envoi, non_lus: 0, type: 'interne', est_cloture: false }, ...upd];
      return upd;
    });

    try {
      await api.post(endpoints.messages, { destinataire: targetId, ...(cid ? { consultation: cid } : {}), contenu: content, type_message: 'texte' });
      fetchConversations();
    } catch {
      setMessages(prev => prev.filter(m => m.id !== temp.id));
    }
  };

  // ── Enregistrement vocal ──────────────────────────────────────────────────

  const startRecording = async () => {
    if (!navigator.mediaDevices) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        if (!selectedConv) return;
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const form = new FormData();
        form.append('destinataire', String(selectedConv.destinataire_id));
        if (selectedConv.consultation_id) form.append('consultation', String(selectedConv.consultation_id));
        form.append('contenu', '🎙 Message vocal');
        form.append('type_message', 'vocal');
        form.append('audio', blob, `voice_${Date.now()}.webm`);
        try {
          const res = await api.post<Message>(endpoints.messages, form);
          setMessages(prev => [...prev, res]);
          fetchConversations();
        } catch { /* silencieux */ }
      };
      mr.start();
      mediaRecRef.current = mr;
      setIsRecording(true);
      setRecSeconds(0);
      recTimerRef.current = setInterval(() => setRecSeconds(s => s + 1), 1000);
    } catch { /* permission refusée */ }
  };

  const stopRecording = () => {
    mediaRecRef.current?.stop();
    mediaRecRef.current = null;
    if (recTimerRef.current) { clearInterval(recTimerRef.current); recTimerRef.current = null; }
    setIsRecording(false);
    setRecSeconds(0);
  };

  const cancelRecording = () => {
    mediaRecRef.current?.stream?.getTracks().forEach(t => t.stop());
    mediaRecRef.current?.stop();
    mediaRecRef.current = null;
    audioChunksRef.current = [];
    if (recTimerRef.current) { clearInterval(recTimerRef.current); recTimerRef.current = null; }
    setIsRecording(false);
    setRecSeconds(0);
  };

  useEffect(() => () => {
    mediaRecRef.current?.stop();
    if (recTimerRef.current) clearInterval(recTimerRef.current);
  }, []);

  // ── Sélection ─────────────────────────────────────────────────────────────

  const selectConv = (conv: Conversation) => {
    setSelectedConv(conv);
    setWsConnected(false);
    setMessages([]);
    setPendingFile(null);
    setShowMobileSidebar(false);
    if (conv.destinataire_id) fetchMessages(conv.destinataire_id, conv.consultation_id);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const selectContact = (contact: Contact) => {
    const existing = conversations.find(c => String(c.destinataire_id) === String(contact.id));
    selectConv(existing ?? {
      destinataire_id: contact.id,
      titre: contact.nom,
      dernier_message: '',
      date_dernier_message: '',
      non_lus: 0,
      type: 'interne',
      est_cloture: false,
      other_user: contact,
    });
  };

  // ── Rendu ─────────────────────────────────────────────────────────────────

  if (loading) return <PageLoader />;

  const showContactsTab  = !isPatient;
  const filteredConvs    = conversations.filter(c => c.titre.toLowerCase().includes(search.toLowerCase()));
  const filteredContacts = contacts.filter(c => c.nom.toLowerCase().includes(search.toLowerCase()));
  const lastReceived     = messages.filter(m => m.expediteur !== user?.id).slice(-1)[0];
  const presence         = selectedConv ? getPresence(lastReceived?.date_envoi ?? selectedConv.date_dernier_message) : null;

  return (
    <div
      className="flex overflow-hidden bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl"
      style={{ height: 'calc(100vh - 130px)', minHeight: '500px' }}
    >
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <div className={`w-full lg:w-80 xl:w-96 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/50 ${!showMobileSidebar ? 'hidden lg:flex' : 'flex'}`}>

        {/* Header sidebar */}
        <div className="p-4 space-y-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-black text-slate-900 dark:text-white">Messages</h1>
            {selectedConv && (
              <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${wsConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                {wsConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {wsConnected ? 'Live' : 'Sync'}
              </span>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
            />
          </div>

          {/* Onglets : seulement pour les non-patients */}
          {showContactsTab && (
            <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl">
              {(['conversations', 'contacts'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${view === v ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  {v === 'conversations' ? (
                    <span className="flex items-center justify-center gap-1">
                      Discussions
                      {conversations.reduce((s, c) => s + c.non_lus, 0) > 0 && (
                        <span className="w-4 h-4 bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center">
                          {conversations.reduce((s, c) => s + c.non_lus, 0)}
                        </span>
                      )}
                    </span>
                  ) : 'Contacts'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Liste conversations ou contacts */}
        <div className="flex-1 overflow-y-auto py-2 px-2">
          {(view === 'conversations' || !showContactsTab) ? (
            filteredConvs.length === 0 ? (
              <div className="py-16 text-center">
                <MessageSquare className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm text-slate-400">Aucune discussion</p>
              </div>
            ) : (
              filteredConvs.map((conv, i) => {
                const p = getPresence(conv.date_dernier_message);
                return (
                  <button
                    key={i}
                    onClick={() => selectConv(conv)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all mb-0.5 text-left ${selectedConv?.destinataire_id === conv.destinataire_id ? 'bg-white dark:bg-slate-800 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' : 'hover:bg-white/70 dark:hover:bg-slate-800/50'}`}
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar name={conv.titre} size="md" />
                      {p.show && !conv.est_cloture && (
                        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${p.dot} rounded-full border-2 border-white dark:border-slate-900`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p className={`text-sm truncate ${conv.non_lus > 0 ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-200'}`}>
                          {conv.titre}
                        </p>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {conv.date_dernier_message ? fmtTime(conv.date_dernier_message) : ''}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {conv.dernier_message || 'Démarrer la conversation'}
                      </p>
                    </div>
                    {conv.non_lus > 0 && (
                      <span className="w-5 h-5 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center flex-shrink-0">
                        {conv.non_lus}
                      </span>
                    )}
                  </button>
                );
              })
            )
          ) : (
            filteredContacts.length === 0 ? (
              <div className="py-16 text-center">
                <User className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm text-slate-400">Aucun contact</p>
              </div>
            ) : (
              filteredContacts.map((c, i) => (
                <button
                  key={i}
                  onClick={() => selectContact(c)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/70 dark:hover:bg-slate-800/50 transition-all mb-0.5 text-left"
                >
                  <Avatar name={c.nom} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{c.nom}</p>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded mt-0.5 ${getRoleColor(c.role)}`}>
                      {getRoleIcon(c.role)} {c.role.replace('_', ' ')}
                    </span>
                  </div>
                </button>
              ))
            )
          )}
        </div>
      </div>

      {/* ── Zone de chat ─────────────────────────────────────────────────── */}
      <div className={`flex-1 flex flex-col min-w-0 ${showMobileSidebar ? 'hidden lg:flex' : 'flex'}`}>
        {selectedConv ? (
          <>
            {/* Header chat */}
            <div className="flex-shrink-0 h-16 flex items-center gap-3 px-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <button onClick={() => setShowMobileSidebar(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
              <div className="relative flex-shrink-0">
                <Avatar name={selectedConv.titre ?? selectedConv.other_user?.nom ?? '?'} size="sm" />
                {presence?.show && !selectedConv.est_cloture && (
                  <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 ${presence.dot} rounded-full border-2 border-white dark:border-slate-900`} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {selectedConv.titre ?? selectedConv.other_user?.nom}
                </p>
                <p className={`text-[11px] font-medium ${selectedConv.est_cloture ? 'text-amber-500' : presence?.show ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {selectedConv.est_cloture ? '🔒 Consultation clôturée' : (presence?.label ?? 'Hors ligne')}
                </p>
              </div>
            </div>

            {/* Bannière clôture */}
            {selectedConv.est_cloture && (
              <div className="flex-shrink-0 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300 font-medium">
                🔒 Cette consultation est clôturée. Les messages sont désactivés.
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 bg-slate-50/80 dark:bg-slate-900/50">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                  <MessageSquare className="w-10 h-10 opacity-20" />
                  <p className="text-sm">Envoyez le premier message</p>
                </div>
              )}
              {messages.map((msg, i) => {
                const isMe    = msg.expediteur === user?.id;
                const showSep = i === 0 || !isSameDay(messages[i - 1].date_envoi, msg.date_envoi);
                const isImg   = msg.piece_jointe && /\.(jpg|jpeg|png|gif|webp)$/i.test(msg.piece_jointe);
                return (
                  <div key={msg.id}>
                    {showSep && (
                      <div className="flex justify-center my-4">
                        <span className="bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-bold px-3 py-1 rounded-full">
                          {dateSepLabel(msg.date_envoi)}
                        </span>
                      </div>
                    )}
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.12 }}
                      className={`flex mb-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMe && (
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary mr-2 flex-shrink-0 self-end">
                          {(msg.expediteur_nom ?? '?')[0].toUpperCase()}
                        </div>
                      )}
                      <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                        {!isMe && msg.expediteur_nom && (
                          <span className="text-[10px] font-bold text-primary mb-0.5 px-1">{msg.expediteur_nom}</span>
                        )}
                        <div className={`px-3.5 py-2.5 rounded-2xl ${isMe ? 'bg-primary text-white rounded-tr-sm' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-sm border border-slate-100 dark:border-slate-700 shadow-sm'}`}>
                          {msg.type_message === 'vocal' && msg.audio && (
                            <div className="flex items-center gap-2">
                              <span className="text-lg">🎙</span>
                              <div>
                                <p className={`text-sm font-medium ${isMe ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>Message vocal</p>
                                <audio controls src={msg.audio} className="mt-1 h-8 w-40" />
                              </div>
                            </div>
                          )}
                          {msg.type_message === 'fichier' && msg.piece_jointe && isImg && (
                            <a href={msg.piece_jointe} target="_blank" rel="noreferrer">
                              <img src={msg.piece_jointe} alt="pièce jointe" className="max-w-[200px] rounded-lg" />
                            </a>
                          )}
                          {msg.type_message === 'fichier' && msg.piece_jointe && !isImg && (
                            <a
                              href={msg.piece_jointe}
                              target="_blank"
                              rel="noreferrer"
                              className={`flex items-center gap-2 text-sm font-medium ${isMe ? 'text-white' : 'text-primary'} underline underline-offset-2`}
                            >
                              <FileText className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate max-w-[150px]">{msg.contenu || 'Fichier'}</span>
                            </a>
                          )}
                          {(!msg.type_message || msg.type_message === 'texte') && (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.contenu}</p>
                          )}
                        </div>
                        <div className={`flex items-center gap-1 mt-0.5 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                          <span className="text-[9px] text-slate-400 font-medium">{fmtTime(msg.date_envoi)}</span>
                          {isMe && (msg.lu
                            ? <CheckCheck className="w-3 h-3 text-primary" />
                            : <Check className="w-3 h-3 text-slate-300" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>

            {/* Zone de saisie */}
            {selectedConv.est_cloture ? (
              <div className="flex-shrink-0 px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center gap-2 text-slate-400 text-sm">
                🔒 Consultation clôturée — messages désactivés
              </div>
            ) : (
              <div className="flex-shrink-0 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
                {/* Aperçu fichier */}
                {pendingFile && (
                  <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-primary/5 rounded-xl border border-primary/20">
                    <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                    <p className="flex-1 text-xs text-slate-700 dark:text-slate-200 truncate font-medium">{pendingFile.name}</p>
                    <span className="text-[10px] text-slate-400">{(pendingFile.size / 1024).toFixed(0)} Ko</span>
                    <button onClick={() => setPendingFile(null)} className="p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30">
                      <X className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
                    </button>
                  </div>
                )}

                {/* Indicateur enregistrement */}
                {isRecording && (
                  <div className="flex items-center gap-3 mb-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
                    <p className="flex-1 text-sm text-red-600 dark:text-red-400 font-medium">
                      Enregistrement… {Math.floor(recSeconds / 60).toString().padStart(2, '0')}:{(recSeconds % 60).toString().padStart(2, '0')}
                    </p>
                    <button onClick={cancelRecording} className="text-xs text-red-500 hover:text-red-700 font-bold">
                      Annuler
                    </button>
                  </div>
                )}

                <form onSubmit={handleSend} className="flex items-end gap-2">
                  {/* Bouton fichier */}
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                    onChange={e => { const f = e.target.files?.[0]; if (f) setPendingFile(f); e.target.value = ''; }}
                  />

                  {/* Champ texte */}
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-2.5">
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder={isRecording ? '🎙 Enregistrement en cours...' : 'Écrivez votre message...'}
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                      disabled={isRecording}
                      className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 disabled:opacity-50 h-8"
                    />
                  </div>

                  {/* Bouton micro */}
                  {!pendingFile && !newMessage.trim() && (
                    <button
                      type="button"
                      onMouseDown={startRecording}
                      onMouseUp={stopRecording}
                      onTouchStart={startRecording}
                      onTouchEnd={stopRecording}
                      className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${isRecording ? 'bg-red-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400'}`}
                      title="Maintenir pour enregistrer"
                    >
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  )}

                  {/* Bouton envoyer */}
                  {(newMessage.trim() || pendingFile) && (
                    <button
                      type="submit"
                      className="flex-shrink-0 w-9 h-9 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </form>
              </div>
            )}
          </>
        ) : (
          /* État vide */
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-950">
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6">
              <MessageSquare className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
              Centre de messagerie
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs text-sm">
              {isPatient
                ? 'Sélectionnez une consultation pour envoyer un message à votre médecin.'
                : 'Sélectionnez une discussion ou choisissez un contact pour démarrer.'}
            </p>
            {!isPatient && (
              <Button variant="outline" onClick={() => setView('contacts')} className="mt-6 rounded-xl font-bold">
                Nouveau message
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
