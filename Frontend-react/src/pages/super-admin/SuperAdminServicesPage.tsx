// @ts-nocheck
import { useState, useEffect } from 'react';
import { api, endpoints } from '@/services/api';
import { Card, Button, PageLoader } from '@/components/ui';
import { Activity, Plus, Search, Edit2, Trash2, RefreshCw, X, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ErrorModal, ConfirmModal } from '@/components/ui';

type Mode = 'list' | 'create' | 'edit';

export default function SuperAdminServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState<Mode>('list');
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ nom: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; nom: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data: any = await api.get(endpoints.servicesGlobaux);
      setServices(Array.isArray(data) ? data : data.results ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setForm({ nom: '', description: '' }); setSelected(null); setMode('create'); };
  const openEdit = (s: any) => { setForm({ nom: s.nom, description: s.description ?? '' }); setSelected(s); setMode('edit'); };
  const cancel = () => { setMode('list'); setSelected(null); };

  const handleSave = async () => {
    if (!form.nom.trim()) return;
    setSaving(true);
    try {
      if (mode === 'create') {
        await api.post(endpoints.servicesGlobaux, form);
      } else if (mode === 'edit' && selected) {
        await api.patch(`${endpoints.servicesGlobaux}${selected.id}/`, form);
      }
      await fetchData();
      cancel();
    } catch { setErrorMsg('Erreur lors de la sauvegarde.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number, nom: string) => {
    setConfirmDelete(null);
    try {
      await api.delete(`${endpoints.servicesGlobaux}${id}/`);
      fetchData();
    } catch { setErrorMsg('Erreur lors de la suppression.'); }
  };

  const filtered = services.filter(s =>
    s.nom.toLowerCase().includes(search.toLowerCase()) ||
    (s.description ?? '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading && services.length === 0) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Services Globaux</h1>
          <p className="text-slate-500 mt-1">{services.length} service{services.length !== 1 ? 's' : ''} disponible{services.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchData} leftIcon={<RefreshCw className="w-4 h-4" />}>Actualiser</Button>
          <Button onClick={openCreate} leftIcon={<Plus className="w-4 h-4" />}>Nouveau service</Button>
        </div>
      </div>

      {/* Form panel */}
      <AnimatePresence>
        {(mode === 'create' || mode === 'edit') && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card padding="lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-900">{mode === 'create' ? 'Nouveau service' : `Modifier "${selected?.nom}"`}</h2>
                <button onClick={cancel} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nom du service *"
                  value={form.nom}
                  onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
                <textarea
                  rows={3}
                  placeholder="Description (optionnel)"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none transition"
                />
              </div>
              <div className="flex gap-3 mt-4">
                <Button variant="outline" onClick={cancel}>Annuler</Button>
                <Button onClick={handleSave} loading={saving} leftIcon={<Check className="w-4 h-4" />}>
                  {mode === 'create' ? 'Créer' : 'Enregistrer'}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher un service…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <Activity className="w-7 h-7 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">{search ? `Aucun résultat pour "${search}"` : 'Aucun service'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card padding="md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center shrink-0">
                    <Activity className="w-5 h-5 text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{s.nom}</p>
                    {s.description && (
                      <p className="text-sm text-slate-500 truncate mt-0.5">{s.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(s)}
                      className="w-8 h-8 rounded-lg hover:bg-blue-50 flex items-center justify-center transition group"
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete({ id: s.id, nom: s.nom })}
                      className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center transition group"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-red-600" />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <ErrorModal message={errorMsg} onClose={() => setErrorMsg('')} />
      <ConfirmModal
        open={confirmDelete !== null}
        title={`Supprimer "${confirmDelete?.nom}" ?`}
        message="Cette action est irréversible. Le service sera retiré de tous les hôpitaux."
        confirmLabel="Supprimer"
        icon="delete"
        onConfirm={() => handleDelete(confirmDelete!.id, confirmDelete!.nom)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
