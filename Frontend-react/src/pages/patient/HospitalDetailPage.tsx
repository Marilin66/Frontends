// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, endpoints } from '@/services/api';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button, 
  Badge, 
  PageLoader,
  Avatar
} from '@/components/ui';
import { 
  MapPin, 
  Phone, 
  Globe, 
  ArrowLeft, 
  Activity,
  CheckCircle,
  ChevronRight,
  ShieldCheck,
  Clock,
  Mail,
  Share,
  Zap,
  Building,
  Stethoscope,
  Star,
  ArrowRight
} from 'lucide-react';

interface HospitalService {
  id: number;
  service: number;
  service_nom: string;
  service_description: string;
  service_icone: string;
}

interface Hospital {
  id: number;
  nom: string;
  adresse: string;
  ville: string;
  telephone: string;
  email: string;
  site_web: string;
  description: string;
  logo: string;
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

export default function HospitalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [services, setServices] = useState<HospitalService[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hData, sData] = await Promise.all([
          api.get<Hospital>(endpoints.hopitalDetail(parseInt(id!))),
          api.get<HospitalService[]>(endpoints.hopitalServices(parseInt(id!)))
        ]);
        setHospital(hData);
        setServices(Array.isArray(sData) ? sData : (sData as any).results || []);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (isLoading) return <PageLoader />;
  if (!hospital) return null;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5 lg:space-y-12 pb-20"
    >
      {/* High-Contrast Navigation architecture */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6 lg:gap-8">
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3 mb-4">
             <Link to="/patient/search">
                <Button variant="outline" className="h-10 w-10 p-0 rounded-lg border-2">
                   <ArrowLeft className="w-5 h-5 text-slate-950" />
                </Button>
             </Link>
             <div className="bg-slate-900 text-white border-2 border-slate-800 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest italic">
                HOSPITAL_INTEL.
             </div>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">{hospital.nom}</h1>
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mt-4 italic">Indexation & Spécialités du Segment Clinique</p>
        </motion.div>

        <div className="flex items-center gap-3">
           <Button variant="outline" className="h-12 px-6 rounded-xl border-2 italic text-[10px] font-black">
             <Share className="w-4 h-4 mr-2" /> PARTAGER
           </Button>
           <Button className="h-12 px-8 rounded-xl font-black italic text-[10px] shadow-2xl shadow-primary/20">
             <MapPin className="w-4 h-4 mr-2" /> ITINÉRAIRE
           </Button>
        </div>
      </section>

      {/* Hospital Identity Grid */}
      <motion.div variants={itemVariants}>
        <Card className="border-2 border-slate-950 bg-slate-950 text-white rounded-2xl lg:rounded-3xl p-8 lg:p-14 overflow-hidden shadow-2xl relative group">
           <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none overflow-hidden underline-none">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-[100px] -mr-48 -mt-48 transition-transform group-hover:scale-125 duration-700" />
           </div>
           
           <div className="relative z-10 flex flex-col lg:flex-row gap-12 lg:items-center">
              <div className="w-32 h-32 lg:w-48 lg:h-48 bg-white/5 backdrop-blur-3xl border-2 border-white/10 rounded-2xl flex items-center justify-center p-8 shadow-2xl group-hover:bg-white group-hover:border-white transition-all duration-500">
                 {hospital.logo ? (
                   <img src={hospital.logo} alt={hospital.nom} className="w-full h-full object-contain" />
                 ) : (
                   <Building className="w-16 h-16 text-white group-hover:text-slate-950 transition-colors" />
                 )}
              </div>

              <div className="flex-1 space-y-8">
                 <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                       <Badge variant="success" className="bg-emerald-500/10 text-emerald-500 border-2 border-emerald-500/20 px-4 py-1.5 font-black rounded-lg text-[9px] italic uppercase tracking-widest">Opérationnel 24/7</Badge>
                       <Badge variant="primary" className="bg-primary/10 text-primary border-2 border-primary/20 px-4 py-1.5 font-black rounded-lg text-[9px] italic uppercase tracking-widest">Centre Agréé</Badge>
                    </div>
                    <p className="text-white/40 font-black text-xs lg:text-base uppercase tracking-widest italic leading-relaxed max-w-2xl">
                       {hospital.description || "Établissement clinique de haute précision indexé dans le réseau Hopitel."}
                    </p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t-2 border-white/5">
                    <div className="space-y-2">
                       <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] italic">Coordonnées GPS</p>
                       <p className="text-sm font-black italic tracking-tight">{hospital.adresse}, {hospital.ville}</p>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] italic">Protocole Vocal</p>
                       <p className="text-sm font-black italic tracking-tight">{hospital.telephone || "+229 01 00 00 00"}</p>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] italic">Flux Web</p>
                       <a href={hospital.site_web} className="text-sm font-black italic text-primary hover:underline tracking-tight">{hospital.site_web || "www.hopitel.bj"}</a>
                    </div>
                 </div>
              </div>
           </div>
        </Card>
      </motion.div>

      {/* Services Operational Loop */}
      <div className="space-y-8">
        <motion.div variants={itemVariants} className="flex items-center justify-between">
           <div className="space-y-1">
             <h3 className="text-2xl lg:text-3xl font-black text-slate-950 tracking-tighter uppercase italic flex items-center gap-4 leading-none">
               <Stethoscope className="w-8 h-8 text-primary" />
               Services Cliniques
             </h3>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mt-4 pl-12">
               {services.length} unités de spécialisation synchronisées
             </p>
           </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((s) => (
            <motion.div key={s.id} variants={itemVariants}>
              <Card 
                className="h-full border-2 border-slate-100 bg-white hover:border-primary transition-all duration-300 group p-6 lg:p-8 flex flex-col justify-between shadow-sm cursor-pointer"
                onClick={() => navigate(`/patient/hopital/${hospital.id}/service/${s.service}`)}
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-slate-50 border-2 border-slate-100 rounded-xl flex items-center justify-center text-slate-900 group-hover:bg-slate-950 group-hover:text-white transition-all shadow-sm">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1">
                       {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 text-amber-400 fill-current" />)}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-xl lg:text-2xl font-black text-slate-950 group-hover:text-primary transition-colors tracking-tighter uppercase italic leading-none">{s.service_nom}</h4>
                    <p className="text-[10px] lg:text-xs font-bold text-slate-400 italic leading-relaxed line-clamp-3 uppercase tracking-tight">
                      {s.service_description || "Unité clinique opérationnelle pour des protocoles de soins individualisés."}
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t-2 border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <Clock className="w-4 h-4 text-emerald-500" />
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Segments Disponibles</span>
                  </div>
                  <Button variant="outline" size="sm" className="h-10 w-10 p-0 rounded-lg border-2 text-slate-300 hover:text-slate-950 group-hover:border-slate-300">
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
