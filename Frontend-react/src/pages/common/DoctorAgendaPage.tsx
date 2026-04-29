// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, endpoints } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button, 
  Badge, 
  Avatar, 
  Input,
  PageLoader 
} from '@/components/ui';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash, 
  Check, 
  X, 
  User, 
  Filter,
  ChevronRight,
  AlertCircle,
  MoreVertical,
  Mail,
  MapPin,
  Target,
  PlusCircle,
  Hash,
  Activity,
  CalendarDays,
  Zap,
  Layout,
  Stethoscope,
  History,
  Timer,
  Assignment,
  ClipboardCheck,
  ClipboardList
} from 'lucide-react';

interface Availability {
  id: number;
  jour_semaine: number;
  jour_semaine_display: string;
  heure_debut: string;
  heure_fin: string;
  is_active: boolean;
}

interface Appointment {
  id: number;
  patient_nom: string;
  patient_email: string;
  date: string;
  heure: string;
  motif: string;
  statut: string;
  pre_enregistrement?: {
    symptomes_principaux: string;
    debut_symptomes: string;
    traitements_en_cours: string;
    observations: string;
  } | null;
}

export default function DoctorAgendaPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'appointments' | 'availabilities'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newAvail, setNewAvail] = useState({
    jour_semaine: 1,
    heure_debut: '09:00',
    heure_fin: '17:00'
  });

  const [selectedIntake, setSelectedIntake] = useState<any>(null);
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [appData, availData] = await Promise.all([
        api.get<Appointment[]>(endpoints.rendezVous),
        api.get<Availability[]>(endpoints.medecinDisponibilites(user?.id || 0))
      ]);
      setAppointments(Array.isArray(appData) ? appData : (appData as any).results || []);
      setAvailabilities(Array.isArray(availData) ? availData : (availData as any).results || []);
    } catch (error) {
      console.error('Erreur chargement agenda:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchData();
  }, [user?.id]);

  const handleAction = async (id: number, action: 'confirmer' | 'refuser' | 'terminer') => {
    try {
      setIsLoading(true);
      await api.post(`/rendezvous/rendezvous/${id}/${action}/`);
      fetchData();
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAvail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await api.post('/rendezvous/disponibilites/', newAvail);
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAvail = async (id: number) => {
    try {
      setIsLoading(true);
      await api.delete(`/rendezvous/disponibilites/${id}/`);
      fetchData();
    } catch (error: any) {
       console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.98, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 }
  };

  if (isLoading && appointments.length === 0 && availabilities.length === 0) return <PageLoader />;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12 pb-32"
    >
      {/* Supreme Clinical Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 px-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
             <Badge className="bg-indigo-500 text-white border-none py-1.5 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/20 italic italic italic">Professional Core</Badge>
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-none italic">Registre <span className="text-primary italic">Agenda</span></h1>
          <p className="text-slate-400 font-bold text-lg max-w-xl leading-relaxed">
             Optimisation du flux patient et orchestration des <span className="text-slate-900">shift cliniques</span> hebdomadaires.
          </p>
        </div>
        
        <div className="flex bg-white shadow-premium p-2 rounded-[2rem] border border-slate-50">
          {[
            { id: 'appointments', label: 'Rendez-vous', icon: CalendarDays },
            { id: 'availabilities', label: 'Shift Matrix', icon: Clock }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-8 py-5 h-16 text-[11px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all ${
                activeTab === tab.id 
                  ? 'bg-slate-900 text-white shadow-2xl' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-5 h-5" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'appointments' ? (
          <motion.div 
            key="appointments"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, x: -50 }}
            className="space-y-10 px-2"
          >
            {appointments.length > 0 ? appointments.map((rdv) => (
              <motion.div key={rdv.id} variants={itemVariants}>
                <Card className="border-none shadow-premium hover:shadow-premium-hover bg-white rounded-[3.5rem] overflow-hidden transition-all duration-500 group">
                  <div className="flex flex-col lg:flex-row">
                    {/* Immersive Profile Sector */}
                    <div className="lg:w-80 bg-slate-50/50 p-12 flex flex-col items-center justify-center text-center border-r border-slate-50 group-hover:bg-primary/[0.03] transition-colors relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[60px] -mr-16 -mt-16" />
                       <div className="relative mb-6">
                          <Avatar name={rdv.patient_nom} size="xl" className="w-24 h-24 ring-8 ring-white shadow-2xl group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white border-4 border-slate-50 shadow-glow-sm">
                             <Check className="w-5 h-5" />
                          </div>
                       </div>
                       <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-none italic lowercase">{rdv.patient_nom}</h3>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3 flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5" /> ID_{rdv.id.toString().padStart(4, '0')}
                       </p>
                    </div>

                    {/* Operational Details Sector */}
                    <div className="flex-1 p-12 flex flex-col justify-between gap-12">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <Badge className="bg-emerald-500 text-white border-none py-1.5 px-4 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 italic italic">Diagnostic Planifié</Badge>
                             {rdv.statut === 'en_attente' && <div className="w-3 h-3 bg-rose-500 rounded-full animate-ping" />}
                          </div>
                          <Button variant="ghost" className="w-12 h-12 p-0 rounded-2xl bg-white border border-slate-100 text-slate-300 hover:text-slate-900 shadow-sm transition-all"><MoreVertical className="w-6 h-6" /></Button>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                          {[
                            { label: 'Date Consultation', value: new Date(rdv.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }), icon: CalendarDays },
                            { label: 'Matrice Horaire', value: rdv.heure, icon: Timer },
                            { label: 'Motif Clinique', value: rdv.motif || 'Suivi Standard', icon: Target }
                          ].map((item, i) => (
                             <div key={i} className="space-y-4">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                   <item.icon className="w-3.5 h-3.5" /> {item.label}
                                </p>
                                <span className="text-xl font-black text-slate-900 tracking-tighter leading-none group-hover:text-primary transition-colors block italic">{item.value}</span>
                             </div>
                          ))}

                          {/* Intake Section */}
                          {rdv.pre_enregistrement && (
                             <div className="space-y-4">
                                <p className="text-[10px] font-black text-teal-500 uppercase tracking-widest flex items-center gap-2">
                                   <ClipboardCheck className="w-3.5 h-3.5" /> Fiche Patient
                                </p>
                                <button 
                                  onClick={() => {
                                    setSelectedIntake(rdv.pre_enregistrement);
                                    setIsIntakeModalOpen(true);
                                  }}
                                  className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-600 rounded-xl font-black text-[11px] uppercase tracking-widest border border-teal-100 hover:bg-teal-100 transition-all italic"
                                >
                                   Visualiser <ChevronRight className="w-4 h-4" />
                                </button>
                             </div>
                          )}
                       </div>

                       <div className="flex items-center gap-4 ml-auto pt-6 border-t border-slate-50 w-full justify-end">
                          {rdv.statut === 'en_attente' ? (
                            <>
                               <Button 
                                 variant="ghost" 
                                 className="h-16 px-10 rounded-[1.5rem] font-black text-rose-500 hover:bg-rose-50 transition-all text-lg"
                                 onClick={() => handleAction(rdv.id, 'refuser')}
                               >
                                  Décliner
                               </Button>
                               <Button 
                                 className="h-16 px-12 rounded-[1.5rem] bg-slate-900 text-white font-black text-lg shadow-2xl hover:scale-[1.05] transition-all"
                                 onClick={() => handleAction(rdv.id, 'confirmer')}
                               >
                                  Confirmer RDV
                               </Button>
                            </>
                          ) : (
                               <Badge className={`h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] border-none shadow-premium italic ${
                                 rdv.statut === 'confirme' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                               }`}>
                                  Statut: {rdv.statut.replace('_', ' ')}
                               </Badge>
                          )}
                          {rdv.statut === 'confirme' && (
                             <Button 
                               className="h-16 px-14 rounded-[1.5rem] bg-primary text-white font-black text-lg shadow-2xl hover:scale-[1.05] transition-all"
                               onClick={() => handleAction(rdv.id, 'terminer')}
                               leftIcon={<Stethoscope className="w-7 h-7" />}
                             >
                                Lancer Examen
                             </Button>
                          )}
                       </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )) : (
              <motion.div variants={itemVariants} className="text-center py-48 bg-slate-50/50 rounded-[4rem] border-4 border-dashed border-slate-100 flex flex-col items-center">
                 <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mb-10 shadow-inner group transition-transform hover:rotate-12">
                   <History className="w-12 h-12 text-slate-100 group-hover:text-primary transition-colors" />
                 </div>
                 <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-3 italic">Session Vierge</h3>
                 <p className="text-slate-400 font-bold max-w-sm text-lg leading-relaxed">Aucun flux de patient détecté dans la matrice temporelle actuelle.</p>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="availabilities"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, x: 50 }}
            className="px-2 space-y-12"
          >
            <div className="flex justify-between items-center bg-slate-900 p-12 rounded-[3.5rem] text-white overflow-hidden relative group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32 transition-transform group-hover:scale-125" />
               <div className="relative z-10">
                  <h2 className="text-4xl font-black tracking-tighter leading-none italic italic">Matrice Hebdomadaire</h2>
                  <p className="text-white/40 font-bold text-lg mt-3 uppercase tracking-widest text-[10px]">Orchestration des points d'accès cliniques</p>
               </div>
               <Button onClick={() => setIsModalOpen(true)} className="h-20 px-12 rounded-[2rem] bg-white text-slate-900 font-black text-xl shadow-2xl hover:scale-[1.05] transition-all italic italic">
                  Injecter Shift <PlusCircle className="w-7 h-7 ml-4 text-primary" />
               </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {availabilities.map((avail) => (
                <motion.div key={avail.id} variants={itemVariants}>
                  <Card className="border-none shadow-premium hover:shadow-premium-hover bg-white rounded-[3rem] p-10 overflow-hidden group transition-all duration-500">
                    <div className="flex justify-between items-start mb-12">
                       <Badge className="h-12 px-6 rounded-xl bg-slate-900 text-white border-none font-black uppercase text-[10px] tracking-widest shadow-2xl group-hover:scale-110 transition-all italic">{avail.jour_semaine_display}</Badge>
                       <Button 
                         variant="ghost" 
                         className="h-12 w-12 p-0 rounded-2xl bg-slate-50 text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                         onClick={() => handleDeleteAvail(avail.id)}
                       >
                          <Trash className="w-6 h-6" />
                       </Button>
                    </div>
                    
                    <div className="flex items-center gap-10 relative">
                       <div className="absolute left-1/2 -translate-x-1/2 w-8 h-8 bg-slate-50 border-4 border-white rounded-xl flex items-center justify-center z-10 group-hover:rotate-180 transition-transform duration-700 shadow-sm">
                          <ChevronRight className="w-4 h-4 text-slate-300" />
                       </div>
                       <div className="flex-1 text-center space-y-3">
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Ouverture</p>
                          <span className="text-3xl font-black text-slate-900 tracking-tighter group-hover:text-primary transition-colors block italic">{avail.heure_debut}</span>
                       </div>
                       <div className="flex-1 text-center space-y-3">
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Fermeture</p>
                          <span className="text-3xl font-black text-slate-900 tracking-tighter group-hover:text-primary transition-colors block italic">{avail.heure_fin}</span>
                       </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
              {availabilities.length === 0 && (
                <div className="col-span-full py-40 text-center bg-slate-50/50 rounded-[4rem] border-4 border-dashed border-slate-100 flex flex-col items-center">
                   <Clock className="w-16 h-16 text-slate-100 mb-8 shadow-inner" />
                   <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic">Shift Matrix Off</h3>
                   <p className="text-slate-400 font-bold max-w-sm text-lg mt-3 leading-relaxed">Activez vos créneaux pour rendre votre expertise accessible au réseau.</p>
                   <Button onClick={() => setIsModalOpen(true)} className="h-20 px-16 rounded-[2rem] bg-slate-900 text-white font-black text-xl shadow-2xl mt-10">Ouvrir Session Planning</Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Supreme Configuration Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsModalOpen(false)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-3xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-lg"
            >
              <Card className="shadow-2xl rounded-[4.5rem] overflow-hidden border-none bg-white">
                <div className="bg-slate-900 p-16 text-center text-white relative">
                   <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-[100px] -mr-24 -mt-24" />
                   <div className="w-24 h-24 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl rotate-6 group transition-transform hover:rotate-0">
                      <Zap className="w-12 h-12 text-primary shadow-glow-sm" />
                   </div>
                   <h2 className="text-4xl font-black tracking-tighter mb-4 italic italic">Configuration de Shift</h2>
                   <p className="text-white/40 font-bold text-lg uppercase tracking-widest text-[10px]">Injection de paramètres cliniques</p>
                </div>
                <form onSubmit={handleCreateAvail} className="p-16 space-y-12">
                   <div className="space-y-6">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] pl-6 block text-center">Sélection du Segment Hebdomadaire</label>
                      <select 
                        className="w-full h-24 px-12 bg-slate-50 border-none rounded-[2.5rem] text-2xl font-black tracking-tighter focus:ring-8 focus:ring-primary/5 transition-all outline-none appearance-none cursor-pointer text-center italic"
                        value={newAvail.jour_semaine}
                        onChange={(e) => setNewAvail({...newAvail, jour_semaine: parseInt(e.target.value)})}
                      >
                         <option value={1}>LUNDI_CORE</option>
                         <option value={2}>MARDI_CORE</option>
                         <option value={3}>MERCREDI_CORE</option>
                         <option value={4}>JEUDI_CORE</option>
                         <option value={5}>VENDREDI_CORE</option>
                         <option value={6}>SAMEDI_WEEKEND</option>
                         <option value={0}>DIMANCHE_WEEKEND</option>
                      </select>
                   </div>
                   <div className="grid grid-cols-2 gap-12">
                      <div className="space-y-6">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4 text-center block italic">Start_Vector</label>
                         <Input 
                           type="time" 
                           className="h-20 rounded-[2.5rem] bg-slate-50 border-none font-black text-3xl text-center shadow-inner focus:ring-4 focus:ring-primary/10 italic"
                           value={newAvail.heure_debut} 
                           onChange={(e) => setNewAvail({...newAvail, heure_debut: e.target.value})} 
                         />
                      </div>
                      <div className="space-y-6">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4 text-center block italic">End_Vector</label>
                         <Input 
                           type="time" 
                           className="h-20 rounded-[2.5rem] bg-slate-50 border-none font-black text-3xl text-center shadow-inner focus:ring-4 focus:ring-primary/10 italic"
                           value={newAvail.heure_fin} 
                           onChange={(e) => setNewAvail({...newAvail, heure_fin: e.target.value})} 
                         />
                      </div>
                   </div>
                   <div className="flex flex-col gap-6 pt-6">
                      <Button 
                        type="submit" 
                        isLoading={isLoading} 
                        className="w-full h-24 text-2xl font-black rounded-[3rem] bg-slate-900 text-white shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all italic italic"
                      >
                         VALIDER LA MATRICE
                      </Button>
                      <button 
                        type="button" 
                        className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] hover:text-rose-500 transition-colors"
                        onClick={() => setIsModalOpen(false)}
                      >
                         Annuler la transaction
                      </button>
                   </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Patient Intake Detail Modal */}
      <AnimatePresence>
        {isIntakeModalOpen && selectedIntake && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsIntakeModalOpen(false)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-3xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-2xl"
            >
              <Card className="shadow-2xl rounded-[4rem] overflow-hidden border-none bg-white">
                <div className="bg-teal-600 p-12 text-white relative">
                   <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-[100px] -mr-24 -mt-24" />
                   <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-white/20 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] flex items-center justify-center shadow-2xl">
                         <ClipboardList className="w-10 h-10 text-white" />
                      </div>
                      <div>
                         <h2 className="text-3xl font-black tracking-tighter italic">Fiche de Pré-consultation</h2>
                         <p className="text-white/60 font-bold text-sm uppercase tracking-widest">Données cliniques transmises par le patient</p>
                      </div>
                   </div>
                </div>
                
                <div className="p-12 space-y-10">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5 text-red-400" /> Symptômes Principaux
                         </p>
                         <p className="text-lg font-bold text-slate-900 leading-relaxed bg-slate-50 p-6 rounded-3xl border border-slate-100 italic">
                            {selectedIntake.symptomes_principaux || '—'}
                         </p>
                      </div>
                      <div className="space-y-4">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-orange-400" /> Début des Symptômes
                         </p>
                         <p className="text-lg font-bold text-slate-900 leading-relaxed bg-slate-50 p-6 rounded-3xl border border-slate-100 italic">
                            {selectedIntake.debut_symptomes || 'Non spécifié'}
                         </p>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                         <Pill className="w-3.5 h-3.5 text-blue-400" /> Traitements en cours
                      </p>
                      <p className="text-lg font-bold text-slate-900 leading-relaxed bg-slate-50 p-6 rounded-3xl border border-slate-100 italic">
                         {selectedIntake.traitements_en_cours || 'Aucun traitement signalé'}
                      </p>
                   </div>

                   <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                         <FileText className="w-3.5 h-3.5 text-purple-400" /> Observations complémentaires
                      </p>
                      <p className="text-lg font-bold text-slate-900 leading-relaxed bg-slate-50 p-6 rounded-3xl border border-slate-100 italic">
                         {selectedIntake.observations || 'Aucune observation'}
                      </p>
                   </div>

                   <Button 
                     onClick={() => setIsIntakeModalOpen(false)}
                     className="w-full h-20 rounded-[2rem] bg-slate-900 text-white font-black text-xl shadow-2xl mt-6 uppercase tracking-tighter italic"
                   >
                      Fermer le Dossier
                   </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
