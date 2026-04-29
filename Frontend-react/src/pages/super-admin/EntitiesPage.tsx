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
  Building, 
  Trash, 
  MoreVertical,
  ShieldCheck,
  Search,
  Zap,
  MapPin,
  Activity,
  ArrowRight,
  Globe,
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Hopital {
  id: number;
  nom: string;
  adresse: string;
  ville: string;
  telephone: string;
  email: string;
  is_active: boolean;
  date_creation: string;
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

export default function EntitiesPage() {
  const [entities, setEntities] = useState<Hopital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    ville: '',
    telephone: '',
    email: '',
    admin_email: '',
    admin_first_name: '',
    admin_last_name: '',
    admin_telephone: '',
    admin_date_naissance: '1990-01-01',
    admin_sexe: 'M'
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<{ results: Hopital[] }>(endpoints.hopitaux);
      setEntities(response.results || []);
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
      await api.post(endpoints.hopitaux, formData);
      setIsModalOpen(false);
      fetchData();
      // Reset form
      setFormData({
        nom: '', adresse: '', ville: '', telephone: '', email: '',
        admin_email: '', admin_first_name: '', admin_last_name: '',
        admin_telephone: '', admin_date_naissance: '1990-01-01', admin_sexe: 'M'
      });
    } catch (error: any) {
      console.error(error);
      alert("Erreur lors de la création de l'hôpital.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      setIsLoading(true);
      await api.patch(`${endpoints.hopitaux}${id}/`, { is_active: !currentStatus });
      fetchData();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEntities = entities.filter(e => 
    `${e.nom} ${e.ville} ${e.adresse}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 lg:space-y-12 pb-20"
    >
      {/* High-Contrast Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center shadow-lg">
                <Building className="w-6 h-6 text-white" />
             </div>
             <div className="bg-slate-900 text-white border-2 border-slate-800 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest italic">
                ENTITY_MANAGER.
             </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">Hôpitaux Réseau</h1>
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mt-4 italic">Gestion des infrastructures sanitaires certifiées</p>
        </motion.div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-64 group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors z-10" />
             <input 
               placeholder="Rechercher une entité..." 
               className="w-full pl-11 h-12 rounded-xl bg-white border-2 border-slate-200 focus:border-primary text-slate-950 text-xs font-black transition-all shadow-sm italic placeholder:text-slate-300"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          
          <Button onClick={() => setIsModalOpen(true)} variant="primary" className="h-12 px-8 rounded-xl text-[10px] italic font-black shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" /> NOUVEL HOPITAL
          </Button>
        </div>
      </section>

      {/* Entities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
        {isLoading && entities.length === 0 ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
          ))
        ) : filteredEntities.length > 0 ? filteredEntities.map((entity) => (
          <motion.div key={entity.id} variants={itemVariants}>
            <Card className="h-full border-2 border-slate-100 bg-white hover:border-primary transition-all duration-300 group p-8 lg:p-10 flex flex-col justify-between shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:bg-primary/5 transition-colors" />
               
               <div className="relative z-10">
                  <div className="flex items-start justify-between mb-8">
                     <div className="w-16 h-16 rounded-2xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-950 group-hover:text-white transition-all">
                        <Building className="w-8 h-8" />
                     </div>
                     <Badge variant={entity.is_active ? 'success' : 'warning'} className="text-[8px] px-3 font-black italic">
                        {entity.is_active ? 'OPÉRATIONNEL' : 'INACTIF'}
                     </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-8">
                     <h3 className="text-xl lg:text-3xl font-black text-slate-950 tracking-tighter uppercase italic leading-none">{entity.nom}</h3>
                     <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest italic">
                        <MapPin className="w-3 h-3 text-primary" /> {entity.ville || 'BÉNIN'}
                     </div>
                  </div>

                  <div className="w-full space-y-3 text-left bg-slate-50 p-5 rounded-xl border-2 border-slate-100 mb-8">
                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-900 italic">
                      <Mail className="w-4 h-4 text-primary" /> {entity.email || 'N/A'}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                      <Phone className="w-4 h-4 text-emerald-500" /> {entity.telephone || 'N/A'}
                    </div>
                  </div>
               </div>

               <div className="mt-auto flex items-center justify-between relative z-10 pt-6 border-t-2 border-slate-50">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-10 px-4 rounded-lg border-2 text-[10px] font-black italic uppercase"
                    onClick={() => navigate(`/super-admin/entities/${entity.id}`)}
                  >
                    PILOTAGE <ArrowRight className="w-3 h-3 ml-2" />
                  </Button>
                  <div className="flex items-center gap-2">
                     <Button 
                        variant="outline" 
                        size="sm" 
                        className={`h-9 w-9 p-0 rounded-lg border-2 ${entity.is_active ? 'text-emerald-500' : 'text-rose-500'}`}
                        onClick={() => handleToggleStatus(entity.id, entity.is_active)}
                     >
                        <Zap className="w-4 h-4" />
                     </Button>
                  </div>
               </div>
            </Card>
          </motion.div>
        )) : (
            <div className="col-span-full py-32 text-center bg-slate-50 rounded-3xl border-2 border-slate-100 border-dashed">
               <Activity className="w-20 h-20 text-slate-200 mx-auto mb-6" />
               <p className="text-2xl font-black text-slate-300 uppercase tracking-[0.2em] italic">Aucune Entité répertoriée</p>
            </div>
        )}
      </div>

      {/* Modal: Ajout Hospital */}
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
                    <CardTitle className="text-2xl lg:text-3xl font-black tracking-tighter leading-none italic uppercase">Déployer Unité</CardTitle>
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
                       <Zap className="w-3.5 h-3.5 text-primary" /> Initialisation Infrastructure
                    </p>
                  </div>
                  <Button onClick={() => setIsModalOpen(false)} variant="ghost" className="h-10 w-10 p-0 rounded-lg hover:bg-white/10 text-white relative z-10">
                    <X className="w-6 h-6" />
                  </Button>
                </CardHeader>
                <form onSubmit={handleCreate}>
                  <CardContent className="p-8 lg:p-10 space-y-8 text-black">
                    <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-primary uppercase tracking-widest italic border-l-4 border-primary pl-4">Informations Hôpital</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Nom de l'Entité</label>
                          <input required className="w-full h-11 px-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-black text-slate-950 focus:border-primary transition-all outline-none italic placeholder:text-slate-300" placeholder="Ex: CHU Cotonou..." value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Adresse Physique</label>
                          <input required className="w-full h-11 px-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-black text-slate-950 focus:border-primary transition-all outline-none italic placeholder:text-slate-300" placeholder="Quartier, Rue..." value={formData.adresse} onChange={(e) => setFormData({...formData, adresse: e.target.value})} />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Ville</label>
                          <input required className="w-full h-11 px-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-black text-slate-950 focus:border-primary transition-all outline-none italic" placeholder="Cotonou" value={formData.ville} onChange={(e) => setFormData({...formData, ville: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Téléphone</label>
                          <input required className="w-full h-11 px-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-black text-slate-950 focus:border-primary transition-all outline-none italic" placeholder="+229..." value={formData.telephone} onChange={(e) => setFormData({...formData, telephone: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Email</label>
                          <input required type="email" className="w-full h-11 px-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-black text-slate-950 focus:border-primary transition-all outline-none italic" placeholder="contact@hop.bj" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic border-l-4 border-emerald-500 pl-4">Administrateur Local</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Prénom Admin</label>
                          <input required className="w-full h-11 px-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-black text-slate-950 focus:border-primary transition-all outline-none italic" value={formData.admin_first_name} onChange={(e) => setFormData({...formData, admin_first_name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Nom Admin</label>
                          <input required className="w-full h-11 px-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-black text-slate-950 focus:border-primary transition-all outline-none italic" value={formData.admin_last_name} onChange={(e) => setFormData({...formData, admin_last_name: e.target.value})} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Email Admin</label>
                        <input required type="email" className="w-full h-11 px-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-black text-slate-950 focus:border-primary transition-all outline-none italic" value={formData.admin_email} onChange={(e) => setFormData({...formData, admin_email: e.target.value})} />
                      </div>
                    </div>
                    
                    <Button type="submit" isLoading={isLoading} className="w-full h-14 rounded-xl font-black italic text-[10px] shadow-2xl shadow-primary/20">
                       ACTIVER L'ENTITE <ArrowRight className="w-4 h-4 ml-2" />
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
