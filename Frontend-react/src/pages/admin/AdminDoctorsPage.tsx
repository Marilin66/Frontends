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
  Stethoscope, 
  Trash, 
  MoreVertical,
  ShieldCheck,
  UserCheck,
  Search,
  Zap,
  Star,
  Activity,
  ArrowRight,
  Filter
} from 'lucide-react';

interface Specialite {
  id: number;
  nom: string;
}

interface Medecin {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  specialite: string;
  telephone: string;
  numero_ordre: string;
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

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Medecin[]>([]);
  const [specialties, setSpecialties] = useState<Specialite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    telephone: '',
    specialite: '',
    numero_ordre: '',
    date_naissance: '1985-01-01',
    sexe: 'M',
    biographie: '',
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [docsData, specsData] = await Promise.all([
        api.get<{ results: Medecin[] }>(endpoints.medecins),
        api.get<Specialite[]>(endpoints.servicesGlobaux)
      ]);
      setDoctors(docsData.results || []);
      setSpecialties(specsData || []);
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
      await api.post(endpoints.medecins, formData);
      setIsModalOpen(false);
      fetchData();
      setFormData({ email: '', first_name: '', last_name: '', telephone: '', specialite: '', numero_ordre: '', date_naissance: '1985-01-01', sexe: 'M', biographie: '' });
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Confirmer la désactivation ?')) return;
    try {
      setIsLoading(true);
      await api.delete(`${endpoints.medecins}${id}/`);
      fetchData();
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(d => 
    `${d.first_name} ${d.last_name} ${d.specialite}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 lg:space-y-12 pb-20"
    >
      {/* High-Contrast Header architecture */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center shadow-lg">
                <Stethoscope className="w-6 h-6 text-white" />
             </div>
             <div className="bg-slate-900 text-white border-2 border-slate-800 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest italic">
                PRATICIEN_SYNC.
             </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">Corps Médical</h1>
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mt-4 italic">Indexation des praticiens certifiés du réseau</p>
        </motion.div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-64 group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors z-10" />
             <input 
               placeholder="Filtrer les experts..." 
               className="w-full pl-11 h-12 rounded-xl bg-white border-2 border-slate-200 focus:border-primary text-slate-950 text-xs font-black transition-all shadow-sm italic placeholder:text-slate-300"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          
          <input 
            type="file" 
            id="csv-import" 
            className="hidden" 
            accept=".csv"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              
              const formData = new FormData();
              formData.append('fichier', file);
              
              try {
                setIsLoading(true);
                await api.post(endpoints.medecinsImport, formData);
                alert('Importation réussie ! Les médecins recevront un email de confirmation.');
                fetchData();
              } catch (err: any) {
                alert(err.response?.data?.error || "Erreur lors de l'importation. Vérifiez le format du fichier.");
              } finally {
                setIsLoading(false);
                e.target.value = '';
              }
            }}
          />
          
          <div className="flex flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => document.getElementById('csv-import')?.click()} 
                variant="outline" 
                className="h-12 px-6 rounded-xl text-[10px] italic border-2 border-slate-200 hover:border-emerald-500 hover:text-emerald-500 transition-all font-black"
              >
                <Activity className="w-4 h-4 mr-2" /> IMPORT CSV
              </Button>
              <Button onClick={() => setIsModalOpen(true)} variant="primary" className="h-12 px-8 rounded-xl text-[10px] italic font-black shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4 mr-2" /> NOUVEAU PRATICIEN
              </Button>
            </div>
            <a 
              href={`${import.meta.env.VITE_API_URL || 'https://backend-soutenance-1et0.onrender.com/api'}${endpoints.medecinsImportTemplate}`}
              className="text-[9px] font-black text-primary uppercase tracking-widest italic hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Télécharger le modèle CSV
            </a>
          </div>
        </div>
      </section>

      {/* Grid architecture Loop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
        {filteredDoctors.length > 0 ? filteredDoctors.map((medecin) => (
          <motion.div key={medecin.id} variants={itemVariants}>
            <Card className="h-full border-2 border-slate-100 bg-white hover:border-primary transition-all duration-300 group p-8 lg:p-10 flex flex-col justify-between shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:bg-primary/5 transition-colors" />
               
               <div className="relative z-10">
                  <div className="flex items-start justify-between mb-8">
                     <div className="relative">
                        <Avatar name={`${medecin.first_name} ${medecin.last_name}`} size="lg" className="ring-4 ring-white shadow-xl group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 border-2 border-white rounded-lg flex items-center justify-center shadow-lg">
                           <ShieldCheck className="w-4 h-4 text-white" />
                        </div>
                     </div>
                     <Badge variant={medecin.is_active ? 'success' : 'warning'} className="text-[8px] px-3 font-black italic">
                        {medecin.is_active ? 'ACTIF' : 'PENDING'}
                     </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-8">
                     <div className="bg-primary/10 text-primary border-2 border-primary/20 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest italic inline-block">{medecin.specialite || 'PRATICIEN'}</div>
                     <h3 className="text-xl lg:text-3xl font-black text-slate-950 tracking-tighter uppercase italic leading-none">{medecin.first_name} {medecin.last_name}</h3>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">REF_ID: MED-0{medecin.id}99</p>
                  </div>

                  <div className="w-full space-y-3 text-left bg-slate-50 p-5 rounded-xl border-2 border-slate-100 mb-8">
                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-900 italic">
                      <Mail className="w-4 h-4 text-primary" /> {medecin.email}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                      <Phone className="w-4 h-4 text-emerald-500" /> {medecin.telephone}
                    </div>
                  </div>
               </div>

               <div className="mt-auto flex items-center justify-between relative z-10 pt-6 border-t-2 border-slate-50">
                  <div className="flex items-center gap-2">
                     <Star className="w-3 h-3 text-amber-500 fill-current" />
                     <span className="text-[9px] font-black text-slate-950 italic">RANKING: TOP_TIER</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-lg border-2 text-slate-300 hover:text-slate-950">
                        <MoreVertical className="w-4 h-4" />
                     </Button>
                     <Button 
                       variant="outline" 
                       size="sm" 
                       className="h-9 w-9 p-0 rounded-lg border-2 text-slate-300 hover:text-rose-600 hover:border-rose-200"
                       onClick={() => handleDelete(medecin.id)}
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
               <p className="text-2xl font-black text-slate-300 uppercase tracking-[0.2em] italic">Aucune donnée Medecin</p>
            </div>
        )}
      </div>

      {/* Modal Matrix */}
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
                    <CardTitle className="text-2xl lg:text-3xl font-black tracking-tighter leading-none italic uppercase">Nouvelle Archive</CardTitle>
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
                       <Zap className="w-3.5 h-3.5 text-primary" /> Integration d'Expert Clinique
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
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Prénom Docteur</label>
                        <input required className="w-full h-11 px-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-black text-slate-950 focus:border-primary transition-all outline-none italic placeholder:text-slate-300" placeholder="Ex: Jean..." value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Nom de Famille</label>
                        <input required className="w-full h-11 px-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-black text-slate-950 focus:border-primary transition-all outline-none italic placeholder:text-slate-300" placeholder="Ex: Kouassi..." value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Email Professionnel</label>
                        <input type="email" required className="w-full h-11 px-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-black text-slate-950 focus:border-primary transition-all outline-none italic placeholder:text-slate-300" placeholder="med@matrix.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Spécialité Principale</label>
                        <select 
                          required 
                          className="w-full h-11 px-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-black text-slate-950 focus:border-primary transition-all outline-none cursor-pointer italic"
                          value={formData.specialite}
                          onChange={(e) => setFormData({...formData, specialite: e.target.value})}
                        >
                          <option value="">Sélectionner une unité</option>
                          {specialties.map(spec => (
                            <option key={spec.id} value={spec.nom}>{spec.nom}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Contact Direct</label>
                        <input required className="w-full h-11 px-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-black text-slate-950 focus:border-primary transition-all outline-none italic placeholder:text-slate-300" placeholder="+229 XX XX XX XX" value={formData.telephone} onChange={(e) => setFormData({...formData, telephone: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Genre Clinique</label>
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Date de Naissance</label>
                        <input type="date" required className="w-full h-11 px-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-black text-slate-950 focus:border-primary transition-all outline-none italic" value={formData.date_naissance} onChange={(e) => setFormData({...formData, date_naissance: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">N° d'Ordre National</label>
                        <input placeholder="ORD-XXXXX-BJ" className="w-full h-11 px-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-black text-slate-950 focus:border-primary transition-all outline-none italic placeholder:text-slate-300" value={formData.numero_ordre} onChange={(e) => setFormData({...formData, numero_ordre: e.target.value})} />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Note de Curriculum / Expertise</label>
                      <textarea className="w-full h-32 p-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-black text-slate-950 focus:border-primary transition-all outline-none leading-relaxed resize-none italic placeholder:text-slate-300" placeholder="Présentation synthétique du parcours..." value={formData.biographie} onChange={(e) => setFormData({...formData, biographie: e.target.value})} />
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-slate-950 rounded-xl border-2 border-white/5">
                       <ShieldCheck className="w-5 h-5 text-primary" />
                       <p className="text-[9px] font-black text-white/40 uppercase tracking-widest italic leading-relaxed">
                          Validation requise : Ce profil sera activé après audit du numéro d'ordre national des médecins.
                       </p>
                    </div>

                    <Button type="submit" isLoading={isLoading} className="w-full h-14 rounded-xl font-black italic text-[10px] shadow-2xl shadow-primary/20">
                       FINALISER L'INTEGRATION <UserCheck className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
