// @ts-nocheck
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api, endpoints } from '@/services/api';
import { Card, Button, Input } from '@/components/ui';
import {
  User, Mail, Phone, MapPin, Calendar, Droplets, AlertTriangle,
  PhoneCall, Shield, LogOut, Edit2, Save, X, Camera,
  FileText, Stethoscope, Building, Briefcase, Award, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ROLE_CONFIG: Record<string, any> = {
  patient:       { label: 'Patient',       color: 'from-blue-600 to-indigo-700',   badge: 'bg-blue-50 text-blue-600 border-blue-100' },
  medecin:       { label: 'Médecin',       color: 'from-emerald-600 to-teal-700',  badge: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  laborantin:    { label: 'Laborantin',    color: 'from-cyan-600 to-blue-700',     badge: 'bg-cyan-50 text-cyan-600 border-cyan-100' },
  admin_hopital: { label: 'Administrateur', color: 'from-orange-600 to-red-700',    badge: 'bg-orange-50 text-orange-600 border-orange-100' },
  super_admin:   { label: 'Super Admin',   color: 'from-violet-600 to-purple-700', badge: 'bg-violet-50 text-violet-600 border-violet-100' },
  admin_general: { label: 'Admin Général', color: 'from-orange-600 to-red-700',    badge: 'bg-orange-50 text-orange-600 border-orange-100' },
};

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  
  const role = user?.role || 'patient';
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.patient;

  const [activeTab, setActiveTab] = useState('profil'); // profil, medical, pro
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    telephone: user?.telephone || '',
    adresse: user?.adresse || '',
    date_naissance: user?.date_naissance || '',
    sexe: user?.sexe || 'M',
    biographie: user?.medecin_profile?.biographie || '',
    specialite: user?.medecin_profile?.specialite || '',
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = { ...form };
      if (role === 'medecin') {
        payload.medecin_profile = { 
          biographie: form.biographie,
          specialite: form.specialite
        };
      }
      await api.patch(endpoints.me, payload);
      await refreshUser();
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
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

  const tabs = [
    { id: 'profil',  label: 'Informations', icon: User },
    ...(role === 'patient' ? [{ id: 'medical', label: 'Dossier Médical', icon: FileText }] : []),
    ...(role === 'medecin' || role === 'laborantin' || role === 'admin_hopital' ? [{ id: 'pro', label: 'Profil Pro', icon: Briefcase }] : []),
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-fade-in">
      
      {/* ── Banner ── */}
      <div className={`relative h-40 sm:h-56 bg-gradient-to-r ${config.color} rounded-[2.5rem] shadow-lg overflow-hidden`}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        </div>
      </div>

      {/* ── Profile Info Header ── */}
      <div className="px-8 -mt-16 sm:-mt-24 flex flex-col sm:flex-row items-center sm:items-end gap-6 relative z-10">
        <div className="relative">
          <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-[2.5rem] bg-white p-2 shadow-2xl">
            <div className={`w-full h-full rounded-[2.2rem] ${config.badge.split(' ')[0]} flex items-center justify-center overflow-hidden relative border border-slate-100`}>
              {user?.photo ? (
                <img src={user.photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-black opacity-40">
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
            className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-slate-100 hover:scale-110 active:scale-95 transition-all"
          >
            <Camera className="w-5 h-5 text-slate-600" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </div>

        <div className="flex-1 text-center sm:text-left pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {user?.first_name} {user?.last_name}
            </h1>
            <span className={`inline-flex px-4 py-1.5 border rounded-full text-[10px] font-black uppercase tracking-widest self-center sm:self-auto ${config.badge}`}>
              {config.label}
            </span>
          </div>
          <p className="text-slate-500 font-bold flex items-center gap-2 justify-center sm:justify-start">
            <Mail className="w-4 h-4 text-slate-400" /> {user?.email}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ── Sidebar Tabs ── */}
        <aside className="lg:col-span-3 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-wider ${
                activeTab === tab.id 
                ? 'bg-slate-900 text-white shadow-lg' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <tab.icon className="w-4.5 h-4.5" />
              {tab.label}
            </button>
          ))}
          <div className="pt-4 mt-4 border-t border-slate-100">
             <button onClick={logout} className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-red-500 hover:bg-red-50 font-black text-xs uppercase tracking-wider transition-all group">
                <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Déconnexion
             </button>
          </div>
        </aside>

        {/* ── Tab Content ── */}
        <main className="lg:col-span-9">
          <AnimatePresence mode="wait">
            {activeTab === 'profil' && (
              <motion.div key="profil" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <Card className="p-8 border-none shadow-xl bg-white relative overflow-visible">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">Identité Personnelle</h3>
                    {!isEditing ? (
                      <Button variant="secondary" onClick={() => setIsEditing(true)} leftIcon={<Edit2 className="w-4 h-4" />}>Modifier</Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsEditing(false)}><X className="w-4 h-4" /></Button>
                        <Button onClick={handleSave} isLoading={saving} leftIcon={<Save className="w-4 h-4" />}>Enregistrer</Button>
                      </div>
                    )}
                  </div>

                  {saveSuccess && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-sm font-bold flex items-center gap-3">
                      <CheckCircle className="w-5 h-5" /> Profil mis à jour avec succès
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {!isEditing ? (
                      <>
                        <InfoBox icon={User} label="Prénom" value={user?.first_name} />
                        <InfoBox icon={User} label="Nom" value={user?.last_name} />
                        <InfoBox icon={Phone} label="Téléphone" value={user?.telephone} />
                        <InfoBox icon={MapPin} label="Adresse" value={user?.adresse || 'Non renseignée'} />
                        <InfoBox icon={Calendar} label="Date de Naissance" value={user?.date_naissance ? new Date(user.date_naissance).toLocaleDateString() : '—'} />
                        <InfoBox icon={User} label="Sexe" value={user?.sexe === 'M' ? 'Masculin' : 'Féminin'} />
                      </>
                    ) : (
                      <div className="col-span-2 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <Input label="Prénom" value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} />
                          <Input label="Nom" value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <Input label="Téléphone" value={form.telephone} onChange={e => setForm({...form, telephone: e.target.value})} />
                           <Input label="Adresse" value={form.adresse} onChange={e => setForm({...form, adresse: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Input type="date" label="Date de naissance" value={form.date_naissance} onChange={e => setForm({...form, date_naissance: e.target.value})} />
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Sexe</label>
                            <select value={form.sexe} onChange={e => setForm({...form, sexe: e.target.value})} className="w-full h-12 px-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all">
                              <option value="M">Masculin</option>
                              <option value="F">Féminin</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'medical' && role === 'patient' && (
              <motion.div key="medical" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <Card className="p-8 border-none shadow-xl bg-white">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">Résumé Médical</h3>
                    <Button variant="outline" size="sm" onClick={() => navigate('/patient/profile/edit')}>Accéder au dossier complet</Button>
                  </div>

                  {/* NPI */}
                  {user?.patient_profile && (
                    <div className={`mb-6 p-4 rounded-2xl border flex items-start gap-3 ${
                      user.patient_profile.npi
                        ? 'bg-emerald-50 border-emerald-100'
                        : 'bg-amber-50 border-amber-200'
                    }`}>
                      <Shield className={`w-5 h-5 shrink-0 mt-0.5 ${user.patient_profile.npi ? 'text-emerald-600' : 'text-amber-500'}`} />
                      <div className="flex-1">
                        <p className={`text-xs font-black uppercase tracking-widest ${user.patient_profile.npi ? 'text-emerald-500' : 'text-amber-500'}`}>
                          NPI — Requis pour réserver un RDV
                        </p>
                        <p className={`text-sm font-bold mt-0.5 ${user.patient_profile.npi ? 'text-emerald-900' : 'text-amber-800'}`}>
                          {user.patient_profile.npi || 'Non renseigné'}
                        </p>
                        {!user.patient_profile.npi && (
                          <button
                            onClick={() => navigate('/patient/profile/edit')}
                            className="text-xs font-bold text-amber-700 underline mt-1"
                          >
                            Ajouter mon NPI →
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 bg-red-50 rounded-[2rem] border border-red-100">
                      <div className="flex items-center gap-3 mb-3">
                         <Droplets className="w-5 h-5 text-red-500" />
                         <span className="text-xs font-black text-red-400 uppercase tracking-widest">Groupe Sanguin</span>
                      </div>
                      <p className="text-3xl font-black text-red-700">{user?.patient_profile?.groupe_sanguin || '—'}</p>
                    </div>
                    <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100">
                      <div className="flex items-center gap-3 mb-3">
                         <AlertTriangle className="w-5 h-5 text-amber-500" />
                         <span className="text-xs font-black text-amber-400 uppercase tracking-widest">Allergies</span>
                      </div>
                      <p className="text-sm font-bold text-amber-700 truncate">{user?.patient_profile?.allergies || 'Aucune allergie connue'}</p>
                    </div>
                  </div>
                  <div className="mt-6 p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100">
                     <div className="flex items-center gap-3 mb-4">
                        <PhoneCall className="w-5 h-5 text-emerald-600" />
                        <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">Contact d'Urgence</span>
                     </div>
                     <p className="text-lg font-black text-emerald-900">{user?.patient_profile?.contact_urgence_nom || 'Non renseigné'}</p>
                     <p className="text-sm font-bold text-emerald-600 mt-1">{user?.patient_profile?.contact_urgence_tel || ''}</p>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'pro' && (
              <motion.div key="pro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <Card className="p-8 border-none shadow-xl bg-white">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">Profil Professionnel</h3>
                    {!isEditing ? (
                      <Button variant="secondary" onClick={() => setIsEditing(true)} leftIcon={<Edit2 className="w-4 h-4" />}>Modifier</Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsEditing(false)}><X className="w-4 h-4" /></Button>
                        <Button onClick={handleSave} isLoading={saving} leftIcon={<Save className="w-4 h-4" />}>Enregistrer</Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-8">
                     {role === 'medecin' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <InfoBox icon={Award} label="Spécialité" value={user?.medecin_profile?.specialite || 'Généraliste'} />
                           <InfoBox icon={Building} label="Hôpital Principal" value={user?.medecin_profile?.hopital?.nom || 'Indépendant'} />
                        </div>
                     )}

                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Biographie / Parcours</label>
                        {!isEditing ? (
                           <div className="p-6 bg-slate-50 rounded-[2rem] text-sm text-slate-600 leading-relaxed font-medium">
                              {user?.medecin_profile?.biographie || "Aucune biographie renseignée."}
                           </div>
                        ) : (
                           <textarea 
                             rows={6}
                             className="w-full p-6 bg-slate-50 border-none rounded-[2rem] text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                             placeholder="Décrivez votre expérience, vos spécialités..."
                             value={form.biographie}
                             onChange={e => setForm({...form, biographie: e.target.value})}
                           />
                        )}
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
    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-50 transition-all hover:bg-white hover:shadow-xl group">
      <div className="flex items-center gap-3 mb-2">
         <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            <Icon className="w-5 h-5 text-slate-400" />
         </div>
         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-sm font-black text-slate-900 pl-1">{value || '—'}</p>
    </div>
  );
}
