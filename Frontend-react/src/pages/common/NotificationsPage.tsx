// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, endpoints } from '@/services/api';
import { 
  Card, 
  Button, 
  Avatar, 
  Badge, 
  PageLoader 
} from '@/components/ui';
import { 
  Bell, 
  Calendar, 
  FileText, 
  MessageCircle, 
  AlertTriangle, 
  CheckCircle, 
  Trash,
  Clock,
  MoreVertical,
  Zap,
  ShieldCheck,
  Layout,
  ChevronRight,
  Info,
  Layers,
  Sparkles,
  Search,
  Settings
} from 'lucide-react';
import { Notification } from '@/types/models.types';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await api.get<any>(endpoints.notifications);
      const results = Array.isArray(data) ? data : data.results || [];
      setNotifications(results);
    } catch (error) {
      console.error('Erreur notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post(endpoints.markAllRead);
      setNotifications(notifications.map(n => ({ ...n, est_lu: true })));
    } catch (error) {
      console.error('Erreur marquage lu:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'rendez_vous': return { icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50', shadow: 'shadow-blue-500/10' };
      case 'resultat': return { icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-50', shadow: 'shadow-emerald-500/10' };
      case 'message': return { icon: MessageCircle, color: 'text-indigo-500', bg: 'bg-indigo-50', shadow: 'shadow-indigo-500/10' };
      case 'alerte': return { icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-50', shadow: 'shadow-rose-500/10' };
      default: return { icon: Bell, color: 'text-slate-500', bg: 'bg-slate-50', shadow: 'shadow-slate-500/10' };
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.98, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0 }
  };

  if (isLoading && notifications.length === 0) return <PageLoader />;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-12 pb-32"
    >
      {/* Supreme Alert Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
             <Badge className="bg-slate-900 text-white border-none py-1.5 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg italic italic italic">Signal Noyau</Badge>
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-none">Flux d'Activité</h1>
          <p className="text-slate-400 font-bold text-lg max-w-xl leading-relaxed">
             Restez synchronisé avec les <span className="text-primary italic">signaux critiques</span> de votre parcours Hopitel.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
           {notifications.some(n => !n.est_lu) && (
             <Button 
               onClick={markAllAsRead}
               className="h-16 px-8 rounded-[1.5rem] bg-white border border-slate-100 text-slate-900 font-black text-sm shadow-xl hover:bg-slate-50 transition-all"
             >
                <CheckCircle className="w-5 h-5 mr-3 text-emerald-500" /> Tout lire
             </Button>
           )}
           <Button variant="ghost" className="h-16 w-16 p-0 rounded-[1.5rem] bg-slate-50 text-slate-300 hover:text-rose-500 transition-all">
              <Trash className="w-7 h-7" />
           </Button>
        </div>
      </div>

      {/* Notifications Inventory */}
      <Card className="border-none shadow-premium bg-white rounded-[3.5rem] overflow-hidden p-2">
        <div className="divide-y divide-slate-50">
          {notifications.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {notifications.map((notif, idx) => {
                const { icon: Icon, color, bg, shadow } = getNotificationIcon(notif.type);
                return (
                  <motion.div 
                    key={notif.id}
                    variants={itemVariants}
                    layout
                    whileHover={{ scale: 1.01, backgroundColor: 'rgba(248, 250, 252, 0.5)' }}
                    className={`p-8 lg:p-10 transition-all flex gap-8 relative group ${
                      !notif.est_lu ? 'bg-primary/[0.03]' : 'bg-transparent'
                    }`}
                  >
                    {!notif.est_lu && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-r-full shadow-glow-sm" />
                    )}

                    <div className={`w-18 h-18 ${bg} rounded-[1.8rem] flex items-center justify-center flex-shrink-0 shadow-2xl ${shadow} group-hover:rotate-12 transition-transform duration-500`}>
                      <Icon className={`w-9 h-9 ${color}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className={`text-xl font-black text-slate-900 tracking-tight leading-none group-hover:text-primary transition-colors ${!notif.est_lu ? 'text-primary' : ''}`}>
                            {notif.titre}
                          </h3>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {new Date(notif.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </span>
                          <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl bg-white border border-slate-50 text-slate-200 group-hover:text-slate-900 shadow-sm"><MoreVertical className="w-5 h-5" /></Button>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-slate-500 leading-relaxed max-w-2xl group-hover:text-slate-700 transition-colors uppercase text-[13px] tracking-tight">
                        {notif.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-8">
                        <div className="flex gap-4">
                          {notif.lien && (
                            <Button className="h-12 px-8 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-primary transition-all">
                               Exécuter l'Action <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                          )}
                        </div>
                        {!notif.est_lu && (
                           <Badge className="bg-primary text-white border-none py-1.5 px-3 rounded-lg font-black text-[9px] uppercase tracking-widest shadow-lg shadow-primary/20 italic italic">Priorité Alpha</Badge>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          ) : (
            <motion.div 
               variants={itemVariants} 
               className="py-48 text-center flex flex-col items-center"
            >
              <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-inner group transition-transform hover:rotate-12">
                <Bell className="w-12 h-12 text-slate-100 group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-3 italic">Silence Noyau</h3>
              <p className="text-slate-400 font-bold max-w-xs text-lg leading-relaxed">Le cluster de signaux est actuellement à l'arrêt. Aucune notification en attente.</p>
            </motion.div>
          )}
        </div>
      </Card>

      {/* Global Configuration Card */}
      <motion.div variants={itemVariants}>
         <Card className="border-none shadow-premium rounded-[3.5rem] bg-slate-900 p-12 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[100px] -mr-40 -mt-40 transition-transform group-hover:scale-125" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 text-white">
               <div className="flex items-center gap-10">
                  <div className="w-20 h-20 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[1.8rem] flex items-center justify-center shadow-2xl group-hover:rotate-6 transition-transform">
                     <Settings className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                     <h4 className="text-3xl font-black tracking-tighter leading-none italic italic">Matrice de Diffusion</h4>
                     <p className="text-white/40 font-bold mt-2 text-lg">Configurez les vecteurs de transmission d'alertes (Push, Matrix, Email).</p>
                  </div>
               </div>
               <Button className="h-18 px-12 rounded-[1.8rem] bg-white text-slate-900 font-black text-xl shadow-2xl hover:scale-105 transition-all">
                  Paramétrer Flux
               </Button>
            </div>
         </Card>
      </motion.div>
    </motion.div>
  );
}

