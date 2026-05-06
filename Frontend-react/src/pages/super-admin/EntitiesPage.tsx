// @ts-nocheck
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api, endpoints } from '@/services/api';
import { Card, Button, Badge, PageLoader } from '@/components/ui';
import {
  Plus, Search, Building, MapPin, Mail, Phone,
  ArrowRight, Zap, Edit2, X, Check, RefreshCw,
  ToggleLeft, ToggleRight, ChevronRight
} from 'lucide-react';

interface Hopital {
  id: number;
  nom: string;
  adresse: string;
  ville: string;
  telephone: string;
  email: string;
  is_active: boolean;
  code_court?: string;
  latitude?: number;
  longitude?: number;
}

const EMPTY_FORM = {
  nom: '', adresse: '', ville: '', telephone: '', email: '',
  code_court: '', latitude: '', longitude: '',
};

export default function EntitiesPage() {
  const navigate = useNavigate();
  const [hopitaux, setHopitaux] = useState<Hopital[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected] = useState<Hopital | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data: any = await api.get(endpoints.hopitaux);
      setHopitaux(Array.isArray(data) ? data : data.results ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setForm({ ...EMPTY_FORM });
    setSelected(null);
    setModal('create');
  };

  const openEdit = (h: Hopital) => {
    setForm({
      nom: h.nom ?? '',
      adresse: h.adresse ?? '',
      ville: h.ville ?? '',
      telephone: h.telephone ?? '',
      email: h.email ?? '',
      code_court: h.code_court ?? '',
      latitude: h.latitude?.toString() ?? '',
      longitude: h.longitude?.toString() ?? '',
    });
    setSelected(h);
    setModal('edit');
  };

  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        nom: form.nom,
        adresse: form.adresse,
        ville: form.ville,
        telephone: form.telephone,
        email: form.email,
      };
      if (form.code_court) payload.code_court = form.code_court;
      if (form.latitude)   payload.latitude   = parseFloat(form.latitude);
      if (form.longitude)  payload.longitude  = parseFloat(form.longitude);

      if (modal === 'create') {
        await api.post(endpoints.hopitaux, payload);
      } else if (modal === 'edit' && selected) {
        await api.patch(`${endpoints.hopitaux}${selected.id}/`, payload);
      }
      closeModal();
      fetchData();
    } catch (e: any) {
      alert(e?.response?.data ? JSON.stringify(e.response.data) : 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (h: Hopital) => {
    setToggling(h.id);
    try {
      await api.patch(`${endpoints.hopitaux}${h.id}/`, { is_active: !h.is_active });
      fetchData();
    } catch { alert('Erreur lors du changement de statut.'); }
    finally { setToggling(null); }
  };

  const filtered = hopitaux.filter(h =>
    `${h.nom} ${h.ville} ${h.adresse}`.toLowerCase().includes(search.toLowerCase())
  );

  const actifs   = hopitaux.filter(h => h.is_active).length;
  const inactifs = hopitaux.filter(h => !h.is_active).length;

  if (loading && hopitaux.length === 0) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des Hôpitaux</h1>
          <p className="text-slate-500 mt-1">
            {hopitaux.length} hôpital{hopitaux.length !== 1 ? 'x' : ''} — {actifs} actif{actifs !== 1 ? 's' : ''}, {inactifs} inactif{inactifs !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
          <Button onClick={openCreate} leftIcon={<Plus className="w-4 h-4" />}>
            Nouvel hôpital
          </Button>
        </div>
      </div>

      {/* ── KPIs ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total',    value: hopitaux.length, color: 'text-blue-600',   bg: 'bg-blue-50' },
          { label: 'Actifs',   value: actifs,          color: 'text-green-600',  bg: 'bg-green-50' },
          { label: 'Inactifs', value: inactifs,        color: 'text-slate-500',  bg: 'bg-slate-100' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
            <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center`}>
              <Building className={`w-4 h-4 ${s.color}`} />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search ──────────────────────────────────────────────────── */}
      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher par nom, ville, adresse…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      </div>

      {/* ── Grid ────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <Building className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">{search ? `Aucun résultat pour "${search}"` : 'Aucun hôpital enregistré'}</p>
          {!search && (
            <Button className="mt-4" onClick={openCreate} leftIcon={<Plus className="w-4 h-4" />}>
              Créer le premier hôpital
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((h, i) => (
            <motion.div key={h.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <div className="bg-white rounded-2xl border border-slate-200 hover:shadow-card-md hover:border-slate-300 transition-all overflow-hidden group">

                {/* Card header */}
                <div className="p-5 pb-4">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Building className="w-5 h-5 text-primary" />
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${h.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {h.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-tight mb-1 truncate">{h.nom}</h3>
                  {h.code_court && (
                    <span className="text-xs text-slate-400 font-mono">[{h.code_court}]</span>
                  )}

                  <div className="mt-3 space-y-1.5">
                    {h.ville && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" /> {h.ville}
                      </div>
                    )}
                    {h.email && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
                        <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" /> {h.email}
                      </div>
                    )}
                    {h.telephone && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Phone className="w-3.5 h-3.5 shrink-0 text-slate-400" /> {h.telephone}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card footer */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {/* Toggle actif/inactif */}
                    <button
                      onClick={() => handleToggle(h)}
                      disabled={toggling === h.id}
                      title={h.is_active ? 'Désactiver' : 'Activer'}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        h.is_active
                          ? 'text-green-700 hover:bg-green-100'
                          : 'text-slate-500 hover:bg-slate-200'
                      } disabled:opacity-50`}
                    >
                      {h.is_active
                        ? <ToggleRight className="w-4 h-4" />
                        : <ToggleLeft className="w-4 h-4" />
                      }
                      {toggling === h.id ? '…' : h.is_active ? 'Actif' : 'Inactif'}
                    </button>

                    {/* Modifier */}
                    <button
                      onClick={() => openEdit(h)}
                      title="Modifier"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Détail */}
                  <button
                    onClick={() => navigate(`/super-admin/hopitaux/${h.id}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition"
                  >
                    Gérer <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Modal Créer / Modifier ───────────────────────────────────── */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-modal"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {modal === 'create' ? 'Nouvel hôpital' : `Modifier — ${selected?.nom}`}
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {modal === 'create' ? 'Remplissez les informations de l\'établissement' : 'Modifiez les informations'}
                  </p>
                </div>
                <button onClick={closeModal} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSave} className="p-6 space-y-4">

                {/* Infos principales */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Informations générales</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Nom de l'hôpital *</label>
                      <input
                        required
                        type="text"
                        value={form.nom}
                        onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                        placeholder="Ex: CHU de Cotonou"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Ville *</label>
                        <input
                          required
                          type="text"
                          value={form.ville}
                          onChange={e => setForm(f => ({ ...f, ville: e.target.value }))}
                          placeholder="Cotonou"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Code court</label>
                        <input
                          type="text"
                          value={form.code_court}
                          onChange={e => setForm(f => ({ ...f, code_court: e.target.value }))}
                          placeholder="CHU-COT"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Adresse *</label>
                      <input
                        required
                        type="text"
                        value={form.adresse}
                        onChange={e => setForm(f => ({ ...f, adresse: e.target.value }))}
                        placeholder="Quartier, rue…"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Contact</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Téléphone *</label>
                      <input
                        required
                        type="tel"
                        value={form.telephone}
                        onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))}
                        placeholder="+229 97 00 00 00"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Email *</label>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="contact@hopital.bj"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Géolocalisation */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Géolocalisation (optionnel)</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        value={form.latitude}
                        onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))}
                        placeholder="6.3654"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        value={form.longitude}
                        onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))}
                        placeholder="2.4183"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    {saving ? 'Enregistrement…' : modal === 'create' ? 'Créer l\'hôpital' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
