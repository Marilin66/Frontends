// @ts-nocheck
// DoctorAgendaPage — Agenda médecin moderne
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api, endpoints } from '@/services/api';
import { Avatar, Button, PageLoader } from '@/components/ui';
import {
  Calendar, Clock, Plus, Trash2, CheckCircle, XCircle,
  RefreshCw, ChevronRight, FileText, Activity, Pill,
  Stethoscope, AlertCircle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const JOURS = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];

function statusColor(s: string) {
  const m: Record<string,string> = {
    en_attente: 'bg-amber-50 text-amber-700 border-amber-200',
    confirme:   'bg-blue-50 text-blue-700 border-blue-200',
    termine:    'bg-emerald-50 text-emerald-700 border-emerald-200',
    annule:     'bg-slate-100 text-slate-500 border-slate-200',
    refuse:     'bg-red-50 text-red-600 border-red-200',
  };
  return m[s] ?? 'bg-slate-100 text-slate-500 border-slate-200';
}
function statusLabel(s: string) {
  const m: Record<string,string> = {
    en_attente:'En attente', confirme:'Confirmé',
    termine:'Terminé', annule:'Annulé', refuse:'Refusé',
  };
  return m[s] ?? s;
}

export default function DoctorAgendaPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'rdv'|'dispos'>('rdv');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [availabilities, setAvailabilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number|null>(null);

  // Modals
  const [showAddDispo, setShowAddDispo] = useState(false);
  const [showRefuse, setShowRefuse] = useState<{id:number}|null>(null);
  const [showIntake, setShowIntake] = useState<any>(null);
  const [refuseComment, setRefuseComment] = useState('');
  const [errorModal, setErrorModal] = useState('');
  const [confirmDeleteDispo, setConfirmDeleteDispo] = useState<number|null>(null);

  // Filtre statut
  const [filterStatut, setFilterStatut] = useState('');

  // Formulaire disponibilité
  const [newDispo, setNewDispo] = useState({ type:'recurrent', jour_semaine:1, heure_debut:'09:00', heure_fin:'17:00' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appData, availData] = await Promise.all([
        api.get(endpoints.rendezVous),
        api.get(endpoints.disponibilites),
      ]);
      setAppointments(Array.isArray(appData) ? appData : (appData as any).results || []);
      setAvailabilities(Array.isArray(availData) ? availData : (availData as any).results || []);
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

  const handleAddDispo = async (e: any) => {
    e.preventDefault();
    try {
      await api.post(endpoints.disponibilites, newDispo);
      setShowAddDispo(false);
      fetchData();
    } catch { setErrorModal('Erreur lors de la création du créneau.'); }
  };

  const handleDeleteDispo = async (id: number) => {
    setConfirmDeleteDispo(null);
    try {
      await api.delete(endpoints.disponibiliteDetail(id));
      fetchData();
    } catch { setErrorModal('Erreur lors de la suppression.'); }
  };

  const filtered = filterStatut
    ? appointments.filter(a => a.statut === filterStatut)
    : appointments;

  if (loading && appointments.length === 0) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mon Agenda</h1>
          <p className="text-slate-500 mt-1">{appointments.length} rendez-vous · {availabilities.length} créneaux</p>
        </div>
        <Button variant="outline" onClick={fetchData} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Actualiser
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {[{k:'rdv',l:'Rendez-vous'},{k:'dispos',l:'Disponibilités'}].map(t => (
          <button key={t.k} onClick={() => setTab(t.k as any)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${tab===t.k?'bg-white text-slate-900 shadow-sm':'text-slate-500 hover:text-slate-700'}`}>
            {t.l}
            {t.k==='rdv' && appointments.filter(a=>a.statut==='en_attente').length > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {appointments.filter(a=>a.statut==='en_attente').length}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── Onglet RDV ──────────────────────────────────────────── */}
        {tab === 'rdv' && (
          <motion.div key="rdv" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}}>

            {/* Filtre statut */}
            <div className="flex gap-2 flex-wrap mb-4">
              {['','en_attente','confirme','termine','refuse'].map(s => (
                <button key={s} onClick={() => setFilterStatut(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${filterStatut===s?'bg-primary text-white border-primary':'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                  {s===''?'Tous':statusLabel(s)}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-200">
                <Calendar className="w-12 h-12 text-slate-200 mb-4" />
                <p className="font-medium text-slate-500">Aucun rendez-vous</p>
                <p className="text-sm text-slate-400 mt-1">
                  {filterStatut ? `Aucun RDV avec le statut "${statusLabel(filterStatut)}"` : 'Votre agenda est libre'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((apt: any, i: number) => {
                  const dateStr = apt.date_heure || apt.date;
                  const hasIntake = apt.pre_enregistrement;
                  return (
                    <motion.div key={apt.id} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}>
                      <div className="bg-white rounded-2xl border border-slate-200 hover:shadow-card-md transition-all overflow-hidden">
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <Avatar name={apt.patient_nom} size="md" className="shrink-0 mt-0.5" />

                            {/* Infos */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-slate-900">{apt.patient_nom}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColor(apt.statut)}`}>
                                  {statusLabel(apt.statut)}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mt-1 flex-wrap">
                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                  <Clock className="w-3 h-3" />
                                  {dateStr ? new Date(dateStr).toLocaleDateString('fr-FR', {day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—'}
                                </span>
                                {apt.motif && (
                                  <span className="text-xs text-slate-400">· {apt.motif}</span>
                                )}
                              </div>

                              {/* Fiche pré-consultation */}
                              {hasIntake && (
                                <button
                                  onClick={() => setShowIntake(apt.pre_enregistrement)}
                                  className="mt-2 flex items-center gap-1.5 text-xs text-teal-600 font-medium hover:text-teal-700 transition"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  Voir la fiche pré-consultation
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              {apt.statut === 'en_attente' && (
                                <>
                                  <button
                                    onClick={() => { setShowRefuse({id:apt.id}); setRefuseComment(''); }}
                                    disabled={actionLoading === apt.id}
                                    className="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-100 transition disabled:opacity-50"
                                    title="Refuser"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleAction(apt.id, 'confirmer')}
                                    disabled={actionLoading === apt.id}
                                    className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center hover:bg-emerald-100 transition disabled:opacity-50"
                                    title="Confirmer"
                                  >
                                    {actionLoading===apt.id
                                      ? <div className="w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"/>
                                      : <CheckCircle className="w-4 h-4" />
                                    }
                                  </button>
                                </>
                              )}
                              {apt.statut === 'confirme' && (
                                <Button size="sm" onClick={() => handleAction(apt.id,'terminer')} loading={actionLoading===apt.id}>
                                  Terminer
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ── Onglet Disponibilités ────────────────────────────────── */}
        {tab === 'dispos' && (
          <motion.div key="dispos" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-slate-500">{availabilities.length} créneau(x) configuré(s)</p>
              <Button onClick={() => setShowAddDispo(true)} leftIcon={<Plus className="w-4 h-4" />}>
                Ajouter un créneau
              </Button>
            </div>

            {availabilities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-200">
                <Clock className="w-12 h-12 text-slate-200 mb-4" />
                <p className="font-medium text-slate-500">Aucune disponibilité configurée</p>
                <p className="text-sm text-slate-400 mt-1">Ajoutez vos créneaux pour que les patients puissent prendre rendez-vous</p>
                <Button className="mt-4" onClick={() => setShowAddDispo(true)} leftIcon={<Plus className="w-4 h-4" />}>
                  Ajouter un créneau
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {availabilities.map((dispo: any, i: number) => (
                  <motion.div key={dispo.id} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}>
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-card-md transition-all group">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-slate-900">
                          {dispo.jour_semaine_display || JOURS[dispo.jour_semaine] || `Jour ${dispo.jour_semaine}`}
                        </span>
                        <button
                          onClick={() => setConfirmDeleteDispo(dispo.id)}
                          className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center transition opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 text-center bg-slate-50 rounded-xl py-2">
                          <p className="text-xs text-slate-400 mb-0.5">Début</p>
                          <p className="text-lg font-bold text-slate-900">{dispo.heure_debut}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                        <div className="flex-1 text-center bg-slate-50 rounded-xl py-2">
                          <p className="text-xs text-slate-400 mb-0.5">Fin</p>
                          <p className="text-lg font-bold text-slate-900">{dispo.heure_fin}</p>
                        </div>
                      </div>
                      {dispo.type && (
                        <p className="text-xs text-slate-400 text-center mt-2 capitalize">{dispo.type}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal Ajouter disponibilité ──────────────────────────────── */}
      <AnimatePresence>
        {showAddDispo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowAddDispo(false)} />
            <motion.div initial={{opacity:0,scale:0.96,y:12}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.96}}
              className="relative bg-white rounded-2xl shadow-modal w-full max-w-md">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Ajouter un créneau</h3>
                <button onClick={() => setShowAddDispo(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <form onSubmit={handleAddDispo} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                  <select value={newDispo.type} onChange={e => setNewDispo(d=>({...d,type:e.target.value}))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="recurrent">Récurrent (chaque semaine)</option>
                    <option value="exception">Exceptionnel (jour précis)</option>
                    <option value="indisponible">Indisponibilité</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Jour de la semaine</label>
                  <select value={newDispo.jour_semaine} onChange={e => setNewDispo(d=>({...d,jour_semaine:parseInt(e.target.value)}))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {JOURS.map((j,i) => <option key={i} value={i}>{j}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Heure de début</label>
                    <input type="time" value={newDispo.heure_debut} onChange={e => setNewDispo(d=>({...d,heure_debut:e.target.value}))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Heure de fin</label>
                    <input type="time" value={newDispo.heure_fin} onChange={e => setNewDispo(d=>({...d,heure_fin:e.target.value}))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddDispo(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
                    Annuler
                  </button>
                  <button type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition">
                    Enregistrer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal Refus ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showRefuse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowRefuse(null)} />
            <motion.div initial={{opacity:0,scale:0.96,y:12}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.96}}
              className="relative bg-white rounded-2xl shadow-modal w-full max-w-md p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Refuser le rendez-vous</h3>
              <p className="text-sm text-slate-500 mb-4">Motif du refus (optionnel)</p>
              <textarea rows={3} value={refuseComment} onChange={e => setRefuseComment(e.target.value)}
                placeholder="Ex: Indisponibilité, urgence..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowRefuse(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
                  Annuler
                </button>
                <button
                  onClick={async () => {
                    await handleAction(showRefuse.id, 'refuser', { commentaire: refuseComment });
                    setShowRefuse(null);
                  }}
                  disabled={actionLoading === showRefuse.id}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50">
                  Confirmer le refus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal Fiche pré-consultation ─────────────────────────────── */}
      <AnimatePresence>
        {showIntake && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowIntake(null)} />
            <motion.div initial={{opacity:0,scale:0.96,y:12}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.96}}
              className="relative bg-white rounded-2xl shadow-modal w-full max-w-lg">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Fiche pré-consultation</h3>
                </div>
                <button onClick={() => setShowIntake(null)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { icon: Activity, label: 'Symptômes principaux', key: 'symptomes_principaux', color: 'text-red-500' },
                  { icon: AlertCircle, label: 'Début des symptômes', key: 'debut_symptomes', color: 'text-orange-500' },
                  { icon: Pill, label: 'Traitements en cours', key: 'traitements_en_cours', color: 'text-blue-500' },
                  { icon: FileText, label: 'Observations', key: 'observations', color: 'text-purple-500' },
                ].map(({ icon: Icon, label, key, color }) => (
                  <div key={key}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Icon className={`w-3.5 h-3.5 ${color}`} />
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
                    </div>
                    <p className="text-sm text-slate-800 bg-slate-50 rounded-xl px-4 py-3 leading-relaxed">
                      {showIntake[key] || <span className="text-slate-400 italic">Non renseigné</span>}
                    </p>
                  </div>
                ))}
                <button onClick={() => setShowIntake(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition mt-2">
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal confirmation suppression dispo ─────────────────────── */}
      <AnimatePresence>
        {confirmDeleteDispo !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setConfirmDeleteDispo(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-red-50 border border-red-100 rounded-xl mx-auto">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-base font-semibold text-slate-900">Supprimer ce créneau ?</h3>
                <p className="text-sm text-slate-500">Cette disponibilité sera définitivement supprimée.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDeleteDispo(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
                  Annuler
                </button>
                <button onClick={() => handleDeleteDispo(confirmDeleteDispo)} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" /> Supprimer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal erreur ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {errorModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setErrorModal('')}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-red-50 border border-red-100 rounded-xl mx-auto">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-base font-semibold text-slate-900">Erreur</h3>
                <p className="text-sm text-slate-500">{errorModal}</p>
              </div>
              <button onClick={() => setErrorModal('')} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition">
                Fermer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}