// @ts-nocheck
import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api, endpoints } from '@/services/api';
import { Card, Avatar, Button, Input } from '@/components/ui';
import {
  User, Lock, Bell, Globe, Shield, FileText, Phone, Info,
  ChevronRight, LogOut, Edit2, Save, X, Camera,
  Building, Mail, MapPin, Calendar, CheckCircle, AlertCircle,
  Stethoscope, FlaskConical
} from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  patient: 'Patient', medecin: 'Médecin', admin_hopital: 'Admin Hôpital',
  admin_general: 'Admin Général', super_admin: 'Super Admin', laborantin: 'Laborantin',
};

const ROLE_COLORS: Record<string, string> = {
  patient: 'text-blue-700 bg-blue-50 border-blue-200',
  medecin: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  admin_hopital: 'text-orange-700 bg-orange-50 border-orange-200',
  admin_general: 'text-orange-700 bg-orange-50 border-orange-200',
  super_admin: 'text-violet-700 bg-violet-50 border-violet-200',
  laborantin: 'text-cyan-700 bg-cyan-50 border-cyan-200',
};

function SettingItem({ icon: Icon, label, description, href, onClick, danger = false, value }: any) {
  const navigate = useNavigate();
  const handleClick = () => { if (onClick) onClick(); else if (href) navigate(href); };
  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 touch-manipulation text-left"
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${danger ? 'bg-red-50' : 'bg-slate-100'}`}>
        <Icon className={`w-4 h-4 ${danger ? 'text-red-500' : 'text-slate-500'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${danger ? 'text-red-600' : 'text-slate-900'}`}>{label}</p>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
      {value && <span className="text-xs text-slate-400 mr-1">{value}</span>}
      {!danger && <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />}
    </button>
  );
}

export default function SettingsPage() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    telephone: user?.telephone || '',
    adresse: user?.adresse || '',
    date_naissance: user?.date_naissance || '',
    sexe: user?.sexe || 'M',
    // Champs spécifiques médecin
    biographie: user?.medecin_profile?.biographie || '',
    // Champs spécifiques laborantin
    laboratoire: user?.laborantin_profile?.laboratoire || '',
  });

  const role = user?.role || 'patient';
  const roleColor = ROLE_COLORS[role] || ROLE_COLORS.patient;

  const handleSave = async () => {
    setSaveError('');
    try {
      setSaving(true);
      const payload: any = {
        first_name: form.first_name,
        last_name: form.last_name,
        telephone: form.telephone,
        adresse: form.adresse,
        date_naissance: form.date_naissance || null,
        sexe: form.sexe,
      };
      // Profils imbriqués
      if (role === 'medecin') {
        payload.medecin_profile = { biographie: form.biographie };
      }
      if (role === 'laborantin') {
        payload.laborantin_profile = { laboratoire: form.laboratoire };
      }
      await api.patch(endpoints.me, payload);
      await refreshUser();
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e: any) {
      const data = e?.response?.data;
      setSaveError(data?.telephone?.[0] || data?.detail || 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      await api.patch(endpoints.me, fd);
      await refreshUser();
    } catch (err) { console.error(err); }
    finally { setUploadingPhoto(false); }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setSaveError('');
    setForm({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      telephone: user?.telephone || '',
      adresse: user?.adresse || '',
      date_naissance: user?.date_naissance || '',
      sexe: user?.sexe || 'M',
      biographie: user?.medecin_profile?.biographie || '',
      laboratoire: user?.laborantin_profile?.laboratoire || '',
    });
  };

  const getChangePasswordPath = () => {
    if (role === 'medecin') return '/medecin/profile/change-password';
    if (role === 'admin_hopital') return '/admin-hopital/settings/change-password';
    if (role === 'laborantin') return '/laborantin/profile/change-password';
    return '/super-admin/settings/change-password';
  };

  return (
    <div className="space-y-5 max-w-2xl animate-fade-in pb-6">

      {/* ── En-tête ── */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Paramètres</h1>
        <p className="text-slate-500 text-sm mt-1">Gérez votre profil et vos préférences</p>
      </div>

      {/* ── Carte profil ── */}
      <Card className="p-5">
        <div className="flex items-start gap-4">
          {/* Avatar + photo */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center overflow-hidden">
              {user?.photo ? (
                <img src={user.photo} alt="Photo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-xl">
                  {(user?.first_name?.[0] || '') + (user?.last_name?.[0] || '')}
                </span>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm hover:bg-slate-50 transition touch-manipulation"
            >
              {uploadingPhoto
                ? <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                : <Camera className="w-3 h-3 text-slate-500" />
              }
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-slate-900">{user?.first_name} {user?.last_name}</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${roleColor}`}>
                {ROLE_LABELS[role]}
              </span>
            </div>
            <p className="text-sm text-slate-500 truncate mt-0.5">{user?.email}</p>
            {user?.hopital_nom && (
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <Building className="w-3 h-3" /> {user.hopital_nom}
              </p>
            )}
          </div>

          <Button
            size="sm"
            variant={isEditing ? 'outline' : 'secondary'}
            onClick={isEditing ? cancelEdit : () => setIsEditing(true)}
            leftIcon={isEditing ? <X className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
            className="flex-shrink-0"
          >
            {isEditing ? 'Annuler' : 'Modifier'}
          </Button>
        </div>

        {/* Feedback */}
        {saveSuccess && (
          <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 mt-4">
            <CheckCircle className="w-4 h-4 flex-shrink-0" /> Profil mis à jour avec succès
          </div>
        )}
        {saveError && (
          <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 mt-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {saveError}
          </div>
        )}

        {/* Formulaire d'édition */}
        {isEditing && (
          <div className="mt-5 pt-5 border-t border-slate-100 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Prénom" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} leftIcon={<User className="w-4 h-4" />} />
              <Input label="Nom" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} leftIcon={<User className="w-4 h-4" />} />
            </div>
            <Input label="Téléphone" type="tel" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} leftIcon={<Phone className="w-4 h-4" />} helperText="Format Bénin : 10 chiffres commençant par 01" />
            <Input label="Adresse" value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} leftIcon={<MapPin className="w-4 h-4" />} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Date de naissance" type="date" value={form.date_naissance} onChange={(e) => setForm({ ...form, date_naissance: e.target.value })} />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Sexe</label>
                <select value={form.sexe} onChange={(e) => setForm({ ...form, sexe: e.target.value })}
                  className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all">
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>

            {/* Champs spécifiques médecin */}
            {role === 'medecin' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Biographie</label>
                <textarea
                  rows={3}
                  value={form.biographie}
                  onChange={(e) => setForm({ ...form, biographie: e.target.value })}
                  placeholder="Décrivez votre parcours et spécialités…"
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                />
              </div>
            )}

            {/* Champs spécifiques laborantin */}
            {role === 'laborantin' && (
              <Input
                label="Nom du laboratoire"
                value={form.laboratoire}
                onChange={(e) => setForm({ ...form, laboratoire: e.target.value })}
                leftIcon={<FlaskConical className="w-4 h-4" />}
              />
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={cancelEdit} type="button">Annuler</Button>
              <Button className="flex-1" isLoading={saving} onClick={handleSave} leftIcon={<Save className="w-4 h-4" />}>
                Enregistrer
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ── Informations du compte ── */}
      {!isEditing && (
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">Informations</p>
          <Card className="overflow-hidden p-0">
            {[
              { icon: Mail,     label: 'Email',           value: user?.email,         color: 'text-slate-400' },
              { icon: Phone,    label: 'Téléphone',       value: user?.telephone,     color: 'text-blue-500' },
              { icon: MapPin,   label: 'Adresse',         value: user?.adresse || '—', color: 'text-rose-500' },
              { icon: Calendar, label: 'Membre depuis',   value: user?.date_joined ? new Date(user.date_joined).toLocaleDateString('fr-FR') : null, color: 'text-violet-500' },
            ].filter(i => i.value).map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 last:border-0">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="text-sm font-medium text-slate-900 truncate">{item.value}</p>
                </div>
              </div>
            ))}
            {/* Profil médecin */}
            {role === 'medecin' && user?.medecin_profile && (
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 last:border-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <Stethoscope className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">N° d'ordre</p>
                  <p className="text-sm font-medium text-slate-900">{user.medecin_profile.numero_ordre}</p>
                </div>
              </div>
            )}
            {/* Profil laborantin */}
            {role === 'laborantin' && user?.laborantin_profile?.laboratoire && (
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center flex-shrink-0">
                  <FlaskConical className="w-4 h-4 text-cyan-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Laboratoire</p>
                  <p className="text-sm font-medium text-slate-900">{user.laborantin_profile.laboratoire}</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── Sécurité ── */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">Sécurité</p>
        <Card className="overflow-hidden p-0">
          <SettingItem icon={Lock} label="Changer le mot de passe" description="Modifier votre mot de passe" href={getChangePasswordPath()} />
          <SettingItem icon={Shield} label="Email vérifié" description={user?.is_email_verified ? 'Votre email est vérifié' : 'Email non vérifié'} value={user?.is_email_verified ? '✓' : '!'} />
        </Card>
      </div>

      {/* ── Préférences ── */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">Préférences</p>
        <Card className="overflow-hidden p-0">
          <SettingItem icon={Bell} label="Notifications" description="Gérer mes alertes" href="/notifications" />
          <SettingItem icon={Globe} label="Langue" description="Français" value="FR" />
        </Card>
      </div>

      {/* ── Informations ── */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">Informations</p>
        <Card className="overflow-hidden p-0">
          <SettingItem icon={FileText} label="Conditions d'utilisation" href="/terms" />
          <SettingItem icon={Phone} label="Numéros d'urgence" href="/emergency" />
          <SettingItem icon={Info} label="À propos" description="Hopitel v1.0.0" />
        </Card>
      </div>

      {/* ── Déconnexion ── */}
      <Card className="overflow-hidden p-0">
        <SettingItem icon={LogOut} label="Déconnexion" onClick={logout} danger />
      </Card>

      <p className="text-center text-xs text-slate-400">Hopitel v1.0.0 — République du Bénin</p>
    </div>
  );
}
