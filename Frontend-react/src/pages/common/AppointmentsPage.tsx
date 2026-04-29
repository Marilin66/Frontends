// @ts-nocheck
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  Filter,
  ArrowRight,
  AlertCircle,
  Timer,
  ClipboardList,
  CheckCircle,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent, Button, StatusBadge } from '@/components/ui';
import { api, endpoints } from '@/services/api';

interface Appointment {
  id: number;
  date: string;
  heure: string;
  doctor_name: string;
  service_name: string;
  hopital_name: string;
  statut: string;
}

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get<any>(endpoints.rendezVous);
      setAppointments(Array.isArray(response) ? response : response.results || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (window.confirm('Voulez-vous vraiment annuler ce rendez-vous ?')) {
      try {
        await api.delete(`${endpoints.rendezVous}${id}/`);
        setAppointments(appointments.filter(a => a.id !== id));
      } catch (error) {
        console.error('Erreur annulation:', error);
      }
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    return apt.statut === filter;
  });

  return (
    <div className="space-y-8 lg:space-y-12">
      {/* High-Contrast Tactical Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
             </div>
             <div className="bg-primary/10 text-primary border-2 border-primary/20 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest italic">
                AGENDA_SYNCHRO.
             </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">Gestion des Rendez-Vous.</h1>
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mt-4 italic">{filteredAppointments.length} Événements en File</p>
        </motion.div>

        <div className="flex flex-wrap items-center gap-3">
           <Button onClick={() => navigate('/patient/search')} variant="primary" className="h-12 px-8 rounded-xl text-[10px] italic">
             <Plus className="w-4 h-4 mr-2" /> NOUVEAU SEGMENT
           </Button>
           <Button variant="outline" className="h-12 w-12 p-0 rounded-xl border-2">
             <Filter className="w-5 h-5" />
           </Button>
        </div>
      </section>

      {/* Quick Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
         {['all', 'confirme', 'en_attente', 'annule'].map((f) => (
           <button
             key={f}
             onClick={() => setFilter(f)}
             className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest italic transition-all border-2 ${
               filter === f 
                 ? 'bg-slate-950 text-white border-slate-950 shadow-lg' 
                 : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
             }`}
           >
             {f === 'all' ? 'Tous les segments' : f.replace('_', ' ')}
           </button>
         ))}
      </div>

      {/* Grid Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-200 rounded-2xl animate-pulse" />
          ))
        ) : filteredAppointments.length > 0 ? (
          filteredAppointments.map((apt, idx) => (
            <motion.div
              key={apt.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card hover className="group border-2 border-slate-100 bg-white hover:border-primary transition-all duration-300 p-6">
                 <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                       <Clock className="w-6 h-6" />
                    </div>
                    <StatusBadge status={apt.statut} className="shadow-sm" />
                 </div>

                 <div className="space-y-4 mb-8">
                    <div className="space-y-1">
                       <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic leading-none">{apt.date}</p>
                       <p className="text-2xl lg:text-3xl font-black text-slate-950 tracking-tighter uppercase italic leading-none">{apt.heure}</p>
                    </div>
                    
                    <div className="space-y-3">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-900 border-2 border-slate-800 flex items-center justify-center text-[9px] font-black text-white shrink-0 italic">DR</div>
                          <div className="min-w-0">
                             <p className="text-xs font-black text-slate-950 uppercase truncate leading-none mb-1">{apt.doctor_name}</p>
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic truncate">{apt.service_name}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-3 text-slate-400">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="text-[9px] font-black uppercase tracking-widest italic truncate">{apt.hopital_name}</span>
                       </div>
                    </div>
                 </div>

                 <div className="flex flex-col gap-2 pt-6 border-t-2 border-slate-50">
                    {(apt.statut === 'planifie' || apt.statut === 'confirme' || apt.statut === 'en_attente') && (
                      <Link
                        to={`/patient/rdv/${apt.id}/intake/${encodeURIComponent(apt.medecin_nom || apt.doctor_name || '')}`}
                        className={`w-full h-10 rounded-lg text-[9px] font-black uppercase tracking-widest italic flex items-center justify-center gap-2 border-2 transition-all ${apt.pre_enregistrement ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-600'}`}
                      >
                        {apt.pre_enregistrement
                          ? <><CheckCircle className="w-3 h-3" /> Fiche envoyée</>
                          : <><ClipboardList className="w-3 h-3" /> Pré-consultation</>
                        }
                      </Link>
                    )}
                    {apt.has_consultation && apt.consultation_id && (
                      <Link to="/messages" className="w-full h-10 rounded-lg text-[9px] font-black uppercase tracking-widest italic flex items-center justify-center gap-2 bg-primary/5 border-2 border-primary/20 text-primary hover:bg-primary/10 transition-all">
                        <MessageSquare className="w-3 h-3" /> Conversation
                      </Link>
                    )}
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="flex-1 h-10 rounded-lg text-[9px] border-2 italic text-rose-600 hover:bg-rose-50" onClick={() => handleCancel(apt.id)}>ANNULER</Button>
                      <Button variant="primary" size="sm" className="flex-1 h-10 rounded-lg text-[9px] italic">DÉTAILS</Button>
                    </div>
                 </div>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-32 text-center bg-slate-100 rounded-3xl border-2 border-slate-200 border-dashed">
             <AlertCircle className="w-20 h-20 text-slate-300 mx-auto mb-8" />
             <p className="text-2xl font-black text-slate-400 uppercase tracking-[0.2em] italic">Aucun segment de rendez-vous localisé</p>
          </div>
        )}
      </div>

      {/* Call to Action Matrix */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative group overflow-hidden bg-primary rounded-3xl lg:rounded-[2.5rem] p-8 lg:p-14 shadow-2xl shadow-primary/30"
      >
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[100px] -mr-64 -mt-64 transition-transform group-hover:scale-125" />
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10 text-white text-center lg:text-left">
             <div className="space-y-6 flex-1">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 shadow-xl group-hover:rotate-6 transition-transform">
                   <Timer className="w-8 h-8 text-white animate-pulse" />
                </div>
                <h3 className="text-3xl lg:text-4xl font-black tracking-tighter leading-none italic uppercase">Orchestration de la <span className="text-slate-900">Disponibilité Médicale</span></h3>
                <p className="text-white/70 font-bold text-sm max-w-2xl italic">Optimisez votre parcours de soins via une indexation prioritaire des créneaux cliniques d'élite.</p>
             </div>
             <Button onClick={() => navigate('/patient/search')} className="h-16 px-12 rounded-2xl bg-white text-primary font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all italic uppercase">
                Nouveau Segment <ArrowRight className="w-6 h-6 ml-4" />
             </Button>
          </div>
      </motion.div>
    </div>
  );
}
