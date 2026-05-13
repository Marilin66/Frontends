// @ts-nocheck
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api, endpoints } from '@/services/api';
import { Avatar, Badge, Button, PageLoader } from '@/components/ui';
import {
  Calendar, Users, Clock, CheckCircle, XCircle,
  ChevronRight, Award, FileText, MessageCircle,
  Stethoscope, RefreshCw, AlertCircle, ClipboardList, Activity, TrendingUp
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
  const [errorModal, setErrorModal] = useState('');
  const [showIntake, setShowIntake] = useState<any>(null);

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
    } catch (e: any) {
      const msg = e.response?.data?.error || e.response?.data?.detail || 'Erreur lors de la mise à jour.';
      setErrorModal(msg);
    }
    finally { setActionLoading(null); }
  };

  const pending   = appointments.filter(a => a.statut === 'en_attente').length;
  const confirmed = appointments.filter(a => a.statut === 'confirme').length;
  const uniquePatientsCount = new Set(appointments.map(a => a.patient_id)).size;
  
  const todayApts = appointments.filter(a => {
    const d = a.date_heure || a.date;
    return d && new Date(d).toDateString() === new Date().toDateString();
  });

  if (loading && appointments.length === 0) return <PageLoader />;

  return (
    <div className="animate-fade-in space-y-8 lg:space-y-12">
      
      {/* ── Welcome Header Premium ── */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-primary/10 text-primary border-transparent font-bold uppercase tracking-widest text-[10px]">
              Espace Praticien
            </Badge>
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">En ligne</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Ravi de vous revoir, <span className="text-primary">Dr. {user?.last_name}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Voici l'aperçu de votre activité médicale aujourd'hui.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" onClick={fetchData} className="rounded-xl border-slate-200 h-11 px-4 text-slate-600 hover:bg-slate-50 transition-all">
             <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
           </Button>
           <Button onClick={() => navigate('/medecin/consultations')} className="bg-primary text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-2">
             <Stethoscope className="w-4 h-4" />
             <span>Démarrer consultation</span>
           </Button>
        </div>
      </header>

      {/* ── Key Metrics SaaS ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[
          { label: "RDV du jour", value: todayApts.length, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: "Patients", value: uniquePatientsCount, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: "En attente", value: pending, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: "Confirmés", value: confirmed, icon: CheckCircle, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <TrendingUp className="w-4 h-4 text-slate-200" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ── Priority Actions Drawer ── */}
      {pending > 0 && (
        <section className="bg-slate-900 rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-md">
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <AlertCircle className="text-amber-400 w-5 h-5" />
                Actions requises
              </h2>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                Vous avez {pending} demande{pending > 1 ? 's' : ''} de rendez-vous en attente. Une réponse rapide améliore l'expérience patient.
              </p>
            </div>
            <div className="flex-1 lg:max-w-2xl w-full space-y-3">
              {appointments.filter(a => a.statut === 'en_attente').slice(0, 2).map((apt: any) => (
                <div key={apt.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between group hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <Avatar name={apt.patient_nom} size="sm" className="ring-2 ring-white/10" />
                    <div>
                      <p className="font-bold text-sm text-white">{apt.patient_nom}</p>
                      <p className="text-xs text-slate-400">
                        {apt.date_heure ? new Date(apt.date_heure).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Date non définie'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setRefuseModal({ id: apt.id })}
                      className="w-10 h-10 bg-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl flex items-center justify-center transition-all"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleAction(apt.id, 'confirmer')}
                      className="h-10 px-4 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark transition-all flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Confirmer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Appointments Management ── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* All Appointments Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 lg:p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Prochains rendez-vous</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Planning des prochaines 48 heures</p>
            </div>
            <Link to="/medecin/agenda" className="text-xs font-bold text-primary uppercase tracking-widest hover:text-primary-dark transition-colors">
              Voir l'agenda
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto no-scrollbar">
            {appointments.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-50">
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patient</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date & Heure</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Statut</th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {appointments.slice(0, 8).map((apt: any) => (
                    <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={apt.patient_nom} size="xs" />
                          <div className="min-w-0">
                             <p className="text-sm font-bold text-slate-900 truncate">{apt.patient_nom}</p>
                             <p className="text-[10px] text-slate-400 font-medium truncate">{apt.motif || 'Consultation'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700">
                             {apt.date_heure ? new Date(apt.date_heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                             {apt.date_heure ? new Date(apt.date_heure).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={`${statusColor(apt.statut)} font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-lg border-transparent`}>
                          {statusLabel(apt.statut)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button 
                           onClick={() => navigate(`/medecin/consultation/${apt.id}`)}
                           className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-all"
                         >
                            <ChevronRight className="w-5 h-5" />
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-16 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Calendar className="text-slate-200 w-8 h-8" />
                </div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Aucun rendez-vous</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links & Resources */}
        <div className="space-y-6">
           <div className="bg-white rounded-3xl border border-slate-100 p-6 lg:p-8 shadow-sm">
             <h3 className="text-base font-bold text-slate-900 mb-6">Ressources rapides</h3>
             <div className="space-y-4">
                {[
                  { label: "Mes Patients", sub: "Liste des dossiers", icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-50', href: '/medecin/patients' },
                  { label: "Résultats Labo", sub: "Analyses biologiques", icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-50', href: '/medecin/results' },
                  { label: "Consultations", sub: "Historique & Rapports", icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50', href: '/medecin/consultations' },
                ].map((item, i) => (
                  <Link key={i} to={item.href} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                    <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.label}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{item.sub}</p>
                    </div>
                    <ChevronRight className="ml-auto w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                  </Link>
                ))}
             </div>
           </div>

           <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10 relative overflow-hidden">
              <Activity className="absolute -bottom-6 -right-6 w-32 h-32 text-primary/10 -rotate-12" />
              <div className="relative z-10">
                <h4 className="text-primary font-bold text-sm uppercase tracking-widest mb-4">Support Hopitel</h4>
                <p className="text-slate-600 text-sm font-medium leading-relaxed mb-6">
                  Besoin d'aide avec la plateforme ? Notre équipe technique est disponible 24/7.
                </p>
                <Button className="w-full bg-primary text-white font-bold rounded-xl h-11">
                  Contacter l'assistance
                </Button>
              </div>
           </div>
        </div>
      </section>

      {/* ── Modals ── */}
      {refuseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setRefuseModal(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Refuser le rendez-vous</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium">Indiquez le motif du refus pour informer le patient.</p>
            <textarea
              rows={4}
              value={refuseComment}
              onChange={e => setRefuseComment(e.target.value)}
              placeholder="Ex: Indisponibilité, urgence, erreur de planning..."
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none font-medium mb-6"
            />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setRefuseModal(null)} className="flex-1 rounded-xl h-12 border-slate-200 font-bold text-slate-600">
                Annuler
              </Button>
              <Button
                onClick={async () => {
                  await handleAction(refuseModal.id, 'refuser', { commentaire: refuseComment });
                  setRefuseModal(null);
                }}
                disabled={actionLoading === refuseModal.id}
                className="flex-1 rounded-xl h-12 bg-rose-500 text-white font-bold hover:bg-rose-600 disabled:opacity-50"
              >
                Confirmer le refus
              </Button>
            </div>
          </div>
        </div>
      )}

      {errorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setErrorModal('')}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm p-8 text-center"
          >
            <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-rose-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Opération impossible</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">{errorModal}</p>
            <Button onClick={() => setErrorModal('')} className="w-full h-12 bg-slate-900 text-white font-bold rounded-xl">
              Compris
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
