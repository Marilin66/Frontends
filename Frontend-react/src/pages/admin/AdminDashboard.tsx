// @ts-nocheck
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api, endpoints } from '@/services/api';
import { Card, CardHeader, CardContent, Avatar, Badge, Button, PageLoader } from '@/components/ui';
import {
  Users, UserPlus, Settings, TrendingUp, ChevronRight,
  Activity, Stethoscope, LayoutDashboard, AlertCircle,
  MessageSquare, ArrowRight, Building, Clock, CheckCircle, BarChart2
} from 'lucide-react';

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
    { label: 'Médecins actifs',  value: stats?.total_medecins ?? 0,  icon: Stethoscope, color: 'text-blue-600',   bg: 'bg-blue-50',   trend: '+3 ce mois' },
    { label: 'Services actifs',  value: stats?.total_services ?? 0,  icon: Activity,    color: 'text-violet-600', bg: 'bg-violet-50', trend: 'Tous opérationnels' },
    { label: 'Rendez-vous',      value: stats?.total_rdv ?? 0,       icon: TrendingUp,  color: 'text-emerald-600',bg: 'bg-emerald-50',trend: '+12% ce mois' },
    { label: 'En attente',       value: stats?.rdv_en_attente ?? 0,  icon: Clock,       color: 'text-amber-600',  bg: 'bg-amber-50',  trend: 'À traiter' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{user?.hopital_nom || 'Tableau de bord'}</h1>
          <p className="text-slate-500 mt-1">Administration de l'établissement hospitalier</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/admin-hopital/services')}
            leftIcon={<Activity className="w-4 h-4" />}
          >
            Services
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/admin-hopital/demandes')}
            leftIcon={<MessageSquare className="w-4 h-4" />}
          >
            Demandes
          </Button>
          <Button
            onClick={() => navigate('/admin-hopital/medecins')}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Nouveau médecin
          </Button>
        </div>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-card-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <span className="text-xs text-slate-400">{s.trend}</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{s.value}</p>
            <p className="text-sm text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Contenu principal ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Liste médecins — 2/3 */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-400" />
                <h2 className="font-semibold text-slate-900">Corps médical</h2>
                <Badge variant="secondary" size="sm">{recentDoctors.length}</Badge>
              </div>
              <Link to="/admin-hopital/medecins" className="text-sm text-primary hover:text-primary-dark font-medium flex items-center gap-1 transition-colors">
                Gérer <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {recentDoctors.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {recentDoctors.map((doc: any) => (
                  <div key={doc.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                    <Avatar
                      name={`${doc.first_name || doc.user?.first_name} ${doc.last_name || doc.user?.last_name}`}
                      size="md"
                      className="flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        Dr. {doc.first_name || doc.user?.first_name} {doc.last_name || doc.user?.last_name}
                      </p>
                      <p className="text-sm text-slate-500 truncate">{doc.specialite || doc.specialite_nom || 'Médecin généraliste'}</p>
                    </div>
                    <Badge variant={doc.is_active ? 'success' : 'warning'} size="sm">
                      {doc.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Aucun médecin enregistré</p>
                <Button size="sm" className="mt-4" onClick={() => navigate('/admin-hopital/medecins')} leftIcon={<UserPlus className="w-3.5 h-3.5" />}>
                  Ajouter un médecin
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Colonne droite — 1/3 */}
        <div className="space-y-4">

          {/* Alerte RDV en attente */}
          {(stats?.rdv_en_attente ?? 0) > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <p className="font-semibold text-amber-800">RDV en attente</p>
              </div>
              <p className="text-3xl font-bold text-amber-700">{stats.rdv_en_attente}</p>
              <p className="text-sm text-amber-600 mt-1">Nécessitent une confirmation</p>
            </div>
          )}

          {/* Raccourcis */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Accès rapide</h3>
            <div className="space-y-2">
              {[
                { icon: Stethoscope, label: 'Gérer les médecins',    href: '/admin-hopital/medecins',    color: 'text-blue-600 bg-blue-50' },
                { icon: Activity,    label: 'Gérer les services',     href: '/admin-hopital/services',    color: 'text-violet-600 bg-violet-50' },
                { icon: Users,       label: 'Gérer les laborantins',  href: '/admin-hopital/laborantins', color: 'text-cyan-600 bg-cyan-50' },
                { icon: AlertCircle, label: 'Demandes de service',    href: '/admin-hopital/demandes',    color: 'text-amber-600 bg-amber-50' },
                { icon: Users,       label: 'Patients',               href: '/admin-hopital/patients',    color: 'text-emerald-600 bg-emerald-50' },
                { icon: BarChart2,   label: 'Statistiques',           href: '/admin-hopital/stats',       color: 'text-rose-600 bg-rose-50' },
                { icon: MessageSquare, label: 'Messages',             href: '/admin-hopital/messages',    color: 'text-indigo-600 bg-indigo-50' },
              ].map((item, i) => (
                <Link key={i} to={item.href}>
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
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
              <Settings className="w-6 h-6 text-slate-400 mb-3 group-hover:text-white transition-colors" />
              <p className="font-semibold text-white">Paramètres</p>
              <p className="text-sm text-slate-400 mt-1">Configuration de l'établissement</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
