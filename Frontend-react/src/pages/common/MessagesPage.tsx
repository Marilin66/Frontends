
// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Search, User, MessageSquare, Users, 
  Phone, Info, Clock, Check, 
  CheckCheck, ArrowLeft, Paperclip, Smile, 
  FlaskConical, Stethoscope, ShieldCheck
} from 'lucide-react';
import { api, endpoints } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, Badge, Button, PageLoader } from '@/components/ui';

// ── Types & Helpers ────────────────────────────────────────────────────────

interface Contact {
  id: number;
  nom: string;
  role: string;
  hopital_nom?: string;
  is_admin_contact?: boolean;
}

interface Message {
  id: number;
  expediteur: number;
  destinataire: number;
  contenu: string;
  date_envoi: string;
  lu: boolean;
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
  // Field for UI selection
  other_user?: Contact; 
}

function getRoleIcon(role: string) {
  switch (role) {
    case 'medecin': return <Stethoscope className="w-3.5 h-3.5" />;
    case 'laborantin': return <FlaskConical className="w-3.5 h-3.5" />;
    case 'admin_hopital': return <ShieldCheck className="w-3.5 h-3.5" />;
    default: return <User className="w-3.5 h-3.5" />;
  }
}

function getRoleColor(role: string) {
  switch (role) {
    case 'medecin': return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400';
    case 'laborantin': return 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400';
    case 'admin_hopital': return 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400';
    default: return 'bg-slate-50 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400';
  }
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function MessagesPage() {
  const { user } = useAuth();
  const [view, setView] = useState<'conversations' | 'contacts'>('conversations');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch Logic
  const fetchConversations = async () => {
    try {
      const data: any = await api.get(endpoints.conversations);
      const list = Array.isArray(data) ? data : data.results || [];
      setConversations(list);
    } catch (e) { 
      console.error("fetchConversations error:", e); 
      setConversations([]);
    }
  };

  const fetchContacts = async () => {
    if (!user) return;
    try {
      const role = user.role;
      const rawHopId = user.hopital_id || user.hopital?.id || user.hopital || user.etablissement?.id || user.etablissement || user.id_hopital;
      const hopId = rawHopId ? String(rawHopId) : null;
      
      const safeFetch = async (endpoint: string) => {
        try {
          const data: any = await api.get(endpoint);
          return Array.isArray(data) ? data : data.results || [];
        } catch { return []; }
      };

      let results: Contact[] = [];
      if (role === 'admin_general' || role === 'super_admin') {
        const list = await safeFetch(endpoints.adminHopitaux);
        results = list.map((u: any) => ({ 
          id: u.user_id || u.id, 
          nom: `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || u.username || "Admin Hôpital", 
          role: 'admin_hopital', 
          hopital_nom: u.hopital_nom 
        }));
      } else {
        const [admins, meds, labs] = await Promise.all([
          safeFetch(endpoints.adminHopitaux),
          safeFetch(endpoints.medecins),
          safeFetch(endpoints.laborantins)
        ]);
        
        const filterByHop = (u: any) => {
          if (!hopId) return true;
          const uHopId = String(u.hopital_id || u.hopital?.id || u.hopital || u.etablissement?.id || u.etablissement || u.id_hopital);
          return uHopId === hopId;
        };

        const formattedAdmins = admins.filter(filterByHop).map((u: any) => ({ id: u.user_id || u.id, nom: `Administration: ${u.first_name ?? ''} ${u.last_name ?? ''}`.trim(), role: 'admin_hopital', hopital_nom: u.hopital_nom, is_admin_contact: true }));
        const formattedMeds = meds.filter(filterByHop).filter((u: any) => String(u.id) !== String(user.id)).map((u: any) => ({ id: u.user_id || u.id, nom: `Dr. ${u.first_name ?? ''} ${u.last_name ?? ''}`.trim(), role: 'medecin', hopital_nom: u.hopital_nom }));
        const formattedLabs = labs.filter(filterByHop).filter((u: any) => String(u.id) !== String(user.id)).map((u: any) => ({ id: u.user_id || u.id, nom: `Lab. ${u.first_name ?? ''} ${u.last_name ?? ''}`.trim(), role: 'laborantin', hopital_nom: u.hopital_nom }));

        results = [...formattedAdmins, ...formattedMeds, ...formattedLabs];
      }
      
      if (results.length === 0) {
        results.push({ id: 999, nom: "Support Technique Hopitel", role: "admin_general", hopital_nom: "Assistance" });
      }
      setContacts(results);
    } catch (e) { 
      setContacts([{ id: 999, nom: "Support Technique Hopitel", role: "admin_general" }]);
    }
  };

  const fetchMessages = async (targetId: number, consultationId?: number) => {
    try {
      const url = consultationId 
        ? `${endpoints.messages}?consultation=${consultationId}`
        : `${endpoints.messages}?destinataire=${targetId}`;
        
      const data: any = await api.get(url);
      const list = Array.isArray(data) ? data : data.results || [];
      setMessages(list);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    Promise.all([fetchConversations(), fetchContacts()]).finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (selectedConv) {
      const tid = selectedConv.destinataire_id || selectedConv.other_user?.id;
      const cid = selectedConv.consultation_id;
      if (tid) {
        fetchMessages(tid, cid);
        const interval = setInterval(() => fetchMessages(tid, cid), 5000);
        return () => clearInterval(interval);
      }
    }
  }, [selectedConv]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !selectedConv) return;
    try {
      const content = newMessage;
      const targetUserId = selectedConv.destinataire_id || selectedConv.other_user?.id;
      const consultationId = selectedConv.consultation_id;
      setNewMessage('');
      
      // OPTIMISTIC MESSAGE
      const tempMsg: Message = {
        id: Date.now(),
        expediteur: user?.id || 0,
        destinataire: targetUserId,
        contenu: content,
        date_envoi: new Date().toISOString(),
        lu: false
      };
      setMessages(prev => [...prev, tempMsg]);

      // OPTIMISTIC CONVERSATION in Sidebar
      if (!conversations.some(c => String(c.destinataire_id) === String(targetUserId))) {
         const tempConv: Conversation = {
           destinataire_id: targetUserId,
           titre: selectedConv.titre || selectedConv.other_user?.nom || "Discussion",
           dernier_message: content,
           date_dernier_message: new Date().toISOString(),
           non_lus: 0,
           type: 'interne',
           est_cloture: false
         };
         setConversations(prev => [tempConv, ...prev]);
      }

      await api.post(endpoints.messages, {
        destinataire: targetUserId,
        consultation: consultationId,
        contenu: content,
        type_message: 'texte'
      });

      fetchConversations();
    } catch (e) { console.error(e); }
  };

  const selectContact = (contact: Contact) => {
    const existing = conversations.find(c => String(c.destinataire_id) === String(contact.id));
    if (existing) {
      setSelectedConv(existing);
    } else {
      setSelectedConv({
        destinataire_id: contact.id,
        titre: contact.nom,
        dernier_message: '',
        date_dernier_message: '',
        non_lus: 0,
        type: 'interne',
        est_cloture: false,
        other_user: contact
      });
      setMessages([]);
    }
    setIsMobileListVisible(false);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="h-[calc(100vh-140px)] flex bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative">
      
      {/* Sidebar */}
      <div className={`w-full lg:w-96 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-xl ${!isMobileListVisible ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-6 space-y-4">
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Messages</h1>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-white dark:bg-slate-800 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl">
            <button onClick={() => setView('conversations')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${view === 'conversations' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}>Discussions</button>
            <button onClick={() => setView('contacts')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${view === 'contacts' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}>Contacts</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-6 custom-scrollbar">
          {view === 'conversations' ? (
            <div className="space-y-1">
              {conversations.filter(c => c.titre.toLowerCase().includes(search.toLowerCase())).map((conv, i) => (
                <button 
                  key={i} onClick={() => { setSelectedConv(conv); setIsMobileListVisible(false); }}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${selectedConv?.destinataire_id === conv.destinataire_id ? 'bg-white shadow-lg ring-1 ring-slate-200' : 'hover:bg-white/50'}`}
                >
                  <Avatar name={conv.titre} size="md" />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-bold text-slate-900 truncate">{conv.titre}</p>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{conv.date_dernier_message ? new Date(conv.date_dernier_message).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{conv.dernier_message || 'Nouvelle discussion'}</p>
                  </div>
                  {conv.non_lus > 0 && <div className="w-5 h-5 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center">{conv.non_lus}</div>}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {contacts.filter(c => c.nom.toLowerCase().includes(search.toLowerCase())).map((contact, i) => (
                <button key={i} onClick={() => selectContact(contact)} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/50">
                  <Avatar name={contact.nom} size="md" />
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-900">{contact.nom}</p>
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${getRoleColor(contact.role)}`}>{contact.role}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col bg-white dark:bg-slate-950 relative ${isMobileListVisible ? 'hidden lg:flex' : 'flex'}`}>
        {selectedConv ? (
          <>
            <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800 bg-white/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-4">
                <button onClick={() => setIsMobileListVisible(true)} className="lg:hidden p-2 rounded-xl hover:bg-slate-100"><ArrowLeft className="w-5 h-5" /></button>
                <Avatar name={selectedConv.titre || selectedConv.other_user?.nom} size="md" />
                <div>
                  <h2 className="text-sm font-bold text-slate-900">{selectedConv.titre || selectedConv.other_user?.nom}</h2>
                  <div className="flex items-center gap-2 mt-0.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /><span className="text-[10px] text-slate-400 font-bold uppercase">En ligne</span></div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 custom-scrollbar pb-32 lg:pb-6">
              {messages.filter(m => m.contenu).map((msg, i) => {
                const isMe = msg.expediteur === user?.id;
                const date = new Date(msg.date_envoi);
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`px-4 py-3 rounded-2xl text-sm font-medium ${isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}`}>{msg.contenu}</div>
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-[9px] text-slate-400 font-bold">{!isNaN(date.getTime()) ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                        {isMe && (msg.lu ? <CheckCheck className="w-3 h-3 text-primary" /> : <Check className="w-3 h-3 text-slate-400" />)}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={scrollRef} />
            </div>

            <div className="p-6 border-t border-slate-100 bg-white/80 backdrop-blur-md mb-20 lg:mb-0">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-slate-100 p-2 pl-4 rounded-2xl border border-slate-200">
                <button type="button" className="text-slate-400"><Paperclip className="w-5 h-5" /></button>
                <input 
                  type="text" placeholder="Écrivez votre message..." value={newMessage} onChange={e => setNewMessage(e.target.value)}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium h-10"
                />
                <button type="button" className="text-slate-400"><Smile className="w-5 h-5" /></button>
                <button type="submit" disabled={!newMessage.trim()} className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center disabled:opacity-50"><Send className="w-4 h-4" /></button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/30">
            <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mb-8"><MessageSquare className="w-12 h-12 text-primary" /></div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Centre de Messagerie Hopitel</h3>
            <p className="text-slate-500 max-w-sm font-medium">Sélectionnez une discussion pour commencer à échanger.</p>
            <Button variant="outline" onClick={() => setView('contacts')} className="mt-8 rounded-xl font-bold px-8">Nouveau message</Button>
          </div>
        )}
      </div>
    </div>
  );
}
