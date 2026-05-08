// @ts-nocheck
import { useState, useEffect } from 'react';
import { api, endpoints } from '@/services/api';
import { PageLoader } from '@/components/ui';
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
    { label: 'Médecins actifs',   value: stats?.total_medecins ?? 0,  icon: Users,     color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-100' },
    { label: 'Services proposés', value: stats?.total_services ?? 0,  icon: Activity,  color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
    { label: 'Total RDV',         value: stats?.total_rdv ?? 0,       icon: Calendar,  color: 'text-emerald-600',bg: 'bg-emerald-50',border: 'border-emerald-100' },
    { label: 'RDV en attente',    value: stats?.rdv_en_attente ?? 0,  icon: Clock,     color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-100' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-20">

      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Statistiques</h1>
          <p className="text-slate-500 mt-1 text-sm">Vue d'ensemble de votre établissement</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
        >
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
      </section>

      {/* Alert demandes en attente */}
      {(stats?.demandes_en_attente ?? 0) > 0 && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4"
        >
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-sm font-semibold text-amber-800">
            {stats.demandes_en_attente} demande{stats.demandes_en_attente > 1 ? 's' : ''} de service en attente de validation.
          </p>
        </motion.div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <div className={`bg-white rounded-2xl border ${s.border} p-5`}>
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-4`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className="text-3xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs font-medium text-slate-600 mt-1">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Rendez-vous */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Calendar className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Rendez-vous</h3>
          </div>
          <div className="space-y-1">
            {[
              { label: 'Total',       value: stats?.total_rdv ?? 0,       color: 'text-slate-900' },
              { label: 'En attente',  value: stats?.rdv_en_attente ?? 0,  color: 'text-amber-600' },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                <span className="text-xs font-medium text-slate-600">{row.label}</span>
                <span className={`text-2xl font-bold ${row.color}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Équipe */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Équipe médicale</h3>
          </div>
          <div className="space-y-1">
            {[
              { label: 'Médecins actifs',   value: stats?.total_medecins ?? 0 },
              { label: 'Services proposés', value: stats?.total_services ?? 0 },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                <span className="text-xs font-medium text-slate-600">{row.label}</span>
                <span className="text-2xl font-bold text-slate-900">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
