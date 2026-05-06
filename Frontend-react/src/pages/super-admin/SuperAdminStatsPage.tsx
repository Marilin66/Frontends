// @ts-nocheck
import { useState, useEffect } from 'react';
import { api, endpoints } from '@/services/api';
import { Card, CardHeader, CardContent, PageLoader } from '@/components/ui';
import { TrendingUp, Users, Building, Calendar, Activity, MessageCircle } from 'lucide-react';

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
    { label: 'Hôpitaux actifs', value: stats?.total_hopitaux ?? 0, icon: Building, color: 'text-blue-600 bg-blue-50' },
    { label: 'Médecins', value: stats?.total_medecins ?? 0, icon: Users, color: 'text-green-600 bg-green-50' },
    { label: 'Patients', value: stats?.total_patients ?? 0, icon: Users, color: 'text-violet-600 bg-violet-50' },
    { label: 'Rendez-vous', value: stats?.total_rdv ?? 0, icon: Calendar, color: 'text-amber-600 bg-amber-50' },
    { label: 'Utilisateurs actifs', value: stats?.active_users ?? 0, icon: Activity, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Messages', value: stats?.total_messages ?? 0, icon: MessageCircle, color: 'text-cyan-600 bg-cyan-50' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Statistiques globales</h1>
        <p className="text-sm text-slate-500 mt-0.5">Vue d'ensemble du réseau national de santé</p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m, i) => (
          <Card key={i} className="p-5">
            <div className={`w-10 h-10 rounded-xl ${m.color} flex items-center justify-center mb-3`}>
              <m.icon className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{m.value}</p>
            <p className="text-sm text-slate-500 mt-1">{m.label}</p>
          </Card>
        ))}
      </div>

      {/* Activity chart */}
      {stats?.daily_logins && (
        <Card>
          <CardHeader>
            <p className="font-semibold text-slate-900">Connexions — 7 derniers jours</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-40">
              {stats.daily_logins.map((d: any, i: number) => {
                const max = Math.max(...stats.daily_logins.map((x: any) => x.count), 1);
                const pct = (d.count / max) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">{d.count}</span>
                    <div className="w-full flex items-end" style={{ height: '100px' }}>
                      <div
                        className="w-full bg-primary/20 hover:bg-primary rounded-t-lg transition-all"
                        style={{ height: `${Math.max(pct, 4)}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">{d.day}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System performance */}
      {stats?.system_performance && (
        <Card>
          <CardHeader>
            <p className="font-semibold text-slate-900">Performance système</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'CPU', value: stats.system_performance.cpu },
                { label: 'Mémoire RAM', value: stats.system_performance.memory },
                { label: 'Stockage', value: stats.system_performance.storage },
                { label: 'Réseau', value: stats.system_performance.network },
              ].map((m, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-600">{m.label}</span>
                    <span className="font-semibold text-slate-900">{m.value}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${m.value > 80 ? 'bg-red-500' : m.value > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${m.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent activity */}
      {stats?.recent_activity?.length > 0 && (
        <Card>
          <CardHeader>
            <p className="font-semibold text-slate-900">Activité récente</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recent_activity.map((a: any, i: number) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.type === 'register' ? 'bg-emerald-500' : a.type === 'appointment' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700">{a.description}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{a.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
