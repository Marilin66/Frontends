// @ts-nocheck
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api, endpoints } from '@/services/api';
import { Avatar, Badge, Button, PageLoader } from '@/components/ui';
import {
  Calendar, Users, Clock, CheckCircle, XCircle,
  ChevronRight, Award, FileText, MessageCircle,
  Stethoscope, RefreshCw, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

function statusColor(s: string) {
  const m: Record<string, string> = {
    en_attente: 'bg-amber-50 text-amber-700 border-amber-200',
    confirme:   'bg-blue-50 text-blue-700 border-blue-200',
    termine:    'bg-emerald-50 text-emerald-700 border-emerald-200',
    annule:     'bg-slate-100 text-slate-500 border-slate-200',
    refuse:     'bg-red-50 text-red-600 border-red-200',
  };
  return m[s] ?? 'bg-slate-100 text-slate-500 border-slate-200';
}

function statusLabel(s: string) {
  const m: Record<string, string> = {
    en_attente: 'En attente', confirme: 'Confirmé',
    termine: 'Terminé', annule: 'Annulé', refuse: 'Refusé',
  };
  return m[s] ?? s;
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [refuseModal, setRefuseModal] = useState<{ id: number } | null>(null);
  const [refuseComment, setRefuseComment] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const data: any = await api.get(endpoints.rendezVous);
      setAppointments(Array.isArray(data) ? data : data.results || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAction = async (id: number, action: string, extra?: any) => {
    setActionLoading(id);
    try {
      const map: any = {
        confirmer: endpoints.confirmerRdv(id),
        refuser:   endpoints.refuserRdv(id),
        terminer:  endpoints.terminerRdv(id),
      };
      await api.post(map[action], extra);
      fetchData();
    } catch { alert('Erreur lors de la mise à jour.'); }
    finally { setActionLoading(null); }
  };

  const pending   = appointments.filter(a => a.statut === 'en_attente').length;
  const confirmed = appointments.filter(a => a.statut === 'confirme').length;
  const done      = appointments.filter(a => a.statut === 'termine').length;
  const patients  = new Set(appointments.map(a => a.patient_nom)).size;

  // RDV du jour
  const today = new Date().toDateString();
  const todayRdvs = appointments.filter(a => {
    const d = a.date_heure || a.date;
    return d && new Date(d).toDateString() === today;
  });

  if (loading && appointments.length === 0) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Bonjour, Dr. {user?.last_name || user?.first_name} 👋
          </h1>
          <p className="text-slate-500 mt-1">Tableau de bord clinique</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={fetchData} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Actualiser
          </Button>
          <Button variant="outline" onClick={() => navigate('/medecin/agenda')} leftIcon={<Calendar className="w-4 h-4" />}>
            Mon agenda
          </Button>
          <Button onClick={() => navigate('/medecin/consultations')} leftIcon={<Stethoscope className="w-4 h-4" />}>
            Consultations
          </Button>
        </div>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'En attente',       value: pending,   icon: Clock,         color: 'text-amber-600',   bg: 'bg-amber-50',   href: '/medecin/agenda' },
          { label: 'Confirmés',        value: confirmed, icon: CheckCircle,   color: 'text-blue-600',    bg: 'bg-blue-50',    href: '/medecin/agenda' },
          { label: 'Terminés',         value: done,      icon: Award,         color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/medecin/consultations' },
          { label: 'Patients uniques', value: patients,  icon: Users,         color: 'text-violet-600',  bg: 'bg-violet-50',  href: '/medecin/patients' },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => navigate(s.href)}
            className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-card-md transition-all cursor-pointer hover:border-slate-300"
          >
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-4`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-3xl font-bold text-slate-900">{s.value}</p>
            <p className="text-sm text-slate-500 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── RDV en attente (actions urgentes) ───────────────────────── */}
      {pending > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-800">
              {pending} rendez-vous en attente de confirmation
            </span>
          </div>
          <div className="space-y-2">
            {appointments.filter(a => a.statut === 'en_attente').slice(0, 3).map((apt: any) => {
              const dateStr = apt.date_heure || apt.date;
              return (
                <div key={apt.id} className="bg-white rounded-xl px-4 py-3 flex items-center gap-3 border border-amber-100">
                  <Avatar name={apt.patient_nom} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">{apt.patient_nom}</p>
                    <p className="text-xs text-slate-500">
                      {dateStr ? new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                      {apt.motif ? ` · ${apt.motif}` : ''}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => { setRefuseModal({ id: apt.id }); setRefuseComment(''); }}
                      disabled={actionLoading === apt.id}
                      className="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-50"
                      title="Refuser"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAction(apt.id, 'confirmer')}
                      disabled={actionLoading === apt.id}
                      className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center hover:bg-emerald-100 transition-colors disabled:opacity-50"
                      title="Confirmer"
                    >
                      {actionLoading === apt.id
                        ? <div className="w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                        : <CheckCircle className="w-4 h-4" />
                      }
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tous les RDV ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-400" />
            <h2 className="font-semibold text-slate-900">Tous les rendez-vous</h2>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
              {appointments.length}
            </span>
          </div>
          <Link to="/medecin/agenda" className="text-sm text-primary hover:text-primary-dark font-medium flex items-center gap-1 transition-colors">
            Agenda complet <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {appointments.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {appointments.slice(0, 10).map((apt: any) => {
              const dateStr = apt.date_heure || apt.date;
              return (
                <div key={apt.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors">
                  {/* Date/heure */}
                  <div className="w-14 text-center shrink-0">
                    <p className="text-sm font-bold text-slate-900">
                      {dateStr ? new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {dateStr ? new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : ''}
                    </p>
                  </div>

                  <div className="w-px h-8 bg-slate-100 shrink-0" />

                  {/* Patient */}
                  <Avatar name={apt.patient_nom} size="sm" className="shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm truncate">{apt.patient_nom}</p>
                    <p className="text-xs text-slate-400 truncate">{apt.motif || 'Consultation'}</p>
                  </div>

                  {/* Statut */}
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium shrink-0 ${statusColor(apt.statut)}`}>
                    {statusLabel(apt.statut)}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {apt.statut === 'en_attente' && (
                      <>
                        <button
                          onClick={() => { setRefuseModal({ id: apt.id }); setRefuseComment(''); }}
                          disabled={actionLoading === apt.id}
                          className="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-50"
                          title="Refuser"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleAction(apt.id, 'confirmer')}
                          disabled={actionLoading === apt.id}
                          className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center hover:bg-emerald-100 transition-colors disabled:opacity-50"
                          title="Confirmer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    {apt.statut === 'confirme' && (
                      <Button
                        size="sm"
                        onClick={() => handleAction(apt.id, 'terminer')}
                        loading={actionLoading === apt.id}
                      >
                        Terminer
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="font-medium text-slate-500">Aucun rendez-vous</p>
            <p className="text-sm text-slate-400 mt-1">Votre agenda est libre</p>
          </div>
        )}
      </div>

      {/* ── Liens rapides ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: FileText,      label: 'Résultats patients', sub: 'Analyses et bilans',  href: '/medecin/results',    color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { icon: MessageCircle, label: 'Messages',           sub: 'Conversations',        href: '/medecin/messagerie', color: 'text-blue-600',    bg: 'bg-blue-50' },
          { icon: Stethoscope,   label: 'Consultations',      sub: 'Comptes rendus',       href: '/medecin/consultations', color: 'text-violet-600', bg: 'bg-violet-50' },
        ].map((item, i) => (
          <Link key={i} to={item.href}>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-card-md hover:border-slate-300 transition-all group">
              <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <p className="font-semibold text-slate-900">{item.label}</p>
              <p className="text-sm text-slate-400 mt-0.5">{item.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Modal refus ─────────────────────────────────────────────── */}
      {refuseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setRefuseModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Refuser le rendez-vous</h3>
            <p className="text-sm text-slate-500 mb-4">Indiquez le motif du refus (optionnel)</p>
            <textarea
              rows={3}
              value={refuseComment}
              onChange={e => setRefuseComment(e.target.value)}
              placeholder="Ex: Indisponibilité, urgence..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setRefuseModal(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
                Annuler
              </button>
              <button
                onClick={async () => {
                  await handleAction(refuseModal.id, 'refuser', { commentaire: refuseComment });
                  setRefuseModal(null);
                }}
                disabled={actionLoading === refuseModal.id}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50"
              >
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
