// @ts-nocheck
import { useState, useEffect } from 'react';
import { api, endpoints } from '@/services/api';
import { Card, Button, PageLoader, Pagination, usePagination } from '@/components/ui';
import { Inbox, RefreshCw, CheckCircle, XCircle, Clock, Building, User, Calendar, ChevronDown, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePermissions } from '@/hooks/usePermissions';

const PAGE_SIZE = 10;

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

export default function SuperAdminDemandesPage() {
  const [demandes, setDemandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('en_attente');
  const [page, setPage] = useState(1);
  const [refusMotif, setRefusMotif] = useState<Record<number, string>>({});
  const [showRefusForm, setShowRefusForm] = useState<number | null>(null);
  const [processing, setProcessing] = useState<number | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ id: number; nom: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data: any = await api.get(endpoints.demandesServices);
      setDemandes(Array.isArray(data) ? data : data.results ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleValider = async (id: number) => {
    setConfirmModal(null);
    setProcessing(id);
    try {
      await api.post(endpoints.validerDemande(id));
      fetchData();
    } catch (e: any) {
      const msg = e.response?.data?.detail || 'Erreur lors de la validation.';
      // On affiche dans le snackbar via state — pas d'alert
      console.error(msg);
    }
    finally { setProcessing(null); }
  };

  const handleRefuser = async (id: number) => {
    const motif = refusMotif[id] ?? '';
    setProcessing(id);
    try {
      await api.post(endpoints.refuserDemande(id), { commentaire: motif });
      setShowRefusForm(null);
      fetchData();
    } catch (e: any) {
      console.error('Erreur lors du refus.', e);
    }
    finally { setProcessing(null); }
  };

  const filtered = demandes.filter(d => d.statut === tab);
  const { paged, totalItems, totalPages } = usePagination(filtered, PAGE_SIZE, page);
  const { canValiderDemande, canRefuserDemande } = usePermissions();

  const tabs: { key: Tab; label: string }[] = [
    { key: 'en_attente', label: 'En attente' },
    { key: 'valide',     label: 'Validées' },
    { key: 'refuse',     label: 'Refusées' },
  ];

  if (loading && demandes.length === 0) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Demandes de Service</h1>
          <p className="text-slate-500 mt-1">
            {demandes.filter(d => d.statut === 'en_attente').length} demande{demandes.filter(d => d.statut === 'en_attente').length !== 1 ? 's' : ''} en attente
          </p>
        </div>
        <Button variant="outline" onClick={fetchData} leftIcon={<RefreshCw className="w-4 h-4" />}>Actualiser</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {tabs.map(t => {
          const count = demandes.filter(d => d.statut === t.key).length;
          return (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${tab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t.label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab === t.key ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
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
          {paged.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card padding="md">
                <div className="space-y-3">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                        <Building className="w-5 h-5 text-violet-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">
                          {d.nom_nouveau_service ?? d.service_existant_nom ?? 'Service'}
                        </p>
                        <p className="text-sm text-slate-500 truncate">{d.hopital_nom}</p>
                        {d.description_nouveau_service && (
                          <p className="text-sm text-slate-400 mt-1 line-clamp-2">{d.description_nouveau_service}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <User className="w-3 h-3" /> {d.demande_par_nom ?? '—'}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Calendar className="w-3 h-3" />
                            {d.date_demande ? new Date(d.date_demande).toLocaleDateString('fr-FR') : '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <StatusPill statut={d.statut} />
                  </div>

                  {/* Actions (en_attente only) — visibles seulement si droits */}
                  {d.statut === 'en_attente' && (canValiderDemande || canRefuserDemande) && (
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      {/* Refus form */}
                      <AnimatePresence>
                        {showRefusForm === d.id && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                            <textarea
                              rows={2}
                              placeholder="Motif du refus (optionnel)…"
                              value={refusMotif[d.id] ?? ''}
                              onChange={e => setRefusMotif(m => ({ ...m, [d.id]: e.target.value }))}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 resize-none transition mb-2"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex gap-2">
                        {showRefusForm === d.id ? (
                          <>
                            <button
                              onClick={() => setShowRefusForm(null)}
                              className="flex-1 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                            >
                              Annuler
                            </button>
                            {canRefuserDemande && (
                              <button
                                onClick={() => handleRefuser(d.id)}
                                disabled={processing === d.id}
                                className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                              >
                                <XCircle className="w-4 h-4" />
                                {processing === d.id ? 'Refus…' : 'Confirmer le refus'}
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            {canRefuserDemande && (
                              <button
                                onClick={() => setShowRefusForm(d.id)}
                                className="flex-1 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition flex items-center justify-center gap-2"
                              >
                                <XCircle className="w-4 h-4" /> Refuser
                              </button>
                            )}
                            {canValiderDemande && (
                              <button
                                onClick={() => setConfirmModal({ id: d.id, nom: d.nom_nouveau_service ?? d.service_existant_nom ?? 'ce service' })}
                                disabled={processing === d.id}
                                className="flex-1 py-2 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                              >
                                <CheckCircle className="w-4 h-4" />
                                {processing === d.id ? 'Validation…' : 'Valider'}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
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

      {/* Modale de confirmation validation */}
      <AnimatePresence>
        {confirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setConfirmModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5"
            >
              {/* Icône */}
              <div className="flex items-center justify-center w-12 h-12 bg-green-50 rounded-xl mx-auto">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>

              {/* Texte */}
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-slate-900">Valider cette demande ?</h3>
                <p className="text-sm text-slate-500">
                  Le service <span className="font-semibold text-slate-700">"{confirmModal.nom}"</span> sera ajouté à l'hôpital.
                </p>
              </div>

              {/* Boutons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleValider(confirmModal.id)}
                  className="flex-1 py-2.5 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Confirmer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
