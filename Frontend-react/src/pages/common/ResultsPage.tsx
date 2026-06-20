
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Search, FlaskConical, Clock, RefreshCw, Share2, User, Loader2 } from 'lucide-react';
import { PageLoader, Pagination, usePagination } from '@/components/ui';
import { api, endpoints } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';

const PAGE_SIZE = 12;

/** Télécharge le PDF via l'endpoint sécurisé du backend (auth requise) */
async function downloadResultat(id: number, titre: string) {
  const base = (import.meta.env.VITE_API_URL as string) || 'https://backend-x5yj.onrender.com/api';
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';
  const url = `${base}${endpoints.resultatTelecharger(id)}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error(`Erreur ${response.status}`);

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = `${titre || 'resultat'}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
}

export default function ResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [downloading, setDownloading] = useState<number | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchResults(); }, []);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const response: any = await api.get(endpoints.resultats);
      const raw = Array.isArray(response) ? response : response.results || [];
      const normalized = raw.map((r: any) => ({
        id: r.id,
        titre: r.titre || r.type_analyse || 'Résultat d\'analyse',
        date_analyse: r.date_analyse || r.date_depot || '',
        patient_nom: r.patient_display_nom || r.patient_nom || r.patient_name || '—',
        laborantin_nom: r.laborantin_nom || r.laborantin_name || '—',
        laboratoire: r.laboratoire || '—',
        code_acces: r.code_acces || '',
        fichier: r.fichier || null,
        medecins_partages: r.medecins_partages || [],
      }));
      setResults(normalized);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filtered = results.filter(r =>
    r.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.patient_nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { paged, totalItems, totalPages } = usePagination(filtered, PAGE_SIZE, page);
  const { canPartagerResultat, canTelechargerResultat } = usePermissions();

  if (loading && results.length === 0) return <PageLoader />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-20">

      {/* Header style ENT */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">
            {user?.role === 'medecin' ? 'Résultats partagés' : 'Mes résultats'}
          </h1>
          <p className="text-slate-500 font-medium">
            Consultez et partagez vos analyses biologiques ({results.length} documents disponibles)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Rechercher une analyse..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-64 pl-9 px-4 py-3 rounded-2xl border border-slate-200 text-sm text-slate-900 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all bg-white"
            />
          </div>
          <button 
            onClick={fetchResults} 
            className="flex items-center justify-center w-12 h-12 rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 shadow-sm"
            title="Actualiser"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200">
          <FlaskConical className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">
            {searchTerm ? `Aucun résultat pour "${searchTerm}"` : 'Aucun résultat disponible'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {paged.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-slate-300 transition-all duration-200">

                {/* En-tête */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                    <FlaskConical className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{r.titre}</p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {r.date_analyse && (
                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          {new Date(r.date_analyse).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                      <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium">
                        Disponible
                      </span>
                    </div>
                  </div>
                </div>

                {/* Infos */}
                <div className="space-y-1.5 mb-4 bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <User className="w-3.5 h-3.5 shrink-0 text-primary" />
                    <span className="truncate">Patient : {r.patient_nom}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <FlaskConical className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                    <span className="truncate">Laboratoire : {r.laboratoire}</span>
                  </div>
                  {r.medecins_partages?.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Share2 className="w-3.5 h-3.5 shrink-0 text-violet-500" />
                      <span>Partagé avec {r.medecins_partages.length} médecin(s)</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-3 border-t border-slate-100">
                  {r.fichier && canTelechargerResultat && (
                    <button
                      onClick={async () => {
                        setDownloading(r.id);
                        try { await downloadResultat(r.id, r.titre); }
                        catch { window.open(r.fichier, '_blank'); } // fallback
                        finally { setDownloading(null); }
                      }}
                      disabled={downloading === r.id}
                      className="flex-1 flex items-center justify-center gap-2 h-9 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-60"
                    >
                      {downloading === r.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Download className="w-3.5 h-3.5" />}
                      {downloading === r.id ? 'Téléchargement...' : 'Télécharger'}
                    </button>
                  )}
                  {canPartagerResultat && (
                    <button
                      onClick={() => navigate(`/patient/results/${r.id}/share`, { state: { resultat: r } })}
                      className="flex-1 flex items-center justify-center gap-2 h-9 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
                    >
                      <Share2 className="w-3.5 h-3.5" /> Partager
                    </button>
                  )}
                  {!r.fichier && !canPartagerResultat && (
                    <p className="text-xs text-slate-400 py-2">Aucun fichier joint</p>
                  )}
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
    </motion.div>
  );
}
