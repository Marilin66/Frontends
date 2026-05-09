
// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import {
  Search, Send, ArrowLeft, Phone, Video, MoreVertical,
  CheckCheck, Check, Paperclip, Mic, MicOff, Play,
  FileText, MessageCircle, Lock, Users
} from 'lucide-react';
import { PageLoader } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { api, endpoints } from '@/services/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(d: string) {
  if (!d) return '';
  return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function formatConvDate(d: string) {
  if (!d) return '';
  const date = new Date(d);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return formatTime(d);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

function initials(name: string) {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name[0]?.toUpperCase() ?? '?';
}

function roleLabel(role: string) {
  const map: Record<string, string> = {
    medecin: 'Médecin', laborantin: 'Laborantin',
    admin_hopital: 'Admin Hôpital', admin_general: 'Admin Général', super_admin: 'Admin Général',
  };
  return map[role] ?? role;
}

function roleColor(role: string) {
  const map: Record<string, string> = {
    medecin: '#0EA5E9', laborantin: '#14B8A6',
    admin_hopital: '#F97316', admin_general: '#8B5CF6', super_admin: '#8B5CF6',
  };
  return map[role] ?? '#2563EB';
}

// ── Chargement des contacts selon le rôle ────────────────────────────────────

async function fetchContactsByRole(user: any): Promise<any[]> {
  const role = user?.role;
  if (!role) return [];

  const get = async (url: string, params?: Record<string, any>) => {
    const data: any = await api.get(url, params);
    return Array.isArray(data) ? data : data.results ?? [];
  };

  // Admin général / super_admin → tous les admins hôpitaux
  if (role === 'admin_general' || role === 'super_admin') {
    const list = await get(endpoints.adminHopitaux);
    return list.map((u: any) => ({
      id: u.id,
      nom: `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim(),
      role: 'admin_hopital',
      hopital_nom: u.hopital_nom,
    }));
  }

  // Admin hôpital → médecins + laborantins de son hôpital
  if (role === 'admin_hopital') {
    const hopId = user.hopital;
    if (!hopId) return [];
    const [meds, labs] = await Promise.all([
      get(endpoints.medecins, { hopital: hopId }),
      get(endpoints.laborantins, { hopital: hopId }),
    ]);
    return [
      ...meds.map((u: any) => ({
        id: u.id,
        nom: `Dr. ${u.first_name ?? ''} ${u.last_name ?? ''}`.trim(),
        role: 'medecin',
        hopital_nom: u.hopital_nom,
      })),
      ...labs.map((u: any) => ({
        id: u.id,
        nom: `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim(),
        role: 'laborantin',
        hopital_nom: u.hopital_nom,
      })),
    ];
  }

  // Médecin / Laborantin → admin de son hôpital
  if (role === 'medecin' || role === 'laborantin') {
    const hopId = user.hopital;
    if (!hopId) return [];
    const list = await get(endpoints.adminHopitaux);
    return list
      .filter((u: any) => u.hopital === hopId || String(u.hopital) === String(hopId))
      .map((u: any) => ({
        id: u.id,
        nom: `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim(),
        role: 'admin_hopital',
        hopital_nom: u.hopital_nom,
      }));
  }

  return [];
}

// ── Composant principal ───────────────────────────────────────────────────────

export default function MessagesPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'discussions' | 'contacts'>('discussions');
  const [conversations, setConversations] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    fetchConversations();
    if (user) fetchContactsByRole(user).then(setContacts).catch(console.error);
  }, [user]);

  useEffect(() => {
    if (active) fetchMessages(active);
    else setMessages([]);
  }, [active]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const data: any = await api.get(endpoints.conversations);
      setConversations(Array.isArray(data) ? data : data.results ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchMessages = async (conv: any) => {
    try {
      let url = endpoints.messages;
      if (conv.consultation_id) url += `?consultation=${conv.consultation_id}`;
      else url += `?destinataire=${conv.destinataire_id ?? conv.id}`;
      const data: any = await api.get(url);
      setMessages(Array.isArray(data) ? data : data.results ?? []);
    } catch (e) { console.error(e); }
  };

  const openContact = (contact: any) => {
    // Ouvre un chat direct avec ce contact
    setActive({ destinataire_id: contact.id, titre: contact.nom, type: 'direct' });
    setTab('discussions');
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !active || sending) return;
    setSending(true);
    try {
      const msg: any = await api.post(endpoints.messages, {
        consultation: active.consultation_id,
        destinataire: active.destinataire_id ?? active.id,
        contenu: text.trim(),
      });
      setMessages(prev => [...prev, msg]);
      setText('');
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !active || sending) return;
    setSending(true);
    try {
      const fd = new FormData();
      if (active.consultation_id) fd.append('consultation', active.consultation_id.toString());
      fd.append('destinataire', (active.destinataire_id ?? active.id).toString());
      fd.append('type_message', 'fichier');
      fd.append('piece_jointe', file);
      fd.append('contenu', `📎 ${file.name}`);
      const msg: any = await api.post(endpoints.messages, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessages(prev => [...prev, msg]);
    } catch (e) { console.error(e); }
    finally { setSending(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const startRecording = async () => {
    if (!active || sending) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], 'voice.webm', { type: 'audio/webm' });
        const fd = new FormData();
        if (active.consultation_id) fd.append('consultation', active.consultation_id.toString());
        fd.append('destinataire', (active.destinataire_id ?? active.id).toString());
        fd.append('type_message', 'vocal');
        fd.append('contenu', '🎙 Message vocal');
        fd.append('audio', file);
        try {
          const msg: any = await api.post(endpoints.messages, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
          setMessages(prev => [...prev, msg]);
        } catch (e) { console.error(e); }
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      setRecording(true);
    } catch { 
      // Microphone non disponible — on ignore silencieusement (pas d'alert natif)
      console.warn('Impossible d\'accéder au microphone.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const isClosed = active?.est_cloture ?? false;

  const filteredConvs = conversations.filter(c =>
    (c.titre ?? '').toLowerCase().includes(search.toLowerCase())
  );
  const filteredContacts = contacts.filter(c =>
    c.nom.toLowerCase().includes(search.toLowerCase()) ||
    (c.hopital_nom ?? '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading && conversations.length === 0 && contacts.length === 0) return <PageLoader />;

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] sm:h-[calc(100dvh-4rem)] -mx-3 -my-4 sm:-mx-6 sm:-my-6 lg:-mx-10 lg:-my-8 overflow-hidden bg-white rounded-none sm:rounded-2xl border-0 sm:border border-slate-200 shadow-none sm:shadow-card">

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <div className={`w-full lg:w-80 xl:w-96 flex flex-col border-r border-slate-100 bg-white ${active ? 'hidden lg:flex' : 'flex'}`}>

        {/* Header */}
        <div className="px-4 pt-4 pb-2 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-3">Messages</h2>
          {/* Barre de recherche */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>
          {/* Onglets */}
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            {(['discussions', 'contacts'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition ${tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t === 'discussions' ? 'Discussions' : 'Contacts'}
                {t === 'discussions' && conversations.filter(c => c.non_lus > 0).length > 0 && (
                  <span className="ml-1.5 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {conversations.filter(c => c.non_lus > 0).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Liste */}
        <div className="flex-1 overflow-y-auto">
          {tab === 'discussions' ? (
            filteredConvs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-7 h-7 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium text-sm">Aucune discussion</p>
                <p className="text-slate-400 text-xs mt-1">Allez dans Contacts pour démarrer</p>
              </div>
            ) : (
              filteredConvs.map((conv, i) => {
                const isActive = active?.consultation_id === conv.consultation_id && active?.destinataire_id === conv.destinataire_id;
                const lastMsg = typeof conv.dernier_message === 'string' ? conv.dernier_message : conv.dernier_message?.contenu ?? '';
                return (
                  <button
                    key={i}
                    onClick={() => setActive(conv)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition text-left ${isActive ? 'bg-primary/5 border-r-2 border-primary' : ''}`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                        {initials(conv.titre ?? '?')}
                      </div>
                      {!conv.est_cloture && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm truncate ${conv.non_lus > 0 ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>{conv.titre}</span>
                        <span className={`text-xs shrink-0 ml-2 ${conv.non_lus > 0 ? 'text-primary font-semibold' : 'text-slate-400'}`}>{formatConvDate(conv.date_dernier_message)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className={`text-xs truncate ${conv.non_lus > 0 ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
                          {conv.est_cloture && <Lock className="inline w-3 h-3 mr-1 text-orange-400" />}
                          {lastMsg || 'Démarrer la conversation'}
                        </p>
                        {conv.non_lus > 0 && (
                          <span className="ml-2 shrink-0 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {conv.non_lus}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )
          ) : (
            filteredContacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-7 h-7 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium text-sm">Aucun contact</p>
                <p className="text-slate-400 text-xs mt-1">Aucun contact disponible pour votre rôle</p>
              </div>
            ) : (
              filteredContacts.map((contact, i) => {
                const color = roleColor(contact.role);
                return (
                  <button
                    key={i}
                    onClick={() => openContact(contact)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition text-left"
                  >
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                      style={{ backgroundColor: color + '20', color }}
                    >
                      {initials(contact.nom)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{contact.nom}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className="text-xs font-semibold px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: color + '15', color }}
                        >
                          {roleLabel(contact.role)}
                        </span>
                        {contact.hopital_nom && (
                          <span className="text-xs text-slate-400 truncate">{contact.hopital_nom}</span>
                        )}
                      </div>
                    </div>
                    <MessageCircle className="w-4 h-4 shrink-0" style={{ color }} />
                  </button>
                );
              })
            )
          )}
        </div>
      </div>

      {/* ── Zone de chat ──────────────────────────────────────────────────── */}
      <div className={`flex-1 flex flex-col ${!active ? 'hidden lg:flex' : 'flex'}`}>
        {active ? (
          <>
            {/* Header chat — vert WhatsApp */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#075E54] text-white">
              <button onClick={() => setActive(null)} className="lg:hidden w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm shrink-0">
                {initials(active.titre ?? '?')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{active.titre}</p>
                <p className={`text-xs ${isClosed ? 'text-orange-200' : 'text-green-200'}`}>
                  {isClosed ? '🔒 Consultation clôturée' : '● En ligne'}
                </p>
              </div>
              <button className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition"><Phone className="w-4 h-4" /></button>
              <button className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition"><Video className="w-4 h-4" /></button>
              <button className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition"><MoreVertical className="w-4 h-4" /></button>
            </div>

            {/* Bandeau clôture */}
            {isClosed && (
              <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-center gap-2 text-amber-700 text-xs">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                Cette consultation est terminée. L'envoi de messages est désactivé.
              </div>
            )}

            {/* Messages — fond WhatsApp */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 bg-[#ECE5DD]">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
                    <MessageCircle className="w-7 h-7 text-slate-300" />
                  </div>
                  <p className="text-slate-500 text-sm font-medium">{isClosed ? 'Consultation terminée' : 'Aucun message'}</p>
                  {!isClosed && <p className="text-slate-400 text-xs mt-1">Envoyez le premier message</p>}
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.expediteur === user?.id;
                  // Séparateur de date
                  const showDate = i === 0 || new Date(messages[i-1].date_envoi ?? messages[i-1].created_at).toDateString() !== new Date(msg.date_envoi ?? msg.created_at).toDateString();
                  const dateStr = msg.date_envoi ?? msg.created_at ?? '';
                  return (
                    <div key={msg.id ?? i}>
                      {showDate && (
                        <div className="flex justify-center my-2">
                          <span className="bg-[#D9FDD3]/90 text-slate-600 text-xs px-3 py-1 rounded-full">
                            {(() => {
                              const d = new Date(dateStr);
                              const now = new Date();
                              if (d.toDateString() === now.toDateString()) return "Aujourd'hui";
                              const y = new Date(now); y.setDate(now.getDate() - 1);
                              if (d.toDateString() === y.toDateString()) return 'Hier';
                              return d.toLocaleDateString('fr-FR');
                            })()}
                          </span>
                        </div>
                      )}
                      <div className={`flex items-end gap-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {!isMe && (
                          <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-primary text-[10px] font-bold shrink-0 mb-1">
                            {(msg.expediteur_nom ?? '?')[0]?.toUpperCase()}
                          </div>
                        )}
                        <div
                          className={`max-w-[70%] px-3 py-2 rounded-2xl shadow-sm ${isMe ? 'bg-[#DCF8C6] rounded-br-sm' : 'bg-white rounded-bl-sm'}`}
                        >
                          {!isMe && msg.expediteur_nom && (
                            <p className="text-xs font-semibold text-primary mb-1">{msg.expediteur_nom}</p>
                          )}
                          {msg.type_message === 'vocal' ? (
                            <a href={msg.audio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                                <Play className="w-3.5 h-3.5 text-primary" />
                              </div>
                              <span className="text-sm text-slate-700">Message vocal</span>
                            </a>
                          ) : msg.type_message === 'fichier' ? (
                            <a href={msg.piece_jointe} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                              <span className="text-sm text-slate-700 underline truncate">{msg.contenu || 'Fichier'}</span>
                            </a>
                          ) : (
                            <p className="text-sm text-slate-900 leading-relaxed">{msg.contenu}</p>
                          )}
                          <div className={`flex items-center gap-1 mt-0.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-[10px] text-slate-400">{formatTime(dateStr)}</span>
                            {isMe && (msg.lu
                              ? <CheckCheck className="w-3.5 h-3.5 text-[#34B7F1]" />
                              : <Check className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {isClosed ? (
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2 text-slate-500 text-sm">
                <Lock className="w-4 h-4 shrink-0" />
                Les messages sont désactivés — consultation clôturée
              </div>
            ) : (
              <div className="px-3 py-3 bg-[#ECE5DD] border-t border-slate-200">
                <input type="file" ref={fileInputRef} onChange={handleFile} className="hidden" />
                <form onSubmit={handleSend} className="flex items-end gap-2">
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="w-9 h-9 rounded-full hover:bg-slate-200 flex items-center justify-center transition text-slate-500 shrink-0">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <div className="flex-1 bg-white rounded-2xl px-4 py-2 flex items-center min-h-[40px]">
                    <input
                      type="text"
                      placeholder="Message"
                      value={text}
                      onChange={e => setText(e.target.value)}
                      className="flex-1 bg-transparent text-sm focus:outline-none text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                  {text.trim() ? (
                    <button type="submit" disabled={sending}
                      className="w-10 h-10 rounded-full bg-[#075E54] text-white flex items-center justify-center hover:bg-[#064e46] transition disabled:opacity-50 shrink-0">
                      <Send className="w-4 h-4" />
                    </button>
                  ) : (
                    <button type="button"
                      onMouseDown={startRecording} onMouseUp={stopRecording} onMouseLeave={stopRecording}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition shrink-0 ${recording ? 'bg-red-500 text-white animate-pulse' : 'bg-[#075E54] text-white hover:bg-[#064e46]'}`}>
                      {recording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  )}
                </form>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#F0F2F5]">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
              <MessageCircle className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">Vos messages</h3>
            <p className="text-slate-400 text-sm mt-2 max-w-xs">
              Sélectionnez une discussion ou un contact pour commencer à échanger.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
