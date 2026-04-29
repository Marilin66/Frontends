// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, endpoints } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button, 
  Badge,
  PageLoader 
} from '@/components/ui';
import { 
  Plus, 
  Stethoscope, 
  X, 
  Activity, 
  ShieldCheck, 
  Layout, 
  Zap, 
  ChevronRight,
  SendHorizontal,
  Star,
  MoreVertical,
  Trash,
  Filter,
  Search
} from 'lucide-react';

interface HospitalService {
  id: number;
  service_nom: string;
  service_description: string;
  service_icone: string;
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

export default function AdminServicesPage() {
  const { user } = useAuth();
  const [services, setServices] = useState<HospitalService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    nom_nouveau_service: '',
    description_nouveau_service: '',
  });

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const data = await api.get<HospitalService[]>(endpoints.hopitalServicesProprietaire);
      setServices(Array.isArray(data) ? data : (data as any).results || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.hopital) {
      alert("Hôpital non identifié pour votre compte.");
      return;
    }

    try {
      setIsLoading(true);
      await api.post(endpoints.createDemandeService(user.hopital), formData);
      alert("Demande transmise avec succès ! Elle sera examinée par le gouverneur général.");
      setIsModalOpen(false);
      setFormData({ nom_nouveau_service: '', description_nouveau_service: '' });
    } catch (error: any) {
      alert(error.response?.data?.error || "Erreur lors de la transmission de la demande.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredServices = services.filter(s => 
    s.service_nom.toLowerCase().includes(searchTerm.toLowerCase())
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
                <Layout className="w-6 h-6 text-white" />
             </div>
             <div className="bg-slate-900 text-white border-2 border-slate-800 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest italic">
                STRUCTURE_DEPT.
             </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">Départements Matrix</h1>
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mt-4 italic">Indexation de l'architecture clinique hospitalière</p>
        </motion.div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-64 group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors z-10" />
             <input 
               placeholder="Filtrer les instances..." 
               className="w-full pl-11 h-12 rounded-xl bg-white border-2 border-slate-200 focus:border-primary text-slate-950 text-xs font-black transition-all shadow-sm italic placeholder:text-slate-300"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <Button onClick={() => setIsModalOpen(true)} variant="primary" className="h-12 px-8 rounded-xl text-[10px] w-full sm:w-auto italic">
            <Plus className="w-4 h-4 mr-2" /> NOUVELLE UNITÉ
          </Button>
        </div>
      </section>

      {/* Services Operational Loop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
        {filteredServices.length > 0 ? filteredServices.map((s) => (
          <motion.div key={s.id} variants={itemVariants}>
            <Card className="h-full border-2 border-slate-100 bg-white hover:border-primary transition-all duration-300 group p-8 lg:p-10 flex flex-col justify-between shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:bg-primary/5 transition-colors" />
               
               <div className="space-y-6 relative z-10">
                  <div className="flex items-center justify-between">
                     <div className="w-12 h-12 bg-slate-50 border-2 border-slate-100 rounded-xl flex items-center justify-center text-slate-950 group-hover:bg-slate-950 group-hover:text-white transition-all shadow-sm">
                        <Zap className="w-6 h-6" />
                     </div>
                     <Badge variant="primary" className="text-[8px] px-3 font-black italic border-primary/20 bg-primary/10 text-primary">UNIT_0{s.id}</Badge>
                  </div>
                  
                  <div className="space-y-3">
                     <h3 className="text-xl lg:text-3xl font-black text-slate-950 tracking-tighter uppercase italic leading-none group-hover:text-primary transition-colors">{s.service_nom}</h3>
                     <p className="text-[10px] lg:text-xs font-bold text-slate-400 italic leading-relaxed line-clamp-3 uppercase tracking-tight">
                        {s.service_description || "Description asynchrone pour ce domaine d'expertise certifié par le protocole hospitalier."}
                     </p>
                  </div>
               </div>

               <div className="mt-8 pt-6 border-t-2 border-slate-50 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-1">
                     <Star className="w-3 h-3 text-amber-500 fill-current" />
                     <span className="text-[9px] font-black text-slate-900 tracking-widest italic">STATUS: CERTIFIED</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-lg border-2 text-slate-300 hover:text-slate-950">
                        <MoreVertical className="w-4 h-4" />
                     </Button>
                  </div>
               </div>
            </Card>
          </motion.div>
        )) : (
            <div className="col-span-full py-32 text-center bg-slate-50 rounded-3xl border-2 border-slate-100 border-dashed">
               <Activity className="w-20 h-20 text-slate-200 mx-auto mb-6" />
               <p className="text-2xl font-black text-slate-300 uppercase tracking-[0.2em] italic">Aucune architecture localisée</p>
            </div>
        )}
      </div>

      {/* Modal Architecture Matrix */}
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
              className="relative w-full max-w-xl"
            >
              <Card className="shadow-2xl rounded-2xl lg:rounded-3xl overflow-hidden border-2 border-white/5 bg-white">
                <CardHeader className="bg-slate-950 p-8 lg:p-10 flex flex-row items-center justify-between text-white relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[50px] -mr-16 -mt-16" />
                  <div className="relative z-10">
                    <CardTitle className="text-2xl lg:text-3xl font-black tracking-tighter leading-none italic uppercase">Nouvelle Unité</CardTitle>
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] mt-3">Initialisation du segment clinique</p>
                  </div>
                  <Button onClick={() => setIsModalOpen(false)} variant="ghost" className="h-10 w-10 p-0 rounded-lg hover:bg-white/10 text-white relative z-10">
                    <X className="w-6 h-6" />
                  </Button>
                </CardHeader>
                <form onSubmit={handleCreate}>
                  <CardContent className="p-8 lg:p-10 space-y-8 text-black">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Nomenclature du Service</label>
                       <input 
                         required
                         className="w-full h-11 px-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-black text-slate-950 focus:border-primary transition-all outline-none italic placeholder:text-slate-300"
                         placeholder="Ex: Neurologie Appliquée..."
                         value={formData.nom_nouveau_service}
                         onChange={(e) => setFormData({...formData, nom_nouveau_service: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Note d'Orientation Stratégique</label>
                       <textarea 
                         required
                         className="w-full h-40 p-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-black text-slate-950 focus:border-primary transition-all outline-none leading-relaxed resize-none italic placeholder:text-slate-300"
                         placeholder="Justifier l'intégration de ce nouveau département..."
                         value={formData.description_nouveau_service}
                         onChange={(e) => setFormData({...formData, description_nouveau_service: e.target.value})}
                       />
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-slate-950 rounded-xl border-2 border-white/5">
                       <ShieldCheck className="w-5 h-5 text-primary" />
                       <p className="text-[9px] font-black text-white/40 uppercase tracking-widest italic leading-relaxed">
                          Traitement asynchrone : Votre requête sera transmise au gouverneur général pour validation architecturelle.
                       </p>
                    </div>

                    <Button type="submit" isLoading={isLoading} className="w-full h-14 rounded-xl font-black italic text-[10px] shadow-2xl shadow-primary/20">
                       PROPOSER L'UNITÉ CLINIQUE <SendHorizontal className="w-4 h-4 ml-2" />
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
