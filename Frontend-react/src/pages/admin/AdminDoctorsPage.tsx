// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, endpoints } from '@/services/api';
import { Avatar, Badge, Button, Input, PageLoader } from '@/components/ui';
import { Plus, Mail, Phone, X, Search, Upload, Download, UserCheck, Trash2, Stethoscope, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ email: '', first_name: '', last_name: '', telephone: '', specialite_id: '', numero_ordre: '', date_naissance: '1985-01-01', sexe: 'M', biographie: '' });

  // Modales feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [d, s]: any = await Promise.all([api.get(endpoints.medecins), api.get(endpoints.servicesGlobaux)]);
      setDoctors(Array.isArray(d) ? d : d.results || []);
      setSpecialties(Array.isArray(s) ? s : s.results || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Le backend attend service_ids (liste d'IDs), pas specialite (nom texte)
      const payload: any = {
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        telephone: form.telephone,
        date_naissance: form.date_naissance,
        sexe: form.sexe,
        numero_ordre: form.numero_ordre,
        biographie: form.biographie,
      };
      if (form.specialite_id) {
        payload.service_ids = [parseInt(form.specialite_id)];
      }
      await api.post(endpoints.medecins, payload);
      setShowModal(false);
      setForm({ email: '', first_name: '', last_name: '', telephone: '', specialite_id: '', numero_ordre: '', date_naissance: '1985-01-01', sexe: 'M', biographie: '' });
      fetchData();
      setSuccessMsg('Médecin créé avec succès. Un email lui a été envoyé.');
    } catch (e: any) {
      // Extraire tous les messages d'erreur du backend
      const data = e.response?.data;
      if (data) {
        const msgs = Object.entries(data)
          .map(([field, errors]: any) => {
            const label = field === 'non_field_errors' ? '' : `${field} : `;
            const text = Array.isArray(errors) ? errors.join(', ') : String(errors);
            return `${label}${text}`;
          })
          .join('\n');
        setErrorMsg(msgs || 'Erreur lors de la création.');
      } else {
        setErrorMsg('Erreur lors de la création.');
      }
    }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    setConfirmDelete(null);
    try { await api.delete(`${endpoints.medecins}${id}/`); fetchData(); }
    catch (e) { setErrorMsg('Erreur lors de la désactivation.'); }
  };

  const handleCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('fichier', file);
    try {
      setLoading(true);
      await api.post(endpoints.medecinsImport, fd);
      setSuccessMsg('Import CSV réussi !');
      fetchData();
    } catch (err: any) { setErrorMsg(err.response?.data?.error || 'Erreur lors de l\'import.'); }
    finally { setLoading(false); e.target.value = ''; }
  };

  const filtered = doctors.filter((d: any) =>
    `${d.first_name} ${d.last_name} ${d.specialite}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && doctors.length === 0) return <PageLoader />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-20">

      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Corps médical</h1>
          <p className="text-slate-500 mt-1 text-sm">
            {doctors.length} praticien{doctors.length !== 1 ? 's' : ''} enregistré{doctors.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              placeholder="Rechercher un médecin..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-primary focus:outline-none transition-all bg-white placeholder:text-slate-400"
            />
          </div>
          <div className="flex gap-2">
            <label className="cursor-pointer">
              <input type="file" accept=".csv" className="hidden" onChange={handleCSV} />
              <div className="inline-flex items-center gap-2 h-10 px-4 text-sm font-semibold border border-slate-200 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition cursor-pointer">
                <Upload className="w-4 h-4" /> Import CSV
              </div>
            </label>
            <a href={`${import.meta.env.VITE_API_URL || 'https://backend-soutenance-1et0.onrender.com/api'}${endpoints.medecinsImportTemplate}`} target="_blank" rel="noopener noreferrer">
              <div className="inline-flex items-center gap-2 h-10 px-4 text-sm font-semibold border border-slate-200 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition cursor-pointer">
                <Download className="w-4 h-4" /> Modèle
              </div>
            </a>
            <Button onClick={() => setShowModal(true)} className="h-10 px-4 rounded-xl text-sm font-semibold">
              <Plus className="w-4 h-4 mr-2" /> Nouveau médecin
            </Button>
          </div>
        </div>
      </section>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Stethoscope className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Aucun praticien trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-600">Médecin</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-600 hidden md:table-cell">Spécialité</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-600 hidden lg:table-cell">Contact</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-600">Statut</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((doc: any, i: number) => (
                  <motion.tr
                    key={doc.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={`${doc.first_name} ${doc.last_name}`} size="md" className="flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Dr. {doc.first_name} {doc.last_name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{doc.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-sm text-slate-600">{doc.specialite || '—'}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className="text-sm text-slate-600">{doc.telephone || '—'}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${doc.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                        {doc.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setConfirmDelete(doc.id)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal création */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
                {/* Modal header — white, clean */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Nouveau médecin</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Le médecin recevra un email pour configurer son mot de passe</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreate} className="p-6 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600">Prénom *</label>
                      <input required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-primary focus:outline-none transition-all placeholder:text-slate-400" placeholder="Jean" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600">Nom *</label>
                      <input required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-primary focus:outline-none transition-all placeholder:text-slate-400" placeholder="Dupont" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Email professionnel *</label>
                    <input type="email" required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-primary focus:outline-none transition-all placeholder:text-slate-400" placeholder="dr.dupont@hopital.bj" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600">Téléphone *</label>
                      <input required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-primary focus:outline-none transition-all placeholder:text-slate-400" placeholder="+229 XX XX XX XX" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600">Spécialité *</label>
                      <select required value={form.specialite_id} onChange={(e) => setForm({ ...form, specialite_id: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-primary focus:outline-none transition-all cursor-pointer bg-white">
                        <option value="">Choisir...</option>
                        {specialties.map((s: any) => <option key={s.id} value={s.id}>{s.nom}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600">Date de naissance *</label>
                      <input type="date" required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-primary focus:outline-none transition-all" value={form.date_naissance} onChange={(e) => setForm({ ...form, date_naissance: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600">Sexe</label>
                      <select value={form.sexe} onChange={(e) => setForm({ ...form, sexe: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-primary focus:outline-none transition-all cursor-pointer bg-white">
                        <option value="M">Masculin</option>
                        <option value="F">Féminin</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">N° d'ordre (optionnel)</label>
                    <input className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-primary focus:outline-none transition-all placeholder:text-slate-400" placeholder="ORD-XXXXX-BJ" value={form.numero_ordre} onChange={(e) => setForm({ ...form, numero_ordre: e.target.value })} />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Annuler</button>
                    <Button type="submit" isLoading={loading} className="flex-1 h-10 rounded-xl text-sm font-semibold">
                      <UserCheck className="w-4 h-4 mr-2" /> Créer le médecin
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modale confirmation suppression */}
      <AnimatePresence>
        {confirmDelete !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setConfirmDelete(null)}
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
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-base font-semibold text-slate-900">Désactiver ce médecin ?</h3>
                <p className="text-sm text-slate-500">Cette action peut être annulée depuis les paramètres.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                  Annuler
                </button>
                <button onClick={() => handleDelete(confirmDelete)} className="flex-1 h-10 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" /> Désactiver
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modale erreur */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setErrorMsg('')}
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
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-base font-semibold text-slate-900">Erreur</h3>
                <p className="text-sm text-slate-500 whitespace-pre-line">{errorMsg}</p>
              </div>
              <button onClick={() => setErrorMsg('')} className="w-full h-10 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition">
                Fermer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modale succès */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setSuccessMsg('')}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-xl mx-auto">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-base font-semibold text-slate-900">Succès</h3>
                <p className="text-sm text-slate-500">{successMsg}</p>
              </div>
              <button onClick={() => setSuccessMsg('')} className="w-full h-10 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition">
                OK
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
