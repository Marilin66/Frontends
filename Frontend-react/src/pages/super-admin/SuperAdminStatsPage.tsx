// @ts-nocheck
import { useState, useEffect } from 'react';
import { api, endpoints } from '@/services/api';
import { PageLoader } from '@/components/ui';
import { TrendingUp, Users, Building, Calendar, Activity, MessageCircle, BarChart2, Server } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SuperAdminStatsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(endpoints.superAdminStats)
      .then((res: any) => setStats(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const metrics = [
    { label: 'Hôpitaux actifs',    value: stats?.total_hopitaux ?? 0,  icon: Building,      color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-100' },
    { label: 'Médecins',           value: stats?.total_medecins ?? 0,  icon: Users,         color: 'text-emerald-600',bg: 'bg-emerald-50',border: 'border-emerald-100' },
    { label: 'Patients',           value: stats?.total_patients ?? 0,  icon: Users,         color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
    { label: 'Rendez-vous',        value: stats?.total_rdv ?? 0,       icon: Calendar,      color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-100' },
    { label: 'Utilisateurs actifs',value: stats?.active_users ?? 0,    icon: Activity,      color: 'text-cyan-600',   bg: 'bg-cyan-50',   border: 'border-cyan-100' },
    { label: 'Messages',           value: stats?.total_messages ?? 0,  icon: MessageCircle, color: 'text-rose-600',   bg: 'bg-rose-50',   border: 'border-rose-100' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-20">

      {/* Header */}
      <section>
        <h1 className="text-2xl font-bold text-slate-900">Statistiques globales</h1>
        <p className="text-slate-500 mt-1 text-sm">Vue d'ensemble du réseau national de santé</p>
      </section>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <div className={`bg-white rounded-2xl border ${m.border} p-5`}>
              <div className={`w-10 h-10 ${m.bg} rounded-xl flex items-center justify-center mb-4`}>
                <m.icon className={`w-5 h-5 ${m.color}`} />
              </div>
              <p className="text-3xl font-bold text-slate-900">{m.value}</p>
              <p className="text-xs font-medium text-slate-600 mt-1">{m.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Activity chart */}
      {stats?.daily_logins && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 mb-5">Connexions — 7 derniers jours</h3>
          <div className="flex items-end gap-3 h-40">
            {stats.daily_logins.map((d: any, i: number) => {
              const max = Math.max(...stats.daily_logins.map((x: any) => x.count), 1);
              const pct = (d.count / max) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs text-slate-500">{d.count}</span>
                  <div className="w-full flex items-end" style={{ height: '100px' }}>
                    <div
                      className="w-full bg-primary/15 hover:bg-primary rounded-t-xl transition-all"
                      style={{ height: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* System performance */}
      {stats?.system_performance && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <Server className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-slate-900">Performance système</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: 'CPU',         value: stats.system_performance.cpu },
              { label: 'Mémoire RAM', value: stats.system_performance.memory },
              { label: 'Stockage',    value: stats.system_performance.storage },
              { label: 'Réseau',      value: stats.system_performance.network },
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

      {/* Recent activity */}
      {stats?.recent_activity?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Activité récente</h3>
          <div className="space-y-1">
            {stats.recent_activity.map((a: any, i: number) => (
              <div key={i} className="flex items-start gap-4 py-3 border-b border-slate-100 last:border-0">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.type === 'register' ? 'bg-emerald-500' : a.type === 'appointment' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">{a.description}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{a.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
