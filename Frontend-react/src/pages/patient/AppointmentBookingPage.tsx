// @ts-nocheck
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  AlertCircle,
  ShieldCheck,
  Zap,
  Activity,
  ArrowRight,
  Info,
  Sparkles,
  Timer,
  BadgeCheck,
  MapPin
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Avatar, PageLoader } from '@/components/ui';
import { api, endpoints } from '@/services/api';

interface Doctor {
  id: number;
  first_name: string;
  last_name: string;
  specialty?: string;
  biographie?: string;
  photo?: string;
}

// Créneau libre retourné par /medecins/{id}/creneaux/
interface Availability {
  date: string;        // ex: "2026-05-10"
  heure_debut: string; // ex: "09:00:00"
  heure_fin: string;   // ex: "09:30:00"
}

const steps = [
  { id: 1, title: 'Praticien', icon: Stethoscope },
  { id: 2, title: 'Planning', icon: Calendar },
  { id: 3, title: 'Validation', icon: ShieldCheck },
  { id: 4, title: 'Confirmation', icon: CheckCircle },
];

export default function AppointmentBookingPage() {
  const { doctorId, hospitalId, serviceId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Availability | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [motif, setMotif] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (doctorId) {
      fetchDoctorData(parseInt(doctorId));
    } else if (hospitalId && serviceId) {
      fetchServiceDoctors();
    } else {
      setIsLoading(false);
    }
  }, [doctorId, hospitalId, serviceId]);

  const fetchServiceDoctors = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<any>(`${endpoints.medecins}?hopital=${hospitalId}&service=${serviceId}`);
      const data = Array.isArray(response) ? response : (response.results || []);
      setDoctors(data);
      if (data.length === 1) {
        setSelectedDoctor(data[0]);
        fetchDoctorAvailabilities(data[0].id);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDoctorData = async (id: number) => {
    try {
      setIsLoading(true);
      const docData = await api.get<Doctor>(endpoints.medecinDetail(id));
      setSelectedDoctor(docData);
      await fetchDoctorAvailabilities(id);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDoctorAvailabilities = async (id: number) => {
    try {
      setSlotsLoading(true);
      // On utilise l'endpoint /creneaux/ qui retourne des créneaux libres concrets
      // avec date + heure_debut + heure_fin (sur les 7 prochains jours)
      const response = await api.get<any>(endpoints.medecinCreneaux(id));
      const data = Array.isArray(response) ? response : (response.results || []);
      setAvailabilities(data);
    } catch (error) {
      console.error('Erreur planning:', error);
    } finally {
      setSlotsLoading(false);
    }
  };

  const [bookingError, setBookingError] = useState('');

  const handleBooking = async () => {
    const finalDoctorId = doctorId ? parseInt(doctorId) : selectedDoctor?.id;
    if (!selectedSlot || !finalDoctorId) return;
    setIsSubmitting(true);
    setBookingError('');
    try {
      // Le backend attend : medecin (int), date_heure (ISO datetime), motif (str)
      const date_heure = `${selectedSlot.date}T${selectedSlot.heure_debut}`;
      await api.post(endpoints.rendezVous, {
        medecin: finalDoctorId,
        date_heure,
        motif: motif || 'Consultation',
      });
      setStep(4);
    } catch (error: any) {
      const data = error.response?.data;
      const msg =
        data?.detail ||
        data?.non_field_errors?.[0] ||
        data?.date_heure?.[0] ||
        data?.medecin?.[0] ||
        'Erreur lors de la réservation. Veuillez réessayer.';
      setBookingError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="max-w-5xl mx-auto space-y-8 lg:space-y-12 pb-20">
      {/* High-Contrast Stepper Architecture */}
      <div className="flex items-center justify-between px-4 lg:px-0">
        {steps.map((s, idx) => (
          <div key={s.id} className="flex items-center gap-3 lg:gap-4 group">
            <div className={`
              w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center border-2 transition-all duration-500
              ${step >= s.id ? 'bg-slate-950 border-slate-950 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-300'}
            `}>
              <s.icon className={`w-5 h-5 lg:w-6 lg:h-6 ${step === s.id ? 'animate-pulse' : ''}`} />
            </div>
            <div className="hidden lg:block">
              <p className={`text-[10px] font-black uppercase tracking-widest leading-none ${step >= s.id ? 'text-slate-950' : 'text-slate-300'}`}>{s.title}</p>
              <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-1 italic">Segment_0{s.id}</p>
            </div>
            {idx < steps.length - 1 && (
              <div className={`hidden lg:block w-12 h-0.5 rounded-full mx-4 ${step > s.id ? 'bg-slate-950' : 'bg-slate-100'}`} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1 & 2 & 3 Combined High-Contrast Views */}
        {step < 4 && (
          <motion.div 
            key="booking-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
             {/* Left: Praticien Intel */}
            <div className="lg:col-span-1 space-y-8">
               <Card className="border-2 border-slate-100 bg-white p-8 lg:p-10 sticky top-24 shadow-sm overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-primary/5 transition-colors" />
                  <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                    <div className="relative">
                       <Avatar name={selectedDoctor?.user?.last_name || selectedDoctor?.last_name || 'Expert'} size="lg" className="w-24 h-24 ring-4 ring-white shadow-2xl group-hover:scale-105 transition-transform" />
                       <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 border-2 border-white rounded-lg flex items-center justify-center shadow-lg">
                          <BadgeCheck className="w-5 h-5 text-white" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <h2 className="text-2xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">
                         {selectedDoctor ? `Dr. ${selectedDoctor.user?.last_name || selectedDoctor.last_name}` : 'Sélection Praticien'}
                       </h2>
                       <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] italic">{selectedDoctor?.specialite_nom || selectedDoctor?.specialty || 'Segment Clinique'}</p>
                    </div>
                    <div className="w-full h-px bg-slate-100" />
                    <div className="space-y-4 w-full text-left">
                       <div className="flex items-center gap-4 text-slate-400">
                          <MapPin className="w-4 h-4 text-emerald-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest italic">Cotonou, Bénin</span>
                       </div>
                    </div>
                  </div>
               </Card>
            </div>


            {/* Right: Booking Matrix */}
            <div className="lg:col-span-2 space-y-8">
               {step === 1 && (
                 <Card className="border-2 border-slate-100 bg-white p-8 lg:p-12 space-y-10 shadow-sm">
                    {doctors.length > 0 && !selectedDoctor ? (
                      <>
                        <div className="space-y-1">
                          <h3 className="text-2xl font-black text-slate-950 tracking-tighter uppercase italic leading-none">Choisir un Praticien</h3>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic mt-2">Sélectionnez votre expert médical</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          {doctors.map((doc) => (
                            <button
                              key={doc.id}
                              onClick={() => {
                                setSelectedDoctor(doc);
                                fetchDoctorAvailabilities(doc.id);
                              }}
                              className="flex items-center gap-6 p-6 rounded-2xl border-2 border-slate-100 hover:border-primary transition-all text-left group"
                            >
                               <Avatar name={doc.user?.last_name || doc.last_name} className="w-16 h-16 group-hover:scale-110 transition-transform" />
                               <div className="flex-1">
                                  <h4 className="text-lg font-black text-slate-950 uppercase italic tracking-tighter">Dr. {doc.user?.last_name || doc.last_name}</h4>
                                  <p className="text-[9px] font-black text-primary uppercase tracking-widest italic mt-1">{doc.specialite_nom || doc.specialty || 'Expert'}</p>
                               </div>
                               <ArrowRight className="w-5 h-5 text-slate-200 group-hover:text-primary transition-colors" />
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <h3 className="text-2xl font-black text-slate-950 tracking-tighter uppercase italic leading-none">Motif de Consultation</h3>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic mt-2">Précisez l'objet du segment clinique</p>
                        </div>
                        <textarea 
                          className="w-full h-40 p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-black text-slate-950 focus:border-primary transition-all outline-none italic leading-relaxed placeholder:text-slate-300"
                          placeholder="Quels sont vos symptômes ?"
                          value={motif}
                          onChange={(e) => setMotif(e.target.value)}
                        />
                        <div className="flex gap-4">
                          {doctors.length > 1 && (
                            <Button variant="ghost" onClick={() => setSelectedDoctor(null)} className="h-14 px-6 border-2 border-slate-100 rounded-xl text-[10px] font-black uppercase italic">Changer</Button>
                          )}
                          <Button 
                            disabled={!selectedDoctor || !motif.trim()} 
                            onClick={() => setStep(2)} 
                            className="flex-1 h-14 rounded-xl font-black italic text-[10px] uppercase shadow-2xl shadow-primary/20"
                          >
                            PROCHAIN SEGMENT <ArrowRight className="w-4 h-4 ml-3" />
                          </Button>
                        </div>
                      </>
                    )}
                 </Card>
               )}

               {step === 2 && (
                 <Card className="border-2 border-slate-100 bg-white p-8 lg:p-12 space-y-10 shadow-sm">
                    <div className="flex items-center justify-between">
                       <div className="space-y-1">
                          <h3 className="text-2xl font-black text-slate-950 tracking-tighter uppercase italic leading-none flex items-center gap-4">
                             <Clock className="w-6 h-6 text-primary" />
                             Créneaux Horaires
                          </h3>
                       </div>
                       <Button variant="ghost" onClick={() => setStep(1)} className="text-[8px] font-black uppercase tracking-widest italic text-slate-400">Retour</Button>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                       {slotsLoading ? (
                         <div className="flex items-center justify-center py-12 text-slate-400">
                           <Clock className="w-6 h-6 animate-spin mr-3" />
                           <span className="text-xs font-black uppercase tracking-widest italic">Chargement des créneaux...</span>
                         </div>
                       ) : availabilities.length === 0 ? (
                         <div className="flex flex-col items-center justify-center py-12 text-slate-300 space-y-3">
                           <Calendar className="w-10 h-10" />
                           <p className="text-xs font-black uppercase tracking-widest italic">Aucun créneau disponible dans les 7 prochains jours</p>
                         </div>
                       ) : (
                         availabilities.map((slot, idx) => {
                           const slotKey = `${slot.date}-${slot.heure_debut}`;
                           const isSelected = selectedSlot && `${selectedSlot.date}-${selectedSlot.heure_debut}` === slotKey;
                           // Formater la date lisiblement
                           const dateLabel = new Date(slot.date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
                           const heureDebut = slot.heure_debut.slice(0, 5);
                           const heureFin = slot.heure_fin.slice(0, 5);
                           return (
                             <button
                               key={slotKey}
                               onClick={() => setSelectedSlot(slot)}
                               className={`w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-300 group ${isSelected ? 'border-primary bg-primary/5 shadow-inner' : 'border-slate-100 hover:border-slate-300 bg-white'}`}
                             >
                                <div className="flex items-center gap-4">
                                   <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary text-white shadow-xl' : 'bg-slate-50 border-slate-100 text-slate-400 group-hover:bg-slate-950 group-hover:text-white'}`}>
                                      <Timer className="w-5 h-5" />
                                   </div>
                                   <div className="text-left">
                                      <p className="text-sm font-black text-slate-950 uppercase tracking-tighter capitalize">{dateLabel}</p>
                                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic mt-1">Créneau disponible</p>
                                   </div>
                                </div>
                                <span className="text-xl lg:text-2xl font-black text-slate-950 tracking-tighter italic uppercase">{heureDebut} — {heureFin}</span>
                             </button>
                           );
                         })
                       )}
                    </div>
                    {selectedSlot && (
                       <Button onClick={() => setStep(3)} className="w-full h-14 rounded-xl font-black italic text-[10px] uppercase shadow-2xl shadow-primary/20">
                          VALIDER LE CRÉNEAU <ChevronRight className="w-4 h-4 ml-3" />
                       </Button>
                    )}
                 </Card>
               )}

               {step === 3 && (
                 <Card className="border-2 border-slate-900 bg-slate-950 p-8 lg:p-12 space-y-10 shadow-3xl text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-32 -mt-32" />
                    <div className="space-y-1">
                       <h3 className="text-2xl lg:text-3xl font-black text-white tracking-tighter uppercase italic leading-none flex items-center gap-4">
                          <ShieldCheck className="w-8 h-8 text-primary" />
                          Récapitulatif
                       </h3>
                       <p className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">Vérifiez les informations avant de confirmer</p>
                    </div>
                    <div className="space-y-4">
                       {/* Médecin */}
                       <div className="flex justify-between items-center p-5 bg-white/5 border border-white/10 rounded-2xl">
                          <div>
                             <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Médecin</p>
                             <p className="text-lg font-black text-white">Dr. {selectedDoctor?.user?.last_name || selectedDoctor?.last_name}</p>
                             <p className="text-xs text-white/40">{selectedDoctor?.specialite_nom || selectedDoctor?.specialty || ''}</p>
                          </div>
                          <Avatar name={selectedDoctor?.user?.last_name || selectedDoctor?.last_name || ''} size="md" />
                       </div>
                       {/* Créneau */}
                       <div className="flex justify-between items-center p-5 bg-white/5 border border-white/10 rounded-2xl">
                          <div>
                             <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Créneau</p>
                             <p className="text-lg font-black text-white capitalize">
                               {selectedSlot ? new Date(selectedSlot.date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                             </p>
                             <p className="text-xs text-white/40">{selectedSlot?.heure_debut?.slice(0,5)} — {selectedSlot?.heure_fin?.slice(0,5)}</p>
                          </div>
                          <Clock className="w-8 h-8 text-primary" />
                       </div>
                       {/* Motif */}
                       {motif && (
                         <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Motif</p>
                            <p className="text-sm text-white leading-relaxed">"{motif}"</p>
                         </div>
                       )}
                    </div>
                    <div className="flex flex-col gap-3">
                       {bookingError && (
                         <div className="flex items-start gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-sm text-red-300">
                           <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                           {bookingError}
                         </div>
                       )}
                       <Button
                         isLoading={isSubmitting}
                         onClick={handleBooking}
                         className="w-full h-14 rounded-xl bg-primary text-white font-black text-sm shadow-2xl"
                         leftIcon={!isSubmitting ? <CheckCircle className="w-5 h-5" /> : undefined}
                       >
                         Confirmer la réservation
                       </Button>
                       <Button variant="ghost" onClick={() => setStep(2)} className="h-11 text-white/40 hover:text-white text-xs font-semibold">
                         ← Modifier le créneau
                       </Button>
                    </div>
                 </Card>
               )}
            </div>
          </motion.div>
        )}

        {/* Step 4: Success High-Impact Confirmation */}
        {step === 4 && (
          <motion.div 
            key="success-matrix"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto py-12"
          >
             <Card className="text-center p-12 lg:p-20 space-y-12 rounded-3xl lg:rounded-[2.5rem] border-2 border-slate-900 bg-slate-950 shadow-3xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[100px] -mr-40 -mt-40 transition-transform group-hover:scale-125 duration-700" />
                
                <div className="relative">
                  <div className="w-24 h-24 lg:w-32 lg:h-32 bg-primary rounded-3xl flex items-center justify-center mx-auto text-white shadow-3xl shadow-primary/40 relative z-10">
                    <CheckCircle className="w-12 h-12 lg:w-16 lg:h-16 stroke-[3]" />
                  </div>
                </div>

                <div className="space-y-6">
                  <Badge variant="success" className="bg-emerald-500 text-white font-black px-6 py-2 rounded-xl border-none tracking-[0.3em] text-[10px] italic">DEMANDE CERTIFIÉE</Badge>
                  <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter italic uppercase leading-[0.9]">Segment Synchronisé.</h2>
                  <p className="text-white/40 font-black text-[12px] lg:text-sm uppercase tracking-widest leading-relaxed px-6 italic">
                    Votre demande avec le <span className="text-white">Dr. {selectedDoctor?.user?.last_name || selectedDoctor?.last_name}</span> est indexée dans l'architecture Hopitel.
                  </p>
                </div>

                <div className="flex flex-col gap-4 pt-8">
                  <Link to="/patient/appointments" className="w-full">
                    <Button size="lg" className="w-full h-16 rounded-xl font-black italic text-[11px] shadow-2xl shadow-primary/20">ACCÉDER À L'AGENDA <ArrowRight className="w-5 h-5 ml-4" /></Button>
                  </Link>
                  <Link to="/" className="w-full">
                    <Button variant="ghost" className="w-full h-14 rounded-xl font-black text-white/30 hover:text-white italic text-[10px]">RETOUR AU HUB CENTRAL</Button>
                  </Link>
                </div>
                
                <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em] flex items-center justify-center gap-3 italic">
                   SMART_HEALTH_SYNCHRO <Sparkles className="w-3 h-3" />
                </p>
             </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
