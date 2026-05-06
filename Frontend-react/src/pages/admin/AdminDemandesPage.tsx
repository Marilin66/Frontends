// @ts-nocheck
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api, endpoints } from '@/services/api';
import { Card, Button, PageLoader } from '@/components/ui';
import { Inbox, RefreshCw, Plus, CheckCircle, XCircle, Clock, Building, User, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'en_attente' | 'valide' | 'refuse';

function StatusPill({ statut }: { statut: string }) {
  const map: Record<string, { label: string; cls: string; icon: any }> = {
    en_attente: { label: 'En attente', cls: 'bg-amber-50 text-amber-700 border-amber-200',  icon: Clock },
    valide:     { label: 'Validée',    cls: 'bg-green-50 text-green-700 border-green-200',  icon: CheckCircle },
    refuse:     { label: 'Refusée',    cls: 'bg-red-50 text-red-700 border-red-200',        icon: XCircle },
  };
  const s = map[statut] ?? map.en_attente;
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium ${s.cls}`}>
      <s.icon className="w-3 h-3" /> {s.label}
    </span>
  );
}

export default function AdminDemandesPage() {
  const { user } = useAuth();
  const [demandes, setDemandes] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('en_attente');
  const [showForm, setShowForm] = useState(false);
  const [isNewService, setIsNewService] = useState(true);
  const [formData, setFormData] = useState({ nom: '', description: '', service_existant: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [d, s]: any = await Promise.all([
        api.get(endpoints.demandesServices),
        api.get(endpoints.servicesGlobaux),
      ]);
      setDemandes(Array.isArray(d) ? d : d.results ?? []);
      setServices(Array.isArray(s) ? s : s.results ?? []);
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
    } catch { alert('Erreur lors de l\'envoi de la demande.'); }
    finally { setSubmitting(false); }
  };

  const filtered = demandes.filter(d => d.statut === tab);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'en_attente', label: 'En attente', count: demandes.filter(d => d.statut === 'en_attente').length },
    { key: 'valide',     label: 'Validées',   count: demandes.filter(d => d.statut === 'valide').length },
    { key: 'refuse',     label: 'Refusées',   count: demandes.filter(d => d.statut === 'refuse').length },
  ];

  if (loading && demandes.length === 0) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Demandes de Service</h1>
          <p className="text-slate-500 mt-1">Gérez vos demandes d'ajout de services</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchData} leftIcon={<RefreshCw className="w-4 h-4" />}>Actualiser</Button>
          <Button onClick={() => setShowForm(true)} leftIcon={<Plus className="w-4 h-4" />}>Nouvelle demande</Button>
        </div>
      </div>

      {/* Formulaire création */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card padding="lg">
              <h2 className="font-semibold text-slate-900 mb-4">Nouvelle demande de service</h2>

              {/* Toggle */}
              <div className="flex rounded-xl overflow-hidden border border-slate-200 mb-4 w-fit">
                {[{ v: true, l: 'Nouveau service' }, { v: false, l: 'Service existant' }].map(({ v, l }) => (
                  <button
                    key={String(v)}
                    onClick={() => setIsNewService(v)}
                    className={`px-4 py-2 text-sm font-medium transition ${isNewService === v ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>

              {isNewService ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Nom du service *"
                    value={formData.nom}
                    onChange={e => setFormData(f => ({ ...f, nom: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  />
                  <textarea
                    rows={3}
                    placeholder="Description (optionnel)"
                    value={formData.description}
                    onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none transition"
                  />
                </div>
              ) : (
                <select
                  value={formData.service_existant}
                  onChange={e => setFormData(f => ({ ...f, service_existant: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                >
                  <option value="">Choisir un service…</option>
                  {services.map((s: any) => <option key={s.id} value={s.id}>{s.nom}</option>)}
                </select>
              )}

              <div className="flex gap-3 mt-4">
                <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
                <Button onClick={handleSubmit} loading={submitting}>Envoyer la demande</Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${tab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab === t.key ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <Inbox className="w-7 h-7 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">Aucune demande {tab === 'en_attente' ? 'en attente' : tab === 'valide' ? 'validée' : 'refusée'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card padding="md">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                      <Building className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">
                        {d.nom_nouveau_service ?? d.service_existant_nom ?? 'Service'}
                      </p>
                      {(d.description_nouveau_service) && (
                        <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{d.description_nouveau_service}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Calendar className="w-3 h-3" />
                          {d.date_demande ? new Date(d.date_demande).toLocaleDateString('fr-FR') : '—'}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <User className="w-3 h-3" />
                          {d.demande_par_nom ?? 'Vous'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <StatusPill statut={d.statut} />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
