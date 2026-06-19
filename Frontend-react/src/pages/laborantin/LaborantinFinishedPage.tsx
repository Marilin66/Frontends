
import { useState, useEffect } from 'react';
import { api, endpoints } from '@/services/api';
import { Button, PageLoader, Pagination, usePagination } from '@/components/ui';
import { FlaskConical, CheckCircle, Search, Download, Mail, Calendar, Key } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DemandeAnalyse } from '@/types/api';
import { toArray } from '@/types/api';

const PAGE_SIZE = 15;

export default function LaborantinFinishedPage() {
  const [demandes, setDemandes] = useState<DemandeAnalyse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    // On récupère les demandes clôturées (pas les résultats bruts)
    api.get(endpoints.demandesAnalyse, { statut: 'cloture' })
      .then((data) => {
        const all = toArray<DemandeAnalyse>(data);
        setDemandes(all.filter((d) => d.statut === 'cloture'));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = demandes.filter((d) => {
    const q = search.toLowerCase();
    return (
      `${d.patient_prenom} ${d.patient_nom}`.toLowerCase().includes(q) ||
      (d.type_analyse || '').toLowerCase().includes(q)
    );
  });

  const { paged, totalItems, totalPages } = usePagination(filtered, PAGE_SIZE, page);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analyses clôturées</h1>
          <p className="text-sm text-slate-500 mt-0.5">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher un patient ou une analyse..."
          className="w-full h-10 pl-9 pr-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <FlaskConical className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">
            {search ? `Aucun résultat pour "${search}"` : 'Aucune analyse clôturée'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {paged.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold text-slate-900 truncate">
                        {d.patient_prenom} {d.patient_nom}
                      </p>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium shrink-0">
                        Clôturé
                      </span>
                    </div>

                    <p className="text-sm text-slate-600">{d.type_analyse}</p>

                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      {d.patient_email && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Mail className="w-3 h-3" /> {d.patient_email}
                        </span>
                      )}
                      {d.date_cloture && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Calendar className="w-3 h-3" />
                          Clôturé le {new Date(d.date_cloture).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                      {d.resultat_code && (
                        <span className="flex items-center gap-1 text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                          <Key className="w-3 h-3" /> {d.resultat_code}
                        </span>
                      )}
                    </div>
                  </div>
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
    </div>
  );
}
