// @ts-nocheck
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api, endpoints } from '@/services/api';
import { Card, CardHeader, CardContent, Avatar, Badge, Button, StatusBadge, PageLoader } from '@/components/ui';
import {
  Calendar, FileText, MessageCircle, Search, Clock,
  ArrowRight, Plus, MapPin, ChevronRight, Bot,
  Activity, Phone, TrendingUp, Star, Zap
} from 'lucide-react';

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(endpoints.rendezVous),
      api.get(endpoints.resultats),
    ]).then(([appData, resData]: any) => {
      const apps = Array.isArray(appData) ? appData : appData.results || [];
      const res  = Array.isArray(resData)  ? resData  : resData.results  || [];
      setAppointments(apps.slice(0, 4));
      setResults(res.slice(0, 3));
    }).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Hero banner ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-8 lg:p-10 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-white rounded-full translate-y-1/2" />
        </div>
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1">Bonjour 👋</p>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
              {user?.first_name} {user?.last_name}
            </h1>
            <p className="text-blue-100 mt-2 text-base">
              Comment pouvons-nous vous aider aujourd'hui ?
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/patient/search')}
              className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-lg"
              leftIcon={<Search className="w-4 h-4" />}
            >
              Trouver un médecin
            </Button>
            <Button
              onClick={() => navigate('/patient/ai-agent')}
              className="bg-blue-500 text-white hover:bg-blue-400 border border-blue-400"
              leftIcon={<Bot className="w-4 h-4" />}
            >
              Assistant IA
            </Button>
          </div>
        </div>
      </div>

      {/* ── Actions rapides ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Search,      label: 'Trouver un médecin', sub: 'Recherche',       href: '/patient/search',       color: 'text-blue-600',   bg: 'bg-blue-50' },
          { icon: Calendar,    label: 'Mes rendez-vous',    sub: `${appointments.length} RDV`, href: '/patient/appointments', color: 'text-violet-600', bg: 'bg-violet-50' },
          { icon: FileText,    label: 'Mes résultats',      sub: `${results.length} résultat${results.length > 1 ? 's' : ''}`, href: '/patient/results', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { icon: MapPin,      label: 'Hôpitaux proches',   sub: 'Carte GPS',       href: '/patient/nearby',       color: 'text-amber-600',  bg: 'bg-amber-50' },
        ].map((a) => (
          <Link key={a.href} to={a.href}>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-card-md hover:border-slate-300 transition-all group cursor-pointer">
              <div className={`w-11 h-11 ${a.bg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <a.icon className={`w-5 h-5 ${a.color}`} />
              </div>
              <p className="font-semibold text-slate-900 text-sm">{a.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{a.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Contenu principal ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Rendez-vous — 2/3 */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Prochains rendez-vous</h2>
            <Link to="/patient/appointments" className="text-sm text-primary hover:text-primary-dark font-medium flex items-center gap-1 transition-colors">
              Voir tout <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {appointments.length > 0 ? (
            <div className="space-y-3">
              {appointments.map((apt: any) => (
                <div key={apt.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 hover:shadow-card-md hover:border-slate-300 transition-all">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{apt.medecin_nom || apt.doctor_name}</p>
                    <p className="text-sm text-slate-500">{apt.specialite_nom || apt.service_name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-slate-900">{apt.heure}</p>
                    <p className="text-xs text-slate-400">{apt.date}</p>
                  </div>
                  <StatusBadge status={apt.statut} />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
              <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="font-medium text-slate-500">Aucun rendez-vous</p>
              <p className="text-sm text-slate-400 mt-1">Prenez votre premier rendez-vous</p>
              <Button size="sm" className="mt-4" onClick={() => navigate('/patient/search')} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Prendre un RDV
              </Button>
            </div>
          )}
        </div>

        {/* Colonne droite — 1/3 */}
        <div className="space-y-4">

          {/* Résultats récents */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-slate-900">Résultats récents</h2>
              <Link to="/patient/results" className="text-sm text-primary hover:text-primary-dark font-medium transition-colors">
                Voir tout
              </Link>
            </div>
            {results.length > 0 ? (
              <div className="space-y-2">
                {results.map((r: any) => (
                  <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-3.5 flex items-center gap-3 hover:shadow-card transition-shadow">
                    <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{r.type_analyse || r.titre}</p>
                      <p className="text-xs text-slate-400">{r.date_analyse || r.date_resultat}</p>
                    </div>
                    <Badge variant="success" size="sm">Prêt</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
                <p className="text-sm text-slate-400">Aucun résultat disponible</p>
              </div>
            )}
          </div>

          {/* Assistant IA */}
          <div
            onClick={() => navigate('/patient/ai-agent')}
            className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 cursor-pointer hover:from-slate-800 hover:to-slate-700 transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Assistant IA Santé</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <p className="text-xs text-slate-400">En ligne 24h/24</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Posez vos questions médicales, analysez vos symptômes ou comprenez vos résultats.
            </p>
            <div className="flex items-center gap-1 text-xs text-primary font-medium">
              Démarrer une consultation <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Urgence */}
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-700">Urgence médicale</p>
              <a href="tel:113" className="text-2xl font-bold text-red-600 hover:text-red-700 transition-colors">113</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
