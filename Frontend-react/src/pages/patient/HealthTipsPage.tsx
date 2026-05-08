// @ts-nocheck
import { useState, useEffect } from 'react';
import { api, endpoints } from '@/services/api';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { 
  Heart, 
  Zap, 
  Moon, 
  Stethoscope,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Activity,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
};

export default function HealthTipsPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const response = await api.get<any>(endpoints.servicesGlobaux);
        const results = Array.isArray(response) ? response : response.results || [];
        setServices(results);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchServices();
  }, []);

  const getIconForService = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('cardio')) return Heart;
    if (n.includes('dent')) return Zap;
    if (n.includes('femme') || n.includes('gyneco')) return Sparkles;
    return Stethoscope;
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto space-y-5 lg:space-y-12 pb-20"
    >
      {/* High-Contrast Knowledge Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6 lg:gap-8">
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3 mb-4">
             <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="rounded-lg h-10 w-10 p-0 border-2">
                <ArrowLeft className="w-4 h-4 text-slate-950" />
             </Button>
             <div className="bg-slate-950 text-white border-2 border-slate-900 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest italic">
                HEALTH_INTEL.
             </div>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">Protocole Préventif</h1>
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mt-4 italic">Optimisation du segment de santé quotidien</p>
        </motion.div>
      </section>

      {/* Recommendations Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {isLoading ? (
          [...Array(6)].map((_, i) => <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />)
        ) : services.map((service, i) => {
          const Icon = getIconForService(service.nom);
          return (
            <motion.div key={i} variants={itemVariants}>
              <Card className="border-2 border-slate-100 bg-white hover:border-primary transition-all duration-300 group overflow-hidden shadow-sm p-8">
                <div className="flex flex-col h-full space-y-8">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-slate-50 border-2 border-slate-100 rounded-xl flex items-center justify-center text-slate-950 group-hover:bg-slate-950 group-hover:text-white transition-all shadow-sm">
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge variant="primary" className="text-[8px] px-3 font-black italic border-primary/20 bg-primary/10 text-primary uppercase tracking-widest leading-none">Segment_Expert</Badge>
                  </div>
                  
                  <div className="space-y-4 flex-1">
                    <h3 className="text-xl lg:text-2xl font-black text-slate-950 uppercase italic tracking-tighter leading-none">{service.nom}</h3>
                    <p className="text-[10px] lg:text-xs font-bold text-slate-400 italic leading-relaxed uppercase tracking-tight line-clamp-3">
                      {service.description || "Découvrez nos protocoles spécialisés et prenez rendez-vous avec nos experts certifiés pour une analyse approfondie."}
                    </p>
                  </div>

                  <div className="pt-8 border-t-2 border-slate-50">
                    <Button 
                      onClick={() => navigate('/patient/search')}
                      variant="ghost" 
                      className="text-[9px] font-black italic uppercase tracking-widest p-0 h-auto hover:bg-transparent text-primary hover:text-primary-dark group-hover:translate-x-1 transition-all"
                    >
                      INITIALISER LE RDV <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* AI Integration Tactical Banner */}
      <motion.div variants={itemVariants}>
        <Card className="bg-slate-950 text-white border-2 border-slate-900 shadow-2xl rounded-2xl lg:rounded-3xl overflow-hidden relative group p-8 lg:p-14">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[100px] -mr-40 -mt-40 transition-transform group-hover:scale-125 duration-700" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
             <div className="w-20 h-20 bg-white/5 backdrop-blur-3xl border-2 border-white/10 rounded-2xl flex items-center justify-center flex-shrink-0 animate-float shadow-2xl">
                <Sparkles className="w-10 h-10 text-primary" />
             </div>
             <div className="flex-1 space-y-6 text-center lg:text-left">
                <div className="space-y-2">
                   <Badge variant="primary" className="text-[9px] font-black italic border-white/20">Protocol_Bio_Optimization</Badge>
                   <h2 className="text-3xl lg:text-4xl font-black italic uppercase tracking-tighter leading-none italic">Assistance Algorithmique</h2>
                </div>
                <p className="text-white/40 font-black text-xs lg:text-sm uppercase tracking-widest italic leading-relaxed max-w-2xl">
                  Besoin d'un suivi analytique précis ? Interagissez avec notre Hub IA pour obtenir des recommandations synchronisées à votre dataset de santé.
                </p>
             </div>
             <Button onClick={() => navigate('/patient/ai-agent')} className="w-full lg:w-auto h-14 px-10 bg-white text-slate-950 hover:bg-white/90 rounded-xl font-black italic uppercase tracking-widest text-[10px] shadow-2xl">
                LANCER L'AGENT <Zap className="w-4 h-4 ml-3" />
             </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
