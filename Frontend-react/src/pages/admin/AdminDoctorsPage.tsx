// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { api, endpoints } from '@/services/api';
import { Avatar, Badge, Button, Input, PageLoader } from '@/components/ui';
import { Plus, Mail, Phone, X, Search, Upload, Download, UserCheck, Trash2, Stethoscope } from 'lucide-react';

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ email: '', first_name: '', last_name: '', telephone: '', specialite: '', numero_ordre: '', date_naissance: '1985-01-01', sexe: 'M', biographie: '' });

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
      await api.post(endpoints.medecins, form);
      setShowModal(false);
      setForm({ email: '', first_name: '', last_name: '', telephone: '', specialite: '', numero_ordre: '', date_naissance: '1985-01-01', sexe: 'M', biographie: '' });
      fetchData();
    } catch (e: any) { alert(e.response?.data?.email?.[0] || 'Erreur lors de la création.'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Désactiver ce médecin ?')) return;
    try { await api.delete(`${endpoints.medecins}${id}/`); fetchData(); }
    catch (e) { console.error(e); }
  };

  const handleCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('fichier', file);
    try {
      setLoading(true);
      await api.post(endpoints.medecinsImport, fd);
      alert('Import réussi !');
      fetchData();
    } catch (err: any) { alert(err.response?.data?.error || 'Erreur import.'); }
    finally { setLoading(false); e.target.value = ''; }
  };

  const filtered = doctors.filter((d: any) =>
    `${d.first_name} ${d.last_name} ${d.specialite}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && doctors.length === 0) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Corps médical</h1>
          <p className="text-slate-500 mt-1">{doctors.length} médecin{doctors.length !== 1 ? 's' : ''} enregistré{doctors.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-3">
          <label className="cursor-pointer">
            <input type="file" accept=".csv" className="hidden" onChange={handleCSV} />
            <div className="inline-flex items-center gap-2 h-10 px-4 text-sm font-semibold border border-slate-200 bg-white text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm cursor-pointer">
              <Upload className="w-4 h-4" /> Import CSV
            </div>
          </label>
          <a href={`${import.meta.env.VITE_API_URL || 'https://backend-soutenance-1et0.onrender.com/api'}${endpoints.medecinsImportTemplate}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="md" leftIcon={<Download className="w-4 h-4" />}>Modèle</Button>
          </a>
          <Button onClick={() => setShowModal(true)} leftIcon={<Plus className="w-4 h-4" />}>
            Nouveau médecin
          </Button>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          placeholder="Rechercher un médecin..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <Stethoscope className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Aucun médecin trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Médecin</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Spécialité</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Contact</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((doc: any) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={`${doc.first_name} ${doc.last_name}`} size="md" />
                        <div>
                          <p className="font-medium text-slate-900">Dr. {doc.first_name} {doc.last_name}</p>
                          <p className="text-xs text-slate-400">{doc.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-sm text-slate-600">{doc.specialite || '—'}</span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-sm text-slate-600">{doc.telephone || '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={doc.is_active ? 'success' : 'warning'} size="sm">
                        {doc.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal création */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Nouveau médecin</h2>
                <p className="text-sm text-slate-500 mt-0.5">Le médecin recevra un email pour configurer son mot de passe</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Prénom" required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} placeholder="Jean" />
                <Input label="Nom" required value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} placeholder="Dupont" />
              </div>
              <Input label="Email professionnel" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="dr.dupont@hopital.bj" leftIcon={<Mail className="w-4 h-4" />} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Téléphone" required value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} placeholder="+229 XX XX XX XX" leftIcon={<Phone className="w-4 h-4" />} />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Spécialité</label>
                  <select required value={form.specialite} onChange={(e) => setForm({ ...form, specialite: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10">
                    <option value="">Choisir...</option>
                    {specialties.map((s: any) => <option key={s.id} value={s.nom}>{s.nom}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Date de naissance" type="date" required value={form.date_naissance} onChange={(e) => setForm({ ...form, date_naissance: e.target.value })} />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Sexe</label>
                  <select value={form.sexe} onChange={(e) => setForm({ ...form, sexe: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10">
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                </div>
              </div>
              <Input label="N° d'ordre (optionnel)" value={form.numero_ordre} onChange={(e) => setForm({ ...form, numero_ordre: e.target.value })} placeholder="ORD-XXXXX-BJ" />
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)} type="button">Annuler</Button>
                <Button type="submit" className="flex-1" isLoading={loading} leftIcon={<UserCheck className="w-4 h-4" />}>
                  Créer le médecin
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
