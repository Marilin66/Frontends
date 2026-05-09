// @ts-nocheck
import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api, endpoints } from '@/services/api';
import { Card, Avatar, Button, Input } from '@/components/ui';
import {
  Phone, Mail, MapPin, Calendar, User, Droplets, AlertTriangle,
  PhoneCall, Lock, Bell, LogOut, Edit2, Save, X, ChevronRight,
  Building, Camera, CheckCircle, AlertCircle, Stethoscope,
  FlaskConical, Shield, FileText, Info
} from 'lucide-react';

const ROLE_COLORS: Record<string, { badge: string; bar: string; avatar: string }> = {
  patient:       { badge: 'text-blue-700 bg-blue-50 border-blue-200',    bar: 'bg-blue-600',    avatar: 'bg-blue-600' },
  medecin:       { badge: 'text-emerald-700 bg-emerald-50 border-emerald-200', bar: 'bg-emerald-600', avatar: 'bg-emerald-700' },
  admin_hopital: { badge: 'text-orange-700 bg-orange-50 border-orange-200', bar: 'bg-orange-600', avatar: 'bg-orange-600' },
  admin_general: { badge: 'text-orange-700 bg-orange-50 border-orange-200', bar: 'bg-orange-600', avatar: 'bg-orange-600' },
  super_admin:   { badge: 'text-violet-700 bg-violet-50 border-violet-200', bar: 'bg-violet-700', avatar: 'bg-violet-700' },
  laborantin:    { badge: 'text-cyan-700 bg-cyan-50 border-cyan-200',    bar: 'bg-cyan-700',    avatar: 'bg-cyan-700' },
};

const ROLE_LABELS: Record<string, string> = {
  patient: 'Patient', medecin: 'Médecin', admin_hopital: 'Admin Hôpital',
  admin_general: 'Admin Général', super_admin: 'Super Admin', laborantin: 'Laborantin',
};

function InfoRow({ icon: Icon, label, value, color = 'text-slate-400' }: any) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
      <div className={`w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-900 mt-0.5 break-words">{value}</p>
      </div>
    </div>
  );
}

function SettingLink({ icon: Icon, label, description, href, onClick, danger = false, badge }: any) {
  const navigate = useNavigate();
  const handleClick = () => { if (onClick) onClick(); else if (href) navigate(href); };
  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 touch-manipulation`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${danger ? 'bg-red-50' : 'bg-slate-100'}`}>
        <Icon className={`w-4 h-4 ${danger ? 'text-red-500' : 'text-slate-500'}`} />
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className={`text-sm font-medium ${danger ? 'text-red-600' : 'text-slate-900'}`}>{label}</p>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
      {badge && (
        <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full font-semibold">{badge}</span>
      )}
      {!danger && <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />}
    </button>
  );
}

export default function ProfilePage() {
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
  });

  const role = user?.role || 'patient';
  const colors = ROLE_COLORS[role] || ROLE_COLORS.patient;

  const handleSave = async () => {
    setSaveError('');
    try {
      setSaving(true);
      await api.patch(endpoints.me, form);
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
    });
  };

  const getChangePasswordPath = () => {
    if (role === 'patient') return '/patient/profile/security/change-password';
    if (role === 'medecin') return '/medecin/profile/change-password';
    if (role === 'laborantin') return '/laborantin/profile/change-password';
    if (role === 'admin_hopital') return '/admin-hopital/settings/change-password';
    return '/super-admin/settings/change-password';
  };

  const getSettingsLinks = () => {
    const common = [
      { icon: Lock, label: 'Changer le mot de passe', description: 'Sécurité du compte', href: getChangePasswordPath() },
      { icon: Bell, label: 'Notifications', description: 'Gérer mes alertes', href: '/notifications' },
      { icon: FileText, label: "Conditions d'utilisation", href: '/terms' },
    ];
    if (role === 'patient') {
      return [
        { icon: Shield, label: 'Sécurité', description: 'Paramètres de sécurité', href: '/patient/profile/security' },
        ...common,
      ];
    }
    return common;
  };

  return (
    <div className="space-y-4 max-w-lg animate-fade-in pb-6">

      {/* ── Carte profil ── */}
      <Card className="overflow-hidden p-0">
        {/* Barre colorée */}
        <div className={`h-24 ${colors.bar}`} />

        <div className="px-5 pb-5">
          <div className="flex items-end justify-between -mt-12 mb-4">
            {/* Avatar + bouton photo */}
            <div className="relative">
              <div className={`w-20 h-20 rounded-2xl ${colors.avatar} flex items-center justify-center border-4 border-white shadow-lg overflow-hidden`}>
                {user?.photo ? (
                  <img src={user.photo} alt="Photo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-2xl">
                    {(user?.first_name?.[0] || '') + (user?.last_name?.[0] || '')}
                  </span>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm hover:bg-slate-50 transition touch-manipulation"
                title="Changer la photo"
              >
                {uploadingPhoto
                  ? <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  : <Camera className="w-3.5 h-3.5 text-slate-500" />
                }
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </div>

            {/* Bouton modifier */}
            {!isEditing ? (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsEditing(true)}
                leftIcon={<Edit2 className="w-3.5 h-3.5" />}
              >
                Modifier
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={cancelEdit} leftIcon={<X className="w-3.5 h-3.5" />}>
                  Annuler
                </Button>
                <Button size="sm" isLoading={saving} onClick={handleSave} leftIcon={<Save className="w-3.5 h-3.5" />}>
                  Sauvegarder
                </Button>
              </div>
            )}
          </div>

          {/* Feedback */}
          {saveSuccess && (
            <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 mb-3">
              <CheckCircle className="w-4 h-4 flex-shrink-0" /> Profil mis à jour avec succès
            </div>
          )}
          {saveError && (
            <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 mb-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {saveError}
            </div>
          )}

          {/* Nom + rôle */}
          {!isEditing ? (
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="text-xl font-bold text-slate-900">{user?.first_name} {user?.last_name}</h2>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${colors.badge}`}>
                  {ROLE_LABELS[role]}
                </span>
              </div>
              <p className="text-sm text-slate-500">{user?.email}</p>
              {user?.hopital_nom && (
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <Building className="w-3 h-3" /> {user.hopital_nom}
                </p>
              )}
            </div>
          ) : (
            /* Formulaire d'édition */
            <div className="space-y-3">
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
                leftIcon={<MapPin className="w-4 h-4" />}
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
        </div>
      </Card>

      {/* ── Informations générales ── */}
      {!isEditing && (
        <Card className="p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-900">Informations</p>
          </div>
          <div className="px-4">
            <InfoRow icon={Phone}    label="Téléphone"       value={user?.telephone}     color="text-blue-500" />
            <InfoRow icon={Mail}     label="Email"           value={user?.email}         color="text-slate-400" />
            <InfoRow icon={MapPin}   label="Adresse"         value={user?.adresse}       color="text-rose-500" />
            <InfoRow icon={Calendar} label="Date de naissance"
              value={user?.date_naissance ? new Date(user.date_naissance).toLocaleDateString('fr-FR') : null}
              color="text-violet-500"
            />
            {user?.hopital_nom && (
              <InfoRow icon={Building} label="Hôpital" value={user.hopital_nom} color="text-orange-500" />
            )}
            {/* Statut email */}
            <div className="flex items-start gap-3 py-3">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                <Shield className={`w-4 h-4 ${user?.is_email_verified ? 'text-emerald-500' : 'text-amber-500'}`} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Email vérifié</p>
                <p className={`text-sm font-medium mt-0.5 ${user?.is_email_verified ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {user?.is_email_verified ? 'Vérifié ✓' : 'Non vérifié'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ── Profil médecin ── */}
      {!isEditing && role === 'medecin' && user?.medecin_profile && (
        <Card className="p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-900">Profil médecin</p>
          </div>
          <div className="px-4">
            <InfoRow icon={Stethoscope} label="N° d'ordre professionnel" value={user.medecin_profile.numero_ordre} color="text-emerald-600" />
            {user.medecin_profile.biographie && (
              <InfoRow icon={Info} label="Biographie" value={user.medecin_profile.biographie} color="text-slate-400" />
            )}
            <InfoRow icon={CheckCircle} label="Statut"
              value={user.medecin_profile.statut === 'actif' ? 'Actif' : 'Inactif'}
              color={user.medecin_profile.statut === 'actif' ? 'text-emerald-500' : 'text-slate-400'}
            />
          </div>
        </Card>
      )}

      {/* ── Profil laborantin ── */}
      {!isEditing && role === 'laborantin' && user?.laborantin_profile && (
        <Card className="p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-900">Profil laborantin</p>
          </div>
          <div className="px-4">
            <InfoRow icon={FlaskConical} label="Laboratoire"
              value={user.laborantin_profile.laboratoire || 'Non renseigné'}
              color="text-cyan-600"
            />
          </div>
        </Card>
      )}

      {/* ── Informations médicales (patient) ── */}
      {!isEditing && role === 'patient' && (
        <Card className="p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">Dossier médical</p>
            <Link
              to="/patient/profile/edit"
              className="text-xs text-primary font-medium hover:text-primary-dark transition-colors"
            >
              Compléter
            </Link>
          </div>
          <div className="px-4">
            <InfoRow icon={Droplets}     label="Groupe sanguin"    value={user?.patient_profile?.groupe_sanguin || '—'}    color="text-red-500" />
            <InfoRow icon={AlertTriangle} label="Allergies"         value={user?.patient_profile?.allergies || 'Aucune'}    color="text-amber-500" />
            <InfoRow icon={PhoneCall}    label="Contact d'urgence" value={user?.patient_profile?.contact_urgence_nom}       color="text-emerald-500" />
            {user?.patient_profile?.contact_urgence_tel && (
              <InfoRow icon={Phone} label="Tél. urgence" value={user.patient_profile.contact_urgence_tel} color="text-emerald-400" />
            )}
          </div>
        </Card>
      )}

      {/* ── Paramètres ── */}
      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-900">Paramètres</p>
        </div>
        {getSettingsLinks().map((item, i) => (
          <SettingLink key={i} {...item} />
        ))}
        <div className="border-t border-slate-100">
          <SettingLink icon={LogOut} label="Déconnexion" onClick={logout} danger />
        </div>
      </Card>

      {/* Version */}
      <p className="text-center text-xs text-slate-400">Hopitel v1.0.0 — République du Bénin</p>
    </div>
  );
}
