// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  FlaskConical, 
  Plus, 
  Search, 
  Activity, 
  CheckCircle, 
  Clock, 
  X, 
  ShieldCheck,
  Zap,
  MoreVertical,
  TrendingUp,
  ArrowUpRight,
  Filter,
  ChevronRight,
  PlayCircle,
  FileCheck,
  Upload,
  User,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, Badge, Button, Avatar, Input } from '@/components/ui';
import { api, endpoints } from '@/services/api';

interface DemandeAnalyse {
  id: number;
  patient_nom: string;
  patient_telephone: string;
  type_analyse: string;
  statut: 'en_attente' | 'en_cours' | 'cloture';
  date_demande: string;
  hopital_nom: string;
}

interface Resultat {
  id: number;
  patient_display_nom: string;
  titre: string;
  date_analyse: string;
  fichier: string | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export default function LaborantinDashboard() {
  const [demandes, setDemandes] = useState<DemandeAnalyse[]>([]);
  const [results, setResults] = useState<Resultat[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'archive'>('requests');
  
  // Modal states
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isClotureModalOpen, setIsClotureModalOpen] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState<DemandeAnalyse | null>(null);

  const [formData, setFormData] = useState({
    patient_email: '',
    type_analyse: '',
    notes: ''
  });

  const [clotureData, setClotureData] = useState({
    observations: '',
    fichier: null as File | null
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [demandesData, resultsData] = await Promise.all([
        api.get<any>(endpoints.demandesAnalyse),
        api.get<any>(endpoints.resultats)
      ]);
      
      setDemandes(Array.isArray(demandesData) ? demandesData : demandesData.results || []);
      setResults(Array.isArray(resultsData) ? resultsData : resultsData.results || []);
    } catch (error) {
      console.error('Erreur Data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post(endpoints.demandesAnalyse, formData);
      setIsRequestModalOpen(false);
      setFormData({ patient_email: '', type_analyse: '', notes: '' });
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || "Erreur lors de la création.");
    } finally {
      setLoading(false);
    }
  };

  const handleOuvrir = async (id: number) => {
    try {
      setLoading(true);
      await api.post(endpoints.ouvrirAnalyse(id));
      fetchData();
    } catch (error: any) {
      alert("Impossible d'ouvrir l'analyse.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloturer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDemande) return;

    const body = new FormData();
    body.append('observations', clotureData.observations);
    if (clotureData.fichier) {
      body.append('fichier', clotureData.fichier);
    }

    try {
      setLoading(true);
      await api.post(endpoints.cloturerAnalyse(selectedDemande.id), body);
      setIsClotureModalOpen(false);
      setSelectedDemande(null);
      setClotureData({ observations: '', fichier: null });
      fetchData();
      alert("Analyse clôturée avec succès ! Le patient a été notifié.");
    } catch (error: any) {
      alert(error.response?.data?.error || "Erreur lors de la clôture.");
    } finally {
      setLoading(false);
    }
  };

  const openClotureModal = (demande: DemandeAnalyse) => {
    setSelectedDemande(demande);
    setIsClotureModalOpen(true);
  };

  const stats = {
    pending: demandes.filter(d => d.statut === 'en_attente').length,
    active: demandes.filter(d => d.statut === 'en_cours').length,
    completedToday: results.length // Simplifié
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 lg:space-y-12 pb-20"
    >
      {/* Header BioAnalytics */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center shadow-lg">
                <FlaskConical className="w-6 h-6 text-white" />
             </div>
             <div className="bg-slate-900 text-white border-2 border-slate-800 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest italic">
                BIO_ANALYST_NODE.
             </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">Console Laboratoire</h1>
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mt-4 italic">Gouvernance des flux d'analyses biologiques</p>
        </motion.div>

        <div className="flex items-center gap-3">
           <Button onClick={() => setIsRequestModalOpen(true)} className="h-12 px-8 rounded-xl text-[10px] italic bg-slate-950 hover:bg-primary transition-all font-black uppercase">
             <Plus className="w-4 h-4 mr-2" /> NOUVEAU TUBE
           </Button>
           <div className="h-12 bg-white border-2 border-slate-100 rounded-xl flex p-1">
              <button 
                onClick={() => setActiveTab('requests')}
                className={`px-6 rounded-lg text-[9px] font-black uppercase italic transition-all ${activeTab === 'requests' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Demandes
              </button>
              <button 
                onClick={() => setActiveTab('archive')}
                className={`px-6 rounded-lg text-[9px] font-black uppercase italic transition-all ${activeTab === 'archive' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Archives
              </button>
           </div>
        </div>
      </section>

      {/* Real-time BioMetrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
        {[
          { label: 'Analyses en attente', value: stats.pending, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'En cours de traitement', value: stats.active, icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-50' },
          { label: 'Certifications globales', value: stats.completedToday, icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' }
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="border-4 border-slate-50 shadow-premium p-8 flex flex-col gap-6 group hover:border-primary/20 transition-all">
               <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-7 h-7" />
               </div>
               <div>
                  <p className="text-5xl font-black text-slate-950 tracking-tighter leading-none italic">{stat.value}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3 italic">{stat.label}</p>
               </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Analysis Matrix */}
      <AnimatePresence mode="wait">
        {activeTab === 'requests' ? (
          <motion.div
            key="requests"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {demandes.map((d) => (
              <motion.div key={d.id} variants={itemVariants}>
                <Card className={`border-2 ${d.statut === 'en_cours' ? 'border-primary bg-primary/[0.02]' : 'border-slate-100 bg-white'} p-8 rounded-3xl relative overflow-hidden group`}>
                   <div className="absolute top-0 right-0 p-4">
                      <Badge className={`${d.statut === 'en_cours' ? 'bg-primary' : 'bg-slate-200'} text-white border-none font-black italic`}>
                        {d.statut.toUpperCase()}
                      </Badge>
                   </div>

                   <div className="flex items-start gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center text-slate-950 shadow-sm relative overflow-hidden">
                         <div className={`absolute inset-0 ${d.statut === 'en_cours' ? 'bg-primary/10 animate-pulse' : ''}`} />
                         <FlaskConical className={`w-8 h-8 relative z-10 ${d.statut === 'en_cours' ? 'text-primary' : 'text-slate-400'}`} />
                      </div>
                      <div className="space-y-1">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{d.hopital_nom || 'LABO_SYNCHRO'}</p>
                         <h3 className="text-2xl font-black text-slate-950 tracking-tighter uppercase italic">{d.patient_nom}</h3>
                         <p className="text-sm font-black text-primary uppercase italic">{d.type_analyse}</p>
                      </div>
                   </div>

                   <div className="mt-8 grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white border-2 border-slate-50 rounded-2xl">
                         <p className="text-[8px] font-black text-slate-400 uppercase italic mb-1">Identifiant Tube</p>
                         <p className="text-xs font-black text-slate-950 uppercase italic tracking-widest">#{d.id}992X</p>
                      </div>
                      <div className="p-4 bg-white border-2 border-slate-50 rounded-2xl">
                         <p className="text-[8px] font-black text-slate-400 uppercase italic mb-1">Horodatage</p>
                         <p className="text-xs font-black text-slate-950 uppercase italic tracking-tight">{new Date(d.date_demande).toLocaleDateString()}</p>
                      </div>
                   </div>

                   <div className="mt-8 flex gap-3">
                      {d.statut === 'en_attente' ? (
                        <Button 
                          onClick={() => handleOuvrir(d.id)}
                          className="flex-1 h-14 rounded-2xl bg-slate-950 text-white font-black italic shadow-xl shadow-slate-900/20 active:scale-95 transition-all uppercase"
                        >
                          <PlayCircle className="w-5 h-5 mr-3 text-emerald-400" /> OUVRIR ANALYSE
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => openClotureModal(d)}
                          className="flex-1 h-14 rounded-2xl bg-primary text-white font-black italic shadow-xl shadow-primary/20 active:scale-95 transition-all uppercase"
                        >
                          <FileCheck className="w-5 h-5 mr-3" /> CLÔTURER & SIGNER
                        </Button>
                      )}
                      <Button variant="outline" className="h-14 w-14 rounded-2xl border-2 border-slate-100 hover:border-slate-300">
                         <MoreVertical className="w-5 h-5" />
                      </Button>
                   </div>
                </Card>
              </motion.div>
            ))}
            
            {demandes.length === 0 && (
              <div className="col-span-full py-32 text-center bg-slate-50 rounded-[3rem] border-4 border-slate-100 border-dashed">
                 <FlaskConical className="w-20 h-20 text-slate-200 mx-auto mb-6" />
                 <p className="text-2xl font-black text-slate-300 uppercase tracking-[0.2em] italic">Aucune demande transmise</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="archive"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <Card className="border-4 border-slate-50 shadow-premium bg-white rounded-[3rem] overflow-hidden">
               <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left">
                     <thead className="bg-slate-50 border-b-2 border-slate-100 italic">
                        <tr>
                           <th className="py-8 px-10 text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Patient_Core</th>
                           <th className="py-8 px-6 text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Analyse</th>
                           <th className="py-8 px-6 text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Dernier Rapport</th>
                           <th className="py-8 px-6 text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Certification</th>
                           <th className="py-8 px-10 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right italic">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y-2 divide-slate-50">
                        {results.map((r) => (
                           <tr key={r.id} className="group hover:bg-slate-50/50 transition-all italic">
                              <td className="py-8 px-10">
                                 <div className="flex items-center gap-5">
                                    <Avatar name={r.patient_display_nom} className="w-12 h-12 ring-2 ring-primary/20" />
                                    <div>
                                       <p className="font-black text-slate-950 uppercase">{r.patient_display_nom}</p>
                                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ID: BIO-{r.id}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="py-8 px-6">
                                 <Badge variant="outline" className="border-primary/20 text-primary font-black uppercase text-[9px] italic">{r.titre}</Badge>
                              </td>
                              <td className="py-8 px-6">
                                 <p className="text-xs font-black text-slate-900 tracking-tight italic">{new Date(r.date_analyse).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</p>
                              </td>
                              <td className="py-8 px-6">
                                 <div className="inline-flex items-center gap-2 text-emerald-500 font-black text-[9px] uppercase italic">
                                    <ShieldCheck className="w-4 h-4" /> SIGNÉ_NUMÉRIQUEMENT
                                 </div>
                              </td>
                              <td className="py-8 px-10 text-right">
                                 {r.fichier && (
                                   <a href={r.fichier} target="_blank" className="inline-flex h-10 px-5 bg-slate-900 text-white rounded-xl items-center text-[8px] font-black italic hover:bg-primary transition-all uppercase">
                                      PDF <ChevronRight className="w-3 h-3 ml-2" />
                                   </a>
                                 )}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Nouvelle Demande */}
      <AnimatePresence>
        {isRequestModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setIsRequestModalOpen(false)}
               className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-xl"
            >
              <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="bg-slate-950 p-10 text-white relative">
                   <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl -mr-24 -mt-24" />
                   <div className="relative z-10 flex justify-between items-center">
                      <div>
                        <CardTitle className="text-3xl font-black italic uppercase tracking-tighter">Initialisation Tube</CardTitle>
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] mt-3">Séquençage de flux biologique</p>
                      </div>
                      <Button variant="ghost" onClick={() => setIsRequestModalOpen(false)} className="text-white hover:bg-white/10 h-12 w-12 rounded-xl"><X /></Button>
                   </div>
                </CardHeader>
                <form onSubmit={handleCreateRequest} className="p-10 space-y-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase italic ml-1">E-mail Patient_Target</label>
                      <div className="relative">
                         <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                         <input 
                           required className="w-full pl-12 h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-black text-slate-950 focus:border-primary outline-none transition-all italic" 
                           placeholder="identite@bio.com"
                           value={formData.patient_email}
                           onChange={(e) => setFormData({...formData, patient_email: e.target.value})}
                         />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase italic ml-1">Vecteur Analytique</label>
                      <input 
                        required className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-black text-slate-950 focus:border-primary outline-none transition-all italic px-6 uppercase" 
                        placeholder="Ex: HÉMOGRAMME COMPLET..."
                        value={formData.type_analyse}
                        onChange={(e) => setFormData({...formData, type_analyse: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase italic ml-1">Notes Cliniques</label>
                      <textarea 
                        className="w-full h-32 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-black text-slate-950 focus:border-primary outline-none transition-all italic p-6 resize-none" 
                        placeholder="Instructions spécifiques..."
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      />
                   </div>
                   <Button type="submit" className="w-full h-16 rounded-2xl bg-primary text-white font-black italic shadow-2xl shadow-primary/30 text-xs uppercase tracking-widest">
                      VALIDER L'ENTRÉE <ChevronRight className="ml-2" />
                   </Button>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Clôture avec Upload PDF */}
      <AnimatePresence>
        {isClotureModalOpen && selectedDemande && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setIsClotureModalOpen(false)}
               className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-xl"
            >
              <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="bg-emerald-600 p-10 text-white relative">
                   <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-3xl -mr-24 -mb-24" />
                   <div className="relative z-10 flex justify-between items-center">
                      <div>
                        <CardTitle className="text-3xl font-black italic uppercase tracking-tighter">Certification Finale</CardTitle>
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] mt-3">{selectedDemande.patient_nom} | {selectedDemande.type_analyse}</p>
                      </div>
                      <Button variant="ghost" onClick={() => setIsClotureModalOpen(false)} className="text-white hover:bg-white/10 h-12 w-12 rounded-xl"><X /></Button>
                   </div>
                </CardHeader>
                <form onSubmit={handleCloturer} className="p-10 space-y-8">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase italic ml-1 flex items-center gap-2">
                        <Upload className="w-3 h-3 text-emerald-500" /> RAPPORT PDF SIGNÉ
                      </label>
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`h-40 border-4 border-dashed rounded-[2rem] flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${clotureData.fichier ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-emerald-300'}`}
                      >
                         {clotureData.fichier ? (
                           <>
                             <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg"><FileCheck className="w-6 h-6 text-emerald-500" /></div>
                             <p className="text-xs font-black uppercase italic tracking-tighter">{clotureData.fichier.name}</p>
                           </>
                         ) : (
                           <>
                             <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg"><Upload className="w-6 h-6 text-slate-400" /></div>
                             <p className="text-[10px] font-black uppercase italic tracking-wider">Cliquer pour uploader le PDF</p>
                           </>
                         )}
                         <input 
                           type="file" 
                           ref={fileInputRef} 
                           className="hidden" 
                           accept=".pdf" 
                           onChange={(e) => setClotureData({...clotureData, fichier: e.target.files?.[0] || null})}
                         />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase italic ml-1">Observations Biologiques</label>
                      <textarea 
                        required className="w-full h-32 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-black text-slate-950 focus:border-emerald-500 outline-none transition-all italic p-6 resize-none" 
                        placeholder="Résultats synthétisés et observations..."
                        value={clotureData.observations}
                        onChange={(e) => setClotureData({...clotureData, observations: e.target.value})}
                      />
                   </div>

                   <div className="flex items-center gap-3 p-5 bg-emerald-50/50 border-2 border-emerald-100 rounded-2xl">
                      <AlertCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                      <p className="text-[9px] font-bold text-emerald-800 uppercase italic leading-tight">
                         En clôturant, le patient recevra un SMS avec son code d'accès unique au format PDF.
                      </p>
                   </div>

                   <Button type="submit" disabled={!clotureData.fichier} className="w-full h-16 rounded-2xl bg-emerald-600 text-white font-black italic shadow-2xl shadow-emerald-500/30 text-xs uppercase tracking-widest disabled:opacity-50">
                      CERTIFIER ET ENVOYER <CheckCircle className="ml-2" />
                   </Button>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
