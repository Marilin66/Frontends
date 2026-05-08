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
  Input,
  PageLoader 
} from '@/components/ui';
import { 
  UserPlus, 
  Mail, 
  Phone, 
  X, 
  Save, 
  ShieldCheck, 
  Trash,
  MoreVertical,
  Briefcase,
  Activity,
  UserCheck,
  ChevronRight,
  Zap,
  Globe,
  Database,
  Filter,
  AlertCircle,
  Search
} from 'lucide-react';
import { ConfirmModal } from '@/components/ui';

interface Laborantin {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  telephone: string;
  is_active: boolean;
  hopital_nom: string;
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

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<Laborantin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    telephone: '',
    date_naissance: '1995-01-01',
    sexe: 'M',
    laboratoire: '',
  });

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const data: any = await api.get(endpoints.laborantins);
      setStaff(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await api.post(endpoints.laborantins, formData);
      setIsModalOpen(false);
      fetchStaff();
      setFormData({ email: '', first_name: '', last_name: '', telephone: '', date_naissance: '1995-01-01', sexe: 'M', laboratoire: '' });
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setConfirmDeleteId(null);
    try {
      setIsLoading(true);
      await api.delete(`${endpoints.laborantins}${id}/`);
      fetchStaff();
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStaff = staff.filter(s => 
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 lg:space-y-12 pb-20"
    >
      {/* High-Contrast Human Capital Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center shadow-lg">
                <Briefcase className="w-6 h-6 text-white" />
             </div>
             <div className="bg-slate-900 text-white border-2 border-slate-800 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest italic">
                HUMAN_CAPITAL.
             </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">Registre Expert</h1>
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mt-4 italic">Indexation des techniciens cliniques certifiés</p>
        </motion.div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-64 group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors z-10" />
             <input 
               placeholder="Filtrer les collaborateurs..." 
               className="w-full pl-11 h-12 rounded-xl bg-white border-2 border-slate-200 focus:border-primary text-slate-950 text-xs font-black transition-all shadow-sm italic placeholder:text-slate-300"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <Button onClick={() => setIsModalOpen(true)} variant="primary" className="h-12 px-8 rounded-xl text-[10px] w-full sm:w-auto italic">
            <UserPlus className="w-4 h-4 mr-2" /> NOUVEAU PROFIL
          </Button>
        </div>
      </section>

      {/* Staff Identity Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
        {filteredStaff.length > 0 ? filteredStaff.map((member) => (
          <motion.div key={member.id} variants={itemVariants}>
            <Card className="relative h-full border-2 border-slate-100 bg-white hover:border-primary transition-all duration-300 group p-8 lg:p-10 flex flex-col items-center shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:bg-primary/5 transition-colors" />
               
               <div className="relative z-10 w-full flex flex-col items-center">
                  <div className="relative mb-6">
                     <Avatar name={`${member.first_name} ${member.last_name}`} size="lg" className="ring-4 ring-white shadow-xl group-hover:scale-110 transition-transform duration-500" />
                     <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 border-2 border-white rounded-lg flex items-center justify-center text-white">
                        <UserCheck className="w-4 h-4" />
                     </div>
                  </div>

                  <div className="space-y-2 mb-8 text-center">
                     <div className="bg-indigo-50 text-indigo-600 border-2 border-indigo-100 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest italic inline-block">TECH_SUP_LABO</div>
                     <h3 className="text-xl lg:text-3xl font-black text-slate-950 tracking-tighter uppercase italic leading-none">{member.first_name} {member.last_name}</h3>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">ID_SYSTEM: X-0{member.id}72</p>
                  </div>

                  <div className="w-full space-y-3 text-left bg-slate-50 p-5 rounded-xl border-2 border-slate-100 mb-8">
                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-900 italic">
                      <Mail className="w-4 h-4 text-primary" /> {member.email}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                      <Phone className="w-4 h-4 text-emerald-500" /> {member.telephone}
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between w-full border-t-2 border-slate-50 pt-6">
                    <Badge variant={member.is_active ? 'success' : 'warning'} className="px-3 py-1.5 rounded-lg font-black text-[8px] uppercase tracking-widest italic">
                      {member.is_active ? 'OPÉRATIONNEL' : 'INACTIF'}
                    </Badge>
                    <div className="flex items-center gap-2">
                       <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-lg border-2 text-slate-300 hover:text-slate-950">
                          <MoreVertical className="w-4 h-4" />
                       </Button>
                       <Button 
                         variant="outline" 
                         size="sm" 
                         className="h-9 w-9 p-0 rounded-lg border-2 text-slate-300 hover:text-rose-600 hover:border-rose-200"
                         onClick={() => setConfirmDeleteId(member.id)}
                       >
                         <Trash className="w-4 h-4" />
                       </Button>
                    </div>
                  </div>
               </div>
            </Card>
          </motion.div>
        )) : (
           <div className="col-span-full py-32 text-center bg-slate-50 rounded-3xl border-2 border-slate-100 border-dashed">
              <AlertCircle className="w-20 h-20 text-slate-300 mx-auto mb-8" />
              <p className="text-2xl font-black text-slate-400 uppercase tracking-[0.2em] italic">Aucun profil localisé</p>
           </div>
        )}
      </div>

      {/* Enrollment Modal Matrix */}
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
                    <CardTitle className="text-2xl lg:text-3xl font-black tracking-tighter leading-none italic uppercase">Inscription Expert</CardTitle>
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
                       <Zap className="w-3.5 h-3.5 text-primary" /> Enrollment de Personnel Certifié
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
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Prénom Collaborateur</label>
                        <input required className="w-full h-11 px-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-black text-slate-950 focus:border-primary transition-all outline-none italic placeholder:text-slate-300" placeholder="Ex: Jean..." value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Nom de Famille</label>
                        <input required className="w-full h-11 px-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-black text-slate-950 focus:border-primary transition-all outline-none italic placeholder:text-slate-300" placeholder="Ex: Kouassi..." value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Identifiant E-mail Corréler</label>
                      <input type="email" required className="w-full h-11 px-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-black text-slate-950 focus:border-primary transition-all outline-none italic placeholder:text-slate-300" placeholder="staff@matrix.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Ligne Directe</label>
                        <input required className="w-full h-11 px-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-black text-slate-950 focus:border-primary transition-all outline-none italic placeholder:text-slate-300" placeholder="+229 XX XX XX XX" value={formData.telephone} onChange={(e) => setFormData({...formData, telephone: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Sexe Collaborateur</label>
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
                    
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Date de Naissance Requise</label>
                      <input type="date" required className="w-full h-11 px-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-black text-slate-950 focus:border-primary transition-all outline-none italic" value={formData.date_naissance} onChange={(e) => setFormData({...formData, date_naissance: e.target.value})} />
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-slate-950 rounded-xl border-2 border-white/5">
                       <ShieldCheck className="w-5 h-5 text-primary" />
                       <p className="text-[9px] font-black text-white/40 uppercase tracking-widest italic leading-relaxed">
                          Validation requise : En certifiant ce profil, vous engagez la responsabilité structurelle du laboratoire.
                       </p>
                    </div>

                    <Button type="submit" isLoading={isLoading} className="w-full h-14 rounded-xl font-black italic text-[10px] shadow-2xl shadow-primary/20">
                       CERTIFIER COLLABORATEUR <UserCheck className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        open={confirmDeleteId !== null}
        title="Supprimer ce laborantin ?"
        message="Le compte sera désactivé et le laborantin ne pourra plus se connecter."
        confirmLabel="Supprimer"
        icon="delete"
        onConfirm={() => handleDelete(confirmDeleteId!)}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </motion.div>
  );
}
