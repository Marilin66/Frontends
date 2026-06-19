
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api, endpoints } from '@/services/api';
import { Card, Button, Badge, PageLoader, ErrorModal, Pagination, usePagination } from '@/components/ui';
import {
  Plus, Search, Building, MapPin, Mail, Phone,
  X, RefreshCw, ToggleLeft, ToggleRight, ChevronRight,
  Edit2, CheckCircle
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import type { Hopital, ApiError } from '@/types/api';
import { toArray } from '@/types/api';

const PAGE_SIZE = 12;

const EMPTY_FORM = {
  nom: '', adresse: '', ville: '', telephone: '', email: '',
  code_court: '', latitude: '', longitude: '',
};

export default function EntitiesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [hopitaux, setHopitaux] = useState<Hopital[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<'edit' | null>(null);
  const [selected, setSelected] = useState<Hopital | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState(
    location.state?.created ? 'Hôpital créé avec succès !' : ''
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await api.get(endpoints.hopitaux);
      setHopitaux(toArray<Hopital>(data));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // Auto-dismiss du message de succès
  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

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
      const payload: Record<string, string | number> = {
        nom: form.nom,
        adresse: form.adresse,
        ville: form.ville,
        telephone: form.telephone,
        email: form.email,
      };
      if (form.code_court) payload.code_court = form.code_court;
      if (form.latitude)   payload.latitude   = parseFloat(form.latitude);
      if (form.longitude)  payload.longitude  = parseFloat(form.longitude);

      if (modal === 'edit' && selected) {
        await api.patch(`${endpoints.hopitaux}${selected.id}/`, payload);
      }
      closeModal();
      fetchData();
    } catch (e) {
      const apiErr = e as ApiError;
      setErrorMsg(apiErr?.response?.data ? JSON.stringify(apiErr.response.data) : 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (h: Hopital) => {
    setToggling(h.id);
    try {
      await api.patch(`${endpoints.hopitaux}${h.id}/`, { is_active: !h.is_active });
      fetchData();
    } catch { setErrorMsg('Erreur lors du changement de statut.'); }
    finally { setToggling(null); }
  };

  const filtered = hopitaux.filter(h =>
    `${h.nom} ${h.ville} ${h.adresse}`.toLowerCase().includes(search.toLowerCase())
  );

  const { paged, totalItems, totalPages } = usePagination(filtered, PAGE_SIZE, page);
  const { canCreateHopital, canEditHopital, canToggleHopital } = usePermissions();

  const actifs   = hopitaux.filter(h => h.is_active).length;
  const inactifs = hopitaux.filter(h => !h.is_active).length;

  if (loading && hopitaux.length === 0) return <PageLoader />;

  return (
    <div className="space-y-6 pb-20">

      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des Hôpitaux</h1>
          <p className="text-slate-500 mt-1 text-sm">
            {hopitaux.length} hôpital{hopitaux.length !== 1 ? 'x' : ''} — {actifs} actif{actifs !== 1 ? 's' : ''}, {inactifs} inactif{inactifs !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, ville…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-64 pl-9 px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-primary focus:outline-none transition-all bg-white placeholder:text-slate-400"
            />
          </div>
          <button onClick={fetchData} className="flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
          {canCreateHopital && (
            <Button onClick={() => navigate('/super-admin/hopitaux/nouveau')} className="h-10 px-4 rounded-xl text-sm font-semibold">
              <Plus className="w-4 h-4 mr-2" /> Nouvel hôpital
            </Button>
          )}
        </div>
      </section>

      {/* Toast succès création */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800"
          >
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="text-sm font-medium flex-1">{successMsg}</p>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-500 hover:text-emerald-700 transition">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Total',    value: hopitaux.length, color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-100' },
          { label: 'Actifs',   value: actifs,          color: 'text-emerald-600',bg: 'bg-emerald-50',border: 'border-emerald-100' },
          { label: 'Inactifs', value: inactifs,        color: 'text-slate-500',  bg: 'bg-slate-100', border: 'border-slate-200' },
        ].map((s, i) => (
          <div key={i} className={`bg-white rounded-2xl border ${s.border} p-5 flex items-center gap-4`}>
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center shrink-0`}>
              <Building className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs font-medium text-slate-600 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200">
          <Building className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">
            {search ? `Aucun résultat pour "${search}"` : 'Aucun hôpital enregistré'}
          </p>
          {!search && (
            <button onClick={() => navigate('/super-admin/hopitaux/nouveau')} className="mt-4 flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-white text-sm font-semibold mx-auto hover:bg-primary/90 transition">
              <Plus className="w-4 h-4" /> Créer le premier hôpital
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paged.map((h, i) => (
            <motion.div key={h.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <div className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 overflow-hidden">

                {/* Card header */}
                <div className="p-5 pb-4">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Building className="w-5 h-5 text-primary" />
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${h.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {h.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 leading-tight mb-0.5 truncate">{h.nom}</h3>
                  {h.code_court && (
                    <span className="text-xs text-slate-500">[{h.code_court}]</span>
                  )}

                  <div className="mt-3 space-y-1.5 bg-slate-50 rounded-xl p-3 border border-slate-100">
                    {h.ville && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" /> {h.ville}
                      </div>
                    )}
                    {h.email && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
                        <Mail className="w-3.5 h-3.5 shrink-0 text-emerald-500" /> {h.email}
                      </div>
                    )}
                    {h.telephone && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Phone className="w-3.5 h-3.5 shrink-0 text-blue-500" /> {h.telephone}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card footer */}
                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {canToggleHopital && (
                      <button
                        onClick={() => handleToggle(h)}
                        disabled={toggling === h.id}
                        title={h.is_active ? 'Désactiver' : 'Activer'}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                          h.is_active
                            ? 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                            : 'text-slate-500 border-slate-200 hover:bg-slate-100'
                        } disabled:opacity-50`}
                      >
                        {h.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        {toggling === h.id ? '…' : h.is_active ? 'Actif' : 'Inactif'}
                      </button>
                    )}
                    {canEditHopital && (
                      <button
                        onClick={() => openEdit(h)}
                        title="Modifier"
                        className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => navigate(`/super-admin/hopitaux/${h.id}`)}
                    className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition"
                  >
                    Gérer <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
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

      {/* Modal Modifier — visible seulement si droits */}
      <AnimatePresence>
        {modal === 'edit' && canEditHopital && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Modifier — {selected?.nom}</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Modifiez les informations de l'établissement</p>
                  </div>
                  <button onClick={closeModal} className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-5">
                  <div>
                    <p className="text-xs font-medium text-slate-600 mb-3">Informations générales</p>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-600">Nom de l'hôpital *</label>
                        <input required type="text" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} placeholder="Ex: CHU de Cotonou"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-primary focus:outline-none transition-all placeholder:text-slate-400" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-600">Ville *</label>
                          <input required type="text" value={form.ville} onChange={e => setForm(f => ({ ...f, ville: e.target.value }))} placeholder="Cotonou"
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-primary focus:outline-none transition-all placeholder:text-slate-400" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-600">Code court</label>
                          <input type="text" value={form.code_court} onChange={e => setForm(f => ({ ...f, code_court: e.target.value }))} placeholder="CHU-COT"
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-primary focus:outline-none transition-all placeholder:text-slate-400" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-600">Adresse *</label>
                        <input required type="text" value={form.adresse} onChange={e => setForm(f => ({ ...f, adresse: e.target.value }))} placeholder="Quartier, rue…"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-primary focus:outline-none transition-all placeholder:text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-600 mb-3">Contact</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-600">Téléphone *</label>
                        <input required type="tel" value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} placeholder="+229 97 00 00 00"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-primary focus:outline-none transition-all placeholder:text-slate-400" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-600">Email *</label>
                        <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="contact@hopital.bj"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-primary focus:outline-none transition-all placeholder:text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-600 mb-3">Géolocalisation (optionnel)</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-600">Latitude</label>
                        <input type="number" step="any" value={form.latitude} onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))} placeholder="6.3654"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-primary focus:outline-none transition-all placeholder:text-slate-400" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-600">Longitude</label>
                        <input type="number" step="any" value={form.longitude} onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))} placeholder="2.4183"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-primary focus:outline-none transition-all placeholder:text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={closeModal} className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                      Annuler
                    </button>
                    <button type="submit" disabled={saving}
                      className="flex-1 h-10 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {saving ? 'Enregistrement…' : 'Enregistrer'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <ErrorModal message={errorMsg} onClose={() => setErrorMsg('')} />
    </div>
  );
}
