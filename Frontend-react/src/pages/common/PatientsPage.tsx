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
  Users, 
  Search, 
  Filter, 
  Plus, 
  ChevronRight, 
  Mail, 
  Phone, 
  MoreVertical,
  Calendar,
  Activity,
  UserPlus,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Layout,
  Heart
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  telephone: string;
  date_naissance?: string;
  sexe?: string;
  derniere_visite?: string;
}

export default function PatientsPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      // Sélection de l'endpoint en fonction du rôle
      let endpoint = endpoints.patients; // Par défaut (Super Admin)
      
      if (user?.role === 'admin_hopital') {
        endpoint = endpoints.hopitalPatients;
      } else if (user?.role === 'medecin') {
        // Le médecin voit ses propres patients (Endpoint existant ou à venir)
        endpoint = '/rendezvous/mes-patients/'; // Hypothétique
      }
      
      const response = await api.get<{ results: Patient[] } | Patient[]>(endpoint);
      const data = Array.isArray(response) ? response : response.results;
      setPatients(data || []);
    } catch (error) {
      console.error('Erreur patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { opacity: 1, scale: 1 }
  };

  const filteredPatients = patients.filter(p => 
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && patients.length === 0) return <PageLoader />;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12 pb-32"
    >
      {/* Immersive Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
             <Badge className="bg-primary text-white border-none py-1.5 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 italic italic italic">Registre Clinique</Badge>
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping shadow-glow-sm" />
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-none italic italic">Chancellerie des <span className="text-primary italic italic">Patients</span></h1>
          <p className="text-slate-400 font-bold text-lg max-w-xl leading-relaxed">
             Inventaire complet et gestion longitudinale des <span className="text-slate-900">dossiers patients</span> certifiés.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group min-w-[320px] hidden lg:block">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-primary transition-all shadow-glow-sm" />
             <Input 
                placeholder="Rechercher identité..." 
                className="pl-16 h-18 rounded-[1.8rem] border-slate-100 bg-white shadow-premium focus:ring-4 focus:ring-primary/5 font-bold text-lg" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <Button className="h-18 px-10 rounded-[1.8rem] bg-slate-900 text-white font-black text-lg shadow-2xl hover:scale-105 transition-all">
             <UserPlus className="w-6 h-6 mr-3 text-primary shadow-glow-sm" /> Inscrire Patient
          </Button>
        </div>
      </div>

      {/* Stats QuickView */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-2">
         {[
           { label: 'Total Patients', value: patients.length, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
           { label: 'Visites ce mois', value: 142, icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
           { label: 'Dossiers Critiques', value: 12, icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50' },
           { label: 'Vérifiés Global', value: '98%', icon: ShieldCheck, color: 'text-amber-600', bg: 'bg-amber-50' }
         ].map((stat, i) => (
            <motion.div key={i} variants={itemVariants}>
               <Card className="border-none shadow-premium bg-white rounded-[2.5rem] p-8 flex flex-col gap-6 group hover:shadow-premium-hover transition-all">
                  <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-[1.2rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                     <stat.icon className="w-7 h-7" />
                  </div>
                  <div>
                     <p className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{stat.value}</p>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{stat.label}</p>
                  </div>
               </Card>
            </motion.div>
         ))}
      </div>

      {/* Patient Matrix Interface */}
      <Card className="border-none shadow-premium bg-white rounded-[4rem] overflow-hidden p-2">
        <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="py-10 px-12 text-[10px] font-black text-slate-400 uppercase tracking-widest italic italic">Pion Patient</th>
                    <th className="py-10 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest italic italic">Coordonnées</th>
                    <th className="py-10 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest italic italic">Chronogramme</th>
                    <th className="py-10 px-12 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right italic italic">Contrôle Flux</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {filteredPatients.length > 0 ? filteredPatients.map((p) => (
                    <tr key={p.id} className="group hover:bg-slate-50/80 transition-all duration-300">
                       <td className="py-10 px-12">
                          <div className="flex items-center gap-6">
                             <div className="relative">
                                <Avatar name={`${p.first_name} ${p.last_name}`} size="lg" className="w-18 h-18 rounded-[1.8rem] shadow-xl ring-4 ring-white group-hover:rotate-3 transition-transform" />
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center text-white border-4 border-slate-50 shadow-glow-sm">
                                   <ShieldCheck className="w-3 h-3" />
                                </div>
                             </div>
                             <div>
                                <span className="block font-black text-slate-900 text-xl tracking-tighter leading-none group-hover:text-primary transition-colors uppercase">{p.first_name} {p.last_name}</span>
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2 block italic italic">Ref: P-{p.id.toString().padStart(5, '0')}</span>
                             </div>
                          </div>
                       </td>
                       <td className="py-10 px-8">
                          <div className="space-y-2">
                             <div className="flex items-center gap-3 text-slate-600 font-bold text-sm">
                                <Mail className="w-4 h-4 text-slate-300" /> {p.email}
                             </div>
                             <div className="flex items-center gap-3 text-slate-600 font-bold text-sm">
                                <Phone className="w-4 h-4 text-slate-300" /> {p.telephone}
                             </div>
                          </div>
                       </td>
                       <td className="py-10 px-8">
                          <div className="space-y-1">
                             <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg">Dernière Scéance</Badge>
                             <p className="text-sm font-bold text-slate-900 mt-2">{p.derniere_visite || '14 Oct 2024'}</p>
                          </div>
                       </td>
                       <td className="py-10 px-12 text-right">
                          <div className="flex items-center justify-end gap-3">
                             <Button variant="ghost" className="h-14 w-14 rounded-2xl bg-white border border-slate-100 text-slate-300 hover:text-primary hover:border-primary/20 shadow-sm transition-all grayscale hover:grayscale-0">
                                <Layout className="w-6 h-6" />
                             </Button>
                             <Button variant="ghost" className="h-14 w-14 rounded-2xl bg-white border border-slate-100 text-slate-300 hover:text-slate-900 shadow-sm transition-all">
                                <ChevronRight className="w-7 h-7" />
                             </Button>
                          </div>
                       </td>
                    </tr>
                 )) : (
                    <tr>
                       <td colSpan={4} className="py-48 text-center bg-slate-50/30">
                          <div className="flex flex-col items-center">
                             <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-inner mb-6 transition-transform hover:scale-110">
                                <Users className="w-12 h-12 text-slate-100" />
                             </div>
                             <h4 className="text-3xl font-black text-slate-900 tracking-tighter italic">Dossier Vide</h4>
                             <p className="text-slate-400 font-bold max-w-sm text-lg mt-3 leading-relaxed">Aucun patient correspondant au critère de recherche n'a été indexé.</p>
                          </div>
                       </td>
                    </tr>
                 )}
              </tbody>
           </table>
        </div>
        <div className="p-12 border-t border-slate-50 bg-slate-50/10 text-center">
           <Button variant="ghost" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-all flex items-center gap-3 mx-auto italic italic italic">
              <Zap className="w-4 h-4" /> Charger l'historique de l'infrastructure globale
           </Button>
        </div>
      </Card>
      
      {/* Visual Indicator Detail Footer */}
      <motion.div variants={itemVariants} className="bg-indigo-600 rounded-[4rem] p-16 overflow-hidden relative group">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] -mr-64 -mt-64 transition-transform group-hover:scale-125" />
         <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 text-white">
            <div className="space-y-6 flex-1">
               <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-500/20 group-hover:rotate-3 transition-transform">
                  <Heart className="w-10 h-10 text-white animate-pulse" />
               </div>
               <h3 className="text-4xl lg:text-5xl font-black tracking-tighter leading-none italic italic">Gouvernance de la <span className="text-primary-foreground underline decoration-primary/20">Donnée Patient</span></h3>
               <p className="text-white/60 font-bold text-lg max-w-2xl leading-relaxed italic italic">Synchronisez les archives vitales avec le registre national pour une intégrité absolue de l'historique clinique.</p>
            </div>
            <Button className="h-24 px-16 rounded-[2.5rem] bg-white text-indigo-900 font-black text-2xl shadow-2xl hover:scale-[1.05] active:scale-95 transition-all italic italic italic">
               Master Sync <ArrowUpRight className="w-8 h-8 ml-4" />
            </Button>
         </div>
      </motion.div>
    </motion.div>
  );
}
