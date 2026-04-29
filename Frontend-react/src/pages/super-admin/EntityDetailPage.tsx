// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Building, 
  ArrowLeft, 
  Users, 
  Stethoscope, 
  FlaskConical, 
  Activity, 
  Settings,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Globe,
  Zap,
  MoreVertical,
  Plus,
  Inbox,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function EntityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entity, setEntity] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [demandes, setDemandes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('agents');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [entityData, agentsData, servicesData, demandesData] = await Promise.all([
        api.get<any>(endpoints.hopitalDetail(Number(id))),
        api.get<any[]>(`${endpoints.medecins}?hopital=${id}`), // Simplification pour les praticiens
        api.get<any[]>(endpoints.hopitalServices(Number(id))),
        api.get<any[]>(endpoints.demandesServices) // Fetch toutes les demandes, puis filtrage
      ]);
      setEntity(entityData);
      setAgents(agentsData.results || agentsData || []);
      setServices(servicesData.results || servicesData || []);
      
      const allDemandes = demandesData.results || demandesData || [];
      const hospDemandes = allDemandes.filter((d: any) => d.hopital === Number(id));
      setDemandes(hospDemandes);
      
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleActionDemande = async (demandeId: number, estValidation: boolean) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir ${estValidation ? 'valider' : 'refuser'} cette demande ?`)) return;
    
    try {
      setActionLoading(demandeId);
      if (estValidation) {
        await api.post(endpoints.validerDemande(demandeId));
      } else {
        await api.post(endpoints.refuserDemande(demandeId), { motif: 'Refusé' });
      }
      fetchData(); // Rafraîchir pour avoir le nouveau statut et potentiellement les nouveaux services
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'opération.");
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading && !entity) return <PageLoader />;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 lg:space-y-12 pb-20"
    >
      {/* Header with Back Button */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/super-admin/entities')}
            className="h-12 w-12 p-0 rounded-xl border-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="primary" className="text-[9px] font-black italic uppercase italic">ID: {id}</Badge>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-glow-sm" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Node_Active</span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-black text-slate-950 tracking-tighter uppercase italic leading-none">{entity?.nom}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-12 px-6 rounded-xl border-2 text-[10px] font-black italic uppercase">
            <Settings className="w-4 h-4 mr-2" /> CONFIGURER
          </Button>
          <Button variant="primary" className="h-12 px-8 rounded-xl text-[10px] font-black italic uppercase shadow-xl shadow-primary/20">
            <Zap className="w-4 h-4 mr-2" /> SYNC_FORCE
          </Button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Info Sidebar */}
        <div className="space-y-8">
           <Card className="border-2 border-slate-100 p-8 lg:p-10 bg-white shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="relative z-10 space-y-8">
                 <div className="w-20 h-20 rounded-2xl bg-slate-950 flex items-center justify-center text-white shadow-2xl">
                    <Building className="w-10 h-10" />
                 </div>
                 
                 <div className="space-y-6">
                    <div className="space-y-1">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Coordonnées Réseau</p>
                       <div className="space-y-4 pt-2">
                          <div className="flex items-center gap-4 text-xs font-black text-slate-950 italic">
                             <Mail className="w-4 h-4 text-primary" /> {entity?.email}
                          </div>
                          <div className="flex items-center gap-4 text-xs font-black text-slate-950 italic">
                             <Phone className="w-4 h-4 text-emerald-500" /> {entity?.telephone}
                          </div>
                          <div className="flex items-center gap-4 text-xs font-black text-slate-950 italic">
                             <MapPin className="w-4 h-4 text-rose-500" /> {entity?.adresse}, {entity?.ville}
                          </div>
                       </div>
                    </div>
                    
                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                       <div className="space-y-1">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">Statut Global</p>
                          <Badge variant={entity?.is_active ? 'success' : 'warning'} className="text-[9px] font-black italic px-4">
                             {entity?.is_active ? 'OPÉRATIONNEL' : 'MAINTENANCE'}
                          </Badge>
                       </div>
                       <div className="text-right">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">Uptime</p>
                          <p className="text-lg font-black text-slate-950 italic leading-none mt-1">99.9%</p>
                       </div>
                    </div>
                 </div>
              </div>
           </Card>
           
           <Card className="bg-slate-950 p-8 rounded-3xl border-2 border-white/5 shadow-2xl">
              <div className="space-y-6">
                 <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                    <h3 className="text-lg font-black text-white italic uppercase tracking-tighter">Sécurité & Audit</h3>
                 </div>
                 <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed italic tracking-widest">
                    Toutes les actions sur cette entité sont journalisées dans le segment de haute sécurité (CORE_SYNC).
                 </p>
                 <Button variant="outline" className="w-full h-12 rounded-xl bg-white/5 border-white/10 text-white hover:bg-white hover:text-slate-950 text-[10px] font-black transition-all">
                    LOGS_ACQUISITION
                 </Button>
              </div>
           </Card>
        </div>

        {/* Content Tabs */}
        <div className="lg:col-span-2 space-y-8">
           <div className="flex gap-4 p-2 bg-slate-100 rounded-2xl border-2 border-slate-100 overflow-x-auto no-scrollbar">
              {[
                { id: 'agents', label: 'AGENTS_NODES', icon: Users },
                { id: 'services', label: 'UNITE_SERVICES', icon: Activity },
                { id: 'demandes', label: 'REQUETES', icon: Inbox }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[120px] h-14 rounded-xl flex items-center justify-center gap-3 transition-all ${
                    activeTab === tab.id 
                    ? 'bg-white shadow-xl shadow-slate-200/50 text-slate-950 ring-2 ring-primary/20 flex-shrink-0' 
                    : 'text-slate-400 hover:text-slate-600 flex-shrink-0'
                  }`}
                >
                  <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary' : ''}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest italic">{tab.label}</span>
                </button>
              ))}
           </div>

           <AnimatePresence mode="wait">
              {activeTab === 'agents' ? (
                <motion.div 
                  key="agents"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                   {agents.length > 0 ? agents.map((agent, i) => (
                     <Card key={i} className="group border-2 border-slate-50 hover:border-primary transition-all p-6 bg-white flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-5">
                           <Avatar name={`${agent.first_name} ${agent.last_name}`} size="md" className="ring-2 ring-slate-100" />
                           <div>
                              <div className="flex items-center gap-2 mb-1">
                                 <Badge variant="outline" className="text-[8px] font-black italic border-slate-200 uppercase">{agent.role?.replace('ROLE_', '') || 'AGENT'}</Badge>
                              </div>
                              <h4 className="text-lg font-black text-slate-950 tracking-tight uppercase italic leading-none">{agent.first_name} {agent.last_name}</h4>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">{agent.email}</p>
                           </div>
                        </div>
                        <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-lg text-slate-300 hover:text-slate-950">
                           <MoreVertical className="w-4 h-4" />
                        </Button>
                     </Card>
                   )) : (
                     <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-slate-100 border-dashed">
                        <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Aucun agent répertorié</p>
                     </div>
                   )}
                   <Button variant="outline" className="w-full h-14 border-2 border-dashed border-slate-200 hover:border-primary hover:bg-primary/5 rounded-2xl text-[10px] font-black italic uppercase tracking-widest text-slate-400 hover:text-primary transition-all">
                      <Plus className="w-4 h-4 mr-2" /> AJOUTER UN AGENT_NODE
                   </Button>
                </motion.div>
              ) : activeTab === 'services' ? (
                <motion.div 
                  key="services"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                   {services.length > 0 ? services.map((service, i) => (
                     <Card key={i} className="group border-2 border-slate-50 hover:border-primary transition-all p-6 bg-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 rounded-full -mr-6 -mt-6" />
                        <div className="flex flex-col h-full justify-between gap-6 relative z-10">
                           <div className="space-y-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center text-primary group-hover:bg-slate-950 group-hover:text-white transition-all">
                                 <Activity className="w-5 h-5" />
                              </div>
                              <h4 className="text-xl font-black text-slate-950 uppercase italic leading-none">{service.service_nom || service.nom}</h4>
                              <p className="text-[10px] font-bold text-slate-400 italic line-clamp-2">{service.service_description || 'Pas de description.'}</p>
                           </div>
                           <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                              <Badge variant={service.is_active ? 'success' : 'warning'} className="text-[8px] font-black italic uppercase">{service.is_active ? 'ACTIF' : 'INACTIF'}</Badge>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-slate-300 hover:text-slate-950">
                                 <MoreVertical className="w-3.5 h-3.5" />
                              </Button>
                           </div>
                        </div>
                     </Card>
                   )) : (
                     <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-slate-100 border-dashed">
                        <Activity className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Aucun service actif</p>
                     </div>
                   )}
                </motion.div>
              ) : (
                <motion.div 
                  key="demandes"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                   {demandes.length > 0 ? demandes.map((demande, i) => {
                     const estEnAttente = demande.statut === 'en_attente';
                     const estValidee = demande.statut === 'validee';
                     return (
                       <Card key={i} className={`p-6 bg-white border-2 transition-all shadow-sm ${estEnAttente ? 'border-amber-100 hover:border-amber-200' : 'border-slate-50'}`}>
                          <div className="flex flex-col gap-4">
                             <div className="flex justify-between items-start">
                                <div>
                                   <Badge variant={estEnAttente ? 'warning' : estValidee ? 'success' : 'error'} className="text-[8px] font-black italic uppercase mb-2">
                                     {demande.statut.replace('_', ' ')}
                                   </Badge>
                                   <h4 className="text-xl font-black text-slate-950 italic uppercase">{demande.nom_nouveau_service || demande.service_existant_nom || 'Création de Service'}</h4>
                                   <p className="text-[10px] font-black text-slate-400 mt-2 italic">{demande.description_nouveau_service || 'Demande de validation existante.'}</p>
                                </div>
                                <Activity className={`w-6 h-6 stroke-[3px] ${estEnAttente ? 'text-amber-500' : 'text-slate-300'}`} />
                             </div>
                             
                             {estEnAttente && (
                               <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                                  <Button 
                                    variant="outline"
                                    disabled={actionLoading === demande.id}
                                    className="h-10 px-4 rounded-lg border-2 border-rose-100 text-rose-500 hover:bg-rose-50 hover:border-rose-200 text-[10px] font-black uppercase italic"
                                    onClick={() => handleActionDemande(demande.id, false)}
                                  >
                                    <XCircle className="w-3 h-3 mr-2" /> REFUSER
                                  </Button>
                                  <Button 
                                    disabled={actionLoading === demande.id}
                                    className="h-10 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 text-[10px] font-black uppercase italic"
                                    onClick={() => handleActionDemande(demande.id, true)}
                                  >
                                    <CheckCircle className="w-3 h-3 mr-2" /> VALIDER UNITÉ
                                  </Button>
                               </div>
                             )}
                          </div>
                       </Card>
                     );
                   }) : (
                     <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-slate-100 border-dashed">
                        <Inbox className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Aucune requête en attente</p>
                     </div>
                   )}
                </motion.div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
