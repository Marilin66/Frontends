// @ts-nocheck
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api, endpoints } from '@/services/api';
import { Avatar, Badge, Button, PageLoader } from '@/components/ui';
import {
  Users, UserPlus, Settings, TrendingUp, ChevronRight,
  Activity, Stethoscope, AlertCircle, MessageSquare,
  Building, Clock, BarChart2, FlaskConical, Calendar,
  HeartPulse
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [recentDoctors, setRecentDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // On récupère les stats de supervision globale
    api.get(endpoints.hopitalStatistiques)
      .then((data: any) => {
        setStats(data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <PageLoader />;

  const statCards = [
    { label: 'Rendez-vous',      value: stats?.rendezvous?.total ?? 0,    icon: Calendar,      color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-100',   href: '/admin-hopital/rendez-vous' },
    { label: 'Consultations',    value: stats?.consultations?.total ?? 0, icon: MessageSquare, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', href: '/admin-hopital/consultations' },
    { label: 'Demandes Labo',    value: stats?.laboratoire?.total_demandes ?? 0, icon: FlaskConical, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-100', href: '/admin-hopital/laboratoire' },
    { label: 'Services actifs',  value: stats?.total_services ?? 0,       icon: Activity,    color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100', href: '/admin-hopital/services' },
  ];

  return (
    <div className="animate-fade-in space-y-10 lg:space-y-12">
      
      {/* ── Dashboard Header ── */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
             <Badge className="bg-primary/10 text-primary border-transparent font-bold uppercase tracking-widest text-[10px]">
               Administration Hospitalière
             </Badge>
             <div className="w-1 h-1 bg-slate-300 rounded-full" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Console de Supervision</span>
           </div>
           <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Vue d'ensemble</h1>
           <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Monitoring global des flux patients, médecins et laboratoires.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button 
             variant="outline" 
             onClick={() => navigate('/admin-hopital/stats')}
             className="rounded-xl border-slate-200 dark:border-slate-800 h-11 px-4 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-bold text-xs"
           >
             <BarChart2 className="w-4 h-4 mr-2" />
             Analyses
           </Button>
           <Button 
             onClick={() => navigate('/admin-hopital/medecins')}
             className="bg-primary text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-2"
           >
             <UserPlus className="w-4 h-4" />
             Nouveau personnel
           </Button>
        </div>
      </header>

      {/* ── Key Performance Indicators ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((stat, i) => (
          <div key={i} onClick={() => stat.href && navigate(stat.href)} className="stat-card group cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-200 dark:text-slate-700 group-hover:text-primary transition-colors" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ── Supervision des Flux (Real-time monitoring) ── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flux Rendez-vous */}
        <div className="section-card p-6 border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden relative group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
           <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                 <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                   <Calendar className="w-5 h-5 text-emerald-600" />
                 </div>
                 <Badge className="bg-emerald-500/10 text-emerald-600 border-transparent text-[9px] font-black uppercase tracking-widest">Flux Patient</Badge>
              </div>
              <div>
                 <p className="text-2xl font-black text-slate-900 dark:text-white">{stats?.rendezvous?.en_attente ?? 0}</p>
                 <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">En attente de confirmation</p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                 <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{stats?.rendezvous?.confirmes ?? 0}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Confirmés</p>
                 </div>
                 <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{stats?.rendezvous?.termines ?? 0}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Terminés</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Suivi Consultations */}
        <div className="section-card p-6 border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden relative group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
           <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                 <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                   <MessageSquare className="w-5 h-5 text-blue-600" />
                 </div>
                 <Badge className="bg-blue-500/10 text-blue-600 border-transparent text-[9px] font-black uppercase tracking-widest">Suivi Médical</Badge>
              </div>
              <div>
                 <p className="text-2xl font-black text-slate-900 dark:text-white">{stats?.consultations?.en_cours ?? 0}</p>
                 <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Consultations en cours</p>
              </div>
              <div className="pt-4">
                 <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-500 font-bold uppercase tracking-wider">Taux de clôture</span>
                    <span className="text-blue-600 font-black">{Math.round(((stats?.consultations?.cloturees ?? 0) / (stats?.consultations?.total || 1)) * 100)}%</span>
                 </div>
                 <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${((stats?.consultations?.cloturees ?? 0) / (stats?.consultations?.total || 1)) * 100}%` }}
                      className="h-full bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                    />
                 </div>
              </div>
           </div>
        </div>

        {/* Flux Laboratoire */}
        <div className="section-card p-6 border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden relative group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
           <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                 <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                   <FlaskConical className="w-5 h-5 text-cyan-600" />
                 </div>
                 <Badge className="bg-cyan-500/10 text-cyan-600 border-transparent text-[9px] font-black uppercase tracking-widest">Laboratoire</Badge>
              </div>
              <div>
                 <p className="text-2xl font-black text-slate-900 dark:text-white">{stats?.laboratoire?.en_cours ?? 0}</p>
                 <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Analyses en cours</p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                 <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-sm font-bold text-cyan-600">{stats?.laboratoire?.terminees ?? 0}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold text-center">Terminées</p>
                 </div>
                 <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{stats?.laboratoire?.total_demandes ?? 0}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold text-center">Total</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* ── Main Operations Grid ── */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Praticiens List */}
        <div className="xl:col-span-2 section-card flex flex-col bg-white dark:bg-slate-900">
          <div className="p-6 lg:p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-950/30">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Supervision Médicale</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Derniers praticiens et leurs activités</p>
            </div>
            <Link to="/admin-hopital/medecins" className="text-xs font-bold text-primary uppercase tracking-widest hover:text-primary-dark transition-colors">
              Gérer l'annuaire
            </Link>
          </div>

          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {recentDoctors.length > 0 ? (
              recentDoctors.map((doc: any, i: number) => (
                <div key={doc.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => navigate(`/admin-hopital/medecin/${doc.id}`)}>
                  <Avatar
                    name={`${doc.first_name || doc.user?.first_name} ${doc.last_name || doc.user?.last_name}`}
                    size="md"
                    className="ring-2 ring-slate-100 dark:ring-slate-800"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      Dr. {doc.first_name || doc.user?.first_name} {doc.last_name || doc.user?.last_name}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                      {doc.specialite || doc.specialite_nom || 'Médecin généraliste'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="hidden md:block text-right">
                        <p className="text-[10px] font-bold text-slate-900 dark:text-white">{doc.nombre_consultations ?? 0}</p>
                        <p className="text-[8px] text-slate-400 uppercase font-bold tracking-widest">Consultations</p>
                     </div>
                     <Badge className={`${doc.is_active ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'} font-bold text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-lg border-transparent`}>
                       {doc.is_active ? 'Actif' : 'Inactif'}
                     </Badge>
                     <ChevronRight className="w-5 h-5 text-slate-200 dark:text-slate-700" />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-16 text-center">
                <Users className="w-12 h-12 text-slate-100 dark:text-slate-800 mx-auto mb-4" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Aucun médecin trouvé</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Actions & Status */}
        <div className="space-y-6">
          
          {/* Status Alert */}
          {(stats?.rdv_en_attente ?? 0) > 0 && (
            <div className="bg-slate-900 dark:bg-primary/10 rounded-[2rem] p-6 lg:p-8 text-white relative overflow-hidden group border border-white/5">
               <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
               <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center">
                       <Clock className="w-5 h-5 text-slate-900" />
                    </div>
                    <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">Supervision RDV</p>
                 </div>
                 <h3 className="text-3xl font-bold text-white dark:text-primary mb-2">{stats.rdv_en_attente}</h3>
                 <p className="text-slate-400 dark:text-slate-400 text-xs font-medium leading-relaxed">
                   Demandes de rendez-vous en attente de validation ou de traitement.
                 </p>
                 <Button onClick={() => navigate('/admin-hopital/demandes')} className="w-full mt-6 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl h-11 border border-white/10">
                   Consulter les flux
                 </Button>
               </div>
            </div>
          )}

          {/* Quick Menu */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 lg:p-8 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6">Supervision Directe</h3>
            <div className="space-y-1">
              {[
                { icon: Calendar,    label: 'Rendez-vous',  href: '/admin-hopital/rendez-vous', color: 'text-blue-600 bg-blue-50' },
                { icon: MessageSquare,label: 'Consultations',href: '/admin-hopital/consultations',color: 'text-emerald-600 bg-emerald-50' },
                { icon: FlaskConical,label: 'Laboratoire',  href: '/admin-hopital/laboratoire', color: 'text-cyan-600 bg-cyan-50' },
                { icon: HeartPulse,  label: 'Post-Suivi',   href: '/admin-hopital/post-suivi',   color: 'text-rose-600 bg-rose-50' },
                { icon: Users,       label: 'Patients',     href: '/admin-hopital/patients',    color: 'text-indigo-600 bg-indigo-50' },
              ].map((item, i) => (
                <Link key={i} to={item.href} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-50 dark:hover:border-slate-800 group">
                  <div className={`w-9 h-9 ${item.bg} dark:bg-slate-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
                  <ChevronRight className="ml-auto w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Settings Shortcut */}
          <Link to="/admin-hopital/settings" className="block">
            <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-all flex items-center justify-between group">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm">
                    <Settings className="w-5 h-5 text-slate-400 group-hover:rotate-45 transition-transform" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Paramètres</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Configuration</p>
                  </div>
               </div>
               <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-primary transition-colors" />
            </div>
          </Link>

        </div>
      </section>
    </div>
  );
}
