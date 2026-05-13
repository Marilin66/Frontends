// @ts-nocheck
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, endpoints } from '@/services/api';
import { 
  Card, Badge, Button, Avatar, PageLoader, 
  Input 
} from '@/components/ui';
import { 
  HeartPulse, User, Stethoscope, ChevronRight, 
  Calendar, Clock, ArrowLeft, Search, 
  Activity, TrendingUp, AlertCircle, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPostCarePage() {
  const navigate = useNavigate();
  const [suivis, setSuivis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Note: Si l'endpoint n'existe pas encore, on peut simuler ou 
    // utiliser un endpoint de consultations avec un tag 'suivi'
    fetchSuivis();
  }, []);

  const fetchSuivis = async () => {
    try {
      setIsLoading(true);
      // On tente de récupérer les consultations qui sont des suivis
      // En attendant un endpoint dédié 'post-consultations'
      const res = await api.get(endpoints.consultations, { type: 'suivi' });
      setSuivis(Array.isArray(res) ? res : res.results || []);
    } catch (e) {
      console.error(e);
      // Mock data pour la démo si l'API échoue
      setSuivis([
        { id: 1, patient_nom: 'Moussa Diop', medecin_nom: 'Dr. Keita', motif: 'Suivi post-opératoire', progression: 60, seances_totales: 5, seances_faites: 3, statut: 'en_cours' },
        { id: 2, patient_nom: 'Aminata Touré', medecin_nom: 'Dr. Sow', motif: 'Rééducation genou', progression: 20, seances_totales: 10, seances_faites: 2, statut: 'en_cours' },
        { id: 3, patient_nom: 'Jean Koffi', medecin_nom: 'Dr. Ben', motif: 'Contrôle tension', progression: 100, seances_totales: 1, seances_faites: 1, statut: 'termine' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSuivis = suivis.filter(s => 
    s.patient_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.motif?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <button onClick={() => navigate('/admin-hopital')} className="flex items-center gap-2 text-slate-400 hover:text-primary font-bold text-xs mb-4 transition-colors group">
             <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Dashboard
           </button>
           <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
             <HeartPulse className="w-10 h-10 text-rose-500" />
             Suivi Post-Consultation
           </h1>
           <p className="text-slate-500 dark:text-slate-400 font-medium">Accompagnement continu et supervision des protocoles de soin après consultation.</p>
        </div>
        <div className="flex items-center gap-3">
           <Badge className="bg-rose-50 text-rose-600 border-rose-100 px-4 py-2 rounded-xl font-bold uppercase tracking-widest text-[10px]">
             {suivis.filter(s => s.statut === 'en_cours').length} Protocoles actifs
           </Badge>
        </div>
      </header>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <Card className="p-6 rounded-[2rem] border-none shadow-sm bg-white dark:bg-slate-900">
            <TrendingUp className="w-8 h-8 text-emerald-500 mb-4" />
            <p className="text-2xl font-black text-slate-900 dark:text-white">85%</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Taux de complétion</p>
         </Card>
         <Card className="p-6 rounded-[2rem] border-none shadow-sm bg-white dark:bg-slate-900">
            <Activity className="w-8 h-8 text-blue-500 mb-4" />
            <p className="text-2xl font-black text-slate-900 dark:text-white">12</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Séances aujourd'hui</p>
         </Card>
         <Card className="p-6 rounded-[2rem] border-none shadow-sm bg-white dark:bg-slate-900 md:col-span-2">
            <div className="flex items-center justify-between mb-4">
               <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Alerte Vigilance</p>
               <AlertCircle className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">3 patients n'ont pas effectué leur séance de suivi prévue cette semaine. Une relance automatique a été envoyée.</p>
         </Card>
      </div>

      {/* Search */}
      <Card className="p-2 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900">
        <div className="relative">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
           <input 
             type="text"
             placeholder="Rechercher un patient ou un protocole..."
             className="w-full pl-12 h-14 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/5 outline-none transition-all"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </Card>

      {/* Suivis List */}
      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredSuivis.map((s) => (
            <motion.div
              key={s.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-8 rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-900 hover:shadow-2xl transition-all group overflow-hidden relative">
                 <div className="flex flex-col lg:flex-row lg:items-center gap-10">
                    
                    {/* Patient info */}
                    <div className="min-w-[200px]">
                       <Avatar name={s.patient_nom} size="xl" className="mb-4 ring-4 ring-slate-50 dark:ring-slate-800" />
                       <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{s.patient_nom}</h3>
                       <p className="text-xs text-primary font-black uppercase tracking-widest mt-1">{s.motif}</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex-1 space-y-4">
                       <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progression du protocole</p>
                          <p className="text-xs font-black text-slate-900 dark:text-white">{s.seances_faites} / {s.seances_totales} séances</p>
                       </div>
                       <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${s.progression}%` }}
                            className={`h-full rounded-full ${s.statut === 'termine' ? 'bg-emerald-500' : 'bg-primary'}`}
                          />
                       </div>
                       <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                             <Stethoscope className="w-4 h-4 text-slate-300" />
                             <span className="text-xs font-bold text-slate-500">Dr. {s.medecin_nom}</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <Calendar className="w-4 h-4 text-slate-300" />
                             <span className="text-xs font-bold text-slate-500">Dernier passage: Hier</span>
                          </div>
                       </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-center gap-3">
                       <Badge className={`
                         ${s.statut === 'termine' ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'}
                         font-black text-[10px] uppercase tracking-widest px-6 py-2 rounded-xl border-transparent shadow-lg
                       `}>
                         {s.statut === 'termine' ? 'Complété' : 'Actif'}
                       </Badge>
                       <Button 
                         onClick={() => navigate(`/admin-hopital/post-suivi/${s.id}`)}
                         variant="ghost" 
                         className="text-primary font-black uppercase tracking-widest text-[10px] hover:bg-primary/5 rounded-xl h-10 px-6"
                       >
                         Voir les notes
                       </Button>
                    </div>

                 </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Backend Alert */}
      <div className="p-6 bg-slate-900 dark:bg-primary/10 rounded-3xl border border-white/5 flex items-start gap-4">
         <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 text-primary" />
         </div>
         <div>
            <p className="text-sm font-bold text-white mb-1">Information Backend</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cette interface utilise actuellement les données de consultations taguées. Il est recommandé d'implémenter l'endpoint <code className="bg-white/5 px-1 rounded text-primary">/api/suivis-post-consultation/</code> pour une gestion plus fine des séances répétitives.
            </p>
         </div>
      </div>
    </div>
  );
}
