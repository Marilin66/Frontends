// @ts-nocheck
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, endpoints } from '@/services/api';
import { Button, PageLoader } from '@/components/ui';
import {
  Users, Building, Activity, BarChart2, MessageCircle,
  RefreshCw, ChevronRight, TrendingUp, Globe, Server
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchStats = () => {
    setLoading(true);
    api.get(endpoints.superAdminStats)
      .then((res: any) => setStats(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) return <PageLoader />;

  const statCards = [
    { label: 'Hôpitaux partenaires', value: stats?.total_hopitaux ?? 0,  icon: Building,      color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-100',   href: '/super-admin/hopitaux' },
    { label: 'Corps médical',        value: stats?.total_medecins ?? 0,  icon: Users,         color: 'text-emerald-600',bg: 'bg-emerald-50',border: 'border-emerald-100',href: '/super-admin/users' },
    { label: 'Patients',             value: stats?.total_patients ?? 0,  icon: Users,         color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100', href: null },
    { label: 'Rendez-vous',          value: stats?.total_rdv ?? 0,       icon: Activity,      color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-100',  href: null },
    { label: 'Utilisateurs actifs',  value: stats?.active_users ?? 0,    icon: TrendingUp,    color: 'text-cyan-600',   bg: 'bg-cyan-50',   border: 'border-cyan-100',   href: null },
    { label: 'Messages',             value: stats?.total_messages ?? 0,  icon: MessageCircle, color: 'text-rose-600',   bg: 'bg-rose-50',   border: 'border-rose-100',   href: '/super-admin/messagerie' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-20">

      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Console de direction</h1>
          <p className="text-slate-500 mt-1 text-sm">Réseau national de santé — Bénin</p>
        </div>
        <button onClick={fetchStats} className="flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
      </section>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => s.href && navigate(s.href)}
            className={`bg-white rounded-2xl border ${s.border} p-5 transition-all ${s.href ? 'cursor-pointer hover:shadow-md hover:border-slate-300' : ''}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              {s.href && <ChevronRight className="w-4 h-4 text-slate-300" />}
            </div>
            <p className="text-3xl font-bold text-slate-900">{s.value.toLocaleString()}</p>
            <p className="text-xs font-medium text-slate-600 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Graphique connexions — 2/3 */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h2 className="font-semibold text-slate-900">Activité des connexions</h2>
              <p className="text-xs text-slate-500 mt-0.5">7 derniers jours</p>
            </div>
          </div>
          <div className="p-5">
            {stats?.daily_logins && (
              <div className="flex items-end gap-3 h-40">
                {stats.daily_logins.map((d: any, i: number) => {
                  const max = Math.max(...stats.daily_logins.map((x: any) => x.count), 1);
                  const pct = Math.max((d.count / max) * 100, 4);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs text-slate-500">{d.count}</span>
                      <div className="w-full flex items-end" style={{ height: '100px' }}>
                        <div
                          className="w-full bg-primary/15 hover:bg-primary rounded-t-xl transition-colors cursor-pointer"
                          style={{ height: `${pct}%` }}
                          title={`${d.count} connexions`}
                        />
                      </div>
                      <span className="text-xs text-slate-500">{d.day}</span>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5 pt-5 border-t border-slate-100">
              {[
                { label: 'Utilisateurs actifs', value: stats?.active_users ?? 0, color: 'text-slate-900' },
                { label: 'Patients inscrits',   value: stats?.total_patients ?? 0, color: 'text-slate-900' },
                { label: 'Temps de réponse',    value: '12ms', color: 'text-primary' },
              ].map((m, i) => (
                <div key={i} className="text-center">
                  <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Colonne droite — 1/3 */}
        <div className="space-y-4">

          {/* Performance système */}
          {stats?.system_performance && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                  <Server className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm">Performance système</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'CPU',      value: stats.system_performance.cpu },
                  { label: 'Mémoire', value: stats.system_performance.memory },
                  { label: 'Stockage',value: stats.system_performance.storage },
                ].map((m, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs font-medium text-slate-600">{m.label}</span>
                      <span className="text-xs text-slate-500">{m.value}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${m.value > 80 ? 'bg-red-500' : m.value > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${m.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation rapide */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 text-sm mb-3">Navigation rapide</h3>
            <div className="space-y-0.5">
              {[
                { label: 'Hôpitaux',          href: '/super-admin/hopitaux',   icon: Building },
                { label: 'Administrateurs',    href: '/super-admin/users',      icon: Users },
                { label: 'Services globaux',   href: '/super-admin/services',   icon: Globe },
                { label: 'Demandes',           href: '/super-admin/demandes',   icon: BarChart2 },
                { label: 'Statistiques',       href: '/super-admin/stats',      icon: BarChart2 },
                { label: 'Messages',           href: '/super-admin/messagerie', icon: MessageCircle },
              ].map((item, i) => (
                <Link key={i} to={item.href}>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
                    <item.icon className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                    <span className="text-sm font-medium text-slate-700 flex-1">{item.label}</span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Activité récente */}
          {stats?.recent_activity?.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-900 text-sm mb-3">Activité récente</h3>
              <div className="space-y-3">
                {stats.recent_activity.slice(0, 4).map((a: any, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.type === 'register' ? 'bg-emerald-500' : a.type === 'appointment' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 truncate">{a.description}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{a.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
