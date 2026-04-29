// @ts-nocheck
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Building, 
  Activity, 
  Zap, 
  Globe, 
  Database, 
  Lock, 
  ChevronRight, 
  Settings,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import { api, endpoints } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';

interface ActivityItem {
  type: 'register' | 'appointment' | 'login';
  description: string;
  timestamp: string;
}

interface Performance {
  cpu: number;
  memory: number;
  storage: number;
  network: number;
}

interface Stats {
  total_hopitaux: number;
  total_medecins: number;
  total_patients: number;
  total_rdv: number;
  active_users: number;
  total_messages: number;
  daily_logins: { day: string; count: number }[];
  recent_activity: ActivityItem[];
  system_performance: Performance;
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get<Stats>(endpoints.superAdminStats);
      setStats(response);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const dashboardCards = [
    { 
      label: 'HÔPITAUX PARTENAIRES', 
      value: stats?.total_hopitaux || 0, 
      change: 'STABLE', 
      icon: Building,
      color: 'primary',
      trend: 'up'
    },
    { 
      label: 'CORPS MÉDICAL', 
      value: stats?.total_medecins || 0, 
      change: stats?.total_medecins && stats.total_medecins > 0 ? '+12%' : '0%', 
      icon: Users,
      color: 'emerald',
      trend: 'up'
    },
    { 
      label: 'TRAFIC MESSAGERIE', 
      value: stats?.total_messages || 0, 
      change: '+45%', 
      icon: Zap,
      color: 'amber',
      trend: 'up'
    },
    { 
      label: 'RENDEZ-VOUS TOTAUX', 
      value: stats?.total_rdv || 0, 
      change: '+18%', 
      icon: Activity,
      color: 'rose',
      trend: 'up'
    }
  ];

  return (
    <div className="space-y-8 lg:space-y-12 pb-20">
      {/* High-Contrast Super-Command Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center shadow-2xl">
                <Lock className="w-5 h-5 text-white" />
             </div>
             <div className="bg-slate-900 shadow-glow-sm text-white border-2 border-slate-800 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest italic">
                HOPITEL_CORE v5.0.1_STABLE
             </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-950 tracking-tighter italic uppercase leading-none underline decoration-primary/30 decoration-4 underline-offset-8">Console de Haute Direction</h1>
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mt-6 italic">Surveillance du Segment Global &bull; Bénin Healthcare Network</p>
        </motion.div>

        <div className="flex items-center gap-3">
           <Button variant="primary" className="h-12 px-8 rounded-xl text-[10px] italic shadow-xl shadow-primary/20">
             <RefreshCw className="w-4 h-4 mr-2" /> RE-SYNC GLOBAL
           </Button>
           <Button variant="outline" className="h-12 w-12 p-0 rounded-xl border-2">
             <Globe className="w-5 h-5 text-slate-950" />
           </Button>
        </div>
      </section>

      {/* Real-Time Metrics Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
          ))
        ) : dashboardCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="group border-2 border-slate-100 hover:border-primary transition-all duration-500 p-6 lg:p-8 bg-white shadow-sm overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:bg-primary/5 transition-colors" />
                 
                 <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                       <div className="w-10 h-10 rounded-lg bg-slate-50 border-2 border-slate-100 flex items-center justify-center text-slate-900 group-hover:bg-slate-950 group-hover:text-white transition-all">
                          <Icon className="w-5 h-5" />
                       </div>
                       <Badge variant={card.trend === 'up' ? 'success' : 'error'} className="text-[9px] px-3 font-black uppercase italic">{card.change}</Badge>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{card.label}</p>
                       <p className="text-3xl lg:text-4xl font-black text-slate-950 tracking-tighter uppercase leading-none italic">{card.value}</p>
                    </div>
                 </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Control Matrix Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend Graph Matrix */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
           <Card className="border-2 border-slate-100 bg-white p-6 lg:p-8 flex flex-col h-full">
              <div className="flex items-center justify-between mb-10">
                 <div className="space-y-1">
                    <h3 className="text-xl lg:text-2xl font-black text-slate-950 tracking-tighter uppercase italic leading-none">Flux de Connexion</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Trafic Utilisateurs &bull; 7 Derniers Jours</p>
                 </div>
                 <div className="flex gap-2">
                    <div className="flex items-center gap-2 group">
                       <div className="w-3 h-3 bg-primary rounded-full group-hover:scale-125 transition-transform shadow-glow-sm" />
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Activité Réelle</span>
                    </div>
                 </div>
              </div>

              {/* Simple CSS-Based Histogram for Daily Logins */}
              <div className="flex-1 flex items-end justify-between gap-4 h-64 px-4 bg-slate-50/50 rounded-2xl pt-10 border-2 border-slate-50 border-dashed">
                 {stats?.daily_logins.map((stat, i) => {
                   const max = Math.max(...stats.daily_logins.map(d => d.count), 1);
                   const height = `${(stat.count / max) * 100}%`;
                   return (
                     <div key={i} className="flex-1 flex flex-col items-center gap-4 h-full justify-end">
                        <div className="relative w-full group">
                           <motion.div 
                             initial={{ height: 0 }}
                             animate={{ height }}
                             transition={{ delay: i * 0.1, duration: 1, ease: 'circOut' }}
                             className="w-full bg-slate-950 border-t-4 border-primary group-hover:bg-primary transition-all rounded-t-lg shadow-2xl flex flex-col items-center justify-start overflow-hidden pt-4"
                           >
                              <span className="text-[10px] font-black text-white italic opacity-0 group-hover:opacity-100 transition-opacity">
                                 {stat.count}
                              </span>
                           </motion.div>
                        </div>
                        <span className="text-[10px] font-black text-slate-950 uppercase tracking-wider italic mb-4">{stat.day}</span>
                     </div>
                   );
                 })}
              </div>
              
              <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
                 <div className="p-4 rounded-xl border-2 border-slate-50 bg-white">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Utilisateurs Actifs</p>
                    <p className="text-xl font-black text-primary italic leading-none mt-1">{stats?.active_users}</p>
                 </div>
                 <div className="p-4 rounded-xl border-2 border-slate-50 bg-white">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Base Patients</p>
                    <p className="text-xl font-black text-slate-950 italic leading-none mt-1">{stats?.total_patients}</p>
                 </div>
                 <div className="lg:col-span-2 p-4 rounded-xl bg-slate-950 text-white flex items-center justify-between group overflow-hidden relative">
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl" />
                    <div className="space-y-1 relative z-10">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Temps de Réponse</p>
                       <p className="text-xl font-black italic text-primary leading-none">12.4 ms</p>
                    </div>
                    <Database className="w-8 h-8 text-white/10 group-hover:text-primary/40 transition-colors relative z-10" />
                 </div>
              </div>
           </Card>
        </motion.div>

        {/* System Performance Tactical Matrix */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
           <Card className="border-2 border-slate-100 bg-slate-950 p-6 lg:p-8 flex flex-col gap-8 h-full shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-full bg-primary/5 -translate-y-full group-hover:translate-y-0 transition-transform duration-1000" />
              
              <div className="relative z-10 space-y-1">
                 <h3 className="text-xl lg:text-2xl font-black text-white tracking-tighter uppercase italic leading-none">Performance Sytème</h3>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Analyse Matérielle &bull; vCPU Core</p>
              </div>

              <div className="relative z-10 space-y-8 flex-1 flex flex-col justify-center">
                 {[
                   { label: 'Processeur (CPU)', value: stats?.system_performance.cpu || 0, icon: Activity, color: 'primary' },
                   { label: 'Mémoire RAM', value: stats?.system_performance.memory || 0, icon: Database, color: 'emerald' },
                   { label: 'Stockage DISK', value: stats?.system_performance.storage || 0, icon: Zap, color: 'amber' },
                   { label: 'Trafic Réseau', value: stats?.system_performance.network || 0, icon: Globe, color: 'rose' }
                 ].map((metric, i) => (
                   <div key={i} className="space-y-3">
                      <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest italic">
                         <span className="text-slate-400">{metric.label}</span>
                         <span className="text-white">{metric.value}%</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${metric.value}%` }}
                           transition={{ duration: 1.5, ease: 'circOut', delay: i * 0.1 }}
                           className={`h-full bg-primary shadow-glow-sm`}
                         />
                      </div>
                   </div>
                 ))}
              </div>

              <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-glow-sm" />
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">Hardware_Locked</span>
                 </div>
                 <Button variant="ghost" size="sm" className="h-8 text-[9px] font-black text-slate-500 hover:text-white uppercase px-0">DIAGNOSTIC <ChevronRight className="w-3 h-3 ml-1" /></Button>
              </div>
           </Card>
        </motion.div>
      </div>

      {/* Global Activity Event Stream */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
            <Card className="border-2 border-slate-100 bg-white p-6 lg:p-10">
               <div className="flex items-center justify-between mb-10">
                  <div className="space-y-1">
                     <h3 className="text-xl lg:text-3xl font-black text-slate-950 tracking-tighter uppercase italic leading-none italic">Journal d'Activité National</h3>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic tracking-[0.4em]">Flux Direct &bull; Segment National</p>
                  </div>
                  <Button variant="outline" className="border-2 rounded-xl text-[9px] italic font-black h-12 px-6">HISTORIQUE_LOG</Button>
               </div>

               <div className="space-y-5">
                  {stats?.recent_activity.map((activity, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-100 hover:border-primary transition-all flex items-center justify-between group"
                    >
                       <div className="flex items-center gap-5">
                          <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
                            activity.type === 'register' ? 'bg-emerald-50 border-emerald-100 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white' : 
                            activity.type === 'appointment' ? 'bg-primary/5 border-primary/10 text-primary group-hover:bg-primary group-hover:text-white' :
                            'bg-amber-50 border-amber-100 text-amber-500 group-hover:bg-amber-500 group-hover:text-white'
                          }`}>
                            <Activity className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                             <p className="text-xs font-black text-slate-950 uppercase tracking-tight">{activity.description}</p>
                             <p className="text-[10px] font-bold text-slate-400 italic">TYPE: {activity.type.toUpperCase()} / SYNC_OFF_GMT</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-slate-950 italic">{activity.timestamp}</p>
                          <Badge variant="outline" className="mt-1 text-[8px] bg-white italic border-slate-100">STABLE</Badge>
                       </div>
                    </motion.div>
                  ))}
               </div>
            </Card>
         </motion.div>

         <div className="space-y-8">
            {/* Quick Actions Panel */}
            <Card className="border-2 border-slate-100 bg-slate-50 p-6 lg:p-8">
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 text-center italic">Raccourcis Tactiques</h3>
               <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Hôpitaux', icon: Building, link: '/super-admin/entities' },
                    { label: 'Utilisateurs', icon: Users, link: '/super-admin/users' },
                    { label: 'Sécurité', icon: ShieldCheck, link: '/super-admin/security' },
                    { label: 'Paramètres', icon: Settings, link: '/super-admin/settings' }
                  ].map((tool, i) => (
                    <motion.button 
                      key={i} 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(tool.link)}
                      className="w-full h-28 bg-white border-2 border-slate-200 hover:border-primary rounded-2xl flex flex-col items-center justify-center gap-2 group transition-all"
                    >
                      <tool.icon className="w-5 h-5 text-slate-400 group-hover:text-primary transition-all" />
                      <span className="text-[9px] font-black text-slate-500 group-hover:text-primary uppercase tracking-widest">{tool.label}</span>
                    </motion.button>
                  ))}
               </div>
            </Card>

            {/* Support Matrix Banner */}
            <Card className="bg-primary p-8 rounded-3xl shadow-3xl shadow-primary/30 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
               <div className="relative z-10 space-y-4">
                  <ShieldCheck className="w-10 h-10 text-white animate-bounce" />
                  <h3 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">Support Technique</h3>
                  <p className="text-[10px] font-bold text-white/70 uppercase leading-relaxed italic">Assistance directe VIP pour le segment Administratif Global.</p>
                  <Button variant="outline" className="w-full h-12 rounded-xl bg-white/10 border-white/20 text-white hover:bg-white hover:text-primary text-[10px] font-black transition-all">OUVRIR_TICKET</Button>
               </div>
            </Card>
         </div>
      </section>
    </div>
  );
}
