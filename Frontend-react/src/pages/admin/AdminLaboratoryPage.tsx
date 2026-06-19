import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, endpoints } from '@/services/api';
import { 
  Card, Badge, Button, PageLoader
} from '@/components/ui';
import { 
  Search, FlaskConical, Beaker, Stethoscope, 
  ChevronRight, Clock, AlertCircle, 
  ArrowLeft, Microscope, Activity, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalyseItem {
  id: number;
  patient_nom?: string;
  type_analyse?: string;
  statut: string;
  code_analyse?: string;
  medecin_nom?: string;
  laborantin_nom?: string;
  date_demande?: string;
  created_at?: string;
}

export default function AdminLaboratoryPage() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<AnalyseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      setIsLoading(true);
      const res = await api.get<{results: AnalyseItem[]}>(endpoints.analyses);
      setAnalyses(res.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAnalyses = analyses.filter(a => 
    a.patient_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.type_analyse?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <button onClick={() => navigate('/admin-hopital')} className="flex items-center gap-2 text-slate-400 hover:text-primary font-bold text-xs mb-4 transition-colors group">
             <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Retour au dashboard
           </button>
           <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
             <Microscope className="w-10 h-10 text-primary" />
             Supervision Laboratoire
           </h1>
           <p className="text-slate-500 dark:text-slate-400 font-medium">Monitoring des flux d'analyses et des résultats biologiques.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="text-right hidden md:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Flux actif</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">{analyses.filter(a => a.statut !== 'termine').length} en attente</p>
           </div>
           <div className="w-px h-10 bg-slate-100 dark:bg-slate-800 mx-2" />
           <Button onClick={fetchAnalyses} variant="outline" className="h-12 w-12 p-0 rounded-xl border-slate-200 dark:border-slate-800">
              <Clock className="w-5 h-5 text-slate-400" />
           </Button>
        </div>
      </header>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Demandes totales', value: analyses.length, icon: Beaker, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'En cours de traitement', value: analyses.filter(a => a.statut === 'en_cours').length, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Résultats validés', value: analyses.filter(a => a.statut === 'termine').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <Card key={i} className="p-6 rounded-[2rem] border-none shadow-sm bg-white dark:bg-slate-900 flex items-center gap-5">
            <div className={`w-12 h-12 ${stat.bg} dark:bg-slate-800 rounded-2xl flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{stat.label}</p>
               <p className="text-2xl font-black text-slate-900 dark:text-white leading-none mt-1">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Search Bar */}
      <Card className="p-2 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900">
        <div className="relative">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
           <input 
             type="text"
             placeholder="Rechercher par patient, type d'examen ou numéro de dossier..."
             className="w-full pl-12 h-14 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/5 outline-none transition-all"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </Card>

      {/* Analyses Table-like List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredAnalyses.length > 0 ? (
            filteredAnalyses.map((a) => (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="p-6 rounded-[2rem] border-none shadow-xl bg-white dark:bg-slate-900 hover:translate-x-1 transition-all group">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                    {/* Status Icon */}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:rotate-12 ${
                      a.statut === 'termine' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      <FlaskConical className="w-7 h-7" />
                    </div>

                    {/* Analysis Main Info */}
                    <div className="flex-1 min-w-[200px]">
                       <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{a.type_analyse || 'Examen Biologique'}</h3>
                          <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border-transparent font-bold text-[9px] uppercase tracking-tighter">#{a.code_analyse || String(a.id)}</Badge>
                       </div>
                       <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                          <span className="text-xs font-bold uppercase tracking-widest">{a.patient_nom}</span>
                       </div>
                    </div>

                    {/* Prescriber & Processor */}
                    <div className="grid grid-cols-2 gap-8 min-w-[300px]">
                       <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Prescrit par</p>
                          <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                             <Stethoscope className="w-3.5 h-3.5 text-primary" /> Dr. {a.medecin_nom || 'Interne'}
                          </p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Laborantin</p>
                          <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                             <div className="w-3.5 h-3.5 bg-slate-200 dark:bg-slate-700 rounded-full" /> {a.laborantin_nom || 'En attente...'}
                          </p>
                       </div>
                    </div>

                    {/* Status Badge & Time */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                       <Badge className={`
                         ${a.statut === 'termine' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'}
                         font-black text-[9px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-xl border-transparent
                       `}>
                         {a.statut === 'termine' ? 'Résultat prêt' : 'Analyse en cours'}
                       </Badge>
                       <p className="text-[10px] font-bold text-slate-400">Demande du {new Date(a.date_demande || a.created_at || '').toLocaleDateString()}</p>
                    </div>

                    {/* Action Arrow */}
                    <div className="hidden lg:block lg:pl-4">
                       <button 
                         onClick={() => navigate(`/admin-hopital/laboratoire/${a.id}`)}
                         className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all shadow-sm"
                       >
                          <ChevronRight className="w-6 h-6" />
                       </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="py-20 text-center">
               <AlertCircle className="w-12 h-12 text-slate-100 mx-auto mb-4" />
               <p className="text-slate-400 font-bold uppercase tracking-widest">Aucune analyse à superviser</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
