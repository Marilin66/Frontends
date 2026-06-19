
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api, endpoints } from '@/services/api';
import { Button, PageLoader, Pagination, usePagination } from '@/components/ui';
import { Inbox, RefreshCw, Plus, CheckCircle, XCircle, Clock, Building, User, Calendar, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ErrorModal } from '@/components/ui';
import type { DemandeService, Service, ApiError } from '@/types/api';
import { toArray } from '@/types/api';

const PAGE_SIZE = 10;

type Tab = 'en_attente' | 'valide' | 'refuse';

function StatusPill({ statut }: { statut: string }) {
  const map: Record<string, { label: string; cls: string; icon: typeof Clock }> = {
    en_attente: { label: 'En attente', cls: 'bg-amber-50 text-amber-700 border-amber-200',   icon: Clock },
    valide:     { label: 'Validée',    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
    refuse:     { label: 'Refusée',    cls: 'bg-red-50 text-red-700 border-red-200',          icon: XCircle },
  };
  const s = map[statut] ?? map.en_attente;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${s.cls}`}>
      <s.icon className="w-3.5 h-3.5" /> {s.label}
    </span>
  );
}

export default function AdminDemandesPage() {
  const { user } = useAuth();
  const [demandes, setDemandes] = useState<DemandeService[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('en_attente');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [isNewService, setIsNewService] = useState(true);
  const [formData, setFormData] = useState({ nom: '', description: '', service_existant: '' });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [d, s] = await Promise.all([
        api.get(endpoints.demandesServices),
        api.get(endpoints.servicesGlobaux),
      ]);
      setDemandes(toArray<DemandeService>(d));
      setServices(toArray<Service>(s));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    if (!user?.hopital) return;
    setSubmitting(true);
    try {
      const payload = isNewService
        ? { nom_nouveau_service: formData.nom, description_nouveau_service: formData.description }
        : { service_existant: Number(formData.service_existant) };
      await api.post(endpoints.createDemandeService(user.hopital), payload);
      setShowForm(false);
      setFormData({ nom: '', description: '', service_existant: '' });
      fetchData();
    } catch (_err) { setErrorMsg('Erreur lors de l\'envoi de la demande.'); }
    finally { setSubmitting(false); }
  };

  const filtered = demandes.filter(d => d.statut === tab);
  const { paged, totalItems, totalPages } = usePagination(filtered, PAGE_SIZE, page);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'en_attente', label: 'En attente', count: demandes.filter(d => d.statut === 'en_attente').length },
    { key: 'valide',     label: 'Validées',   count: demandes.filter(d => d.statut === 'valide').length },
    { key: 'refuse',     label: 'Refusées',   count: demandes.filter(d => d.statut === 'refuse').length },
  ];

  if (loading && demandes.length === 0) return <PageLoader />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-20">

      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Demandes de Service</h1>
          <p className="text-slate-500 mt-1 text-sm">Gérez vos demandes d'ajout de services</p>
        </div>

        <div className="flex gap-3">
          <button onClick={fetchData} className="flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
          <Button onClick={() => setShowForm(true)} className="h-10 px-4 rounded-xl text-sm font-semibold">
            <Plus className="w-4 h-4 mr-2" /> Nouvelle demande
          </Button>
        </div>
      </section>

      {/* Formulaire création */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">Nouvelle demande de service</h2>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Toggle */}
              <div className="flex rounded-xl overflow-hidden border border-slate-200 w-fit">
                {[{ v: true, l: 'Nouveau service' }, { v: false, l: 'Service existant' }].map(({ v, l }) => (
                  <button
                    key={String(v)}
                    onClick={() => setIsNewService(v)}
                    className={`px-4 py-2 text-sm font-semibold transition ${isNewService === v ? 'bg-primary text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>

              {isNewService ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Nom du service *</label>
                    <input
                      type="text"
                      placeholder="Ex: Cardiologie"
                      value={formData.nom}
                      onChange={e => setFormData(f => ({ ...f, nom: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-primary focus:outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Description (optionnel)</label>
                    <textarea
                      rows={3}
                      placeholder="Description du service…"
                      value={formData.description}
                      onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-primary focus:outline-none transition-all placeholder:text-slate-400 resize-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">Service existant *</label>
                  <select
                    value={formData.service_existant}
                    onChange={e => setFormData(f => ({ ...f, service_existant: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-primary focus:outline-none transition-all cursor-pointer bg-white"
                  >
                    <option value="">Choisir un service…</option>
                    {services.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
                  </select>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setShowForm(false)} className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Annuler</button>
                <Button onClick={handleSubmit} isLoading={submitting} className="flex-1 h-10 rounded-xl text-sm font-semibold">
                  Envoyer la demande
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${tab === t.key ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${tab === t.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200">
          <Inbox className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">
            Aucune demande {tab === 'en_attente' ? 'en attente' : tab === 'valide' ? 'validée' : 'refusée'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {paged.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-slate-300 transition-all duration-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                      <Building className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {d.nom_nouveau_service ?? d.service_existant_nom ?? 'Service'}
                      </p>
                      {d.description_nouveau_service && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{d.description_nouveau_service}</p>
                      )}
                      <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Calendar className="w-3 h-3" />
                          {d.date_demande ? new Date(d.date_demande).toLocaleDateString('fr-FR') : '—'}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                          <User className="w-3 h-3" />
                          {d.demande_par_nom ?? 'Vous'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <StatusPill statut={d.statut} />
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

      <ErrorModal message={errorMsg} onClose={() => setErrorMsg('')} />
    </motion.div>
  );
}
