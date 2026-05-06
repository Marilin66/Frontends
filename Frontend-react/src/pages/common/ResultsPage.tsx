// @ts-nocheck
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Search, FlaskConical, Clock, RefreshCw, Share2, User } from 'lucide-react';
import { Button, PageLoader } from '@/components/ui';
import { api, endpoints } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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

  if (loading && results.length === 0) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {user?.role === 'medecin' ? 'Résultats partagés' : 'Mes résultats'}
          </h1>
          <p className="text-slate-500 mt-1">{results.length} résultat{results.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={fetchResults} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher par titre ou patient..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
        />
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-200">
          <FlaskConical className="w-12 h-12 text-slate-200 mb-4" />
          <p className="font-medium text-slate-500">
            {searchTerm ? `Aucun résultat pour "${searchTerm}"` : 'Aucun résultat disponible'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-card-md transition-all">

                {/* En-tête */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                    <FlaskConical className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{r.titre}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {r.date_analyse && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="w-3 h-3" />
                          {new Date(r.date_analyse).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                        Disponible
                      </span>
                    </div>
                  </div>
                </div>

                {/* Infos */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <User className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Patient : {r.patient_nom}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <FlaskConical className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Laboratoire : {r.laboratoire}</span>
                  </div>
                  {r.medecins_partages?.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Share2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Partagé avec {r.medecins_partages.length} médecin(s)</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  {r.fichier && (
                    <button
                      onClick={() => window.open(r.fichier, '_blank')}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition"
                    >
                      <Download className="w-3.5 h-3.5" /> Télécharger
                    </button>
                  )}
                  {/* Partager (patient uniquement) */}
                  {user?.role === 'patient' && (
                    <button
                      onClick={() => navigate(`/patient/results/${r.id}/share`, { state: { resultat: r } })}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
                    >
                      <Share2 className="w-3.5 h-3.5" /> Partager
                    </button>
                  )}
                  {!r.fichier && user?.role !== 'patient' && (
                    <p className="text-xs text-slate-400 italic py-2">Aucun fichier joint</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

interface Result {
  id: number;
  date_analyse: string;
  type_analyse: string;
  resultat: string;
  laborantin_name: string;
  patient_name: string;
}

