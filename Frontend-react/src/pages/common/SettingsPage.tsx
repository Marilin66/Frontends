// @ts-nocheck
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api, endpoints } from '@/services/api';
import { Card, Avatar, Button, Input } from '@/components/ui';
import {
  User, Lock, Bell, Shield, FileText, Phone, Info,
  ChevronRight, LogOut, Edit2, Save, X, Camera,
  Building, Mail, MapPin, Calendar, CheckCircle, AlertCircle,
  FlaskConical, Stethoscope, ChevronLeft, UserCircle, Settings as SettingsIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ROLE_THEME: Record<string, { primary: string; light: string; badge: string }> = {
  patient:       { primary: 'bg-blue-600',    light: 'bg-blue-50',    badge: 'text-blue-700 bg-blue-50 border-blue-100' },
  medecin:       { primary: 'bg-emerald-600', light: 'bg-emerald-50', badge: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
  admin_hopital: { primary: 'bg-orange-600',  light: 'bg-orange-50',  badge: 'text-orange-700 bg-orange-50 border-orange-100' },
  super_admin:   { primary: 'bg-violet-600',  light: 'bg-violet-50',  badge: 'text-violet-700 bg-violet-50 border-violet-100' },
  admin_general: { primary: 'bg-orange-600',  light: 'bg-orange-50',  badge: 'text-orange-700 bg-orange-50 border-orange-100' },
  laborantin:    { primary: 'bg-cyan-600',    light: 'bg-cyan-50',    badge: 'text-cyan-700 bg-cyan-50 border-cyan-100' },
};

export default function SettingsPage() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState('securite'); // profil, securite, aides
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
    biographie: user?.medecin_profile?.biographie || '',
    laboratoire: user?.laborantin_profile?.laboratoire || '',
  });

  const role = user?.role || 'patient';
  const theme = ROLE_THEME[role] || ROLE_THEME.patient;

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
      if (role === 'medecin') payload.medecin_profile = { biographie: form.biographie };
      if (role === 'laborantin') payload.laborantin_profile = { laboratoire: form.laboratoire };

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

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* ── Header Profil ── */}
      <section className="relative group">
        <div className={`h-32 sm:h-48 w-full ${theme.primary} rounded-[2rem] overflow-hidden relative shadow-lg`}>
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />
          {/* Motifs décoratifs */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute left-10 bottom-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        </div>

        <div className="px-6 -mt-12 sm:-mt-16 flex flex-col sm:flex-row items-center sm:items-end gap-6 relative z-10">
          <div className="relative group/avatar">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] bg-white p-1.5 shadow-2xl">
              <div className={`w-full h-full rounded-[1.6rem] ${theme.primary} flex items-center justify-center overflow-hidden relative`}>
                {user?.photo ? (
                  <img src={user.photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-black text-3xl">
                    {(user?.first_name?.[0] || '') + (user?.last_name?.[0] || '')}
                  </span>
                )}
                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>
            <button 
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-1 right-1 w-8 h-8 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-lg border border-slate-100 dark:border-slate-700 hover:scale-110 active:scale-95 transition-all"
            >
              <Camera className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>

          <div className="text-center sm:text-left flex-1 pb-2">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {user?.first_name} {user?.last_name}
              </h1>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${theme.badge}`}>
                {role.replace('_', ' ')}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2 justify-center sm:justify-start mt-1">
              <Mail className="w-3.5 h-3.5" /> {user?.email}
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        
        {/* ── Sidebar interne (Tabs) ── */}
        <aside className="lg:col-span-3 space-y-2">
          {[
            { id: 'securite', label: 'Sécurité',    icon: Shield },
            { id: 'aides',    label: 'Aide & Infos', icon: Info },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-sm ${
                activeTab === tab.id 
                ? `${theme.light} text-slate-900 shadow-sm ring-1 ring-slate-100` 
                : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          ))}
          <div className="pt-4 mt-4 border-t border-slate-100">
             <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 font-bold text-sm transition-all">
                <LogOut className="w-5 h-5" /> Déconnexion
             </button>
          </div>
        </aside>

        {/* ── Contenu Tab ── */}
        <main className="lg:col-span-9">
           <AnimatePresence mode="wait">


              {activeTab === 'securite' && (
                <motion.div key="securite" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                   <Card className="p-8 border-none shadow-xl bg-white dark:bg-slate-900">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider mb-8">Sécurité du Compte</h3>
                      <div className="space-y-4">
                         <SettingLink 
                            icon={Lock} 
                            label="Mot de passe" 
                            description="Changer votre mot de passe pour plus de sécurité"
                            onClick={() => {
                               navigate(`/${role.replace('_', '-')}/settings/change-password`);
                            }}
                         />
                         <SettingLink 
                            icon={Shield} 
                            label="Vérification Email" 
                            description={user?.is_email_verified ? "Votre compte est sécurisé et vérifié" : "Veuillez vérifier votre email"}
                            value={user?.is_email_verified ? "✓ Vérifié" : "! À vérifier"}
                            status={user?.is_email_verified ? 'success' : 'warning'}
                         />
                      </div>
                   </Card>
                </motion.div>
              )}

              {activeTab === 'aides' && (
                <motion.div key="aides" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                   <Card className="p-8 border-none shadow-xl bg-white dark:bg-slate-900">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider mb-8">Support & Informations</h3>
                      <div className="space-y-4">
                         <SettingLink icon={FileText} label="Conditions d'utilisation" description="Consulter les CGU de la plateforme" />
                         <SettingLink icon={Info} label="À propos de Hopitel" description="Version 1.0.0 — Système National de Supervision" />
                         <div className="p-6 bg-slate-900 rounded-[2rem] text-white relative overflow-hidden mt-8">
                            <div className="relative z-10">
                               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Besoin d'aide ?</p>
                               <p className="text-sm font-medium opacity-80 mb-4">Notre support technique est disponible 24/7 pour vous accompagner.</p>
                               <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">Contacter le support</Button>
                            </div>
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
                         </div>
                      </div>
                   </Card>
                </motion.div>
              )}
           </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function InfoBox({ icon: Icon, label, value }: any) {
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-md group">
      <div className="flex items-center gap-3 mb-2">
         <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            <Icon className="w-4 h-4 text-slate-400" />
         </div>
         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-sm font-bold text-slate-900 dark:text-white pl-1">{value}</p>
    </div>
  );
}

function SettingLink({ icon: Icon, label, description, value, status, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group text-left"
    >
      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform">
         <Icon className="w-5 h-5 text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
         <p className="text-sm font-bold text-slate-900 dark:text-white">{label}</p>
         <p className="text-xs text-slate-400 font-medium mt-0.5">{description}</p>
      </div>
      {value && (
        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
          status === 'success' ? 'bg-emerald-50 text-emerald-600' : 
          status === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'
        }`}>
          {value}
        </span>
      )}
      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
    </button>
  );
}
