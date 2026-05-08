// @ts-nocheck
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, endpoints } from '@/services/api';
import { Badge, Button, Avatar, PageLoader } from '@/components/ui';
import { FlaskConical, Clock, CheckCircle, ChevronRight, History, MessageCircle, FileCheck } from 'lucide-react';

export default function LaborantinDashboard() {
  const [demandes, setDemandes] = useState([]);
  const [resultats, setResultats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(endpoints.demandesAnalyse),
      api.get(endpoints.resultats),
    ]).then(([d, r]: any) => {
      setDemandes(Array.isArray(d) ? d : d.results || []);
      setResultats(Array.isArray(r) ? r : r.results || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const pending  = demandes.filter((d: any) => d.statut !== 'cloture').length;
  const finished = resultats.length;

  return (
    <div className="space-y-5 lg:space-y-8 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Console Laboratoire</h1>
        <p className="text-slate-500 mt-1">Gestion des analyses biologiques</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Analyses en attente',   value: pending,  icon: Clock,         color: 'text-amber-600',   bg: 'bg-amber-50',   href: '/laborantin/pending' },
          { label: 'Analyses clôturées',    value: finished, icon: CheckCircle,   color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/laborantin/finished' },
          { label: 'Total demandes',        value: demandes.length, icon: FlaskConical, color: 'text-cyan-600', bg: 'bg-cyan-50', href: null },
        ].map((s, i) => (
          <div
            key={i}
            onClick={() => s.href && (window.location.href = s.href)}
            className={`bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-card-md transition-all ${s.href ? 'cursor-pointer hover:border-slate-300' : ''}`}
          >
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-4`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-3xl font-bold text-slate-900">{s.value}</p>
            <p className="text-sm text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Demandes récentes */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-slate-400" />
            <h2 className="font-semibold text-slate-900">Demandes récentes</h2>
          </div>
          <Link to="/laborantin/pending" className="text-sm text-primary hover:text-primary-dark font-medium flex items-center gap-1 transition-colors">
            Voir tout <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {demandes.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {demandes.slice(0, 5).map((d: any) => (
              <div key={d.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FlaskConical className="w-5 h-5 text-cyan-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{d.patient_prenom} {d.patient_nom}</p>
                  <p className="text-sm text-slate-500">{d.type_analyse}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-slate-400">{d.date_inscription ? new Date(d.date_inscription).toLocaleDateString('fr-FR') : '—'}</p>
                </div>
                <Badge variant={d.statut === 'cloture' ? 'success' : d.statut === 'en_cours' ? 'primary' : 'warning'} size="sm">
                  {d.statut === 'cloture' ? 'Clôturé' : d.statut === 'en_cours' ? 'En cours' : 'En attente'}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <FlaskConical className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500">Aucune demande d'analyse</p>
          </div>
        )}
      </div>

      {/* Liens rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: FlaskConical,  label: 'Analyses en cours',  sub: `${pending} en attente`,  href: '/laborantin/pending',    color: 'text-amber-600 bg-amber-50' },
          { icon: History,       label: 'Archives',           sub: `${finished} clôturées`,  href: '/laborantin/finished',   color: 'text-emerald-600 bg-emerald-50' },
          { icon: MessageCircle, label: 'Messages',           sub: 'Conversations',           href: '/laborantin/messagerie', color: 'text-blue-600 bg-blue-50' },
        ].map((item, i) => (
          <Link key={i} to={item.href}>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-card-md hover:border-slate-300 transition-all group">
              <div className={`w-10 h-10 ${item.color.split(' ')[1]} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <item.icon className={`w-5 h-5 ${item.color.split(' ')[0]}`} />
              </div>
              <p className="font-semibold text-slate-900">{item.label}</p>
              <p className="text-sm text-slate-400 mt-0.5">{item.sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
