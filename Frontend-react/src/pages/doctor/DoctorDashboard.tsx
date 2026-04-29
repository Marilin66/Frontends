// @ts-nocheck
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { api, endpoints } from '@/services/api';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle,
  Avatar, 
  Badge, 
  Button, 
  PageLoader 
} from '@/components/ui';
import { 
  Calendar,
  FileText,
  ChevronRight,
  CheckCircle,
  Zap,
  ArrowUpRight,
  Clock,
  Activity,
  Video,
  Award,
  Users,
  XCircle,
  MoreHorizontal
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Appointment {
  id: number;
  patient_nom: string;
  heure: string;
  date: string;
  type_consultation?: string;
  statut: 'en_attente' | 'confirme' | 'annule' | 'termine';
}

interface DoctorStats {
  total_consultations: number;
  pending_rdv: number;
  completed_rdv: number;
  total_patients: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<DoctorStats>({
    total_consultations: 1280,
    pending_rdv: 0,
    completed_rdv: 0,
    total_patients: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [rdvData, statsData] = await Promise.all([
        api.get<any>(endpoints.rendezVous),
        api.get<any>(endpoints.hopitalStatistiques) // Réutilise les stats hôpital qui contiennent des infos pertinentes
      ]);
      
      const results = Array.isArray(rdvData) ? rdvData : rdvData.results || [];
      setAppointments(results);
      
      // Calculer des stats locales en attendant un endpoint dédié docteur
      const pending = results.filter(r => r.statut === 'en_attente').length;
      const completed = results.filter(r => r.statut === 'termine').length;
      
      setStats({
        total_consultations: 1280 + completed,
        pending_rdv: pending,
        completed_rdv: completed,
        total_patients: Array.from(new Set(results.map(r => r.patient_nom))).length
      });

    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id: number, newStatut: string) => {
    try {
      setIsLoading(true);
      await api.patch(endpoints.rendezVousDetail(id), { statut: newStatut });
      fetchData();
    } catch (error: any) {
      alert("Erreur lors de la mise à jour du statut.");
    } finally {
      setIsLoading(false);
    }
  };

  const metricCards = [
    { label: 'RDV en attente', value: stats.pending_rdv, icon: Clock, color: 'primary', trend: 'ACTION_REQ' },
    { label: 'Patients Uniques', value: stats.total_patients, icon: Users, color: 'slate', trend: 'SYNC' },
    { label: 'Analyses Labo', value: '12', icon: FileText, color: 'rose', trend: 'RÉCENT' },
    { label: 'Score Expert', value: '4.9', icon: Award, color: 'amber', trend: 'TOP' },
  ];

  if (isLoading && appointments.length === 0) return <PageLoader />;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 lg:space-y-12 pb-20"
    >
      {/* High-Contrast Clinical Header */}
      <motion.div variants={itemVariants} className="bg-slate-950 rounded-2xl lg:rounded-3xl p-8 lg:p-12 overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[80px] -mr-40 -mt-40" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
           <div className="flex items-center gap-6">
              <div className="relative group">
                 <Avatar name={user?.last_name} size="lg" className="w-20 h-20 lg:w-24 lg:h-24 border-2 border-white/10 ring-4 ring-white/5 shadow-2xl" />
                 <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 border-2 border-slate-950 rounded-lg flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-4 h-4 text-white" />
                 </div>
              </div>
              <div className="text-white">
                 <h1 className="text-3xl lg:text-4xl font-black tracking-tighter leading-none mb-3 italic uppercase">
                    Dr. <span className="text-primary">{user?.last_name}</span>
                 </h1>
                 <div className="flex flex-wrap items-center gap-3 text-white/40 font-black uppercase tracking-widest text-[9px] italic">
                    <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 text-white"><Clock className="w-3.5 h-3.5" /> OPÉRATIONNEL</span>
                    <span className="flex items-center gap-2 text-emerald-400"><Activity className="w-3.5 h-3.5" /> MATRIX_CERTIFIED</span>
                 </div>
              </div>
           </div>
           <div className="flex gap-3">
              <Link to="/doctor/agenda">
                 <Button variant="ghost" className="rounded-xl h-12 px-6 bg-white/5 text-white hover:bg-white/10 italic text-[10px] font-black uppercase">MON AGENDA</Button>
              </Link>
              <Button className="rounded-xl h-12 px-8 font-black shadow-xl shadow-primary/20 italic text-[10px] uppercase">
                 VIDÉO-CONSULTATION <Video className="w-4 h-4 ml-2" />
              </Button>
           </div>
        </div>
      </motion.div>

      {/* Analytics Architecture */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div key={index} variants={itemVariants}>
              <Card className="border-4 border-slate-50 bg-white hover:border-primary transition-all p-6 lg:p-8 group shadow-sm">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-slate-50 text-slate-950 border-2 border-slate-100 rounded-xl flex items-center justify-center group-hover:bg-slate-950 group-hover:text-white transition-all shadow-inner">
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge variant="outline" className="text-[8px] px-3 font-black italic border-2 border-slate-100">{stat.trend}</Badge>
                  </div>
                  <div>
                    <p className="text-4xl lg:text-5xl font-black text-slate-950 tracking-tighter mb-1 uppercase leading-none italic">{stat.value}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{stat.label}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Operational Matrix Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border-4 border-slate-50 bg-white rounded-[2.5rem] overflow-hidden h-full shadow-premium">
            <CardHeader className="p-8 lg:p-12 border-b-2 border-slate-50 flex flex-row items-center justify-between bg-slate-50/30">
              <div>
                <h3 className="text-xl lg:text-3xl font-black text-slate-950 tracking-tighter uppercase italic flex items-center gap-4 leading-none">
                  <Calendar className="w-7 h-7 text-primary" />
                  Flux Patients
                </h3>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-3 italic">Indexation chronologique des segments cliniques</p>
              </div>
              <Button variant="outline" size="sm" className="h-10 w-10 p-0 rounded-lg border-2"><MoreHorizontal className="w-4 h-4" /></Button>
            </CardHeader>
            <CardContent className="p-8 lg:p-12 space-y-6">
                {appointments.length > 0 ? appointments.map((appointment) => (
                  <div 
                    key={appointment.id}
                    className={`group flex items-center gap-8 p-8 border-4 transition-all rounded-[2rem] relative ${appointment.statut === 'en_attente' ? 'border-primary/10 bg-primary/[0.01]' : 'border-slate-50 bg-white hover:border-slate-100 hover:shadow-xl'}`}
                  >
                    <div className="text-center w-24 shrink-0">
                      <p className="text-3xl font-black text-slate-950 tracking-tighter leading-none">{appointment.heure}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 italic">{new Date(appointment.date).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="flex items-center gap-6 flex-1 min-w-0 border-l-4 border-slate-100 pl-8">
                       <Avatar name={appointment.patient_nom} size="lg" className="ring-4 ring-white shadow-xl" />
                       <div className="min-w-0">
                          <p className="text-lg lg:text-xl font-black text-slate-950 uppercase tracking-tighter truncate leading-none mb-2">{appointment.patient_nom}</p>
                          <div className="flex items-center gap-3">
                             <Badge variant={appointment.statut === 'confirme' ? 'success' : appointment.statut === 'annule' ? 'destructive' : 'warning'} className="text-[9px] font-black italic px-4 py-1 uppercase">{appointment.statut}</Badge>
                             <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic hidden md:block">UID: P-0{appointment.id}X</span>
                          </div>
                       </div>
                    </div>

                    <div className="flex items-center gap-3">
                       {appointment.statut === 'en_attente' && (
                         <div className="flex gap-2">
                           <Button 
                             onClick={() => handleUpdateStatus(appointment.id, 'confirme')}
                             className="h-12 w-12 p-0 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg active:scale-95 transition-all"
                           >
                             <CheckCircle className="w-5 h-5" />
                           </Button>
                           <Button 
                             onClick={() => handleUpdateStatus(appointment.id, 'annule')}
                             className="h-12 w-12 p-0 rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-lg active:scale-95 transition-all"
                           >
                             <XCircle className="w-5 h-5" />
                           </Button>
                         </div>
                       )}
                       {appointment.statut === 'confirme' && (
                          <Button 
                             onClick={() => handleUpdateStatus(appointment.id, 'termine')}
                             className="h-12 px-6 rounded-xl bg-slate-950 text-white font-black italic text-[10px] shadow-xl hover:bg-primary transition-all uppercase"
                          >
                             TERMINER
                          </Button>
                       )}
                       <Button variant="outline" size="sm" className="h-12 w-12 p-0 rounded-xl border-2 text-slate-300 hover:text-slate-950 group-hover:border-slate-300">
                          <ChevronRight className="w-5 h-5" />
                       </Button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-32 bg-slate-50/50 rounded-[2.5rem] border-4 border-dashed border-slate-100 overflow-hidden relative">
                    <Calendar className="w-20 h-20 mx-auto mb-6 text-slate-200" />
                    <h3 className="text-2xl font-black text-slate-300 uppercase italic tracking-[0.2em]">Agenda Libre</h3>
                    <p className="text-slate-400 font-bold text-xs uppercase mt-3 italic tracking-widest">Aucune indexation patient</p>
                  </div>
                )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Clinical Sidepanels */}
        <motion.div variants={itemVariants} className="space-y-10">
          <Card className="border-4 border-slate-950 bg-slate-950 text-white p-10 lg:p-12 overflow-hidden relative group rounded-[3rem] shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[70px] -mr-32 -mt-32 transition-transform group-hover:scale-125" />
            <div className="relative z-10 space-y-10">
               <div className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform"><FileText className="w-8 h-8 text-primary" /></div>
               <div className="space-y-4">
                  <h4 className="text-4xl font-black tracking-tighter leading-none italic uppercase">ANALYSES <br /><span className="text-white/40 text-2xl font-bold italic uppercase tracking-tight">Vecteur Labo</span></h4>
                  <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed italic">
                    Synchronisation asynchrone des datasets biologiques
                  </p>
               </div>
               <Button className="w-full h-16 rounded-2xl bg-white text-slate-950 font-black text-xs italic shadow-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest">OUVRIR ARCHIVES <ArrowUpRight className="w-5 h-5 ml-3" /></Button>
            </div>
          </Card>

          <Card className="border-4 border-slate-50 bg-white p-10 rounded-[3rem] shadow-premium">
            <div className="flex items-center justify-between mb-10">
               <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] italic">ALERTES_NODE</h4>
               <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping shadow-glow-sm" />
            </div>
            <div className="space-y-8">
               {[
                 { name: "Saliou Diallo", time: "15 min", type: "RÉSUMÉ DISPO", icon: CheckCircle, color: "text-emerald-500" },
                 { name: "Marie Koffi", time: "2h ago", type: "URGENCE_REQ", icon: Activity, color: "text-rose-500" }
               ].map((pat, i) => (
                 <div key={i} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-5">
                       <div className="relative">
                          <Avatar name={pat.name} size="md" className="ring-2 ring-slate-100 group-hover:scale-110 transition-transform shadow-premium" />
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${pat.color.replace('text', 'bg')} rounded-lg border-2 border-white flex items-center justify-center shadow-lg`}><pat.icon className="w-3 h-3 text-white" /></div>
                       </div>
                       <div>
                          <p className="text-sm font-black text-slate-950 uppercase tracking-tighter italic">{pat.name}</p>
                          <p className={`text-[8px] font-black uppercase tracking-widest italic ${pat.color}`}>{pat.type}</p>
                       </div>
                    </div>
                    <span className="text-[9px] font-black text-slate-300 italic uppercase">{pat.time}</span>
                 </div>
               ))}
               <Button variant="ghost" className="w-full h-14 rounded-2xl text-primary font-black text-[10px] uppercase tracking-[0.25em] hover:bg-primary/5 mt-6 border-4 border-transparent hover:border-primary/10 italic">VOIR LE FLUX GLOBAL</Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
