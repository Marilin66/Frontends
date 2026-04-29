// @ts-nocheck
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Search, 
  ShieldCheck,
  Filter,
  FlaskConical,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { api, endpoints } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface Result {
  id: number;
  date_analyse: string;
  type_analyse: string;
  resultat: string;
  laborantin_name: string;
  patient_name: string;
}

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await api.get<any>(endpoints.resultats);
      const raw = Array.isArray(response) ? response : response.results || [];
      // Normalize: ensure all rendered fields are primitive strings
      const normalized = raw.map((r: any) => ({
        id: r.id,
        date_analyse: typeof r.date_analyse === 'string' ? r.date_analyse : (r.date_resultat || ''),
        type_analyse: typeof r.type_analyse === 'string' ? r.type_analyse : (r.titre || r.type_analyse?.nom || ''),
        resultat: typeof r.resultat === 'string' ? r.resultat : (r.observations || ''),
        laborantin_name: typeof r.laborantin_name === 'string' ? r.laborantin_name : (r.laborantin_nom || ''),
        patient_name: typeof r.patient_name === 'string' ? r.patient_name : (r.patient_display_nom || r.patient_nom || ''),
        fichier: r.fichier || null,
      }));
      setResults(normalized);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter(r => 
    (typeof r.type_analyse === 'string' ? r.type_analyse : '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 lg:space-y-10">
      {/* High-Contrast Command Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-3">
             <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-5 h-5 text-white" />
             </div>
             <div className="bg-emerald-100 text-emerald-950 border-2 border-emerald-200 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest italic">
                SECURE_ARCHIVE
             </div>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">Archives Bio-Cliniques</h1>
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mt-3 italic">{filteredResults.length} Dossiers Opérationnels</p>
        </motion.div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors z-10" />
            <input 
              placeholder="Rechercher une analyse..." 
              className="pl-12 w-64 h-11 lg:h-12 rounded-xl bg-white border-2 border-slate-200 focus:border-primary text-slate-950 text-xs font-bold transition-all shadow-sm italic"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="h-11 lg:h-12 w-11 lg:w-12 p-0 rounded-xl border-2">
             <Filter className="w-5 h-5 text-slate-950" />
          </Button>
        </div>
      </section>

      {/* High-Impact Results Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-slate-200 rounded-2xl animate-pulse" />
          ))
        ) : filteredResults.length > 0 ? (
          filteredResults.map((result, idx) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card hover variant="default" className="group overflow-hidden border-2 border-slate-100 p-6 lg:p-8 bg-white hover:border-primary transition-all duration-300">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 lg:w-14 lg:h-14 rounded-xl bg-slate-950 flex items-center justify-center shadow-xl group-hover:rotate-6 transition-all">
                      <FlaskConical className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl lg:text-2xl font-black text-slate-950 tracking-tighter uppercase italic leading-none">{result.type_analyse || '—'}</h3>
                      <div className="flex items-center gap-2 mt-2 text-slate-500">
                         <Clock className="w-4 h-4 text-primary" />
                         <span className="text-[10px] font-black uppercase tracking-widest italic">{result.date_analyse}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-emerald-500 text-white text-[8px] font-black px-4 py-1.5 rounded-lg italic shadow-lg shadow-emerald-500/20">VALIDE</div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 lg:p-8 mb-8 group-hover:bg-primary/5 transition-colors border-2 border-slate-100">
                   <div className="flex items-center justify-between">
                      <div className="space-y-2">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Valeur Clinique Synchronisée</p>
                          <p className="text-2xl lg:text-3xl font-black text-slate-950 tracking-tighter italic uppercase">{result.resultat || '—'}</p>
                      </div>
                      <CheckCircle className="w-10 h-10 lg:w-14 lg:h-14 text-emerald-600 opacity-20 group-hover:opacity-100 transition-all duration-500" />
                   </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t-2 border-slate-50">
                  <div className="flex items-center gap-4">
                     <div className="flex -space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 border-2 border-white flex items-center justify-center text-[9px] font-black text-white">JS</div>
                        <div className="w-8 h-8 rounded-lg bg-primary border-2 border-white flex items-center justify-center text-[9px] font-black text-white shadow-lg">SC</div>
                     </div>
                     <span className="text-[10px] font-black text-slate-950 uppercase tracking-widest italic truncate max-w-[120px]">{result.patient_name || '—'}</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="primary" 
                    className="h-10 lg:h-12 px-6 rounded-xl text-[10px] font-black group/dl italic"
                    onClick={() => {
                      if (result.fichier) {
                        window.open(result.fichier, '_blank');
                      } else {
                        alert('Aucun fichier disponible pour ce résultat.');
                      }
                    }}
                  >
                     ARCHIVE PDF <Download className="w-4 h-4 ml-2 group-hover/dl:translate-y-1 transition-transform" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
             <AlertCircle className="w-16 h-16 text-slate-200 mx-auto mb-6" />
             <p className="text-xl font-black text-slate-300 uppercase tracking-widest italic">Aucun segment bio-clinique trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}
