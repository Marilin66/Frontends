// @ts-nocheck
import { useState, useEffect } from 'react';
import { api, endpoints } from '@/services/api';
import { Card, PageLoader } from '@/components/ui';
import { BarChart2, Users, Activity, Calendar, Clock, RefreshCw, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminStatsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data: any = await api.get(endpoints.hopitalStatistiques);
      setStats(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading && !stats) return <PageLoader />;

  const statCards = [
    { label: 'Médecins actifs',   value: stats?.total_medecins ?? 0,  icon: Users,     color: 'text-blue-600',   bg: 'bg-blue-50' },
    { label: 'Services proposés', value: stats?.total_services ?? 0,  icon: Activity,  color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Total RDV',         value: stats?.total_rdv ?? 0,       icon: Calendar,  color: 'text-emerald-600',bg: 'bg-emerald-50' },
    { label: 'RDV en attente',    value: stats?.rdv_en_attente ?? 0,  icon: Clock,     color: 'text-amber-600',  bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Statistiques</h1>
          <p className="text-slate-500 mt-1">Vue d'ensemble de votre établissement</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
        >
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
      </div>

      {/* Alert demandes en attente */}
      {(stats?.demandes_en_attente ?? 0) > 0 && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 text-amber-800"
        >
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />
          <p className="text-sm font-medium">
            {stats.demandes_en_attente} demande{stats.demandes_en_attente > 1 ? 's' : ''} de service en attente de validation.
          </p>
        </motion.div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-card-md transition-shadow">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-4`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className="text-3xl font-bold text-slate-900">{s.value}</p>
              <p className="text-sm text-slate-500 mt-1">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Rendez-vous */}
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Calendar className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Rendez-vous</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Total',       value: stats?.total_rdv ?? 0,       color: 'text-slate-900' },
              { label: 'En attente',  value: stats?.rdv_en_attente ?? 0,  color: 'text-amber-600' },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <span className="text-sm text-slate-600">{row.label}</span>
                <span className={`text-lg font-bold ${row.color}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Équipe */}
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Équipe médicale</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Médecins actifs',   value: stats?.total_medecins ?? 0 },
              { label: 'Services proposés', value: stats?.total_services ?? 0 },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <span className="text-sm text-slate-600">{row.label}</span>
                <span className="text-lg font-bold text-slate-900">{row.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
