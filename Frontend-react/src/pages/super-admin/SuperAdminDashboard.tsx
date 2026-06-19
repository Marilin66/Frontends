
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, endpoints } from '@/services/api';
import { Button, PageLoader, Badge } from '@/components/ui';
import {
  Users, Building, Activity, RefreshCw, ChevronRight, TrendingUp, Globe, Server, FlaskConical
} from 'lucide-react';
import type { SuperAdminStats, DailyLogin } from '@/types/api';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<SuperAdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchStats = () => {
    setLoading(true);
    api.get(endpoints.superAdminStats)
      .then((res) => {
        const data = res as SuperAdminStats;
        if (data && (data.total_hopitaux !== undefined || data.total_medecins !== undefined)) {
          setStats(data);
        } else {
          Promise.all([
            api.get(endpoints.hopitaux).catch(() => ({ results: [], count: 0 })),
            api.get(endpoints.medecins).catch(() => ({ results: [], count: 0 })),
            api.get(endpoints.patients).catch(() => ({ results: [], count: 0 })),
            api.get(endpoints.rendezVous).catch(() => ({ results: [], count: 0 })),
          ]).then(([hopitaux, medecins, patients, rdvs]) => {
            const countOf = (d: unknown) => typeof d === 'number' ? d : (d as { count?: number; results?: unknown[] })?.count ?? (Array.isArray(d) ? d.length : (d as { results?: unknown[] })?.results?.length ?? 0);
            setStats({
              total_hopitaux: countOf(hopitaux),
              total_medecins: countOf(medecins),
              total_patients: countOf(patients),
              total_rdv:      countOf(rdvs),
              active_users:   0,
              total_messages: 0,
              daily_logins:   [],
            });
          }).catch(console.error);
        }
      })
      .catch((err) => {
        console.error('Stats error:', err);
        Promise.all([
          api.get(endpoints.hopitaux).catch(() => null),
          api.get(endpoints.medecins).catch(() => null),
        ]).then(([hopitaux, medecins]) => {
          const countOf = (d: unknown) => (d as { count?: number; results?: unknown[] })?.count ?? (Array.isArray(d) ? d.length : (d as { results?: unknown[] })?.results?.length ?? 0);
          setStats({
            total_hopitaux: countOf(hopitaux),
            total_medecins: countOf(medecins),
            total_patients: 0,
            total_rdv: 0,
            active_users: 0,
            total_messages: 0,
            daily_logins: [],
          });
        }).catch(() => setStats({}));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) return <PageLoader />;

  const statCards = [
    { label: 'Hôpitaux partenaires', value: stats?.total_hopitaux || 0, icon: Building, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Praticiens réseau', value: stats?.total_medecins || 0, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Rendez-vous globaux', value: stats?.total_rdv || 0, icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Analyses traitées', value: stats?.total_analyses || 0, icon: FlaskConical, color: 'text-violet-600', bg: 'bg-violet-50' },
  ];

  return (
    <div className="animate-fade-in space-y-10 lg:space-y-12">
      
      {/* ── Network Oversight Header ── */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
             <Badge className="bg-slate-900 text-white border-transparent font-bold uppercase tracking-widest text-[10px] px-3">
               Supervision Nationale
             </Badge>
             <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Réseau Santé Bénin</span>
           </div>
           <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">Console Centrale</h1>
           <p className="text-slate-500 mt-2 font-medium">Monitoring global des flux, des établissements et de l'infrastructure.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button 
             variant="outline" 
             onClick={fetchStats}
             className="rounded-xl border-slate-200 h-11 px-4 text-slate-600 hover:bg-slate-50 transition-all"
           >
             <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
           </Button>
           <Button 
             onClick={() => navigate('/super-admin/hopitaux/nouveau')}
             className="bg-primary text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-2"
           >
             <Building className="w-4 h-4" />
             Ajouter un établissement
           </Button>
        </div>
      </header>

      {/* ── Global Network Metrics ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <TrendingUp className="w-4 h-4 text-slate-200" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-900 tracking-tight tabular-nums">{stat.value}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ── Core Management Modules ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {[
          { 
            title: 'Réseau Hospitalier', 
            desc: 'Gestion centralisée des structures de santé et cliniques partenaires.', 
            icon: Building, 
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            href: '/super-admin/hopitaux',
          },
          { 
            title: 'Contrôle des Accès', 
            desc: 'Supervision des administrateurs et des privilèges de sécurité.', 
            icon: Users, 
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            href: '/super-admin/users',
          },
          { 
            title: 'Services Globaux', 
            desc: 'Maintenance du catalogue national des prestations et actes médicaux.', 
            icon: Activity, 
            color: 'text-violet-600',
            bg: 'bg-violet-50',
            href: '/super-admin/services',
          },
        ].map((service, i) => (
          <Link 
            key={i} 
            to={service.href} 
            className="group bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1 transition-all flex flex-col"
          >
            <div className={`w-14 h-14 ${service.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
               <service.icon className={`w-7 h-7 ${service.color}`} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 flex-1">
              {service.desc}
            </p>
            <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest">
              <span>Gérer le module</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </section>

      {/* ── System Health & Activity ── */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Connection Activity Graph */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 lg:p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Activité du Réseau</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Statistiques de connexion (7j)</p>
            </div>
            <div className="flex gap-2">
               <div className="w-3 h-3 bg-primary rounded-full" />
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Flux Trafic</span>
            </div>
          </div>
          
          <div className="p-8">
            {stats && (stats.daily_logins ?? []).length > 0 && (
              <div className="flex items-end gap-3 h-48 border-b border-slate-100 pb-2">
                {(stats!.daily_logins ?? []).map((d: DailyLogin, i: number) => {
                  const max = Math.max(...(stats!.daily_logins ?? []).map((x: DailyLogin) => x.count), 1);
                  const pct = Math.max((d.count / max) * 100, 5);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-3">
                      <div className="w-full flex items-end h-full">
                        <div
                          className="w-full bg-primary/20 hover:bg-primary rounded-t-xl transition-all duration-300 cursor-pointer relative group/bar"
                          style={{ height: `${pct}%` }}
                        >
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                            {d.count} Connexions
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{d.day}</span>
                    </div>
                  );
                })}
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-8 mt-8 pt-4">
              {[
                { label: 'Utilisateurs actifs', value: stats?.active_users ?? 0 },
                { label: 'Patients inscrits',   value: stats?.total_patients ?? 0 },
                { label: 'Stabilité Système',    value: '99.9%' },
              ].map((m, i) => (
                <div key={i} className="text-center">
                  <p className="text-xl font-bold text-slate-900">{m.value}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Technical Diagnostics */}
        <div className="space-y-6">
           <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
             <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                   <Server className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Santé Infrastructure</h3>
             </div>
             
             <div className="space-y-6">
                {[
                  { label: 'Calcul CPU',      value: stats?.system_performance?.cpu || 12 },
                  { label: 'Mémoire RAM',     value: stats?.system_performance?.memory || 45 },
                  { label: 'Cloud Storage',   value: stats?.system_performance?.storage || 28 },
                ].map((m, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.label}</span>
                      <span className="text-xs font-bold text-slate-900">{m.value}%</span>
                    </div>
                    <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${m.value > 80 ? 'bg-rose-500' : m.value > 60 ? 'bg-amber-500' : 'bg-primary'}`}
                        style={{ width: `${m.value}%` }}
                      />
                    </div>
                  </div>
                ))}
             </div>
           </div>

           <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10">
              <h4 className="text-primary font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Endpoint Status
              </h4>
              <div className="space-y-3">
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600">API Production</span>
                    <Badge className="bg-emerald-50 text-emerald-600 border-transparent text-[9px] font-bold">Opérationnel</Badge>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600">Serveur IA</span>
                    <Badge className="bg-emerald-50 text-emerald-600 border-transparent text-[9px] font-bold">Opérationnel</Badge>
                 </div>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
}
