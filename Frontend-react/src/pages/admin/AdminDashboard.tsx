// @ts-nocheck
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api, endpoints } from '@/services/api';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Avatar, 
  Badge, 
  Button, 
  PageLoader 
} from '@/components/ui';
import { 
  Building,
  Users,
  UserPlus,
  Settings,
  TrendingUp,
  ChevronRight,
  Zap,
  Activity,
  LayoutDashboard,
  Stethoscope,
  Briefcase,
  AlertCircle,
  MessageSquare
} from 'lucide-react';

interface Stats {
  total_medecins: number;
  total_services: number;
  total_rdv: number;
  rdv_en_attente?: number;
  demandes_en_attente?: number;
}

interface Doctor {
  id: number;
  first_name: string;
  last_name: string;
  specialty?: string;
  is_active: boolean;
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

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentDoctors, setRecentDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, doctorsData] = await Promise.all([
          api.get<Stats>(endpoints.hopitalStatistiques),
          api.get<any>(endpoints.medecins),
        ]);
        setStats(statsData);
        const doctors = Array.isArray(doctorsData) ? doctorsData : doctorsData.results || [];
        setRecentDoctors(doctors.slice(0, 3));
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return <PageLoader />;

  const hospitalStats = [
    { label: 'Effectif Médical', value: stats?.total_medecins || 0, icon: Stethoscope, color: 'indigo', trend: '+3 activés' },
    { label: 'Services Actifs', value: stats?.total_services || 0, icon: LayoutDashboard, color: 'blue', trend: '100% CAP' },
    { label: 'Flux Patients', value: stats?.total_rdv || 0, icon: TrendingUp, color: 'emerald', trend: '+12% MOIS' },
    { label: 'Validations RDV', value: stats?.rdv_en_attente || 0, icon: Zap, color: 'amber', trend: 'URGENT' },
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 lg:space-y-12 pb-20"
    >
      {/* High-Contrast Institutional Header */}
      <motion.div variants={itemVariants} className="bg-slate-950 rounded-2xl lg:rounded-3xl p-8 lg:p-14 overflow-hidden shadow-2xl relative group">
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none overflow-hidden underline-none">
           <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-[100px] -mr-48 -mt-48" />
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 lg:w-24 lg:h-24 bg-white/5 backdrop-blur-xl border-2 border-white/10 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform">
              <Building className="w-10 h-10 lg:w-12 lg:h-12 text-white" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                 <Badge variant="primary" className="text-[9px] px-3 font-black italic border-white/20 uppercase">Dashboard Admin</Badge>
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-glow-sm" />
              </div>
              <h1 className="text-3xl lg:text-5xl font-black text-white tracking-tighter leading-none italic uppercase">
                 {user?.hopital_nom || 'HOPITEL CORE'}
              </h1>
              <p className="text-white/40 font-black text-[10px] lg:text-xs uppercase tracking-widest italic max-w-xl leading-relaxed">
                 Gouvernance opérationnelle de l'établissement clinique.
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
             <Link to="/admin/medecins">
                <Button className="h-14 px-8 rounded-xl bg-white text-slate-950 font-black italic text-[10px] uppercase shadow-2xl hover:scale-105 active:scale-95 transition-all">
                  <UserPlus className="w-5 h-5 mr-3" /> Nouveau Médecin
                </Button>
             </Link>
             <Button variant="outline" className="h-14 px-8 rounded-xl bg-white/5 text-white border-2 border-white/10 italic text-[10px] font-black uppercase hover:bg-white/10">
                <Settings className="w-5 h-5 mr-3" /> CONFIGURATION
             </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Hub */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {hospitalStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div key={index} variants={itemVariants}>
              <Card className="border-2 border-slate-100 bg-white hover:border-primary transition-all p-6 lg:p-8 group shadow-sm">
                <div className="flex flex-col gap-6 text-center lg:text-left">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 bg-slate-50 border-2 border-slate-100 rounded-lg flex items-center justify-center group-hover:bg-slate-950 group-hover:text-white transition-all shadow-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="success" className="text-[8px] font-black italic px-3">{stat.trend}</Badge>
                  </div>
                  <div>
                    <p className="text-3xl lg:text-4xl font-black text-slate-950 tracking-tighter mb-1 leading-none italic uppercase">{stat.value}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{stat.label}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Main Operations Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={itemVariants} className="lg:col-span-2">
           <Card className="border-2 border-slate-100 bg-white rounded-2xl lg:rounded-3xl overflow-hidden h-full shadow-sm">
              <CardHeader className="p-8 lg:p-10 border-b-2 border-slate-50 flex flex-row items-center justify-between">
                 <div className="space-y-1">
                    <h3 className="text-xl lg:text-2xl font-black text-slate-950 tracking-tighter uppercase italic flex items-center gap-4 leading-none">
                       <Users className="w-6 h-6 text-indigo-500" />
                       Effectif Médical
                    </h3>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic mt-2">Derniers enregistrements vérifiés</p>
                 </div>
                 <Link to="/admin/medecins">
                    <Button variant="outline" size="sm" className="h-10 px-4 rounded-lg border-2 text-[9px] italic">ARCHIVE COMPLÈTE</Button>
                 </Link>
              </CardHeader>
              <CardContent className="p-6 lg:p-8 space-y-4">
                 {recentDoctors.length > 0 ? recentDoctors.map((doctor) => (
                    <div key={doctor.id} className="group flex items-center gap-6 p-6 bg-slate-50 border-2 border-transparent hover:border-slate-100 hover:bg-white hover:shadow-xl transition-all rounded-2xl shadow-sm">
                       <Avatar name={`${doctor.first_name} ${doctor.last_name}`} size="md" className="ring-2 ring-white shadow-md group-hover:scale-110 transition-transform" />
                       <div className="flex-1 min-w-0 border-l-2 border-slate-200 pl-6">
                          <p className="text-sm lg:text-base font-black text-slate-950 uppercase tracking-tight leading-none mb-1">{doctor.first_name} {doctor.last_name}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
                             <Briefcase className="w-3 h-3 text-indigo-500" /> {doctor.specialty || 'Expert Hospitalier'}
                          </p>
                       </div>
                       <div className="flex flex-col items-end gap-3 shrink-0">
                          <Badge variant={doctor.is_active ? 'success' : 'warning'} className="text-[8px] font-black px-4 py-1.5 italic">
                             {doctor.is_active ? 'OPÉRATIONNEL' : 'EN VÉRIFICATION'}
                          </Badge>
                          <Button variant="outline" size="sm" className="h-10 w-10 p-0 rounded-lg border-2 text-slate-300 hover:text-slate-950 group-hover:border-slate-300">
                             <ChevronRight className="w-4 h-4" />
                          </Button>
                       </div>
                    </div>
                 )) : (
                    <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                       <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-200" />
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Aucun enregistrement localisé</p>
                    </div>
                 )}
              </CardContent>
           </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-8">
           <Card className="border-2 border-slate-900 bg-slate-950 p-8 lg:p-10 overflow-hidden relative group shadow-2xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-[60px] -mr-24 -mt-24" />
              <div className="relative z-10 space-y-8">
                 <div className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center text-white shadow-2xl">
                    <Activity className="w-6 h-6" />
                 </div>
                 <div className="space-y-3">
                    <h3 className="text-2xl lg:text-3xl font-black text-white tracking-tighter leading-tight italic uppercase">Flux de Coeur</h3>
                    <p className="text-white/40 font-black text-[10px] uppercase tracking-widest italic leading-relaxed">Coordination des urgences cliniques.</p>
                 </div>
                 <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                       <span className="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2 italic">RDV en attente</span>
                       <span className="text-2xl font-black text-white tracking-tighter italic">{stats?.rdv_en_attente || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                       <span className="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2 italic">Alertes Sync</span>
                       <span className="text-2xl font-black text-white tracking-tighter italic">12</span>
                    </div>
                 </div>
              </div>
           </Card>

           <Card className="border-2 border-slate-100 bg-white p-8 space-y-6 shadow-sm">
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] italic text-center">Protocoles Système</h3>
              <div className="grid grid-cols-2 gap-4">
                 {[
                   { icon: Building, label: 'Services', link: '/admin/services' },
                   { icon: Users, label: 'Staff', link: '/admin/staff' },
                   { icon: TrendingUp, label: 'Analytics', link: '/admin/analytics' },
                   { icon: MessageSquare, label: 'Matrix', link: '/admin/chat' }
                 ].map((tool, i) => (
                    <Link key={i} to={tool.link}>
                       <button className="w-full h-28 lg:h-32 bg-slate-50 border-2 border-slate-100 hover:bg-slate-950 hover:border-slate-950 hover:shadow-2xl rounded-2xl flex flex-col items-center justify-center gap-3 group transition-all">
                          <tool.icon className="w-6 h-6 text-slate-400 group-hover:text-primary group-hover:scale-110 transition-all" />
                          <span className="text-[9px] font-black text-slate-400 group-hover:text-white uppercase tracking-widest italic">{tool.label}</span>
                       </button>
                    </Link>
                 ))}
              </div>
           </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
