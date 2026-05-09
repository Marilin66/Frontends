// @ts-nocheck
import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { api, endpoints } from '@/services/api';
import { Button, Input } from '@/components/ui';
import {
  ArrowLeft, ArrowRight, Building, Phone, Mail, MapPin,
  Globe, FileText, CheckCircle, AlertCircle, Navigation,
  Hash, Info, Loader2, Building2, Keyboard, Map, LocateFixed,
  MousePointerClick
} from 'lucide-react';

// Fix icône Leaflet (webpack/vite cassent les assets par défaut)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Icône personnalisée rouge pour l'hôpital sélectionné
const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// ── Composant interne : écoute les clics sur la carte ────────────────────────
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface FormData {
  // Étape 1 — Identité
  nom: string;
  code_court: string;
  description: string;
  // Étape 2 — Localisation
  adresse: string;
  ville: string;
  latitude: string;
  longitude: string;
  // Étape 3 — Contact
  telephone: string;
  email: string;
  site_web: string;
  // Étape 4 — Récapitulatif (pas de champs)
}

interface FieldErrors {
  [key: string]: string;
}

const EMPTY: FormData = {
  nom: '', code_court: '', description: '',
  adresse: '', ville: '', latitude: '', longitude: '',
  telephone: '', email: '', site_web: '',
};

// ── Config des étapes ─────────────────────────────────────────────────────────
const STEPS = [
  {
    id: 1,
    title: 'Identité',
    subtitle: 'Nom et description de l\'établissement',
    icon: Building2,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    activeBg: 'bg-blue-600',
  },
  {
    id: 2,
    title: 'Localisation',
    subtitle: 'Adresse et coordonnées GPS',
    icon: MapPin,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    activeBg: 'bg-violet-600',
  },
  {
    id: 3,
    title: 'Contact',
    subtitle: 'Téléphone, email et site web',
    icon: Phone,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    activeBg: 'bg-emerald-600',
  },
  {
    id: 4,
    title: 'Confirmation',
    subtitle: 'Vérifiez avant de créer',
    icon: CheckCircle,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    activeBg: 'bg-amber-600',
  },
];

// ── Composant champ de formulaire ─────────────────────────────────────────────
function Field({
  label, required = false, error, children, hint,
}: {
  label: string; required?: boolean; error?: string; children: React.ReactNode; hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

function TextInput({
  value, onChange, placeholder, type = 'text', icon: Icon, error, disabled,
}: any) {
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="w-4 h-4 text-slate-400" />
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full h-11 px-3 bg-white border rounded-xl text-sm text-slate-900
          placeholder:text-slate-400 transition-all outline-none
          ${Icon ? 'pl-10' : ''}
          ${error
            ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
            : 'border-slate-200 hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}
        `}
      />
    </div>
  );
}

// ── Ligne de récap ────────────────────────────────────────────────────────────
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
  // Mode de saisie GPS : 'manual' | 'map'
  const [gpsMode, setGpsMode] = useState<'manual' | 'map'>('manual');
  // Position du marqueur sur la carte
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(null);
  // Géolocalisation en cours
  const [locating, setLocating] = useState(false);

  const set = useCallback((key: keyof FormData, val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: '' }));
  }, []);

  // Quand on clique sur la carte → met à jour lat/lng + marqueur
  const handleMapClick = useCallback((lat: number, lng: number) => {
    const latStr = lat.toFixed(6);
    const lngStr = lng.toFixed(6);
    setMarkerPos([lat, lng]);
    setForm((f) => ({ ...f, latitude: latStr, longitude: lngStr }));
    setErrors((e) => ({ ...e, latitude: '', longitude: '' }));
  }, []);

  // Géolocalisation du navigateur
  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        handleMapClick(lat, lng);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  };

  // Sync manuel → marqueur quand on tape les coords
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
      if (!form.adresse.trim()) e.adresse = 'L\'adresse est obligatoire';
      if (!form.ville.trim()) e.ville = 'La ville est obligatoire';
      if (form.latitude && isNaN(parseFloat(form.latitude))) e.latitude = 'Latitude invalide';
      if (form.longitude && isNaN(parseFloat(form.longitude))) e.longitude = 'Longitude invalide';
      if (form.latitude && (parseFloat(form.latitude) < -90 || parseFloat(form.latitude) > 90))
        e.latitude = 'Entre -90 et 90';
      if (form.longitude && (parseFloat(form.longitude) < -180 || parseFloat(form.longitude) > 180))
        e.longitude = 'Entre -180 et 180';
    }
    if (s === 3) {
      if (!form.telephone.trim()) e.telephone = 'Le téléphone est obligatoire';
      if (!form.email.trim()) e.email = 'L\'email est obligatoire';
      else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email invalide';
      if (form.site_web && !/^https?:\/\/.+/.test(form.site_web))
        e.site_web = 'Doit commencer par http:// ou https://';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (!validate(step)) return;
    setDirection(1);
    setStep((s) => s + 1);
  };

  const goPrev = () => {
    setDirection(-1);
    setStep((s) => s - 1);
  };

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
      if (data && typeof data === 'object') {
        // Erreurs de champs — on les affiche sur l'étape concernée
        const fieldMap: Record<string, number> = {
          nom: 1, code_court: 1, description: 1,
          adresse: 2, ville: 2, latitude: 2, longitude: 2,
          telephone: 3, email: 3, site_web: 3,
        };
        const newErrors: FieldErrors = {};
        let firstStep = 4;
        Object.entries(data).forEach(([key, val]) => {
          const msg = Array.isArray(val) ? val[0] : String(val);
          newErrors[key] = msg;
          if (fieldMap[key] && fieldMap[key] < firstStep) firstStep = fieldMap[key];
        });
        setErrors(newErrors);
        if (firstStep < 4) { setDirection(-1); setStep(firstStep); }
        else setGlobalError('Erreur lors de la création. Vérifiez les informations.');
      } else {
        setGlobalError('Erreur serveur. Veuillez réessayer.');
      }
    } finally {
      setSaving(false);
    }
  };

  const currentStep = STEPS[step - 1];
  const StepIcon = currentStep.icon;

  // ── Variants d'animation ──────────────────────────────────────────────────
  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/super-admin/hopitaux')}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors touch-manipulation flex-shrink-0"
        >
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
                {/* Cercle étape */}
                <button
                  onClick={() => isDone && (setDirection(-1), setStep(s.id))}
                  disabled={!isDone}
                  className={`
                    flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center
                    transition-all duration-300 font-bold text-sm
                    ${isDone ? `${s.activeBg} text-white cursor-pointer hover:opacity-90 shadow-sm` : ''}
                    ${isActive ? `${s.activeBg} text-white shadow-md scale-105` : ''}
                    ${!isActive && !isDone ? 'bg-slate-100 text-slate-400' : ''}
                  `}
                >
                  {isDone
                    ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    : <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  }
                </button>

                {/* Label — masqué sur très petit écran */}
                <div className="hidden sm:block min-w-0 flex-1">
                  <p className={`text-xs font-semibold truncate ${isActive ? 'text-slate-900' : isDone ? 'text-slate-600' : 'text-slate-400'}`}>
                    {s.title}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate hidden md:block">{s.subtitle}</p>
                </div>

                {/* Connecteur */}
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 sm:flex-none sm:w-6 rounded-full transition-all duration-500 ${step > s.id ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Progression */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-500">Étape {step} sur {STEPS.length}</span>
            <span className="text-xs font-semibold text-primary">{Math.round(((step - 1) / (STEPS.length - 1)) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={false}
              animate={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />
          </div>
        </div>
      </div>

      {/* ── Contenu de l'étape ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* En-tête de l'étape */}
        <div className={`px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center gap-3`}>
          <div className={`w-10 h-10 ${currentStep.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <StepIcon className={`w-5 h-5 ${currentStep.color}`} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{currentStep.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{currentStep.subtitle}</p>
          </div>
        </div>

        {/* Contenu animé */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="p-5 sm:p-6"
            >

              {/* ── Étape 1 : Identité ── */}
              {step === 1 && (
                <div className="space-y-5">
                  <Field label="Nom de l'hôpital" required error={errors.nom}>
                    <TextInput
                      value={form.nom}
                      onChange={(e: any) => set('nom', e.target.value)}
                      placeholder="Ex: Centre Hospitalier Universitaire de Cotonou"
                      icon={Building}
                      error={errors.nom}
                    />
                  </Field>

                  <Field
                    label="Code court"
                    error={errors.code_court}
                    hint="Code unique de 4-6 lettres utilisé dans les codes d'accès aux résultats (ex: CHUC, CNHU). Généré automatiquement si vide."
                  >
                    <TextInput
                      value={form.code_court}
                      onChange={(e: any) => set('code_court', e.target.value.toUpperCase())}
                      placeholder="Ex: CHUC"
                      icon={Hash}
                      error={errors.code_court}
                    />
                  </Field>

                  <Field label="Description" error={errors.description} hint="Optionnel — présentation de l'établissement">
                    <textarea
                      value={form.description}
                      onChange={(e) => set('description', e.target.value)}
                      placeholder="Décrivez l'établissement, ses spécialités, son histoire…"
                      rows={4}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                    />
                  </Field>
                </div>
              )}

              {/* ── Étape 2 : Localisation ── */}
              {step === 2 && (
                <div className="space-y-5">
                  <Field label="Adresse complète" required error={errors.adresse}>
                    <TextInput
                      value={form.adresse}
                      onChange={(e: any) => set('adresse', e.target.value)}
                      placeholder="Ex: Quartier Akpakpa, Rue des Hôpitaux"
                      icon={MapPin}
                      error={errors.adresse}
                    />
                  </Field>

                  <Field label="Ville" required error={errors.ville}>
                    <TextInput
                      value={form.ville}
                      onChange={(e: any) => set('ville', e.target.value)}
                      placeholder="Ex: Cotonou, Porto-Novo, Parakou…"
                      icon={Building2}
                      error={errors.ville}
                    />
                  </Field>

                  {/* GPS */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-violet-500" />
                      <p className="text-sm font-medium text-slate-700">Coordonnées GPS <span className="text-slate-400 font-normal">(optionnel)</span></p>
                    </div>
                    <p className="text-xs text-slate-500 -mt-2">
                      Permettent aux patients de trouver l'hôpital sur la carte et d'utiliser la recherche de proximité.
                    </p>

                    {/* Toggle mode */}
                    <div className="flex gap-2 p-1 bg-white rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setGpsMode('manual')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                          gpsMode === 'manual'
                            ? 'bg-violet-600 text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Keyboard className="w-3.5 h-3.5" />
                        Saisie manuelle
                      </button>
                      <button
                        type="button"
                        onClick={() => setGpsMode('map')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                          gpsMode === 'map'
                            ? 'bg-violet-600 text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Map className="w-3.5 h-3.5" />
                        Choisir sur la carte
                      </button>
                    </div>

                    {/* Mode saisie manuelle */}
                    {gpsMode === 'manual' && (
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Latitude" error={errors.latitude} hint="Ex: 6.3654">
                          <TextInput
                            value={form.latitude}
                            onChange={(e: any) => set('latitude', e.target.value)}
                            placeholder="6.3654"
                            type="number"
                            error={errors.latitude}
                          />
                        </Field>
                        <Field label="Longitude" error={errors.longitude} hint="Ex: 2.4183">
                          <TextInput
                            value={form.longitude}
                            onChange={(e: any) => set('longitude', e.target.value)}
                            placeholder="2.4183"
                            type="number"
                            error={errors.longitude}
                          />
                        </Field>
                      </div>
                    )}

                    {/* Mode carte */}
                    {gpsMode === 'map' && (
                      <div className="space-y-3">
                        {/* Instructions + bouton géoloc */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <MousePointerClick className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
                            <span>Cliquez sur la carte pour placer l'hôpital</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleLocateMe}
                            disabled={locating}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 text-violet-700 text-xs font-semibold hover:bg-violet-100 transition disabled:opacity-50 flex-shrink-0"
                          >
                            {locating
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <LocateFixed className="w-3.5 h-3.5" />
                            }
                            {locating ? 'Localisation…' : 'Ma position'}
                          </button>
                        </div>

                        {/* Carte Leaflet */}
                        <div
                          className="rounded-xl overflow-hidden border border-slate-200 shadow-sm"
                          style={{ height: '280px', minHeight: '280px', position: 'relative' }}
                        >
                          <MapContainer
                            center={markerPos ?? [6.3654, 2.4183]}
                            zoom={markerPos ? 14 : 7}
                            style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}
                            key={`map-${gpsMode}`}
                            scrollWheelZoom={true}
                          >
                            <TileLayer
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <MapClickHandler onMapClick={handleMapClick} />
                            {markerPos && (
                              <Marker position={markerPos} icon={hospitalIcon} />
                            )}
                          </MapContainer>
                        </div>

                        {/* Coordonnées sélectionnées */}
                        {markerPos ? (
                          <div className="flex items-center gap-2 p-3 bg-violet-50 border border-violet-100 rounded-xl">
                            <Navigation className="w-4 h-4 text-violet-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-violet-800">Position sélectionnée</p>
                              <p className="text-xs text-violet-600 font-mono mt-0.5">
                                {parseFloat(form.latitude).toFixed(6)}, {parseFloat(form.longitude).toFixed(6)}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setMarkerPos(null);
                                setForm((f) => ({ ...f, latitude: '', longitude: '' }));
                              }}
                              className="text-xs text-violet-500 hover:text-violet-700 font-medium transition"
                            >
                              Effacer
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                            <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <p className="text-xs text-slate-400">Aucune position sélectionnée — cliquez sur la carte</p>
                          </div>
                        )}

                        {/* Erreurs GPS */}
                        {(errors.latitude || errors.longitude) && (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.latitude || errors.longitude}
                          </p>
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
                    <TextInput
                      value={form.telephone}
                      onChange={(e: any) => set('telephone', e.target.value)}
                      placeholder="Ex: +229 21 30 01 00"
                      icon={Phone}
                      type="tel"
                      error={errors.telephone}
                    />
                  </Field>

                  <Field label="Email de contact" required error={errors.email} hint="Adresse email officielle de l'établissement">
                    <TextInput
                      value={form.email}
                      onChange={(e: any) => set('email', e.target.value)}
                      placeholder="Ex: contact@chu-cotonou.bj"
                      icon={Mail}
                      type="email"
                      error={errors.email}
                    />
                  </Field>

                  <Field label="Site web" error={errors.site_web} hint="Optionnel — doit commencer par https://">
                    <TextInput
                      value={form.site_web}
                      onChange={(e: any) => set('site_web', e.target.value)}
                      placeholder="https://www.chu-cotonou.bj"
                      icon={Globe}
                      type="url"
                      error={errors.site_web}
                    />
                  </Field>
                </div>
              )}

              {/* ── Étape 4 : Récapitulatif ── */}
              {step === 4 && (
                <div className="space-y-5">
                  {globalError && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{globalError}</span>
                    </div>
                  )}

                  <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700">
                      Vérifiez les informations ci-dessous. Vous pourrez les modifier après la création depuis la page de gestion de l'hôpital.
                    </p>
                  </div>

                  {/* Section Identité */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Identité</p>
                      <button
                        onClick={() => { setDirection(-1); setStep(1); }}
                        className="ml-auto text-xs text-primary hover:text-primary-dark font-medium transition-colors"
                      >
                        Modifier
                      </button>
                    </div>
                    <div className="bg-slate-50 rounded-xl px-4 divide-y divide-slate-100">
                      <RecapRow icon={Building} label="Nom" value={form.nom} color="text-blue-600" />
                      {form.code_court && <RecapRow icon={Hash} label="Code court" value={form.code_court} color="text-slate-500" />}
                      {form.description && <RecapRow icon={FileText} label="Description" value={form.description} color="text-slate-400" />}
                    </div>
                  </div>

                  {/* Section Localisation */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-violet-50 rounded-lg flex items-center justify-center">
                        <MapPin className="w-3.5 h-3.5 text-violet-600" />
                      </div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Localisation</p>
                      <button
                        onClick={() => { setDirection(-1); setStep(2); }}
                        className="ml-auto text-xs text-primary hover:text-primary-dark font-medium transition-colors"
                      >
                        Modifier
                      </button>
                    </div>
                    <div className="bg-slate-50 rounded-xl px-4 divide-y divide-slate-100">
                      <RecapRow icon={MapPin} label="Adresse" value={form.adresse} color="text-violet-600" />
                      <RecapRow icon={Building2} label="Ville" value={form.ville} color="text-violet-500" />
                      {(form.latitude || form.longitude) && (
                        <RecapRow
                          icon={Navigation}
                          label="Coordonnées GPS"
                          value={`${form.latitude || '—'}, ${form.longitude || '—'}`}
                          color="text-violet-400"
                        />
                      )}
                    </div>
                  </div>

                  {/* Section Contact */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-emerald-50 rounded-lg flex items-center justify-center">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Contact</p>
                      <button
                        onClick={() => { setDirection(-1); setStep(3); }}
                        className="ml-auto text-xs text-primary hover:text-primary-dark font-medium transition-colors"
                      >
                        Modifier
                      </button>
                    </div>
                    <div className="bg-slate-50 rounded-xl px-4 divide-y divide-slate-100">
                      <RecapRow icon={Phone} label="Téléphone" value={form.telephone} color="text-emerald-600" />
                      <RecapRow icon={Mail} label="Email" value={form.email} color="text-emerald-500" />
                      {form.site_web && <RecapRow icon={Globe} label="Site web" value={form.site_web} color="text-emerald-400" />}
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Navigation ── */}
        <div className="px-5 sm:px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={step === 1 ? () => navigate('/super-admin/hopitaux') : goPrev}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            disabled={saving}
          >
            {step === 1 ? 'Annuler' : 'Précédent'}
          </Button>

          {step < 4 ? (
            <Button
              onClick={goNext}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Suivant
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="min-w-[140px]"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Création…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Créer l'hôpital
                </span>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
