// @ts-nocheck
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api, endpoints } from '@/services/api';
import { Avatar, Badge, Button, PageLoader } from '@/components/ui';
import {
  Users, UserPlus, Settings, TrendingUp, ChevronRight,
  Activity, Stethoscope, AlertCircle, MessageSquare,
  Building, Clock, BarChart2
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [recentDoctors, setRecentDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(endpoints.hopitalStatistiques),
      api.get(endpoints.medecins),
    ]).then(([s, d]: any) => {
      setStats(s);
      const docs = Array.isArray(d) ? d : d.results || [];
      setRecentDoctors(docs.slice(0, 5));
    }).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <PageLoader />;

  const statCards = [
    { label: 'Médecins actifs',  value: stats?.total_medecins ?? 0,  icon: Stethoscope, color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-100',   href: '/admin-hopital/medecins' },
    { label: 'Services actifs',  value: stats?.total_services ?? 0,  icon: Activity,    color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100', href: '/admin-hopital/services' },
    { label: 'Rendez-vous',      value: stats?.total_rdv ?? 0,       icon: TrendingUp,  color: 'text-emerald-600',bg: 'bg-emerald-50',border: 'border-emerald-100',href: null },
    { label: 'En attente',       value: stats?.rdv_en_attente ?? 0,  icon: Clock,       color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-100',  href: null },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-20">

      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {user?.hopital_nom || 'Tableau de bord'}
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Administration de l'établissement hospitalier</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/admin-hopital/services')}
            className="flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            <Activity className="w-4 h-4" /> Services
          </button>
          <button
            onClick={() => navigate('/admin-hopital/demandes')}
            className="flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            <MessageSquare className="w-4 h-4" /> Demandes
          </button>
          <Button
            onClick={() => navigate('/admin-hopital/medecins')}
            className="h-10 px-4 rounded-xl text-sm font-semibold"
          >
            <UserPlus className="w-4 h-4 mr-2" /> + Nouveau médecin
          </Button>
        </div>
      </section>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            onClick={() => s.href && navigate(s.href)}
            className={`bg-white rounded-2xl border border-slate-200 p-5 transition-all ${s.href ? 'cursor-pointer hover:shadow-md hover:border-slate-300' : ''}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              {s.href && <ChevronRight className="w-4 h-4 text-slate-300" />}
            </div>
            <p className="text-3xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs font-medium text-slate-600 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Médecins — 2/3 */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <h2 className="font-semibold text-slate-900">Corps médical</h2>
              <span className="text-xs px-2.5 py-1 rounded-full border border-slate-200 text-slate-500 font-medium">{recentDoctors.length}</span>
            </div>
            <Link to="/admin-hopital/medecins" className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 transition">
              Gérer <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {recentDoctors.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {recentDoctors.map((doc: any, i: number) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors"
                >
                  <Avatar
                    name={`${doc.first_name || doc.user?.first_name} ${doc.last_name || doc.user?.last_name}`}
                    size="md"
                    className="flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      Dr. {doc.first_name || doc.user?.first_name} {doc.last_name || doc.user?.last_name}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {doc.specialite || doc.specialite_nom || 'Médecin généraliste'}
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${doc.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                    {doc.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-16 text-center">
              <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-medium text-sm">Aucun médecin enregistré</p>
              <Button size="sm" className="mt-4 h-10 px-4 rounded-xl text-sm font-semibold" onClick={() => navigate('/admin-hopital/medecins')}>
                <UserPlus className="w-4 h-4 mr-2" /> Ajouter un médecin
              </Button>
            </div>
          )}
        </div>

        {/* Colonne droite — 1/3 */}
        <div className="space-y-4">

          {/* Alerte RDV en attente */}
          {(stats?.rdv_en_attente ?? 0) > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-sm font-semibold text-amber-800">RDV en attente</p>
              </div>
              <p className="text-3xl font-bold text-amber-700">{stats.rdv_en_attente}</p>
              <p className="text-xs text-amber-600 mt-1">Nécessitent une confirmation</p>
            </div>
          )}

          {/* Accès rapide */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-3 text-sm">Accès rapide</h3>
            <div className="space-y-0.5">
              {[
                { icon: Stethoscope, label: 'Médecins',     href: '/admin-hopital/medecins',    color: 'text-blue-600 bg-blue-50' },
                { icon: Activity,    label: 'Services',     href: '/admin-hopital/services',    color: 'text-violet-600 bg-violet-50' },
                { icon: Users,       label: 'Laborantins',  href: '/admin-hopital/laborantins', color: 'text-cyan-600 bg-cyan-50' },
                { icon: AlertCircle, label: 'Demandes',     href: '/admin-hopital/demandes',    color: 'text-amber-600 bg-amber-50' },
                { icon: Users,       label: 'Patients',     href: '/admin-hopital/patients',    color: 'text-emerald-600 bg-emerald-50' },
                { icon: BarChart2,   label: 'Statistiques', href: '/admin-hopital/stats',       color: 'text-rose-600 bg-rose-50' },
                { icon: MessageSquare, label: 'Messages',   href: '/admin-hopital/messages',    color: 'text-indigo-600 bg-indigo-50' },
              ].map((item, i) => (
                <Link key={i} to={item.href}>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
                    <div className={`w-8 h-8 ${item.color.split(' ')[1]} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <item.icon className={`w-4 h-4 ${item.color.split(' ')[0]}`} />
                    </div>
                    <span className="text-sm font-medium text-slate-700 flex-1">{item.label}</span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Paramètres */}
          <Link to="/admin-hopital/settings">
            <div className="bg-slate-900 rounded-2xl p-5 hover:bg-slate-800 transition-colors cursor-pointer group">
              <Settings className="w-5 h-5 text-slate-400 mb-2 group-hover:text-white transition-colors" />
              <p className="text-sm font-semibold text-white">Paramètres</p>
              <p className="text-xs text-slate-400 mt-0.5">Configuration de l'établissement</p>
            </div>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
