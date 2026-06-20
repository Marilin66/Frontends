import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, endpoints } from '@/services/api';
import { 
  Card, Badge, Button, Avatar, PageLoader
} from '@/components/ui';
import { 
  Search, Calendar, Clock, User, Stethoscope, 
  ChevronRight, FileText, CheckCircle, 
  AlertCircle, ArrowLeft, Download, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RendezVous } from '@/types';

interface ConsultationItem {
  id: number;
  patient_nom?: string;
  patient_id?: number;
  medecin_nom?: string;
  specialite_nom?: string;
  statut: string;
  date_creation?: string;
  date?: string;
  compte_rendu?: boolean;
  prescription?: boolean;
}

export default function AdminConsultationsPage() {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState<ConsultationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      setIsLoading(true);
      const res: any = await api.get(endpoints.consultations);
      setConsultations(Array.isArray(res) ? res : res.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredConsultations = consultations.filter(c => {
    const matchesSearch = 
      c.patient_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.medecin_nom?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.statut === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <button onClick={() => navigate('/admin-hopital')} className="flex items-center gap-2 text-slate-400 hover:text-primary font-bold text-xs mb-4 transition-colors group">
             <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Retour au dashboard
           </button>
           <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Supervision des Consultations</h1>
           <p className="text-slate-500 dark:text-slate-400 font-medium">Suivi en temps réel de l'activité médicale de l'établissement.</p>
        </div>
        <div className="flex items-center gap-2">
           <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 px-4 py-2 rounded-xl font-bold uppercase tracking-widest text-[10px]">
             {filteredConsultations.length} Consultations trouvées
           </Badge>
        </div>
      </header>

      {/* Filters Bar */}
      <Card className="p-4 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
           <input 
             type="text"
             placeholder="Rechercher un patient ou un médecin..."
             className="w-full pl-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
           <select 
             className="h-12 px-6 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
             value={filterStatus}
             onChange={(e) => setFilterStatus(e.target.value)}
           >
             <option value="all">Tous les statuts</option>
             <option value="en_cours">En cours</option>
             <option value="termine">Terminées</option>
             <option value="annule">Annulées</option>
           </select>
           <Button variant="outline" onClick={fetchConsultations} className="h-12 w-12 p-0 rounded-xl border-slate-100 dark:border-slate-800">
             <Clock className="w-4 h-4 text-slate-400" />
           </Button>
        </div>
      </Card>

      {/* Consultations List */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredConsultations.length > 0 ? (
            filteredConsultations.map((c) => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="p-6 rounded-[2rem] border-none shadow-xl bg-white dark:bg-slate-900 hover:shadow-2xl transition-all group overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                  
                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-8">
                    {/* Patient Info */}
                    <div className="flex items-center gap-4 min-w-[240px]">
                       <Avatar name={c.patient_nom} size="lg" className="ring-4 ring-slate-50 dark:ring-slate-800" />
                       <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Patient</p>
                          <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{c.patient_nom}</h3>
                          <p className="text-xs text-slate-500 font-medium">Dossier #{c.patient_id || '---'}</p>
                       </div>
                    </div>

                    {/* Doctor Info */}
                    <div className="flex items-center gap-4 min-w-[200px]">
                       <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">
                          <Stethoscope className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Médecin</p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">Dr. {c.medecin_nom}</p>
                          <p className="text-[10px] text-primary font-bold uppercase tracking-wider">{c.specialite_nom || 'Médecine Générale'}</p>
                       </div>
                    </div>

                    {/* Status & Timing */}
                    <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-6">
                       <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Statut</p>
                          <Badge className={`
                            ${c.statut === 'termine' ? 'bg-emerald-50 text-emerald-600' : 
                              c.statut === 'en_cours' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'}
                            font-bold text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg border-transparent
                          `}>
                            {c.statut === 'termine' ? 'Terminée' : c.statut === 'en_cours' ? 'En cours' : 'Programmé'}
                          </Badge>
                       </div>
                       <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Date</p>
                          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                             <Calendar className="w-3.5 h-3.5 text-primary" />
                             {new Date(c.date_creation || c.date || '').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </div>
                       </div>
                       <div className="hidden lg:block">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Documents</p>
                          <div className="flex items-center gap-2">
                             {c.compte_rendu ? <FileText className="w-4 h-4 text-emerald-500" /> : <FileText className="w-4 h-4 text-slate-200" />}
                             {c.prescription ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <CheckCircle className="w-4 h-4 text-slate-200" />}
                          </div>
                       </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 lg:pl-6 lg:border-l border-slate-50 dark:border-slate-800">
                       <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-primary/5 hover:text-primary transition-all">
                          <Eye className="w-5 h-5" />
                       </Button>
                       <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-slate-50 transition-all">
                          <Download className="w-5 h-5 text-slate-400" />
                       </Button>
                       <Button 
                         onClick={() => navigate(`/admin-hopital/consultation/${c.id}`)}
                         className="h-10 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-primary transition-all"
                       >
                         Détails
                       </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="p-20 text-center bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
               <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-slate-200" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Aucune consultation</h3>
               <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">
                 Nous n'avons trouvé aucune consultation correspondant à vos critères de recherche.
               </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
