// @ts-nocheck
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  FileText, 
  Calendar, 
  Building, 
  User, 
  Download, 
  AlertCircle, 
  ChevronRight,
  ShieldCheck,
  QrCode
} from 'lucide-react';
import { Card, Button, Input, Badge } from '@/components/ui';
import { api, endpoints } from '@/services/api';

interface Result {
  id: number;
  titre: string;
  date_analyse: string;
  laboratoire: string;
  patient_display_nom: string;
  hopital_nom: string;
  fichier: string | null;
}

export default function TrackResultsPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
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
      const response = await api.get<Result>(endpoints.getResultatByCode(code.trim().toUpperCase()));
      setResult(response);
    } catch (err: any) {
      setError(err.response?.data?.error || "Code d'accès invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 lg:p-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl space-y-8"
      >
        {/* Header Design */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full border border-primary/20">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest italic">Portail Sécurisé BioTrack</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">Suivi de Résultats</h1>
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Entrez votre code unique pour accéder à vos documents</p>
        </div>

        {/* Search Matrix */}
        <Card className="border-4 border-slate-100 p-8 lg:p-12 bg-white shadow-2xl rounded-[2rem]">
          <form onSubmit={handleTrack} className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
                <QrCode className="w-3 h-3 text-primary" /> CODE DE VÉRIFICATION (6 CARACTÈRES)
              </label>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Input 
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="EX: BK92X1"
                    maxLength={10}
                    className="h-16 px-8 text-2xl font-black tracking-[0.5em] text-slate-950 uppercase border-2 focus:border-primary transition-all rounded-2xl placeholder:opacity-20"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2">
                    <Search className={`w-6 h-6 ${loading ? 'animate-spin text-primary' : 'text-slate-200'}`} />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={!code || loading}
                  className="h-16 px-10 rounded-2xl bg-slate-950 text-white font-black italic shadow-xl shadow-slate-900/20 active:scale-95 transition-all text-xs"
                >
                  VÉRIFIER
                </Button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-5 bg-rose-50 border-2 border-rose-100 rounded-2xl flex items-center gap-4 text-rose-600"
                >
                  <AlertCircle className="w-6 h-6 flex-shrink-0" />
                  <p className="text-xs font-black uppercase italic tracking-tight">{error}</p>
                </motion.div>
              )}

              {result && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 pt-4"
                >
                  <div className="h-px bg-slate-100 w-full" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-100 hover:border-primary transition-colors">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3 italic">Document</p>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border-2 border-slate-100 shadow-sm">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-950 uppercase leading-none">{result.titre}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase italic mt-1 italic italic italic">BioTrack_System v2</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3 italic">Établissement</p>
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border-2 border-slate-100 shadow-sm">
                          <Building className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-[11px] font-black text-slate-950 uppercase leading-tight italic">{result.hopital_nom}</p>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3 italic">Patient</p>
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border-2 border-slate-100 shadow-sm">
                          <User className="w-5 h-5 text-slate-950" />
                        </div>
                        <p className="text-[11px] font-black text-slate-950 uppercase leading-tight italic">{result.patient_display_nom}</p>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3 italic">Date d'Analyse</p>
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border-2 border-slate-100 shadow-sm">
                          <Calendar className="w-5 h-5 text-amber-500" />
                        </div>
                        <p className="text-[11px] font-black text-slate-950 uppercase leading-tight italic">{new Date(result.date_analyse).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>

                  {result.fichier ? (
                    <a 
                      href={result.fichier} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full h-16 bg-primary text-white rounded-2xl flex items-center justify-center gap-3 font-black italic shadow-2xl shadow-primary/30 group transition-all"
                    >
                      <Download className="w-6 h-6 group-hover:scale-125 transition-transform" />
                      TÉLÉCHARGER LE RAPPORT PDF
                    </a>
                  ) : (
                    <div className="p-5 bg-amber-50 border-2 border-amber-100 rounded-2xl flex items-center gap-4 text-amber-600">
                      <AlertCircle className="w-6 h-6 flex-shrink-0" />
                      <p className="text-[10px] font-black uppercase italic tracking-tight">Le fichier PDF n'est pas encore généré. Veuillez contacter le laboratoire ({result.laboratoire}).</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </Card>

        {/* Footer info */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border-2 border-slate-100 shadow-sm">
               <ShieldCheck className="w-7 h-7 text-emerald-500" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[9px] font-black text-slate-900 uppercase tracking-wider">Certifié ISO 27001</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase italic">Cryptage de niveau militaire</p>
            </div>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic text-center md:text-right max-w-xs">
            Le code d'accès est à usage unique. Ne le partagez jamais.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
