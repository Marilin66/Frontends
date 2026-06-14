// @ts-nocheck
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api, endpoints } from '@/services/api';
import { Card, Button, Input, PageLoader } from '@/components/ui';
import {
  User, Stethoscope, AlertCircle, ChevronRight, ChevronLeft,
  Save, Phone, ShieldAlert, CheckCircle, ArrowLeft, Droplets
} from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function EditProfilePage() {
  const { user, isLoading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    // Étape 1 — Infos personnelles
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    telephone: user?.telephone || '',
    adresse: user?.adresse || '',
    date_naissance: user?.date_naissance || '',
    sexe: user?.sexe || 'M',
    // Étape 2 — Dossier médical (patient_profile)
    groupe_sanguin: user?.patient_profile?.groupe_sanguin || '',
    allergies: user?.patient_profile?.allergies || '',
    npi: user?.patient_profile?.npi || '',
    numero_secu: user?.patient_profile?.numero_secu || '',
    // Étape 3 — Contact d'urgence
    contact_urgence_nom: user?.patient_profile?.contact_urgence_nom || '',
    contact_urgence_tel: user?.patient_profile?.contact_urgence_tel || '',
  });

  if (isLoading) return <PageLoader />;

  const steps = [
    { id: 1, name: 'Infos personnelles', icon: User },
    { id: 2, name: 'Dossier médical', icon: Stethoscope },
    { id: 3, name: 'Contact d\'urgence', icon: ShieldAlert },
  ];

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      await api.patch(endpoints.me, {
        first_name: form.first_name,
        last_name: form.last_name,
        telephone: form.telephone,
        adresse: form.adresse,
        date_naissance: form.date_naissance || null,
        sexe: form.sexe,
        patient_profile: {
          groupe_sanguin: form.groupe_sanguin,
          allergies: form.allergies,
          npi: form.npi || null,
          numero_secu: form.numero_secu,
          contact_urgence_nom: form.contact_urgence_nom,
          contact_urgence_tel: form.contact_urgence_tel,
        },
      });
      await refreshUser();
      setSuccess(true);
      setTimeout(() => navigate('/patient/profile'), 2000);
    } catch (e: any) {
      const data = e?.response?.data;
      setError(data?.telephone?.[0] || data?.detail || data?.error || 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-sm mx-auto flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Profil mis à jour</h2>
        <p className="text-sm text-slate-500 text-center">Vos informations ont été enregistrées avec succès.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-5 animate-fade-in pb-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors touch-manipulation"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Compléter mon profil</h1>
          <p className="text-xs text-slate-500 mt-0.5">Ces informations aident les médecins à mieux vous soigner</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 flex-1">
            <button
              onClick={() => step > s.id && setStep(s.id)}
              className={`flex items-center gap-2 flex-1 p-2.5 rounded-xl transition-all ${
                step === s.id
                  ? 'bg-primary text-white shadow-sm'
                  : step > s.id
                  ? 'bg-emerald-50 text-emerald-700 cursor-pointer hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {step > s.id
                ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
                : <s.icon className="w-4 h-4 flex-shrink-0" />
              }
              <span className="text-xs font-semibold truncate hidden sm:block">{s.name}</span>
              <span className="text-xs font-bold sm:hidden">{s.id}</span>
            </button>
            {i < steps.length - 1 && (
              <div className={`w-4 h-0.5 flex-shrink-0 ${step > s.id ? 'bg-emerald-300' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Contenu */}
      <Card className="p-5">
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Étape 1 — Infos personnelles */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Informations personnelles</h2>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Prénom"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                leftIcon={<User className="w-4 h-4" />}
              />
              <Input
                label="Nom"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                leftIcon={<User className="w-4 h-4" />}
              />
            </div>
            <Input
              label="Téléphone"
              type="tel"
              value={form.telephone}
              onChange={(e) => setForm({ ...form, telephone: e.target.value })}
              leftIcon={<Phone className="w-4 h-4" />}
              helperText="Format Bénin : 10 chiffres commençant par 01"
            />
            <Input
              label="Adresse"
              value={form.adresse}
              onChange={(e) => setForm({ ...form, adresse: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Date de naissance"
                type="date"
                value={form.date_naissance}
                onChange={(e) => setForm({ ...form, date_naissance: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Sexe</label>
                <select
                  value={form.sexe}
                  onChange={(e) => setForm({ ...form, sexe: e.target.value })}
                  className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                >
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Étape 2 — Dossier médical */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Dossier médical</h2>

            {/* Groupe sanguin */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Droplets className="w-4 h-4 inline mr-1 text-red-500" />
                Groupe sanguin
              </label>
              <div className="flex flex-wrap gap-2">
                {BLOOD_GROUPS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setForm({ ...form, groupe_sanguin: g })}
                    className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all border ${
                      form.groupe_sanguin === g
                        ? 'bg-red-500 text-white border-red-500 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-red-300 hover:text-red-600'
                    }`}
                  >
                    {g}
                  </button>
                ))}
                {form.groupe_sanguin && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, groupe_sanguin: '' })}
                    className="px-3 py-1.5 rounded-xl text-xs text-slate-400 border border-slate-200 hover:bg-slate-50"
                  >
                    Effacer
                  </button>
                )}
              </div>
            </div>

            {/* Allergies */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Allergies connues</label>
              <textarea
                rows={3}
                value={form.allergies}
                onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                placeholder="Ex: Pénicilline, arachides, latex…"
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all resize-none placeholder:text-slate-400"
              />
            </div>

            {/* Numéro de sécurité sociale */}
            <Input
              label="Numéro de sécurité sociale (optionnel)"
              value={form.numero_secu}
              onChange={(e) => setForm({ ...form, numero_secu: e.target.value })}
              placeholder="Ex: 1 85 07 75 123 456 78"
            />

            {/* NPI — obligatoire pour les RDV */}
            <Input
              label="NPI — Numéro Personnel d'Identification *"
              value={form.npi}
              onChange={(e) => setForm({ ...form, npi: e.target.value })}
              placeholder="Ex: BJ12345678"
              helperText="Requis pour réserver un rendez-vous médical"
            />
          </div>
        )}

        {/* Étape 3 — Contact d'urgence */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-base font-semibold text-slate-900 mb-2">Contact d'urgence</h2>

            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                Ces informations sont vitales en cas d'urgence médicale. Assurez-vous que le contact est joignable.
              </p>
            </div>

            <Input
              label="Nom du contact d'urgence"
              value={form.contact_urgence_nom}
              onChange={(e) => setForm({ ...form, contact_urgence_nom: e.target.value })}
              leftIcon={<User className="w-4 h-4" />}
              placeholder="Ex: Marie Dupont"
            />
            <Input
              label="Téléphone du contact d'urgence"
              type="tel"
              value={form.contact_urgence_tel}
              onChange={(e) => setForm({ ...form, contact_urgence_tel: e.target.value })}
              leftIcon={<Phone className="w-4 h-4" />}
              placeholder="Ex: 0197000000"
              helperText="Format Bénin : 10 chiffres commençant par 01"
            />
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-100">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(s - 1, 1))}
            disabled={step === 1}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            Retour
          </Button>

          {step < 3 ? (
            <Button
              onClick={() => setStep((s) => Math.min(s + 1, 3))}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Suivant
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              isLoading={saving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Enregistrer le profil
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
