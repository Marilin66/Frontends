
import { useState, useEffect, useRef } from 'react';
import { api, endpoints } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, Button, PageLoader, Pagination, usePagination } from '@/components/ui';
import { ErrorModal, SuccessModal } from '@/components/ui';
import {
  FlaskConical, FileCheck, Clock, X, Upload,
  CheckCircle, AlertCircle, Plus, Search, Mail, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePermissions } from '@/hooks/usePermissions';
import type { DemandeAnalyse, Patient } from '@/types/api';
import { toArray } from '@/types/api';

const PAGE_SIZE = 12;

export default function LaborantinPendingPage() {
  const [demandes, setDemandes] = useState<DemandeAnalyse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Clôture
  const [selectedDemande, setSelectedDemande] = useState<DemandeAnalyse | null>(null);
  const [clotureData, setClotureData] = useState({ titre: '', fichier: null as File | null });
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Création nouvelle demande
  const [showCreate, setShowCreate] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [createForm, setCreateForm] = useState({
    patient: '',
    patient_nom: '', patient_prenom: '', patient_email: '',
    patient_telephone: '', type_analyse: '',
  });
  const [creating, setCreating] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      const data = await api.get(endpoints.demandesAnalyse);
      const all = toArray<DemandeAnalyse>(data);
      setDemandes(all.filter((d) => d.statut !== 'cloture'));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchPatients = async () => {
    try {
      const data = await api.get(endpoints.laborantinPatients);
      setPatients(toArray<Patient>(data));
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchData();
    fetchPatients();
  }, []);

  // Quand un patient inscrit est sélectionné, pré-remplir ses infos
  const handlePatientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setCreateForm(f => ({ ...f, patient: id }));
    if (id) {
      const p = patients.find((p) => String(p.id) === id || String(p.user_id) === id);
      if (p) {
        setCreateForm(f => ({
          ...f,
          patient: id,
          patient_nom: p.last_name || '',
          patient_prenom: p.first_name || '',
          patient_email: p.email || '',
          patient_telephone: p.telephone || '',
        }));
      }
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload: Record<string, string | number> = {
        patient_nom: createForm.patient_nom,
        patient_prenom: createForm.patient_prenom,
        patient_email: createForm.patient_email,
        patient_telephone: createForm.patient_telephone,
        type_analyse: createForm.type_analyse,
      };
      if (createForm.patient) payload.patient = parseInt(createForm.patient);
      await api.post(endpoints.demandesAnalyse, payload);
      setShowCreate(false);
      setCreateForm({ patient: '', patient_nom: '', patient_prenom: '', patient_email: '', patient_telephone: '', type_analyse: '' });
      setSuccessMsg('Patient inscrit avec succès. L\'analyse est en cours.');
      fetchData();
    } catch (e) {
      const data = (e as { response?: { data?: Record<string, unknown> } }).response?.data;
      const msg = (data?.patient_email as string[])?.[0] || (data?.type_analyse as string[])?.[0] || (data?.detail as string) || 'Erreur lors de l\'inscription.';
      setErrorMsg(msg);
    } finally { setCreating(false); }
  };

  const handleCloturer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDemande || !clotureData.fichier) return;
    const body = new FormData();
    body.append('fichier', clotureData.fichier);
    if (clotureData.titre.trim()) body.append('titre', clotureData.titre.trim());
    try {
      setSaving(true);
      const result = await api.post(endpoints.cloturerAnalyse(selectedDemande.id), body) as any;
      setSelectedDemande(null);
      setClotureData({ titre: '', fichier: null });
      const code = (result as any)?.code_acces || '';
      setSuccessMsg(`Analyse clôturée. ${code ? `Code d'accès patient : ${code}` : 'Le patient a été notifié.'}`);
      fetchData();
    } catch (e) {
      const raw = (e as any)?.response?.data;
      const status = (e as any)?.response?.status;

      let msg = 'Erreur lors de la clôture.';

      if (raw) {
        if (typeof raw === 'string' && (raw.includes('<html') || raw.includes('<!doctype'))) {
          msg = `Erreur serveur ${status || 500}. Vérifiez que vous êtes bien le laborantin responsable de cette demande.`;
        } else if (typeof raw === 'object') {
          msg = raw.error || raw.detail || raw.fichier?.[0] || raw.non_field_errors?.[0] ||
                Object.values(raw).flat().join(' ') || msg;
        } else {
          msg = String(raw);
        }
      }

      if (status === 403) msg = 'Non autorisé — vous ne pouvez clôturer que les analyses que vous avez créées.';
      if (status === 404) msg = 'Demande d\'analyse introuvable.';
      if (status === 400 && !msg.includes('clôturée') && msg === 'Erreur lors de la clôture.') {
        msg = 'Format de fichier invalide. Seuls les PDF sont acceptés (max 10 Mo).';
      }

      setErrorMsg(msg);
    } finally { setSaving(false); }
  };

  const filtered = demandes.filter((d) => {
    const q = search.toLowerCase();
    return (
      `${d.patient_prenom} ${d.patient_nom}`.toLowerCase().includes(q) ||
      (d.type_analyse || '').toLowerCase().includes(q)
    );
  });

  const { paged, totalItems, totalPages } = usePagination(filtered, PAGE_SIZE, page);
  const { canInscrireAnalyse, canCloturerAnalyse } = usePermissions();

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analyses en cours</h1>
          <p className="text-sm text-slate-500 mt-0.5">{demandes.length} demande{demandes.length !== 1 ? 's' : ''} à traiter</p>
        </div>
        {canInscrireAnalyse && (
          <Button onClick={() => setShowCreate(true)} leftIcon={<Plus className="w-4 h-4" />}>
            Inscrire un patient
          </Button>
        )}
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher un patient ou une analyse..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full h-10 pl-9 pr-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
        />
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <FlaskConical className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">
            {search ? `Aucun résultat pour "${search}"` : 'Aucune analyse en attente'}
          </p>
          {!search && canInscrireAnalyse && (
            <Button className="mt-4" onClick={() => setShowCreate(true)} leftIcon={<Plus className="w-4 h-4" />}>
              Inscrire un patient
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {paged.map((d, i) => {
            // Vérifie si le labo connecté est bien celui qui a créé cette demande
            // Le backend bloque la clôture si laborantin != user connecté
            const isOwner = !d.laborantin || String(d.laborantin) === String(user?.id);

            return (
            <motion.div key={d.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <div className={`bg-white rounded-2xl border p-5 hover:shadow-md transition-all ${isOwner ? 'border-slate-200' : 'border-slate-100 opacity-80'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOwner ? 'bg-cyan-50' : 'bg-slate-50'}`}>
                      <FlaskConical className={`w-5 h-5 ${isOwner ? 'text-cyan-600' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{d.patient_prenom} {d.patient_nom}</p>
                      <p className="text-xs text-slate-500">{d.type_analyse}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {!isOwner && (
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                        <Lock className="w-2.5 h-2.5" /> Autre labo
                      </span>
                    )}
                    <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                      En cours
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {d.date_inscription ? new Date(d.date_inscription).toLocaleDateString('fr-FR') : '—'}
                  </span>
                  {d.patient_email && (
                    <span className="flex items-center gap-1 truncate max-w-[180px]">
                      <Mail className="w-3 h-3 shrink-0" />
                      <span className="truncate">{d.patient_email}</span>
                    </span>
                  )}
                </div>

                {canCloturerAnalyse && (
                  <div className="flex gap-2">
                    {d.patient_email && (
                      <a
                        href={`mailto:${d.patient_email}`}
                        className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
                      >
                        <Mail className="w-3.5 h-3.5" /> Email
                      </a>
                    )}
                    {isOwner ? (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => { setSelectedDemande(d); setClotureData({ titre: d.type_analyse || '', fichier: null }); }}
                        leftIcon={<FileCheck className="w-4 h-4" />}
                      >
                        Clôturer
                      </Button>
                    ) : (
                      <div className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-slate-50 text-slate-400 text-xs font-medium cursor-not-allowed border border-slate-200">
                        <Lock className="w-3.5 h-3.5" /> Non assigné
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {filtered.length > PAGE_SIZE && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      )}

      {/* ── Modal : Inscrire un patient ─────────────────────────────── */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Inscrire un patient</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Nouvelle demande d'analyse</p>
                </div>
                <button onClick={() => setShowCreate(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 space-y-4">
                {/* Sélection patient inscrit (optionnel) */}
                {patients.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Patient inscrit sur la plateforme (optionnel)
                    </label>
                    <select
                      value={createForm.patient}
                      onChange={handlePatientSelect}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 bg-white"
                    >
                      <option value="">— Saisie manuelle —</option>
                      {patients.map((p) => (
                        <option key={p.id || p.user_id} value={p.id || p.user_id}>
                          {p.first_name} {p.last_name} ({p.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Prénom *</label>
                    <input required value={createForm.patient_prenom} onChange={e => setCreateForm(f => ({ ...f, patient_prenom: e.target.value }))}
                      placeholder="Alice" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Nom *</label>
                    <input required value={createForm.patient_nom} onChange={e => setCreateForm(f => ({ ...f, patient_nom: e.target.value }))}
                      placeholder="BENIN" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Email * <span className="text-slate-400">(pour recevoir le code d'accès)</span></label>
                  <input required type="email" value={createForm.patient_email} onChange={e => setCreateForm(f => ({ ...f, patient_email: e.target.value }))}
                    placeholder="alice@email.com" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Téléphone</label>
                  <input value={createForm.patient_telephone} onChange={e => setCreateForm(f => ({ ...f, patient_telephone: e.target.value }))}
                    placeholder="0197000000" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Type d'analyse *</label>
                  <input required value={createForm.type_analyse} onChange={e => setCreateForm(f => ({ ...f, type_analyse: e.target.value }))}
                    placeholder="Ex: NFS, Glycémie à jeun, Bilan lipidique..." className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
                </div>

                <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">L'email est obligatoire — le patient recevra son code d'accès par email lors de la clôture.</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
                    Annuler
                  </button>
                  <Button type="submit" isLoading={creating} className="flex-1">
                    Inscrire le patient
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal : Clôturer l'analyse ──────────────────────────────── */}
      <AnimatePresence>
        {selectedDemande && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <div>
                  <h3 className="font-semibold text-slate-900">Clôturer l'analyse</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedDemande.patient_prenom} {selectedDemande.patient_nom} — {selectedDemande.type_analyse}
                  </p>
                </div>
                <button onClick={() => setSelectedDemande(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCloturer} className="p-5 space-y-4">
                {/* Titre du résultat */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Titre du résultat</label>
                  <input
                    value={clotureData.titre}
                    onChange={e => setClotureData(d => ({ ...d, titre: e.target.value }))}
                    placeholder={`Ex: Résultats ${selectedDemande.type_analyse}`}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>

                {/* Upload PDF */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Rapport PDF *</label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${clotureData.fichier ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    {clotureData.fichier ? (
                      <div className="flex items-center justify-center gap-2 text-emerald-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">{clotureData.fichier.name}</span>
                      </div>
                    ) : (
                      <div className="text-slate-400">
                        <Upload className="w-6 h-6 mx-auto mb-1" />
                        <p className="text-sm">Cliquer pour uploader le PDF</p>
                        <p className="text-xs mt-0.5">Max 10 Mo</p>
                      </div>
                    )}
                    <input ref={fileRef} type="file" accept=".pdf" className="hidden"
                      onChange={e => setClotureData(d => ({ ...d, fichier: e.target.files?.[0] || null }))} />
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    Le patient recevra un email avec son code d'accès pour consulter ses résultats.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setSelectedDemande(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
                    Annuler
                  </button>
                  <Button type="submit" className="flex-1" isLoading={saving} disabled={!clotureData.fichier}>
                    Certifier et envoyer
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ErrorModal message={errorMsg} onClose={() => setErrorMsg('')} />
      <SuccessModal message={successMsg} onClose={() => setSuccessMsg('')} />
    </div>
  );
}
