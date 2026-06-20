
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, FileText, Calendar, Building, User, 
  Download, AlertCircle, ShieldCheck, QrCode, Loader2
} from 'lucide-react';
import { Card, Button, Input, Badge } from '@/components/ui';
import { api, endpoints } from '@/services/api';

const API_BASE = (import.meta.env.VITE_API_URL as string || 'https://backend-x5yj.onrender.com/api')
  .replace(/\/api\/?$/, '');

interface Result {
  id: number;
  titre: string;
  date_analyse: string;
  laboratoire: string;
  patient_display_nom: string;
  hopital_nom?: string;
  fichier: string | null;
  code_acces?: string;
}

/** Télécharge un PDF public (accès via code — sans authentification) */
async function downloadPublicPdf(fichier: string, titre: string) {
  // fichier peut être une URL absolue ou relative (/media/...)
  const url = fichier.startsWith('http') ? fichier : `${API_BASE}${fichier}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error();
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = `${titre || 'resultat'}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
  } catch {
    // Fallback : ouvrir dans un nouvel onglet
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

export default function TrackResultsPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Utilisation du point de terminaison public du backend
      const response = await api.get<Result>(endpoints.getResultatByCode(code.trim()));
      setResult(response);
    } catch (err: any) {
      setError(err.response?.data?.error || "Code d'accès invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-6 lg:p-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl space-y-10"
      >
        {/* Header Design Premium */}
        <div className="text-center space-y-3">
          <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.2em] text-[9px]">
            Portail Sécurisé BioTrack
          </Badge>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">Consultez vos résultats d'analyses</h1>
          <p className="text-sm text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
            Saisissez le code unique fourni par votre laboratoire pour accéder à vos documents médicaux.
          </p>
        </div>

        {/* Console de Recherche SaaS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 lg:p-12 shadow-2xl shadow-slate-200/50 dark:shadow-none rounded-[2.5rem] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-primary/20" />
          
          <form onSubmit={handleTrack} className="space-y-10 relative z-10">
            <div className="space-y-4">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-2">
                Code d'accès fourni par le laboratoire
              </label>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 group">
                  <Input 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Saisissez votre code d'accès"
                    className="h-16 px-8 text-xl font-bold tracking-[0.15em] text-slate-900 border-2 border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all rounded-2xl placeholder:text-slate-200 outline-none"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2">
                    <QrCode className={`w-6 h-6 ${loading ? 'animate-spin text-primary' : 'text-slate-200 group-focus-within:text-primary transition-colors'}`} />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={!code.trim() || loading}
                  className="h-16 px-10 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-xl shadow-slate-900/10 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  <span>Vérifier</span>
                </Button>
              </div>
              <p className="text-xs text-slate-400 px-2">
                Le code est reçu par email ou visible dans votre espace patient après clôture de l'analyse.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4 text-rose-600"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-xs font-bold leading-tight">{error}</p>
                </motion.div>
              )}

              {result && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-8 pt-4 animate-fade-in"
                >
                  <div className="flex items-center gap-4">
                     <div className="flex-1 h-px bg-slate-100" />
                     <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Résultats trouvés</span>
                     <div className="flex-1 h-px bg-slate-100" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 group/item hover:border-primary/20 transition-all">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Dossier Médical</p>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 group-hover/item:scale-110 transition-transform">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 truncate max-w-[160px]">{result.titre}</p>
                          <p className="text-[10px] font-medium text-slate-400 mt-0.5">BioTrack Digital ID</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Laboratoire</p>
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                          <Building className="w-5 h-5 text-slate-400" />
                        </div>
                        <p className="text-xs font-bold text-slate-700 leading-tight">{result.hopital_nom}</p>
                      </div>
                    </div>

                    <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Bénéficiaire</p>
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                          <User className="w-5 h-5 text-slate-400" />
                        </div>
                        <p className="text-xs font-bold text-slate-700 leading-tight">{result.patient_display_nom}</p>
                      </div>
                    </div>

                    <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Date d'Analyse</p>
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                          <Calendar className="w-5 h-5 text-amber-500" />
                        </div>
                        <p className="text-xs font-bold text-slate-700 leading-tight">{new Date(result.date_analyse).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>

                  {result.fichier ? (
                    <button
                      onClick={async () => {
                        if (!result.fichier) return;
                        setDownloading(true);
                        try { await downloadPublicPdf(result.fichier, result.titre); }
                        finally { setDownloading(false); }
                      }}
                      disabled={downloading}
                      className="w-full h-16 bg-primary text-white rounded-2xl flex items-center justify-center gap-4 font-bold shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all group disabled:opacity-70"
                    >
                      {downloading
                        ? <><Loader2 className="w-6 h-6 animate-spin" /><span>Téléchargement en cours...</span></>
                        : <><Download className="w-6 h-6 group-hover:-translate-y-1 transition-transform" /><span>Télécharger le rapport officiel (PDF)</span></>
                      }
                    </button>
                  ) : (
                    <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-4 text-amber-700">
                      <AlertCircle className="w-6 h-6 flex-shrink-0" />
                      <p className="text-xs font-bold leading-tight">Le fichier PDF est en cours de génération. Veuillez réessayer plus tard ou contacter le laboratoire.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* Footer info Premium */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 px-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm">
               <ShieldCheck className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.15em]">Données Chiffrées</p>
              <p className="text-xs text-slate-500 font-medium">Protection conforme aux normes de santé.</p>
            </div>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center md:text-right max-w-[240px] leading-relaxed">
            Ce portail est exclusivement réservé au suivi patient. Ne partagez jamais votre code.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
