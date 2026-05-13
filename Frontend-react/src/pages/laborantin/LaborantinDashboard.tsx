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
    <div className="animate-fade-in space-y-8 lg:space-y-10">
      {/* ── Header Laboratoire Premium ────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="relative z-10 flex-1">
          <Badge className="bg-cyan-50 text-cyan-700 border-cyan-100 font-bold px-3 mb-4 uppercase tracking-wider text-[10px]">Unité Biologique</Badge>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Plateforme de Laboratoire
          </h1>
          <p className="text-slate-500 mt-2 max-w-xl leading-relaxed">
            Gérez les prélèvements, saisissez les résultats d'analyses et validez les rapports biologiques de vos patients.
          </p>
        </div>
        <div className="relative z-10 w-20 h-20 bg-cyan-50 rounded-2xl flex items-center justify-center border border-cyan-100">
           <FlaskConical className="w-10 h-10 text-cyan-600" />
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-50/50 rounded-full translate-x-1/4 -translate-y-1/4 blur-3xl -z-0" />
      </div>

      {/* ── Statistiques Labo ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Analyses en attente', value: pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Analyses clôturées', value: finished, icon: FileCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Dernière activité', value: 'Aujourd\'hui', icon: History, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
            <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center shrink-0`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Actions Métier SaaS ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          { 
            title: 'Analyses en cours', 
            desc: 'Traitez les nouvelles demandes reçues.', 
            icon: Clock, 
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            href: '/laborantin/pending',
          },
          { 
            title: 'Historique Labo', 
            desc: 'Consultez les analyses déjà traitées.', 
            icon: History, 
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            href: '/laborantin/finished',
          },
          { 
            title: 'Messagerie', 
            desc: 'Communiquez avec les prescripteurs.', 
            icon: MessageCircle, 
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            href: '/laborantin/messagerie',
          },
        ].map((service, i) => (
          <Link 
            key={i} 
            to={service.href} 
            className="group bg-white p-8 rounded-2xl border border-slate-200 hover:border-cyan-200 hover:shadow-xl transition-all h-full flex flex-col"
          >
            <div className={`w-14 h-14 ${service.bg} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
               <service.icon className={`w-7 h-7 ${service.color}`} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{service.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-medium mb-6 flex-1">
              {service.desc}
            </p>
            <div className="flex items-center gap-2 text-cyan-600 text-sm font-bold opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
              <span>Traiter</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
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
