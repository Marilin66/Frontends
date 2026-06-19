
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, endpoints } from '@/services/api';
import { 
  Card, Badge, Button, Avatar, PageLoader
} from '@/components/ui';
import { 
  Search, Calendar, Clock, Stethoscope, 
  ChevronRight, ArrowLeft, AlertCircle, Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RendezVous } from '@/types';

export default function AdminAppointmentsPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<RendezVous[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const res = await api.get<{results: RendezVous[]}>(endpoints.rendezVous);
      setAppointments(res.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(a => {
    const matchesSearch = 
      a.patient_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.medecin_nom?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || a.statut === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <button onClick={() => navigate('/admin-hopital')} className="flex items-center gap-2 text-slate-400 hover:text-primary font-bold text-xs mb-4 transition-colors group">
             <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Dashboard
           </button>
           <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Supervision des Rendez-vous</h1>
           <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Contrôle de l'agenda global et gestion des flux d'admission.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button onClick={fetchAppointments} variant="outline" className="h-11 px-4 rounded-xl border-slate-200 dark:border-slate-800 font-bold text-xs flex items-center gap-2">
             <Clock className="w-4 h-4" /> Actualiser
           </Button>
        </div>
      </header>

      {/* Control Bar */}
      <Card className="p-4 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
           <input 
             type="text"
             placeholder="Rechercher par patient ou médecin..."
             className="w-full pl-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
        <select 
          className="h-12 px-6 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold text-slate-700 dark:text-slate-300 outline-none"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Tous les statuts</option>
          <option value="confirme">Confirmés</option>
          <option value="en_attente">En attente</option>
          <option value="termine">Terminés</option>
          <option value="annule">Annulés</option>
        </select>
      </Card>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredAppointments.map((a) => (
            <motion.div
              key={a.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="p-6 rounded-[2rem] border-none shadow-xl bg-white dark:bg-slate-900 hover:shadow-2xl transition-all group relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-2 h-full ${
                  a.statut === 'confirme' ? 'bg-emerald-500' : 
                  a.statut === 'en_attente' ? 'bg-amber-500' :
                  a.statut === 'termine' ? 'bg-blue-500' : 'bg-slate-300'
                }`} />
                
                <div className="flex items-start justify-between mb-6">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rendez-vous #{a.id}</p>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{a.patient_nom}</h3>
                   </div>
                   <Badge className={`
                     ${a.statut === 'confirme' ? 'bg-emerald-50 text-emerald-600' : 
                       a.statut === 'en_attente' ? 'bg-amber-50 text-amber-600' :
                       a.statut === 'termine' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}
                     font-bold text-[8px] uppercase tracking-[0.2em] px-3 py-1 rounded-lg border-transparent
                   `}>
                     {a.statut}
                   </Badge>
                </div>

                <div className="space-y-4 mb-8">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                         <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date & Heure</p>
                         <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {new Date(a.date_heure).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })}
                         </p>
                         <p className="text-xs text-primary font-black uppercase tracking-widest mt-0.5">{new Date(a.date_heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                   </div>

                   <div className="flex items-center gap-3">
                      <Avatar name={a.medecin_nom} size="sm" className="ring-2 ring-slate-100" />
                      <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Médecin assigné</p>
                         <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[150px]">Dr. {a.medecin_nom}</p>
                      </div>
                   </div>
                </div>

                <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-slate-300" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prévu pour 30m</span>
                   </div>
                   <button 
                     onClick={() => navigate(`/admin-hopital/rendez-vous/${a.id}`)}
                     className="text-xs font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all"
                   >
                     Détails <ChevronRight className="w-4 h-4" />
                   </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredAppointments.length === 0 && (
        <div className="py-20 text-center">
           <AlertCircle className="w-12 h-12 text-slate-100 mx-auto mb-4" />
           <p className="text-slate-400 font-bold uppercase tracking-widest">Aucun rendez-vous trouvé</p>
        </div>
      )}
    </div>
  );
}
