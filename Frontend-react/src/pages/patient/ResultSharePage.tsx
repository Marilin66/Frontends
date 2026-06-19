
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, endpoints } from '@/services/api';
import { Card, Button, PageLoader } from '@/components/ui';
import { ArrowLeft, Share2, Search, CheckCircle, User, Building, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { ErrorModal } from '@/components/ui';

export default function ResultSharePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [resultat, setResultat] = useState<any>(null);
  const [medecins, setMedecins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sharing, setSharing] = useState<number | null>(null);
  const [shared, setShared] = useState<number[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(endpoints.resultatDetail(Number(id))),
      api.get(endpoints.medecins),
    ]).then(([r, m]: any) => {
      setResultat(r);
      setMedecins(Array.isArray(m) ? m : m.results ?? []);
      // Pre-populate already shared
      const alreadyShared = (r.medecins_partages ?? []).map((p: any) => p.id ?? p);
      setShared(alreadyShared);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const handleShare = async (medecinId: number) => {
    setSharing(medecinId);
    try {
      await api.post(`${endpoints.resultats}${id}/partager/`, { medecin: medecinId });
      setShared(s => [...s, medecinId]);
    } catch { setErrorMsg('Erreur lors du partage. Veuillez réessayer.'); }
    finally { setSharing(null); }
  };

  const filtered = medecins.filter(m => {
    const q = search.toLowerCase();
    return (
      `${m.first_name ?? ''} ${m.last_name ?? ''}`.toLowerCase().includes(q) ||
      (m.hopital_nom ?? '').toLowerCase().includes(q)
    );
  });

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition">
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Partager le résultat</h1>
          <p className="text-sm text-slate-500">Choisissez un médecin</p>
        </div>
      </div>

      {/* Résultat info */}
      {resultat && (
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Share2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">{resultat.titre || 'Résultat d\'analyse'}</p>
              <p className="text-sm text-slate-500">
                Partagé avec {shared.length} médecin{shared.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Already shared */}
      {shared.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Déjà partagé avec</p>
          <div className="flex flex-wrap gap-2">
            {medecins.filter(m => shared.includes(m.id)).map(m => (
              <span key={m.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-medium">
                <CheckCircle className="w-3 h-3" />
                Dr. {m.first_name} {m.last_name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher un médecin…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      </div>

      {/* Medecins list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="w-10 h-10 text-slate-300 mb-3" />
          <p className="text-slate-500 text-sm">{search ? `Aucun résultat pour "${search}"` : 'Aucun médecin disponible'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((m, i) => {
            const isShared = shared.includes(m.id);
            return (
              <motion.div key={m.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card padding="sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 font-bold text-blue-600 text-sm">
                      {(m.first_name?.[0] ?? 'M').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">Dr. {m.first_name} {m.last_name}</p>
                      {m.hopital_nom && (
                        <span className="flex items-center gap-1 text-xs text-slate-400 truncate">
                          <Building className="w-3 h-3 shrink-0" /> {m.hopital_nom}
                        </span>
                      )}
                    </div>
                    {isShared ? (
                      <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 font-medium shrink-0">
                        <CheckCircle className="w-3 h-3" /> Partagé
                      </span>
                    ) : (
                      <button
                        onClick={() => handleShare(m.id)}
                        disabled={sharing === m.id}
                        className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition disabled:opacity-50 shrink-0"
                      >
                        {sharing === m.id ? '…' : 'Partager'}
                      </button>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
      <ErrorModal message={errorMsg} onClose={() => setErrorMsg('')} />
    </div>
  );
}
