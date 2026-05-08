// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, endpoints } from '@/services/api';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button, 
  Badge,
  Avatar, 
  PageLoader 
} from '@/components/ui';
import { 
  Plus, 
  Mail, 
  Phone, 
  X, 
  Users, 
  Trash, 
  MoreVertical,
  ShieldCheck,
  Search,
  Zap,
  Building,
  Activity,
  Calendar,
  Lock,
  AlertCircle
} from 'lucide-react';
import { ErrorModal, ConfirmModal } from '@/components/ui';

interface Admin {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  telephone: string;
  hopital_nom: string;
  hopital: number;
  is_active: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: any = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export default function UsersPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    telephone: '',
    date_naissance: '1990-01-01',
    sexe: 'M',
    hopital: ''
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [adminsData, hopitauxData] = await Promise.all([
        api.get<any>(endpoints.adminHopitaux),
        api.get<any>(endpoints.hopitaux)
      ]);
      const adminsList = Array.isArray(adminsData) ? adminsData : adminsData?.results ?? [];
      const hopitauxList = Array.isArray(hopitauxData) ? hopitauxData : hopitauxData?.results ?? [];
      setAdmins(adminsList);
      setHospitals(hopitauxList);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await api.post(endpoints.adminHopitaux, formData);
      setIsModalOpen(false);
      fetchData();
      setFormData({ email: '', first_name: '', last_name: '', telephone: '', date_naissance: '1990-01-01', sexe: 'M', hopital: '' });
    } catch (error: any) {
      console.error(error);
      const data = error.response?.data;
      const msg = data ? Object.entries(data).map(([k, v]: any) => `${k === 'non_field_errors' ? '' : k + ' : '}${Array.isArray(v) ? v.join(', ') : v}`).join('\n') : "Erreur lors de l'ajout.";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setConfirmDeleteId(null);
    try {
      setIsLoading(true);
      await api.delete(`${endpoints.adminHopitaux}${id}/`);
      fetchData();
    } catch (error) {
      console.error(error);
      setErrorMsg('Erreur lors de la suppression.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAdmins = admins.filter(a => 
    `${a.first_name} ${a.last_name} ${a.email} ${a.hopital_nom}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 lg:space-y-12 pb-20"
    >
      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
             </div>
             <div className="bg-slate-900 text-white border-2 border-slate-800 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest italic">
                ADMIN_ACCESS.
             </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">Gestion Admins</h1>
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mt-4 italic">Contrôleurs d'établissements du réseau national</p>
        </motion.div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-64 group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors z-10" />
             <input 
               placeholder="Filtrer les administrateurs..." 
               className="w-full pl-11 h-12 rounded-xl bg-white border-2 border-slate-200 focus:border-primary text-slate-950 text-xs font-black transition-all shadow-sm italic placeholder:text-slate-300"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          
          <Button onClick={() => setIsModalOpen(true)} variant="primary" className="h-12 px-8 rounded-xl text-[10px] italic font-black shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" /> NOUVEL ACCÈS
          </Button>
        </div>
      </section>

      {/* Admins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
        {isLoading && admins.length === 0 ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
          ))
        ) : filteredAdmins.length > 0 ? filteredAdmins.map((admin) => (
          <motion.div key={admin.id} variants={itemVariants}>
            <Card className="h-full border-2 border-slate-100 bg-white hover:border-primary transition-all duration-300 group p-8 lg:p-10 flex flex-col justify-between shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:bg-primary/5 transition-colors" />
               
               <div className="relative z-10">
                  <div className="flex items-start justify-between mb-8">
                     <Avatar name={`${admin.first_name} ${admin.last_name}`} size="lg" className="ring-4 ring-white shadow-xl" />
                     <Badge variant={admin.is_active ? 'success' : 'warning'} className="text-[8px] px-3 font-black italic">
                        {admin.is_active ? 'AUTORISÉ' : 'RÉVOQUÉ'}
                     </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-8">
                     <div className="flex items-center gap-2 bg-slate-950 text-white px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest italic inline-block">
                        <Building className="w-3 h-3 text-primary inline mr-1.5" /> {admin.hopital_nom || 'HÔPITAL INCONNU'}
                     </div>
                     <h3 className="text-xl lg:text-3xl font-black text-slate-950 tracking-tighter uppercase italic leading-none">{admin.first_name} {admin.last_name}</h3>
                  </div>

                  <div className="w-full space-y-3 text-left bg-slate-50 p-5 rounded-xl border-2 border-slate-100 mb-8">
                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-900 italic">
                      <Mail className="w-4 h-4 text-primary" /> {admin.email}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                      <Phone className="w-4 h-4 text-emerald-500" /> {admin.telephone || 'N/A'}
                    </div>
                  </div>
               </div>

               <div className="mt-auto flex items-center justify-between relative z-10 pt-6 border-t-2 border-slate-50">
                  <div className="flex items-center gap-2">
                     <Lock className="w-3 h-3 text-amber-500" />
                     <span className="text-[9px] font-black text-slate-950 italic uppercase tracking-widest">Access_LVL: LOCAL_ROOT</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-9 w-9 p-0 rounded-lg border-2 text-slate-300 hover:text-rose-600 hover:border-rose-200"
                        onClick={() => setConfirmDeleteId(admin.id)}
                     >
                        <Trash className="w-4 h-4" />
                     </Button>
                  </div>
               </div>
            </Card>
          </motion.div>
        )) : (
            <div className="col-span-full py-32 text-center bg-slate-50 rounded-3xl border-2 border-slate-100 border-dashed">
               <Activity className="w-20 h-20 text-slate-200 mx-auto mb-6" />
               <p className="text-2xl font-black text-slate-300 uppercase tracking-[0.2em] italic">Aucun Administrateur détecté</p>
            </div>
        )}
      </div>

      {/* Modal: Ajout Admin */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsModalOpen(false)}
               className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <Card className="shadow-2xl rounded-2xl lg:rounded-3xl overflow-hidden border-2 border-white/5 bg-white">
                <CardHeader className="bg-slate-950 p-8 lg:p-10 flex flex-row items-center justify-between text-white relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[50px] -mr-16 -mt-16" />
                  <div className="relative z-10">
                    <CardTitle className="text-2xl lg:text-3xl font-black tracking-tighter leading-none italic uppercase">Créer Accès Admin</CardTitle>
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
                       <Zap className="w-3.5 h-3.5 text-primary" /> Provisioning Privilèges
                    </p>
                  </div>
                  <Button onClick={() => setIsModalOpen(false)} variant="ghost" className="h-10 w-10 p-0 rounded-lg hover:bg-white/10 text-white relative z-10">
                    <X className="w-6 h-6" />
                  </Button>
                </CardHeader>
                <form onSubmit={handleCreate}>
                  <CardContent className="p-8 lg:p-10 space-y-8 text-black">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Prénom</label>
                        <input required className="w-full h-11 px-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-black text-slate-950 focus:border-primary transition-all outline-none italic" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Nom</label>
                        <input required className="w-full h-11 px-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-black text-slate-950 focus:border-primary transition-all outline-none italic" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Email</label>
                        <input type="email" required className="w-full h-11 px-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-black text-slate-950 focus:border-primary transition-all outline-none italic" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Téléphone</label>
                        <input required className="w-full h-11 px-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-black text-slate-950 focus:border-primary transition-all outline-none italic" value={formData.telephone} onChange={(e) => setFormData({...formData, telephone: e.target.value})} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Affectation Hôpital</label>
                      <select 
                        required 
                        className="w-full h-11 px-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-black text-slate-950 focus:border-primary transition-all outline-none cursor-pointer italic"
                        value={formData.hopital}
                        onChange={(e) => setFormData({...formData, hopital: e.target.value})}
                      >
                        <option value="">Choisir un établissement...</option>
                        {hospitals.map(h => (
                          <option key={h.id} value={h.id}>{h.nom}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Date de Naissance</label>
                        <input type="date" required className="w-full h-11 px-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-black text-slate-950 focus:border-primary transition-all outline-none italic" value={formData.date_naissance} onChange={(e) => setFormData({...formData, date_naissance: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Sexe</label>
                        <select 
                          className="w-full h-11 px-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-black text-slate-950 focus:border-primary transition-all outline-none cursor-pointer italic"
                          value={formData.sexe}
                          onChange={(e) => setFormData({...formData, sexe: e.target.value})}
                        >
                          <option value="M">Masculin</option>
                          <option value="F">Féminin</option>
                        </select>
                      </div>
                    </div>
                    
                    <Button type="submit" isLoading={isLoading} className="w-full h-14 rounded-xl font-black italic text-[10px] shadow-2xl shadow-primary/20">
                       OCTROYER L'ACCÈS <ShieldCheck className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ErrorModal message={errorMsg} onClose={() => setErrorMsg('')} />
      <ConfirmModal
        open={confirmDeleteId !== null}
        title="Supprimer cet accès ?"
        message="L'administrateur perdra l'accès à son hôpital."
        confirmLabel="Supprimer"
        icon="delete"
        onConfirm={() => handleDelete(confirmDeleteId!)}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </motion.div>
  );
}
