
// @ts-nocheck
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { api, endpoints } from '@/services/api';
import { Button } from '@/components/ui';
import {
  ArrowLeft, ArrowRight, Building, Phone, Mail, MapPin,
  Globe, FileText, CheckCircle, AlertCircle, Navigation,
  Hash, Info, Loader2, Building2, Keyboard, Map, LocateFixed,
  MousePointerClick, User, Calendar, Users
} from 'lucide-react';

// Fix icône Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click(e) { onMapClick(e.latlng.lat, e.latlng.lng); } });
  return null;
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface FormData {
  // Étape 1 — Identité hôpital
  nom: string; code_court: string; description: string;
  // Étape 2 — Localisation
  adresse: string; ville: string; latitude: string; longitude: string;
  // Étape 3 — Contact hôpital
  telephone: string; email: string; site_web: string;
  // Étape 4 — Admin hôpital
  admin_first_name: string; admin_last_name: string;
  admin_email: string; admin_telephone: string;
  admin_date_naissance: string; admin_sexe: string;
}

interface FieldErrors { [key: string]: string; }

const EMPTY: FormData = {
  nom: '', code_court: '', description: '',
  adresse: '', ville: '', latitude: '', longitude: '',
  telephone: '', email: '', site_web: '',
  admin_first_name: '', admin_last_name: '',
  admin_email: '', admin_telephone: '',
  admin_date_naissance: '', admin_sexe: 'M',
};

// ── Config des 5 étapes ───────────────────────────────────────────────────────
const STEPS = [
  { id: 1, title: 'Identité',      subtitle: "Nom et description",          icon: Building2,    color: 'text-blue-600',    bg: 'bg-blue-50',    activeBg: 'bg-blue-600' },
  { id: 2, title: 'Localisation',  subtitle: 'Adresse et GPS',              icon: MapPin,       color: 'text-violet-600',  bg: 'bg-violet-50',  activeBg: 'bg-violet-600' },
  { id: 3, title: 'Contact',       subtitle: 'Téléphone et email',          icon: Phone,        color: 'text-emerald-600', bg: 'bg-emerald-50', activeBg: 'bg-emerald-600' },
  { id: 4, title: 'Administrateur',subtitle: 'Compte admin de l\'hôpital',  icon: Users,        color: 'text-rose-600',    bg: 'bg-rose-50',    activeBg: 'bg-rose-600' },
  { id: 5, title: 'Confirmation',  subtitle: 'Vérifiez avant de créer',     icon: CheckCircle,  color: 'text-amber-600',   bg: 'bg-amber-50',   activeBg: 'bg-amber-600' },
];

// ── Composants utilitaires ────────────────────────────────────────────────────
function Field({ label, required = false, error, children, hint }: any) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3 flex-shrink-0" /> {error}</p>}
    </div>
  );
}

function TInput({ value, onChange, placeholder, type = 'text', icon: Icon, error, disabled }: any) {
  return (
    <div className="relative">
      {Icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Icon className="w-4 h-4 text-slate-400" /></div>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
        className={`w-full h-11 px-3 bg-white border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none
          ${Icon ? 'pl-10' : ''}
          ${error ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100' : 'border-slate-200 hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10'}
          ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`}
      />
    </div>
  );
}

function RecapRow({ icon: Icon, label, value, color = 'text-slate-400' }: any) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-900 break-words">{value}</p>
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function CreateHospitalPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({ ...EMPTY });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [direction, setDirection] = useState<1 | -1>(1);
  const [gpsMode, setGpsMode] = useState<'manual' | 'map'>('manual');
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);

  const set = useCallback((key: keyof FormData, val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: '' }));
  }, []);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setMarkerPos([lat, lng]);
    setForm((f) => ({ ...f, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
    setErrors((e) => ({ ...e, latitude: '', longitude: '' }));
  }, []);

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { handleMapClick(pos.coords.latitude, pos.coords.longitude); setLocating(false); },
      () => setLocating(false),
      { timeout: 8000 }
    );
  };

  useEffect(() => {
    const lat = parseFloat(form.latitude);
    const lng = parseFloat(form.longitude);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      setMarkerPos([lat, lng]);
    }
  }, [form.latitude, form.longitude]);

  // ── Validation par étape ──────────────────────────────────────────────────
  const validate = (s: number): boolean => {
    const e: FieldErrors = {};
    if (s === 1) {
      if (!form.nom.trim()) e.nom = 'Le nom est obligatoire';
      else if (form.nom.trim().length < 3) e.nom = 'Minimum 3 caractères';
    }
    if (s === 2) {
      if (!form.adresse.trim()) e.adresse = "L'adresse est obligatoire";
      if (!form.ville.trim()) e.ville = 'La ville est obligatoire';
      if (form.latitude && isNaN(parseFloat(form.latitude))) e.latitude = 'Latitude invalide';
      if (form.longitude && isNaN(parseFloat(form.longitude))) e.longitude = 'Longitude invalide';
      if (form.latitude && (parseFloat(form.latitude) < -90 || parseFloat(form.latitude) > 90)) e.latitude = 'Entre -90 et 90';
      if (form.longitude && (parseFloat(form.longitude) < -180 || parseFloat(form.longitude) > 180)) e.longitude = 'Entre -180 et 180';
    }
    if (s === 3) {
      if (!form.telephone.trim()) e.telephone = 'Le téléphone est obligatoire';
      if (!form.email.trim()) e.email = "L'email est obligatoire";
      else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email invalide';
      if (form.site_web && !/^https?:\/\/.+/.test(form.site_web)) e.site_web = 'Doit commencer par http:// ou https://';
    }
    if (s === 4) {
      if (!form.admin_first_name.trim()) e.admin_first_name = 'Requis';
      if (!form.admin_last_name.trim()) e.admin_last_name = 'Requis';
      if (!form.admin_email.trim()) e.admin_email = "L'email est obligatoire";
      else if (!/\S+@\S+\.\S+/.test(form.admin_email)) e.admin_email = 'Email invalide';
      if (!form.admin_telephone.trim()) e.admin_telephone = 'Le téléphone est obligatoire';
      if (!form.admin_date_naissance) e.admin_date_naissance = 'La date de naissance est obligatoire';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => { if (!validate(step)) return; setDirection(1); setStep((s) => s + 1); };
  const goPrev = () => { setDirection(-1); setStep((s) => s - 1); };

  // ── Soumission finale ─────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setGlobalError('');
    setSaving(true);
    try {
      const payload: any = {
        nom: form.nom.trim(),
        adresse: form.adresse.trim(),
        ville: form.ville.trim(),
        telephone: form.telephone.trim(),
        email: form.email.trim(),
        // Champs admin obligatoires
        admin_email: form.admin_email.trim(),
        admin_first_name: form.admin_first_name.trim(),
        admin_last_name: form.admin_last_name.trim(),
        admin_telephone: form.admin_telephone.trim(),
        admin_date_naissance: form.admin_date_naissance,
        admin_sexe: form.admin_sexe,
      };
      if (form.code_court.trim()) payload.code_court = form.code_court.trim().toUpperCase();
      if (form.description.trim()) payload.description = form.description.trim();
      if (form.site_web.trim()) payload.site_web = form.site_web.trim();
      if (form.latitude) payload.latitude = parseFloat(form.latitude);
      if (form.longitude) payload.longitude = parseFloat(form.longitude);

      await api.post(endpoints.hopitaux, payload);
      navigate('/super-admin/hopitaux', { state: { created: true } });
    } catch (err: any) {
      const data = err?.response?.data;
      const status = err?.response?.status;

      if (!err?.response) {
        setGlobalError('Impossible de joindre le serveur. Vérifiez votre connexion.');
        return;
      }

      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const fieldMap: Record<string, number> = {
          nom: 1, code_court: 1, description: 1,
          adresse: 2, ville: 2, latitude: 2, longitude: 2,
          telephone: 3, email: 3, site_web: 3,
          admin_first_name: 4, admin_last_name: 4,
          admin_email: 4, admin_telephone: 4,
          admin_date_naissance: 4, admin_sexe: 4,
        };
        const newErrors: FieldErrors = {};
        let firstStep = 6;
        Object.entries(data).forEach(([key, val]) => {
          const msg = Array.isArray(val) ? val[0] : String(val);
          if (fieldMap[key]) {
            newErrors[key] = msg;
            if (fieldMap[key] < firstStep) firstStep = fieldMap[key];
          }
        });
        if (firstStep <= 5) {
          setErrors(newErrors);
          setDirection(-1);
          setStep(firstStep);
        } else {
          const msg = data.detail || data.error || data.message || data.non_field_errors?.[0] ||
            (status === 403 ? "Vous n'avez pas les droits pour créer un hôpital." :
             status === 409 ? 'Un hôpital avec ce nom ou ce code existe déjà.' :
             `Erreur ${status || ''} — Veuillez réessayer.`);
          setGlobalError(String(msg));
        }
      } else if (typeof data === 'string') {
        setGlobalError(data);
      } else {
        setGlobalError(
          status === 403 ? "Vous n'avez pas les droits pour créer un hôpital." :
          status === 500 ? 'Erreur interne du serveur.' :
          'Erreur lors de la création. Veuillez réessayer.'
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const currentStep = STEPS[step - 1];
  const StepIcon = currentStep.icon;
  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/super-admin/hopitaux')}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors touch-manipulation flex-shrink-0">
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Nouvel hôpital</h1>
          <p className="text-sm text-slate-500 mt-0.5">Enregistrement en {STEPS.length} étapes</p>
        </div>
      </div>

      {/* ── Stepper ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
        <div className="flex items-center gap-1 sm:gap-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <div key={s.id} className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
                <button onClick={() => isDone && (setDirection(-1), setStep(s.id))} disabled={!isDone}
                  className={`flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all duration-300
                    ${isDone ? `${s.activeBg} text-white cursor-pointer hover:opacity-90 shadow-sm` : ''}
                    ${isActive ? `${s.activeBg} text-white shadow-md scale-105` : ''}
                    ${!isActive && !isDone ? 'bg-slate-100 text-slate-400' : ''}`}>
                  {isDone ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </button>
                <div className="hidden sm:block min-w-0 flex-1">
                  <p className={`text-xs font-semibold truncate ${isActive ? 'text-slate-900' : isDone ? 'text-slate-600' : 'text-slate-400'}`}>{s.title}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 sm:flex-none sm:w-4 rounded-full transition-all duration-500 ${step > s.id ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-500">Étape {step} sur {STEPS.length}</span>
            <span className="text-xs font-semibold text-primary">{Math.round(((step - 1) / (STEPS.length - 1)) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div className="h-full bg-primary rounded-full" initial={false}
              animate={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeInOut' }} />
          </div>
        </div>
      </div>

      {/* ── Contenu de l'étape ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className={`w-10 h-10 ${currentStep.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <StepIcon className={`w-5 h-5 ${currentStep.color}`} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{currentStep.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{currentStep.subtitle}</p>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div key={step} custom={direction} variants={variants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="p-5 sm:p-6">

              {/* ── Étape 1 : Identité ── */}
              {step === 1 && (
                <div className="space-y-5">
                  <Field label="Nom de l'hôpital" required error={errors.nom}>
                    <TInput value={form.nom} onChange={(e: any) => set('nom', e.target.value)}
                      placeholder="Ex: Centre Hospitalier Universitaire de Cotonou" icon={Building} error={errors.nom} />
                  </Field>
                  <Field label="Code court" error={errors.code_court}
                    hint="Code unique 4-6 lettres pour les codes d'accès résultats (ex: CHUC). Généré automatiquement si vide.">
                    <TInput value={form.code_court} onChange={(e: any) => set('code_court', e.target.value.toUpperCase())}
                      placeholder="Ex: CHUC" icon={Hash} error={errors.code_court} />
                  </Field>
                  <Field label="Description" error={errors.description} hint="Optionnel">
                    <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
                      placeholder="Décrivez l'établissement, ses spécialités…" rows={4}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all resize-none" />
                  </Field>
                </div>
              )}

              {/* ── Étape 2 : Localisation ── */}
              {step === 2 && (
                <div className="space-y-5">
                  <Field label="Adresse complète" required error={errors.adresse}>
                    <TInput value={form.adresse} onChange={(e: any) => set('adresse', e.target.value)}
                      placeholder="Ex: Quartier Akpakpa, Rue des Hôpitaux" icon={MapPin} error={errors.adresse} />
                  </Field>
                  <Field label="Ville" required error={errors.ville}>
                    <TInput value={form.ville} onChange={(e: any) => set('ville', e.target.value)}
                      placeholder="Ex: Cotonou, Porto-Novo, Parakou…" icon={Building2} error={errors.ville} />
                  </Field>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-violet-500" />
                      <p className="text-sm font-medium text-slate-700">Coordonnées GPS <span className="text-slate-400 font-normal">(optionnel)</span></p>
                    </div>
                    <div className="flex gap-2 p-1 bg-white rounded-xl border border-slate-200">
                      {[{ v: 'manual', l: 'Saisie manuelle', icon: Keyboard }, { v: 'map', l: 'Choisir sur la carte', icon: Map }].map(({ v, l, icon: Icon }) => (
                        <button key={v} type="button" onClick={() => setGpsMode(v as any)}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${gpsMode === v ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                          <Icon className="w-3.5 h-3.5" /> {l}
                        </button>
                      ))}
                    </div>
                    {gpsMode === 'manual' && (
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Latitude" error={errors.latitude} hint="Ex: 6.3654">
                          <TInput value={form.latitude} onChange={(e: any) => set('latitude', e.target.value)} placeholder="6.3654" type="number" error={errors.latitude} />
                        </Field>
                        <Field label="Longitude" error={errors.longitude} hint="Ex: 2.4183">
                          <TInput value={form.longitude} onChange={(e: any) => set('longitude', e.target.value)} placeholder="2.4183" type="number" error={errors.longitude} />
                        </Field>
                      </div>
                    )}
                    {gpsMode === 'map' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <MousePointerClick className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
                            <span>Cliquez sur la carte pour placer l'hôpital</span>
                          </div>
                          <button type="button" onClick={handleLocateMe} disabled={locating}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 text-violet-700 text-xs font-semibold hover:bg-violet-100 transition disabled:opacity-50 flex-shrink-0">
                            {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LocateFixed className="w-3.5 h-3.5" />}
                            {locating ? 'Localisation…' : 'Ma position'}
                          </button>
                        </div>
                        <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm" style={{ height: '280px', minHeight: '280px', position: 'relative' }}>
                          <MapContainer center={markerPos ?? [6.3654, 2.4183]} zoom={markerPos ? 14 : 7}
                            style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}
                            key={`map-${gpsMode}`} scrollWheelZoom={true}>
                            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <MapClickHandler onMapClick={handleMapClick} />
                            {markerPos && <Marker position={markerPos} icon={hospitalIcon} />}
                          </MapContainer>
                        </div>
                        {markerPos ? (
                          <div className="flex items-center gap-2 p-3 bg-violet-50 border border-violet-100 rounded-xl">
                            <Navigation className="w-4 h-4 text-violet-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-violet-800">Position sélectionnée</p>
                              <p className="text-xs text-violet-600 font-mono mt-0.5">{parseFloat(form.latitude).toFixed(6)}, {parseFloat(form.longitude).toFixed(6)}</p>
                            </div>
                            <button type="button" onClick={() => { setMarkerPos(null); setForm((f) => ({ ...f, latitude: '', longitude: '' })); }}
                              className="text-xs text-violet-500 hover:text-violet-700 font-medium transition">Effacer</button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                            <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <p className="text-xs text-slate-400">Aucune position sélectionnée — cliquez sur la carte</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Étape 3 : Contact ── */}
              {step === 3 && (
                <div className="space-y-5">
                  <Field label="Téléphone" required error={errors.telephone} hint="Numéro principal de l'établissement">
                    <TInput value={form.telephone} onChange={(e: any) => set('telephone', e.target.value)}
                      placeholder="Ex: +229 21 30 01 00" icon={Phone} type="tel" error={errors.telephone} />
                  </Field>
                  <Field label="Email de contact" required error={errors.email} hint="Adresse email officielle">
                    <TInput value={form.email} onChange={(e: any) => set('email', e.target.value)}
                      placeholder="Ex: contact@chu-cotonou.bj" icon={Mail} type="email" error={errors.email} />
                  </Field>
                  <Field label="Site web" error={errors.site_web} hint="Optionnel — doit commencer par https://">
                    <TInput value={form.site_web} onChange={(e: any) => set('site_web', e.target.value)}
                      placeholder="https://www.chu-cotonou.bj" icon={Globe} type="url" error={errors.site_web} />
                  </Field>
                </div>
              )}

              {/* ── Étape 4 : Administrateur ── */}
              {step === 4 && (
                <div className="space-y-5">
                  <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-100 rounded-xl">
                    <Info className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-rose-700">
                      Un compte administrateur sera créé automatiquement pour gérer cet hôpital.
                      Les identifiants de connexion seront envoyés par email.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Prénom" required error={errors.admin_first_name}>
                      <TInput value={form.admin_first_name} onChange={(e: any) => set('admin_first_name', e.target.value)}
                        placeholder="Jean" icon={User} error={errors.admin_first_name} />
                    </Field>
                    <Field label="Nom" required error={errors.admin_last_name}>
                      <TInput value={form.admin_last_name} onChange={(e: any) => set('admin_last_name', e.target.value)}
                        placeholder="Kpomagan" icon={User} error={errors.admin_last_name} />
                    </Field>
                  </div>
                  <Field label="Email de l'administrateur" required error={errors.admin_email}
                    hint="Cet email recevra les identifiants de connexion">
                    <TInput value={form.admin_email} onChange={(e: any) => set('admin_email', e.target.value)}
                      placeholder="admin@hopital.bj" icon={Mail} type="email" error={errors.admin_email} />
                  </Field>
                  <Field label="Téléphone" required error={errors.admin_telephone}>
                    <TInput value={form.admin_telephone} onChange={(e: any) => set('admin_telephone', e.target.value)}
                      placeholder="0197000000" icon={Phone} type="tel" error={errors.admin_telephone} />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Date de naissance" required error={errors.admin_date_naissance}>
                      <TInput value={form.admin_date_naissance} onChange={(e: any) => set('admin_date_naissance', e.target.value)}
                        type="date" icon={Calendar} error={errors.admin_date_naissance} />
                    </Field>
                    <Field label="Sexe" required>
                      <select value={form.admin_sexe} onChange={(e) => set('admin_sexe', e.target.value)}
                        className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all">
                        <option value="M">Masculin</option>
                        <option value="F">Féminin</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </Field>
                  </div>
                </div>
              )}

              {/* ── Étape 5 : Confirmation ── */}
              {step === 5 && (
                <div className="space-y-5">
                  {globalError && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-red-700">Erreur lors de la création</p>
                        <p className="text-sm text-red-600 mt-0.5">{globalError}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700">Vérifiez les informations. Vous pourrez les modifier après la création.</p>
                  </div>

                  {/* Identité */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center"><Building2 className="w-3.5 h-3.5 text-blue-600" /></div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Identité</p>
                      <button onClick={() => { setDirection(-1); setStep(1); }} className="ml-auto text-xs text-primary hover:text-primary-dark font-medium transition-colors">Modifier</button>
                    </div>
                    <div className="bg-slate-50 rounded-xl px-4 divide-y divide-slate-100">
                      <RecapRow icon={Building} label="Nom" value={form.nom} color="text-blue-600" />
                      {form.code_court && <RecapRow icon={Hash} label="Code court" value={form.code_court} color="text-slate-500" />}
                      {form.description && <RecapRow icon={FileText} label="Description" value={form.description} color="text-slate-400" />}
                    </div>
                  </div>

                  {/* Localisation */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-violet-50 rounded-lg flex items-center justify-center"><MapPin className="w-3.5 h-3.5 text-violet-600" /></div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Localisation</p>
                      <button onClick={() => { setDirection(-1); setStep(2); }} className="ml-auto text-xs text-primary hover:text-primary-dark font-medium transition-colors">Modifier</button>
                    </div>
                    <div className="bg-slate-50 rounded-xl px-4 divide-y divide-slate-100">
                      <RecapRow icon={MapPin} label="Adresse" value={form.adresse} color="text-violet-600" />
                      <RecapRow icon={Building2} label="Ville" value={form.ville} color="text-violet-500" />
                      {(form.latitude || form.longitude) && (
                        <RecapRow icon={Navigation} label="Coordonnées GPS" value={`${form.latitude}, ${form.longitude}`} color="text-violet-400" />
                      )}
                    </div>
                  </div>

                  {/* Contact */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-emerald-50 rounded-lg flex items-center justify-center"><Phone className="w-3.5 h-3.5 text-emerald-600" /></div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Contact</p>
                      <button onClick={() => { setDirection(-1); setStep(3); }} className="ml-auto text-xs text-primary hover:text-primary-dark font-medium transition-colors">Modifier</button>
                    </div>
                    <div className="bg-slate-50 rounded-xl px-4 divide-y divide-slate-100">
                      <RecapRow icon={Phone} label="Téléphone" value={form.telephone} color="text-emerald-600" />
                      <RecapRow icon={Mail} label="Email" value={form.email} color="text-emerald-500" />
                      {form.site_web && <RecapRow icon={Globe} label="Site web" value={form.site_web} color="text-emerald-400" />}
                    </div>
                  </div>

                  {/* Administrateur */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-rose-50 rounded-lg flex items-center justify-center"><Users className="w-3.5 h-3.5 text-rose-600" /></div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Administrateur</p>
                      <button onClick={() => { setDirection(-1); setStep(4); }} className="ml-auto text-xs text-primary hover:text-primary-dark font-medium transition-colors">Modifier</button>
                    </div>
                    <div className="bg-slate-50 rounded-xl px-4 divide-y divide-slate-100">
                      <RecapRow icon={User} label="Nom complet" value={`${form.admin_first_name} ${form.admin_last_name}`} color="text-rose-600" />
                      <RecapRow icon={Mail} label="Email admin" value={form.admin_email} color="text-rose-500" />
                      <RecapRow icon={Phone} label="Téléphone admin" value={form.admin_telephone} color="text-rose-400" />
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Navigation ── */}
        <div className="px-5 sm:px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <Button variant="outline" onClick={step === 1 ? () => navigate('/super-admin/hopitaux') : goPrev}
            leftIcon={<ArrowLeft className="w-4 h-4" />} disabled={saving}>
            {step === 1 ? 'Annuler' : 'Précédent'}
          </Button>
          {step < 5 ? (
            <Button onClick={goNext} rightIcon={<ArrowRight className="w-4 h-4" />}>Suivant</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={saving} className="min-w-[140px]">
              {saving ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Création…</span>
              ) : (
                <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" />Créer l'hôpital</span>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
