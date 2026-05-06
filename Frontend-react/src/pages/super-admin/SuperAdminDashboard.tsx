// @ts-nocheck
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, endpoints } from '@/services/api';
import { Card, CardHeader, CardContent, Badge, Button, PageLoader } from '@/components/ui';
import {
  Users, Building, Activity, BarChart2, MessageCircle,
  RefreshCw, ChevronRight, TrendingUp, Globe, Server
} from 'lucide-react';

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
    { label: 'Hôpitaux partenaires', value: stats?.total_hopitaux ?? 0,  icon: Building,  color: 'text-blue-600',   bg: 'bg-blue-50',   href: '/super-admin/hopitaux' },
    { label: 'Corps médical',        value: stats?.total_medecins ?? 0,  icon: Users,     color: 'text-emerald-600',bg: 'bg-emerald-50',href: '/super-admin/users' },
    { label: 'Patients',             value: stats?.total_patients ?? 0,  icon: Users,     color: 'text-violet-600', bg: 'bg-violet-50', href: null },
    { label: 'Rendez-vous',          value: stats?.total_rdv ?? 0,       icon: Activity,  color: 'text-amber-600',  bg: 'bg-amber-50',  href: null },
    { label: 'Utilisateurs actifs',  value: stats?.active_users ?? 0,    icon: TrendingUp,color: 'text-cyan-600',   bg: 'bg-cyan-50',   href: null },
    { label: 'Messages',             value: stats?.total_messages ?? 0,  icon: MessageCircle, color: 'text-rose-600', bg: 'bg-rose-50', href: '/super-admin/messagerie' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Console de direction</h1>
          <p className="text-slate-500 mt-1">Réseau national de santé — Bénin</p>
        </div>
        <Button variant="outline" onClick={fetchStats} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Actualiser
        </Button>
      </div>

      {/* ── Stats grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((s, i) => (
          <div
            key={i}
            onClick={() => s.href && navigate(s.href)}
            className={`bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-card-md transition-all ${s.href ? 'cursor-pointer hover:border-slate-300' : ''}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              {s.href && <ChevronRight className="w-4 h-4 text-slate-300" />}
            </div>
            <p className="text-3xl font-bold text-slate-900">{s.value.toLocaleString()}</p>
            <p className="text-sm text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Contenu principal ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Graphique connexions — 2/3 */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <h2 className="font-semibold text-slate-900">Activité des connexions</h2>
              <p className="text-xs text-slate-400 mt-0.5">7 derniers jours</p>
            </div>
          </div>
          <div className="p-6">
            {stats?.daily_logins && (
              <div className="flex items-end gap-3 h-40">
                {stats.daily_logins.map((d: any, i: number) => {
                  const max = Math.max(...stats.daily_logins.map((x: any) => x.count), 1);
                  const pct = Math.max((d.count / max) * 100, 4);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs font-medium text-slate-500">{d.count}</span>
                      <div className="w-full flex items-end" style={{ height: '100px' }}>
                        <div
                          className="w-full bg-primary/15 hover:bg-primary rounded-t-lg transition-colors cursor-pointer"
                          style={{ height: `${pct}%` }}
                          title={`${d.count} connexions`}
                        />
                      </div>
                      <span className="text-xs text-slate-400">{d.day}</span>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{stats?.active_users ?? 0}</p>
                <p className="text-xs text-slate-500 mt-1">Utilisateurs actifs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{stats?.total_patients ?? 0}</p>
                <p className="text-xs text-slate-500 mt-1">Patients inscrits</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">12ms</p>
                <p className="text-xs text-slate-500 mt-1">Temps de réponse</p>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne droite — 1/3 */}
        <div className="space-y-4">

          {/* Performance système */}
          {stats?.system_performance && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Server className="w-4 h-4 text-slate-400" />
                <h3 className="font-semibold text-slate-900">Performance système</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'CPU',      value: stats.system_performance.cpu },
                  { label: 'Mémoire', value: stats.system_performance.memory },
                  { label: 'Stockage',value: stats.system_performance.storage },
                ].map((m, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-600">{m.label}</span>
                      <span className="font-semibold text-slate-900">{m.value}%</span>
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
            <h3 className="font-semibold text-slate-900 mb-3">Navigation rapide</h3>
            <div className="space-y-1">
              {[
                { label: 'Gérer les hôpitaux',    href: '/super-admin/hopitaux',   icon: Building },
                { label: 'Administrateurs',        href: '/super-admin/users',      icon: Users },
                { label: 'Services globaux',       href: '/super-admin/services',   icon: Globe },
                { label: 'Demandes de service',    href: '/super-admin/demandes',   icon: BarChart2 },
                { label: 'Statistiques globales',  href: '/super-admin/stats',      icon: BarChart2 },
                { label: 'Messages',               href: '/super-admin/messagerie', icon: MessageCircle },
              ].map((item, i) => (
                <Link key={i} to={item.href}>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
                    <item.icon className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                    <span className="text-sm text-slate-700 flex-1">{item.label}</span>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Activité récente */}
          {stats?.recent_activity?.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-900 mb-3">Activité récente</h3>
              <div className="space-y-3">
                {stats.recent_activity.slice(0, 4).map((a: any, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.type === 'register' ? 'bg-emerald-500' : a.type === 'appointment' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-700 truncate">{a.description}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{a.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
