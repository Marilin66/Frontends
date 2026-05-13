// @ts-nocheck
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, User, Stethoscope, ChevronRight, 
  CheckCircle, AlertCircle, ShieldCheck, Activity,
  ArrowRight, MapPin, Loader2, Building2, Info, ArrowLeft,
  Search, Star, Check, BadgeCheck
} from 'lucide-react';
import { Card, Badge, Button, Avatar, PageLoader } from '@/components/ui';
import { api, endpoints } from '@/services/api';

interface Hospital { id: number; nom: string; adresse: string; logo?: string }
interface Service { id: number; nom: string; description?: string; service_nom?: string }
interface Doctor { id: number; first_name: string; last_name: string; specialite_nom?: string; photo?: string }
interface Availability { date: string; heure_debut: string; heure_fin: string }

export default function AppointmentBookingPage() {
  const { doctorId: paramDoctorId, hospitalId: paramHospitalId, serviceId: paramServiceId } = useParams();
  const navigate = useNavigate();

  // Data States
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);

  // Selection States
  const [selectedServiceId, setSelectedServiceId] = useState<string | number>(paramServiceId || '');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | number>(paramDoctorId || '');
  const [selectedSlot, setSelectedSlot] = useState<Availability | null>(null);
  const [motif, setMotif] = useState('');

  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [fieldLoading, setFieldLoading] = useState({ services: false, doctors: false, slots: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        if (paramHospitalId) {
          const hData = await api.get<Hospital>(endpoints.hopitalDetail(parseInt(paramHospitalId)));
          setHospital(hData);
          await loadServices(paramHospitalId);
          
          if (paramServiceId) {
            await loadDoctors(paramHospitalId, paramServiceId);
          }
          if (paramDoctorId) {
            await loadDoctorInfo(paramDoctorId);
          }
        }
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    };
    init();
  }, [paramHospitalId, paramServiceId, paramDoctorId]);

  const loadServices = async (hId: number | string) => {
    setFieldLoading(prev => ({ ...prev, services: true }));
    try {
      const res = await api.get<any>(endpoints.hopitalServices(parseInt(hId)));
      const data = Array.isArray(res) ? res : res.results || [];
      // Transform hospital service to flat service
      setServices(data.map((s: any) => ({
        id: s.service || s.id,
        nom: s.service_nom || s.nom,
        description: s.service_description || s.description
      })));
    } catch (e) { console.error(e); }
    finally { setFieldLoading(prev => ({ ...prev, services: false })); }
  };

  const loadDoctors = async (hId: number | string, sId: number | string) => {
    setFieldLoading(prev => ({ ...prev, doctors: true }));
    try {
      const res = await api.get<any>(`${endpoints.medecins}?hopital=${hId}&service=${sId}`);
      setDoctors(Array.isArray(res) ? res : res.results || []);
    } catch (e) { console.error(e); }
    finally { setFieldLoading(prev => ({ ...prev, doctors: false })); }
  };

  const loadDoctorInfo = async (dId: number | string) => {
    setFieldLoading(prev => ({ ...prev, slots: true }));
    try {
      const res = await api.get<any>(endpoints.medecinCreneaux(parseInt(dId)));
      setAvailabilities(Array.isArray(res) ? res : res.results || []);
    } catch (e) { console.error(e); }
    finally { setFieldLoading(prev => ({ ...prev, slots: false })); }
  };

  const handleServiceSelect = (sId: number | string) => {
    setSelectedServiceId(sId);
    setSelectedDoctorId('');
    setSelectedSlot(null);
    setDoctors([]);
    loadDoctors(paramHospitalId!, sId);
  };

  const handleDoctorSelect = (dId: number | string) => {
    setSelectedDoctorId(dId);
    setSelectedSlot(null);
    loadDoctorInfo(dId);
  };

  const handleSubmit = async () => {
    if (!selectedDoctorId || !selectedSlot || !motif.trim()) {
      setError("Veuillez compléter toutes les étapes.");
      return;
    }
    setIsSubmitting(true);
    try {
      const date_heure = `${selectedSlot.date}T${selectedSlot.heure_debut}`;
      await api.post(endpoints.rendezVous, {
        medecin: selectedDoctorId,
        date_heure,
        motif,
      });
      setSuccess(true);
    } catch (e: any) {
      setError(e.response?.data?.detail || "Erreur lors de la réservation.");
    } finally { setIsSubmitting(false); }
  };

  if (isLoading) return <PageLoader />;

  if (success) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4">
        <Card className="text-center p-12 rounded-[3rem] border-none shadow-2xl bg-white dark:bg-slate-900 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-white shadow-xl shadow-emerald-500/20 mb-8">
            <CheckCircle className="w-12 h-12" />
          </motion.div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">C'est validé !</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mb-10">Votre demande de rendez-vous a été transmise avec succès au Dr. {doctors.find(d => d.id.toString() === selectedDoctorId.toString())?.last_name}.</p>
          <Button onClick={() => navigate('/patient/appointments')} className="w-full h-14 rounded-2xl bg-primary text-white font-bold">Consulter mon agenda</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-32">
      {/* ── Navigation ── */}
      <div className="flex items-center justify-between mb-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-primary font-bold text-sm transition-colors group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Retour
        </button>
        <Badge className="bg-primary/10 text-primary border-transparent font-bold px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest">Guichet de réservation</Badge>
      </div>

      {/* ── Page Title ── */}
      <div className="mb-12">
        <h1 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
          Réserver à <span className="text-primary">{hospital?.nom}</span>
        </h1>
        <div className="flex items-center gap-2 mt-4 text-slate-500 font-medium">
          <MapPin className="w-4 h-4" /> {hospital?.adresse}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* ── Interactive Selection Column ── */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* STEP 1: SERVICES (CLEAN CARDS) */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">1</div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Choisissez le service</h2>
            </div>
            
            {fieldLoading.services ? (
              <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleServiceSelect(s.id)}
                    className={`p-6 rounded-3xl border-2 text-left transition-all relative overflow-hidden group ${selectedServiceId.toString() === s.id.toString() ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5' : 'border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200'}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all ${selectedServiceId.toString() === s.id.toString() ? 'bg-primary text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-primary group-hover:text-white'}`}>
                      <Activity className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{s.nom}</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase font-bold tracking-widest">Spécialité</p>
                    {selectedServiceId.toString() === s.id.toString() && (
                      <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white shadow-lg">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* STEP 2: DOCTORS (CLEAN PROFILES) */}
          <AnimatePresence>
            {selectedServiceId && (
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">2</div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sélectionnez votre praticien</h2>
                </div>
                
                {fieldLoading.doctors ? (
                   <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                ) : doctors.length === 0 ? (
                  <div className="p-10 bg-slate-50 dark:bg-slate-800/50 rounded-3xl text-center">
                    <User className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Aucun médecin disponible dans ce service.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {doctors.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => handleDoctorSelect(d.id)}
                        className={`p-5 rounded-3xl border-2 text-left flex items-center gap-4 transition-all relative ${selectedDoctorId.toString() === d.id.toString() ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5' : 'border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200'}`}
                      >
                        <Avatar name={d.last_name} src={d.photo} size="lg" className="ring-2 ring-white dark:ring-slate-800" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 dark:text-white truncate">Dr. {d.first_name} {d.last_name}</h4>
                          <p className="text-xs text-primary font-bold uppercase tracking-wider">{d.specialite_nom || 'Médecin'}</p>
                        </div>
                        {selectedDoctorId.toString() === d.id.toString() && (
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white shadow-lg shrink-0">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>

          {/* STEP 3: SLOTS (CLEAN CHIPS) */}
          <AnimatePresence>
            {selectedDoctorId && (
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">3</div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Choisissez l'heure précise</h2>
                </div>
                
                {fieldLoading.slots ? (
                  <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                ) : availabilities.length === 0 ? (
                  <div className="p-10 bg-slate-50 dark:bg-slate-800/50 rounded-3xl text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Pas de disponibilités pour le moment.</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* On regroupe par date */}
                    {Object.entries(availabilities.reduce((acc, curr) => {
                      if (!acc[curr.date]) acc[curr.date] = [];
                      acc[curr.date].push(curr);
                      return acc;
                    }, {} as Record<string, Availability[]>)).map(([date, slots]) => (
                      <div key={date} className="space-y-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</h4>
                        <div className="flex flex-wrap gap-3">
                          {slots.map((slot, i) => {
                            const isSelected = selectedSlot?.date === slot.date && selectedSlot?.heure_debut === slot.heure_debut;
                            return (
                              <button
                                key={i}
                                onClick={() => setSelectedSlot(slot)}
                                className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all border-2 ${isSelected ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-105' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                              >
                                {slot.heure_debut.slice(0, 5)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* ── Summary & Submit Column ── */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-6">
            <Card className="p-8 rounded-[2.5rem] border-none shadow-2xl bg-white dark:bg-slate-900 transition-colors">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-primary" /> Résumé de visite
              </h3>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Établissement</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{hospital?.nom}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Moment choisi</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {selectedSlot 
                        ? `${new Date(selectedSlot.date + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} à ${selectedSlot.heure_debut.slice(0, 5)}`
                        : 'En attente de choix...'}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50 dark:border-slate-800 space-y-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Motif de consultation</label>
                  <textarea 
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                    placeholder="Pourquoi souhaitez-vous voir ce médecin ?"
                    className="w-full h-32 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-medium text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/5 transition-all resize-none"
                  />
                </div>
              </div>

              {error && (
                <div className="mt-6 p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 rounded-2xl flex items-center gap-3 text-rose-600 dark:text-rose-400 text-xs font-bold">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}

              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedSlot}
                isLoading={isSubmitting}
                className="w-full h-16 mt-8 rounded-2xl bg-primary text-white font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Confirmer
              </Button>
            </Card>

            <div className="p-6 bg-slate-900 dark:bg-primary/10 rounded-3xl text-white dark:text-primary space-y-2">
               <div className="flex items-center gap-2">
                 <BadgeCheck className="w-5 h-5" />
                 <span className="text-xs font-bold uppercase tracking-widest">Réservation Sécurisée</span>
               </div>
               <p className="text-[11px] font-medium opacity-60">Vos données sont protégées et cryptées selon les normes de santé en vigueur au Bénin.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
