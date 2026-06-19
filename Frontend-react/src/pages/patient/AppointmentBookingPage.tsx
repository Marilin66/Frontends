
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, User, Activity, CheckCircle, AlertCircle, ShieldCheck,
  ArrowLeft, Loader2, Building2, Check, BadgeCheck,
  ChevronLeft, ChevronRight, MapPin,
} from 'lucide-react';
import { Card, Badge, Button, Avatar, PageLoader } from '@/components/ui';
import { api, endpoints } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Hopital, Service as ApiService, Medecin } from '@/types/api';
import { toArray } from '@/types/api';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Hospital { id: number; nom: string; adresse: string }
interface Service  { id: number; nom: string }
interface Doctor   { id: number; first_name: string; last_name: string; specialite_nom?: string; photo?: string }
interface Slot     { date: string; heure_debut: string; heure_fin: string }

// ── Helpers ───────────────────────────────────────────────────────────────────

const MOIS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];

function startOfWeek(d: Date): Date {
  const r = new Date(d);
  const diff = (r.getDay() + 6) % 7;
  r.setDate(r.getDate() - diff);
  r.setHours(0, 0, 0, 0);
  return r;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Nettoie une réponse d'erreur — enlève le HTML brut si présent */
function cleanError(raw: unknown, httpStatus?: number): string {
  if (!raw) {
    return httpStatus === 500
      ? 'Erreur serveur. Si votre NPI n\'est pas renseigné dans votre profil, veuillez le compléter avant de réserver.'
      : 'Erreur inconnue.';
  }
  if (typeof raw === 'string') {
    if (raw.includes('<!doctype') || raw.includes('<html') || raw.includes('<body')) {
      return 'Erreur serveur (500). Assurez-vous que votre NPI est renseigné dans votre profil (Profil → Dossier médical → NPI).';
    }
    return raw;
  }
  if (typeof raw === 'object') {
    const d = raw as Record<string, unknown>;
    const msg =
      (d.detail as string) ??
      (Array.isArray(d.non_field_errors) ? (d.non_field_errors as string[])[0] : undefined) ??
      (Array.isArray(d.medecin)    ? (d.medecin    as string[])[0] : undefined) ??
      (Array.isArray(d.date_heure) ? (d.date_heure as string[])[0] : undefined) ??
      (Array.isArray(d.motif)      ? (d.motif      as string[])[0] : undefined);
    if (msg) return msg;
    // Chercher dans les clés imbriquées
    for (const v of Object.values(d)) {
      if (typeof v === 'string') return v;
      if (Array.isArray(v) && typeof v[0] === 'string') return v[0];
    }
    return JSON.stringify(d);
  }
  return String(raw);
}

// ── Calendrier responsive ─────────────────────────────────────────────────────
// Mobile  (<768 px) → 3 colonnes, créneaux lisibles (py-2, texte xs)
// Desktop (≥768 px) → 7 colonnes (semaine entière)

function SlotCalendar({ slots, selected, onSelect }: {
  slots: Slot[];
  selected: Slot | null;
  onSelect: (s: Slot) => void;
}) {
  const today = useMemo(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d;
  }, []);

  // Premier jour qui a des créneaux (≥ aujourd'hui)
  const firstSlotDay = useMemo(() => {
    const sorted = [...slots].sort((a, b) => a.date.localeCompare(b.date));
    const d = sorted.find(s => new Date(s.date + 'T00:00:00') >= today);
    return d ? new Date(d.date + 'T00:00:00') : today;
  }, [slots, today]);

  // Nombre de colonnes selon la largeur d'écran
  const [cols, setCols] = useState<3 | 7>(() => (typeof window !== 'undefined' && window.innerWidth >= 768) ? 7 : 3);

  useEffect(() => {
    const update = () => setCols(window.innerWidth >= 768 ? 7 : 3);
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Début de la période affichée
  const [start, setStart] = useState<Date>(() =>
    cols === 7 ? startOfWeek(firstSlotDay) : firstSlotDay
  );

  // Recalculer le début quand cols change
  useEffect(() => {
    setStart(cols === 7 ? startOfWeek(firstSlotDay) : firstSlotDay);
  }, [cols, firstSlotDay]);

  const days = useMemo(() => Array.from({ length: cols }, (_, i) => addDays(start, i)), [start, cols]);

  const byDate = useMemo(() => {
    const m: Record<string, Slot[]> = {};
    slots.forEach(s => { (m[s.date] ??= []).push(s); });
    return m;
  }, [slots]);

  const hasSlot  = days.some(d => (byDate[toISO(d)] ?? []).length > 0);
  const canPrev  = days[0] > today;

  const rangeLabel = cols === 7
    ? `${days[0].getDate()} – ${days[6].getDate()} ${MOIS[days[6].getMonth()]} ${days[6].getFullYear()}`
    : `${days[0].getDate()} ${MOIS[days[0].getMonth()].slice(0,4)}. – ${days[cols-1].getDate()} ${MOIS[days[cols-1].getMonth()].slice(0,4)}.`;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">

      {/* ── Header navigation ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
        <button
          onClick={() => setStart(s => addDays(s, -cols))}
          disabled={!canPrev}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700
                     disabled:opacity-30 hover:bg-white dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-slate-500" />
        </button>

        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 select-none">
          {rangeLabel}
        </span>

        <button
          onClick={() => setStart(s => addDays(s, cols))}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700
                     hover:bg-white dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* ── Grille ── */}
      <div
        className="grid divide-x divide-slate-100 dark:divide-slate-800"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {days.map(day => {
          const iso      = toISO(day);
          const isPast   = day < today;
          const isToday  = iso === toISO(today);
          const daySlots = (byDate[iso] ?? []).sort((a, b) => a.heure_debut.localeCompare(b.heure_debut));
          const dayName  = day.toLocaleDateString('fr-FR', { weekday: 'short' });

          return (
            <div key={iso} className="flex flex-col">
              {/* En-tête jour */}
              <div className={`py-3 text-center border-b border-slate-100 dark:border-slate-800 ${isToday ? 'bg-primary/5' : ''}`}>
                <p className={`text-[11px] font-bold uppercase tracking-wide ${isToday ? 'text-primary' : 'text-slate-400'}`}>
                  {dayName}
                </p>
                <p className={`text-xl font-black mt-0.5 leading-none ${
                  isToday ? 'text-primary' :
                  isPast  ? 'text-slate-300 dark:text-slate-600' :
                            'text-slate-800 dark:text-white'
                }`}>
                  {day.getDate()}
                </p>
              </div>

              {/* Créneaux */}
              <div className="flex flex-col gap-2 p-2 min-h-[140px]">
                {isPast ? (
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-xs text-slate-200 dark:text-slate-700">—</span>
                  </div>
                ) : daySlots.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-xs text-slate-300 dark:text-slate-700">—</span>
                  </div>
                ) : (
                  daySlots.map((slot, i) => {
                    const active = selected?.date === slot.date && selected?.heure_debut === slot.heure_debut;
                    return (
                      <button
                        key={i}
                        onClick={() => onSelect(slot)}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                          active
                            ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-[1.02]'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary/10 hover:text-primary'
                        }`}
                      >
                        {slot.heure_debut.slice(0, 5)}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Aucun créneau */}
      {!hasSlot && (
        <div className="py-6 text-center border-t border-slate-100 dark:border-slate-800 bg-slate-50/50">
          <p className="text-sm text-slate-400 font-medium">Aucun créneau disponible</p>
          <button
            onClick={() => setStart(s => addDays(s, cols))}
            className="mt-2 text-xs font-bold text-primary hover:underline"
          >
            Voir la période suivante →
          </button>
        </div>
      )}
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function AppointmentBookingPage() {
  const { doctorId: paramDoctorId, hospitalId: paramHospitalId, serviceId: paramServiceId } = useParams();
  const navigate  = useNavigate();
  const { user }  = useAuth();

  const [hospital,       setHospital]       = useState<Hospital | null>(null);
  const [services,       setServices]       = useState<Service[]>([]);
  const [doctors,        setDoctors]        = useState<Doctor[]>([]);
  const [availabilities, setAvailabilities] = useState<Slot[]>([]);

  const [selectedServiceId, setSelectedServiceId] = useState<string | number>(paramServiceId || '');
  const [selectedDoctorId,  setSelectedDoctorId]  = useState<string | number>(paramDoctorId  || '');
  const [selectedDoctor,    setSelectedDoctor]    = useState<Doctor | null>(null);
  const [selectedSlot,      setSelectedSlot]      = useState<Slot | null>(null);
  const [motif,             setMotif]             = useState('');

  const [isLoading,    setIsLoading]    = useState(true);
  const [fldLoading,   setFldLoading]   = useState({ services: false, doctors: false, slots: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error,        setError]        = useState('');
  const [success,      setSuccess]      = useState(false);

  // ── Init ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!paramHospitalId) { setIsLoading(false); return; }
    (async () => {
      try {
        setIsLoading(true);
        const h = await api.get<Hopital>(endpoints.hopitalDetail(parseInt(paramHospitalId)));
        setHospital(h);
        await loadServices(paramHospitalId);
        if (paramServiceId) await loadDoctors(paramHospitalId, paramServiceId);
        if (paramDoctorId)  await loadSlots(paramDoctorId);
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    })();
  }, [paramHospitalId, paramServiceId, paramDoctorId]);

  const loadServices = async (hId: string | number) => {
    setFldLoading(p => ({ ...p, services: true }));
    try {
      const r = await api.get(endpoints.hopitalServices(parseInt(String(hId))));
      const data = toArray<{ service?: number; id: number; service_nom?: string; nom: string }>(r);
      setServices(data.map((s) => ({ id: s.service ?? s.id, nom: s.service_nom ?? s.nom })));
    } catch (e) { console.error(e); }
    finally { setFldLoading(p => ({ ...p, services: false })); }
  };

  const loadDoctors = async (hId: string | number, sId: string | number) => {
    setFldLoading(p => ({ ...p, doctors: true }));
    try {
      const r = await api.get(`${endpoints.medecins}?hopital=${hId}&service=${sId}`);
      setDoctors(toArray<Doctor>(r));
    } catch (e) { console.error(e); }
    finally { setFldLoading(p => ({ ...p, doctors: false })); }
  };

  const loadSlots = async (dId: string | number) => {
    setFldLoading(p => ({ ...p, slots: true }));
    try {
      const r = await api.get(endpoints.medecinCreneaux(parseInt(String(dId))));
      setAvailabilities(toArray<Slot>(r));
    } catch (e) { console.error(e); }
    finally { setFldLoading(p => ({ ...p, slots: false })); }
  };

  const handleServiceSelect = (sId: string | number) => {
    setSelectedServiceId(sId);
    setSelectedDoctorId(''); setSelectedDoctor(null);
    setSelectedSlot(null); setAvailabilities([]); setDoctors([]);
    setError('');
    loadDoctors(paramHospitalId!, sId);
  };

  const handleDoctorSelect = (d: Doctor) => {
    setSelectedDoctorId(d.id); setSelectedDoctor(d);
    setSelectedSlot(null); setAvailabilities([]);
    setError('');
    loadSlots(d.id);
  };

  // ── Soumission ────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!selectedDoctorId || !selectedSlot || !motif.trim() || motif.trim().length < 5) {
      setError('Veuillez sélectionner un créneau et saisir un motif (min. 5 caractères).');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const time       = selectedSlot.heure_debut.length === 5 ? `${selectedSlot.heure_debut}:00` : selectedSlot.heure_debut;
      const date_heure = `${selectedSlot.date}T${time}`;
      await api.post(endpoints.rendezVous, { medecin: selectedDoctorId, date_heure, motif: motif.trim() });
      setSuccess(true);
    } catch (e) {
      const err = e as { response?: { data?: unknown; status?: number } };
      const raw    = err?.response?.data;
      const status = err?.response?.status;
      setError(cleanError(raw, status));
    } finally { setIsSubmitting(false); }
  };

  if (isLoading) return <PageLoader />;

  // ── Succès ────────────────────────────────────────────────────────────────

  if (success) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4">
        <Card className="text-center p-10 rounded-[3rem] border-none shadow-2xl bg-white dark:bg-slate-900">
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-white shadow-xl shadow-emerald-500/20 mb-8">
            <CheckCircle className="w-12 h-12" />
          </motion.div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">Demande envoyée !</h2>
          <p className="text-slate-500 font-medium mb-2">
            Votre demande de rendez-vous avec <strong>Dr. {selectedDoctor?.last_name ?? ''}</strong> a été transmise.
          </p>
          <p className="text-xs text-slate-400 mb-8">Vous serez notifié dès confirmation par le médecin.</p>
          <Button onClick={() => navigate('/patient/appointments')} className="w-full h-13 rounded-2xl bg-primary text-white font-bold">
            Voir mes rendez-vous
          </Button>
        </Card>
      </div>
    );
  }

  // ── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-32">

      {/* Nav */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-primary font-bold text-sm group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Retour
        </button>
        <Badge className="bg-primary/10 text-primary border-transparent font-bold px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest">
          Réservation
        </Badge>
      </div>

      {/* Titre */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Réserver à <span className="text-primary">{hospital?.nom ?? '—'}</span>
        </h1>
        {hospital?.adresse && (
          <p className="flex items-center gap-1.5 text-slate-500 text-sm mt-2">
            <MapPin className="w-3.5 h-3.5 shrink-0" /> {hospital.adresse}
          </p>
        )}
      </div>

      {/* Alerte NPI manquant */}
      {/* NPI check - via Record pour accès flexible */}
      {!((user as any)?.patient_profile as any)?.npi && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800">NPI requis pour réserver</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Votre Numéro Personnel d'Identification est obligatoire. Complétez votre profil avant de confirmer.
            </p>
          </div>
          <button onClick={() => navigate('/patient/profile/edit')}
            className="text-xs font-bold text-amber-800 underline whitespace-nowrap mt-0.5">
            Renseigner →
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ── Colonne sélection ── */}
        <div className="lg:col-span-7 space-y-8">

          {/* Étape 1 — Service */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-sm">1</span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Choisissez le service</h2>
            </div>
            {fldLoading.services ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : services.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 rounded-2xl">
                <p className="text-sm text-slate-400">Aucun service disponible.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {services.map(s => {
                  const active = selectedServiceId.toString() === s.id.toString();
                  return (
                    <button key={s.id} onClick={() => handleServiceSelect(s.id)}
                      className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
                        active ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200'
                      }`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${active ? 'bg-primary text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                        <Activity className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{s.nom}</p>
                      {active && (
                        <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Étape 2 — Médecin */}
          <AnimatePresence>
            {selectedServiceId && (
              <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-sm">2</span>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Sélectionnez un praticien</h2>
                </div>
                {fldLoading.doctors ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                ) : doctors.length === 0 ? (
                  <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                    <User className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Aucun médecin disponible dans ce service.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {doctors.map(d => {
                      const active = selectedDoctorId.toString() === d.id.toString();
                      return (
                        <button key={d.id} onClick={() => handleDoctorSelect(d)}
                          className={`p-4 rounded-2xl border-2 text-left flex items-center gap-3 transition-all ${
                            active ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200'
                          }`}>
                          <Avatar name={`${d.first_name} ${d.last_name}`} src={d.photo} size="md" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Dr. {d.first_name} {d.last_name}</p>
                            <p className="text-xs text-primary font-semibold">{d.specialite_nom || 'Médecin'}</p>
                          </div>
                          {active && <Check className="w-4 h-4 text-primary shrink-0 stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>

          {/* Étape 3 — Calendrier */}
          <AnimatePresence>
            {selectedDoctorId && (
              <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-sm">3</span>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Choisissez un créneau</h2>
                </div>
                {fldLoading.slots ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                ) : availabilities.length === 0 ? (
                  <div className="py-10 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500">Aucun créneau disponible pour ce médecin.</p>
                  </div>
                ) : (
                  <SlotCalendar
                    slots={availabilities}
                    selected={selectedSlot}
                    onSelect={s => { setSelectedSlot(s); setError(''); }}
                  />
                )}
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* ── Colonne résumé ── */}
        <div className="lg:col-span-5">
          <div className="sticky top-24">
            <Card className="p-6 rounded-3xl border-none shadow-xl bg-white dark:bg-slate-900">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" /> Résumé de visite
              </h3>

              <div className="space-y-3">
                {/* Établissement */}
                <div className="flex gap-3 items-start p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Établissement</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{hospital?.nom ?? '—'}</p>
                  </div>
                </div>

                {/* Médecin */}
                {selectedDoctor && (
                  <div className="flex gap-3 items-start p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <Avatar name={`${selectedDoctor.first_name} ${selectedDoctor.last_name}`} size="sm" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Praticien</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Dr. {selectedDoctor.first_name} {selectedDoctor.last_name}</p>
                    </div>
                  </div>
                )}

                {/* Créneau */}
                <div className="flex gap-3 items-start p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Moment choisi</p>
                    <p className={`text-sm font-bold ${selectedSlot ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                      {selectedSlot
                        ? `${new Date(selectedSlot.date + 'T00:00:00').toLocaleDateString('fr-FR', {
                            weekday: 'long', day: 'numeric', month: 'long',
                          })} à ${selectedSlot.heure_debut.slice(0, 5)}`
                        : 'Aucun créneau sélectionné'}
                    </p>
                  </div>
                </div>

                {/* Motif */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                    Motif <span className="text-red-400">*</span>
                  </label>
                  <textarea value={motif} onChange={e => { setMotif(e.target.value); setError(''); }}
                    placeholder="Décrivez brièvement la raison de votre visite…" rows={3}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                               text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20
                               resize-none placeholder:text-slate-400" />
                  {motif.length > 0 && motif.trim().length < 5 && (
                    <p className="text-[11px] text-amber-500 mt-1 font-medium">
                      Minimum 5 caractères requis.
                    </p>
                  )}
                </div>
              </div>

              {/* Erreur — texte propre (jamais de HTML) */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                                rounded-xl flex items-start gap-2 text-red-600 dark:text-red-400 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedSlot || !motif.trim() || motif.trim().length < 5}
                isLoading={isSubmitting}
                className="w-full h-12 mt-5 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                Confirmer la réservation
              </Button>
            </Card>

            <div className="mt-3 p-4 bg-slate-900 dark:bg-primary/10 rounded-2xl text-white flex items-start gap-3">
              <BadgeCheck className="w-4 h-4 shrink-0 mt-0.5 opacity-70" />
              <p className="text-xs font-medium opacity-60">
                Données protégées selon les normes de santé en vigueur au Bénin.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
