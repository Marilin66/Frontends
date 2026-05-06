// @ts-nocheck
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api, endpoints } from '@/services/api';
import { Card, Avatar, Badge, Button, Input } from '@/components/ui';
import {
  Phone, Mail, MapPin, Calendar, User, Droplets, AlertTriangle,
  PhoneCall, Bot, Key, Bell, Globe, Lock, Info, LogOut,
  Edit2, Save, X, ChevronRight, Stethoscope, Building
} from 'lucide-react';

const ROLE_COLOR: Record<string, string> = {
  patient:       'text-blue-600 bg-blue-50 border-blue-200',
  medecin:       'text-green-700 bg-green-50 border-green-200',
  admin_hopital: 'text-orange-600 bg-orange-50 border-orange-200',
  admin_general: 'text-orange-600 bg-orange-50 border-orange-200',
  super_admin:   'text-purple-700 bg-purple-50 border-purple-200',
  laborantin:    'text-cyan-700 bg-cyan-50 border-cyan-200',
};

const ROLE_AVATAR_BG: Record<string, string> = {
  patient:       'bg-blue-600',
  medecin:       'bg-green-700',
  admin_hopital: 'bg-orange-600',
  admin_general: 'bg-orange-600',
  super_admin:   'bg-purple-700',
  laborantin:    'bg-cyan-700',
};

const ROLE_LABEL: Record<string, string> = {
  patient:       'Patient',
  medecin:       'Médecin',
  admin_hopital: 'Admin Hôpital',
  admin_general: 'Admin Général',
  super_admin:   'Super Admin',
  laborantin:    'Laborantin',
};

function InfoTile({ icon: Icon, label, value, color = 'text-slate-400' }: any) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${color}`} />
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function SettingRow({ icon: Icon, label, href, onClick, danger = false }: any) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (onClick) onClick();
    else if (href) navigate(href);
  };
  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 ${danger ? 'text-red-600' : 'text-slate-700'}`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${danger ? 'bg-red-50' : 'bg-slate-100'}`}>
        <Icon className={`w-4 h-4 ${danger ? 'text-red-500' : 'text-slate-500'}`} />
      </div>
      <span className="flex-1 text-sm font-medium text-left">{label}</span>
      {!danger && <ChevronRight className="w-4 h-4 text-slate-300" />}
    </button>
  );
}

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    telephone: user?.telephone || '',
  });

  const role = user?.role || 'patient';
  const roleColor = ROLE_COLOR[role] || ROLE_COLOR.patient;
  const avatarBg = ROLE_AVATAR_BG[role] || ROLE_AVATAR_BG.patient;

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.patch(endpoints.me, form);
      await refreshUser();
      setIsEditing(false);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const getChangePasswordPath = () => {
    if (role === 'patient') return '/patient/profile/security/change-password';
    if (role === 'medecin') return '/medecin/profile/change-password';
    if (role === 'laborantin') return '/laborantin/profile/change-password';
    return '/admin-hopital/settings/change-password';
  };

  const getSettingsRows = () => {
    const base = [
      { icon: Lock, label: 'Changer le mot de passe', href: getChangePasswordPath() },
      { icon: Bell, label: 'Notifications', href: '/notifications' },
      { icon: Info, label: 'À propos', label2: 'Hopitel v1.0.0' },
    ];
    if (role === 'patient') {
      return [
        { icon: Bot, label: 'Assistant IA', href: '/patient/ai-agent' },
        { icon: Key, label: 'Accès par code résultat', href: '/patient/result-code' },
        ...base,
      ];
    }
    return base;
  };

  return (
    <div className="space-y-4 max-w-lg animate-fade-in">
      {/* Header card */}
      <Card className="overflow-hidden p-0">
        {/* Colored top bar */}
        <div className={`h-20 ${avatarBg}`} />
        <div className="px-5 pb-5">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className={`w-20 h-20 rounded-2xl ${avatarBg} flex items-center justify-center border-4 border-white shadow-lg`}>
              <span className="text-white font-bold text-2xl">
                {(user?.first_name?.[0] || '') + (user?.last_name?.[0] || '')}
              </span>
            </div>
            <Button
              size="sm"
              variant={isEditing ? 'outline' : 'secondary'}
              onClick={() => { setIsEditing(!isEditing); if (isEditing) setForm({ first_name: user?.first_name || '', last_name: user?.last_name || '', telephone: user?.telephone || '' }); }}
              leftIcon={isEditing ? <X className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
            >
              {isEditing ? 'Annuler' : 'Modifier'}
            </Button>
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Prénom" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
                <Input label="Nom" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
              </div>
              <Input label="Téléphone" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} leftIcon={<Phone className="w-4 h-4" />} />
              <Button className="w-full" isLoading={saving} onClick={handleSave} leftIcon={<Save className="w-4 h-4" />}>
                Enregistrer
              </Button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-slate-900">{user?.first_name} {user?.last_name}</h2>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${roleColor}`}>
                  {ROLE_LABEL[role]}
                </span>
              </div>
              <p className="text-sm text-slate-500">{user?.email}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Informations */}
      {!isEditing && (
        <Card className="p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-900">Informations</p>
          </div>
          <div className="px-4">
            <InfoTile icon={Phone} label="Téléphone" value={user?.telephone || 'Non renseigné'} color="text-blue-500" />
            <InfoTile icon={Mail} label="Email" value={user?.email} color="text-slate-400" />
            {user?.hopital_nom && <InfoTile icon={Building} label="Hôpital" value={user.hopital_nom} color="text-orange-500" />}
            {user?.medecinProfile?.specialite_nom && <InfoTile icon={Stethoscope} label="Spécialité" value={user.medecinProfile.specialite_nom} color="text-green-600" />}
          </div>
        </Card>
      )}

      {/* Informations médicales (patient uniquement) */}
      {!isEditing && role === 'patient' && (
        <Card className="p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-900">Informations médicales</p>
          </div>
          <div className="px-4">
            <InfoTile icon={Droplets} label="Groupe sanguin" value={user?.patientProfile?.groupe_sanguin || '--'} color="text-red-500" />
            <InfoTile icon={AlertTriangle} label="Allergies" value={user?.patientProfile?.allergies || 'Aucune'} color="text-amber-500" />
            <InfoTile icon={PhoneCall} label="Contact d'urgence" value={user?.patientProfile?.contact_urgence_nom} color="text-emerald-500" />
          </div>
        </Card>
      )}

      {/* Paramètres */}
      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-900">Paramètres</p>
        </div>
        {getSettingsRows().map((row, i) => (
          <SettingRow key={i} icon={row.icon} label={row.label} href={row.href} onClick={row.onClick} />
        ))}
        <div className="border-t border-slate-100">
          <SettingRow icon={LogOut} label="Déconnexion" onClick={logout} danger />
        </div>
      </Card>
    </div>
  );
}
