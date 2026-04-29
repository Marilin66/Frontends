// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Send, 
  User, 
  ArrowLeft,
  Filter,
  AlertCircle,
  Zap,
  History,
  ChevronLeft,
  Phone,
  Video,
  MoreVertical,
  ShieldCheck,
  CheckCheck,
  Sparkles,
  Paperclip,
  Smile,
  MessageCircle,
  Info,
  Lock,
  Mic,
  FileText,
  Play
} from 'lucide-react';
import { Card, CardContent, Button, Input, Avatar, PageLoader } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { api, endpoints } from '@/services/api';
import { Conversation, Message } from '@/types/models.types';

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation);
    } else {
      setMessages([]);
    }
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const data = await api.get<any>(endpoints.conversations);
      const results = Array.isArray(data) ? data : data.results || [];
      setConversations(results);
    } catch (error) {
      console.error('Erreur conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (conv: Conversation) => {
    try {
      let url = endpoints.messages;
      if (conv.consultation_id) {
        url += `?consultation=${conv.consultation_id}`;
      } else {
        url += `?destinataire=${conv.destinataire_id}`;
      }
      const data = await api.get<any>(url);
      const results = Array.isArray(data) ? data : data.results || [];
      setMessages(results);
    } catch (error) {
      console.error('Erreur messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || isSending) return;

    try {
      setIsSending(true);
      const msg = await api.post<Message>(endpoints.messages, {
        consultation: activeConversation.consultation_id,
        destinataire: activeConversation.destinataire_id,
        contenu: newMessage
      });
      setMessages([...messages, msg]);
      setNewMessage('');
      
      setConversations(prev => prev.map(c => 
        (c.consultation_id === activeConversation.consultation_id && c.destinataire_id === activeConversation.destinataire_id) 
          ? { ...c, dernier_message: msg.contenu, date_dernier_message: msg.created_at } 
          : c
      ));
    } catch (error) {
      console.error('Erreur envoi message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConversation || isSending) return;

    try {
      setIsSending(true);
      const formData = new FormData();
      if (activeConversation.consultation_id) {
        formData.append('consultation', activeConversation.consultation_id.toString());
      }
      formData.append('destinataire', activeConversation.destinataire_id.toString());
      formData.append('type_message', 'fichier');
      formData.append('piece_jointe', file);
      formData.append('contenu', `Fichier : ${file.name}`);

      const msg = await api.post<Message>(endpoints.messages, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessages([...messages, msg]);
    } catch (error) {
      console.error('Erreur upload:', error);
    } finally {
      setIsSending(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const startRecording = async () => {
    if (!activeConversation || isSending) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], 'voice_message.webm', { type: 'audio/webm' });
        await sendVoiceFile(file);
        
        // Arrêter les pistes audio pour libérer le micro
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Erreur accès microphone:', error);
      alert('Impossible d\'accéder au microphone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendVoiceFile = async (file: File) => {
    try {
      setIsSending(true);
      const formData = new FormData();
      if (activeConversation?.consultation_id) {
        formData.append('consultation', activeConversation.consultation_id.toString());
      }
      formData.append('destinataire', activeConversation!.destinataire_id.toString());
      formData.append('type_message', 'vocal');
      formData.append('contenu', '🎙 Message vocal');
      formData.append('audio', file);

      const msg = await api.post<Message>(endpoints.messages, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessages([...messages, msg]);
    } catch (error) {
      console.error('Erreur envoi message vocal:', error);
    } finally {
      setIsSending(false);
    }
  };

  const sidebarVariants = {
    hidden: { x: -30, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  const chatVariants = {
    hidden: { scale: 0.98, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  if (isLoading && conversations.length === 0) return <PageLoader />;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-10rem)] gap-8 animate-fade-in px-2">
      {/* Immersive Conversations Sidebar */}
      <motion.div 
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
        className={`w-full lg:w-[400px] flex flex-col gap-6 ${activeConversation ? 'hidden lg:flex' : 'flex'}`}
      >
        <div className="flex items-center justify-between px-4">
           <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none italic italic">Messages</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Centre de Comm' Sécurisé</p>
           </div>
           <Button variant="ghost" className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-300 hover:text-primary transition-all shadow-glow-sm">
              <Zap className="w-6 h-6" />
           </Button>
        </div>

        <Card className="flex-1 flex flex-col border-none shadow-premium bg-white rounded-[3.5rem] overflow-hidden p-2">
           <div className="p-6 border-b border-slate-50">
              <div className="relative group">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                 <Input 
                   placeholder="Index des contacts..." 
                   className="pl-16 h-14 rounded-[1.5rem] border-none bg-slate-50 font-bold focus:ring-4 focus:ring-primary/5 transition-all"
                 />
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
              {conversations.length > 0 ? (
                <div className="space-y-4">
                  {conversations.map((conv) => {
                    const isSelected = activeConversation?.consultation_id === conv.consultation_id && 
                                     activeConversation?.destinataire_id === conv.destinataire_id;
                    
                    return (
                      <motion.div 
                        key={`${conv.consultation_id}-${conv.destinataire_id}`}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setActiveConversation(conv)}
                        className={`p-6 rounded-[2.5rem] cursor-pointer transition-all flex gap-5 items-center relative group ${
                          isSelected 
                            ? 'bg-slate-900 text-white shadow-2xl' 
                            : 'bg-transparent hover:bg-slate-50 text-slate-900'
                        }`}
                      >
                        <div className="relative">
                           <Avatar name={conv.titre || '?'} size="lg" className="w-16 h-16 ring-4 ring-white shadow-xl" />
                           {conv.est_cloture ? (
                             <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-500 rounded-lg border-4 border-white flex items-center justify-center shadow-lg">
                                <Lock className="w-3 h-3 text-white" />
                             </div>
                           ) : (
                             <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-lg border-4 border-white shadow-glow-sm" />
                           )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-1">
                            <span className="font-black truncate block tracking-tighter text-lg uppercase leading-none">
                              {conv.titre}
                            </span>
                            {conv.date_dernier_message && (
                              <span className={`text-[9px] font-black uppercase tracking-widest ${isSelected ? 'text-white/40' : 'text-slate-300'}`}>
                                 {new Date(conv.date_dernier_message).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                          <p className={`text-sm truncate font-bold leading-tight ${isSelected ? 'text-white/60' : 'text-slate-400'}`}>
                            {typeof conv.dernier_message === 'string' ? conv.dernier_message : conv.dernier_message?.contenu || "Initier la synchronisation..."}
                          </p>
                        </div>
                        {conv.non_lus > 0 && (
                          <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-glow-sm" />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-40">
                  <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
                    <History className="w-10 h-10 text-slate-200" />
                  </div>
                  <h4 className="text-xl font-black text-slate-900 italic">Archive Vide</h4>
                  <p className="text-[10px] font-black uppercase tracking-widest mt-2">Aucune conversation indexée</p>
                </div>
              )}
           </div>
        </Card>
      </motion.div>

      {/* Cinematic Content Hub */}
      <motion.div 
        variants={chatVariants}
        initial="hidden"
        animate="visible"
        className={`flex-1 flex flex-col gap-6 ${!activeConversation ? 'hidden lg:flex' : 'flex'}`}
      >
        {activeConversation ? (
          <>
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-6">
                <Button 
                   variant="ghost" 
                   className="lg:hidden h-12 w-12 rounded-2xl bg-white border border-slate-100 shadow-sm"
                   onClick={() => setActiveConversation(null)}
                >
                   <ChevronLeft className="w-7 h-7" />
                </Button>
                <div className="flex items-center gap-5">
                   <div className="relative">
                      <Avatar name={activeConversation.titre || 'Node'} size="lg" className="w-16 h-16 ring-4 ring-white shadow-xl" />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-lg border-4 border-white animate-pulse shadow-glow-sm" />
                   </div>
                    <div>
                       <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-none uppercase flex items-center gap-2">
                         {activeConversation.titre}
                         {activeConversation.est_cloture && <Lock className="w-5 h-5 text-amber-500" />}
                       </h3>
                       <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-2 flex items-center gap-2 ${
                         activeConversation.est_cloture ? 'text-amber-600' : 'text-emerald-500'
                       }`}>
                          {activeConversation.est_cloture ? (
                            <><Lock className="w-3.5 h-3.5" /> Consultation Clôturée</>
                          ) : (
                            <><ShieldCheck className="w-3.5 h-3.5" /> Canal Sécurisé AES-256</>
                          )}
                       </p>
                    </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <Button variant="ghost" className="h-14 w-14 rounded-2xl bg-white border border-slate-100 text-slate-200 hover:text-slate-900 shadow-sm transition-all"><Phone className="w-6 h-6" /></Button>
                 <Button variant="ghost" className="h-14 w-14 rounded-2xl bg-white border border-slate-100 text-slate-200 hover:text-slate-900 shadow-sm transition-all"><Video className="w-6 h-6" /></Button>
                 <Button variant="ghost" className="h-14 w-14 rounded-2xl bg-white border border-slate-100 text-slate-200 hover:text-rose-500 shadow-sm transition-all"><MoreVertical className="w-6 h-6" /></Button>
              </div>
            </div>

            <Card className="flex-1 flex flex-col border-none shadow-premium bg-white rounded-[4rem] overflow-hidden p-2 relative">
               <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white to-transparent pointer-events-none z-10" />
               {activeConversation.est_cloture && (
                 <div className="flex items-center gap-3 px-12 py-3 bg-amber-50 border-b border-amber-100">
                   <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                   <span className="text-xs font-black text-amber-700 uppercase tracking-wide">
                     Consultation clôturée — lecture seule
                   </span>
                 </div>
               )}
               <div className="flex-1 overflow-y-auto p-12 space-y-8 custom-scrollbar bg-slate-50/20">
                   {messages.length > 0 ? (
                   messages.map((msg, index) => {
                     const isMe = msg.expediteur === user?.id;
                     return (
                       <motion.div 
                         initial={{ opacity: 0, y: 10, scale: 0.95 }}
                         animate={{ opacity: 1, y: 0, scale: 1 }}
                         key={msg.id} 
                         className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                       >
                         <div className={`max-w-[70%] group`}>
                            <div className={`p-8 rounded-[3rem] shadow-xl relative transition-all group-hover:scale-[1.02] ${
                              isMe 
                                ? 'bg-slate-900 text-white rounded-tr-[1rem] shadow-slate-200' 
                                : 'bg-white text-slate-900 rounded-tl-[1rem] border border-slate-50'
                            }`}>
                               {msg.type_message === 'vocal' && msg.audio ? (
                                 <a
                                   href={msg.audio}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className={`flex items-center gap-4 group/audio ${
                                     isMe ? 'text-white' : 'text-slate-900'
                                   }`}
                                 >
                                   <span className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                     isMe ? 'bg-white/20' : 'bg-primary/10'
                                   }`}>
                                     <Play className={`w-5 h-5 ${
                                       isMe ? 'text-white' : 'text-primary'
                                     }`} />
                                   </span>
                                   <div>
                                     <p className="text-sm font-black uppercase tracking-wider">Message vocal</p>
                                     <p className={`text-xs font-bold mt-0.5 ${
                                       isMe ? 'text-white/60' : 'text-slate-400'
                                     }`}>Appuyer pour écouter</p>
                                   </div>
                                 </a>
                               ) : msg.type_message === 'fichier' && msg.piece_jointe ? (
                                 <a
                                   href={msg.piece_jointe}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className={`flex items-center gap-3 ${
                                     isMe ? 'text-white' : 'text-slate-900'
                                   }`}
                                 >
                                   <FileText className="w-5 h-5" />
                                   <span className="text-sm font-bold underline">{msg.contenu || 'Pièce jointe'}</span>
                                 </a>
                               ) : (
                                 <p className="text-lg font-bold leading-relaxed">{msg.contenu}</p>
                               )}
                            </div>
                            <div className={`flex items-center gap-3 mt-4 px-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
                               <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </span>
                               {isMe && (
                                 <span className={`text-[10px] font-black shadow-glow-sm ${msg.lu ? 'text-primary' : 'text-slate-300'}`}>
                                    {msg.lu ? <CheckCheck className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                                 </span>
                               )}
                            </div>
                         </div>
                       </motion.div>
                     );
                   })
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center text-slate-200 p-12 text-center">
                      <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner group">
                         <Sparkles className="w-12 h-12 group-hover:text-primary transition-all duration-500 animate-pulse" />
                      </div>
                      <h4 className="text-2xl font-black text-slate-900 italic italic">Nouveau Segment</h4>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] mt-3">Initialiser le flux de données cliniques</p>
                   </div>
                 )}
                 <div ref={messagesEndRef} />
               </div>

               {/* Elite Input Console — disabled si est_cloture */}
               {activeConversation.est_cloture ? (
                 <div className="p-8 bg-amber-50 border-t border-amber-100">
                   <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-[2rem]">
                     <Lock className="w-5 h-5 text-amber-600 flex-shrink-0" />
                     <p className="text-sm font-bold text-amber-700">
                       Cette consultation est <span className="font-black uppercase">clôturée</span>. Les messages sont désactivés.
                     </p>
                   </div>
                 </div>
               ) : (
                 <div className="p-8 bg-white border-t border-slate-50">
                   <input 
                     type="file" 
                     ref={fileInputRef} 
                     onChange={handleFileUpload} 
                     className="hidden" 
                   />
                   <form onSubmit={handleSendMessage} className="flex gap-4 items-center p-2 bg-slate-50 rounded-[2.5rem] border border-slate-100 has-[:focus]:border-primary transition-all shadow-inner-soft group">
                     <button 
                       type="button" 
                       onClick={() => fileInputRef.current?.click()}
                       className="h-14 w-14 rounded-full text-slate-300 hover:text-primary transition-all flex items-center justify-center"
                     >
                        <Paperclip className="w-6 h-6" />
                     </button>
                     <input 
                       placeholder="Émettez votre message sécurisé..." 
                       value={newMessage}
                       onChange={(e) => setNewMessage(e.target.value)}
                       className="flex-1 bg-transparent border-none text-xl font-bold placeholder:text-slate-300 focus:outline-none h-14"
                     />
                     <button 
                       type="button" 
                       onMouseDown={startRecording}
                       onMouseUp={stopRecording}
                       onMouseLeave={stopRecording}
                       className={`h-14 w-14 rounded-full transition-all sm:flex hidden items-center justify-center ${
                         isRecording ? 'bg-red-100 text-red-500 animate-pulse' : 'text-slate-300 hover:text-rose-500'
                       }`}
                     >
                        <Mic className="w-6 h-6" />
                     </button>
                     <button 
                       type="submit" 
                       disabled={!newMessage.trim() || isSending}
                       className="h-14 px-10 rounded-[1.8rem] bg-slate-900 text-white font-black text-lg shadow-2xl active:scale-95 transition-all flex items-center gap-3 uppercase tracking-tighter disabled:opacity-40 disabled:cursor-not-allowed"
                     >
                       <span className="sm:inline hidden">Transmettre</span> <Send className="w-5 h-5" />
                     </button>
                   </form>
                 </div>
               )}
            </Card>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-20 text-center animate-pulse">
            <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center mb-12 shadow-inner">
               <MessageCircle className="w-16 h-16 text-slate-100" />
            </div>
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter italic italic underline decoration-primary decoration-8 underline-offset-8">Comm_Hub Terminal</h3>
            <p className="max-w-md mx-auto text-slate-400 font-bold text-lg mt-10 leading-relaxed italic italic">
               Veuillez sélectionner une identité réseau dans la barre latérale pour activer le segment de communication bidirectionnel.
            </p>
            <div className="mt-16 flex items-center gap-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
               <Info className="w-4 h-4 text-primary" /> Sécurité des données multi-niveaux activée
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
