// @ts-nocheck
import { useState, useEffect } from 'react';
import { api, endpoints } from '@/services/api';
import { Card, Badge, Button } from '@/components/ui';
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
  ArrowRight,
  BookOpen
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
    transition: { duration: 0.5, ease: 'easeOut' }
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
      className="max-w-6xl mx-auto space-y-8 lg:space-y-16 pb-24"
    >
      {/* ── Header ── */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-4 lg:px-0">
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center gap-3">
             <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="rounded-xl h-10 w-10 p-0 border-slate-200">
                <ArrowLeft className="w-4 h-4 text-slate-600" />
             </Button>
             <Badge className="bg-primary/10 text-primary border-transparent font-bold text-[10px] uppercase tracking-wider">Guide Santé</Badge>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">Nos services & conseils</h1>
            <p className="text-slate-500 font-medium text-lg lg:text-xl">
              Découvrez les spécialités médicales disponibles sur Hopitel.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── Services Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 px-4 lg:px-0">
        {isLoading ? (
          [...Array(6)].map((_, i) => <div key={i} className="h-72 bg-slate-50 rounded-3xl animate-pulse border border-slate-100" />)
        ) : services.map((service, i) => {
          const Icon = getIconForService(service.nom);
          return (
            <motion.div key={i} variants={itemVariants}>
              <Card className="h-full border border-slate-100 bg-white hover:border-primary transition-all duration-300 group overflow-hidden shadow-sm hover:shadow-xl p-8 rounded-[2.5rem] flex flex-col justify-between">
                <div className="space-y-8">
                  <div className="flex justify-between items-start">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                      <Icon className="w-7 h-7" />
                    </div>
                    <Badge className="text-[10px] px-3 font-bold bg-emerald-50 text-emerald-600 border-transparent uppercase tracking-wider">Expertise</Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-xl lg:text-2xl font-bold text-slate-900 group-hover:text-primary transition-colors tracking-tight leading-tight">{service.nom}</h3>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-4">
                      {service.description || "Découvrez nos protocoles de soins spécialisés et bénéficiez de l'accompagnement de nos experts certifiés pour votre suivi médical."}
                    </p>
                  </div>
                </div>

                <div className="pt-8 mt-4 border-t border-slate-50">
                  <Button 
                    onClick={() => navigate('/patient/search')}
                    variant="ghost" 
                    className="text-primary hover:text-primary-dark font-bold text-sm p-0 h-auto flex items-center gap-2 group-hover:translate-x-1 transition-all"
                  >
                    Trouver un praticien <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ── AI Banner Premium ── */}
      <motion.div variants={itemVariants} className="px-4 lg:px-0">
        <div className="bg-slate-900 text-white rounded-[3rem] overflow-hidden relative group p-8 lg:p-16 shadow-2xl">
          <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px] -ml-24 -mb-24" />
          </div>
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
             <div className="w-20 h-20 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl flex items-center justify-center flex-shrink-0 shadow-2xl">
                <Sparkles className="w-10 h-10 text-primary" />
             </div>
             <div className="flex-1 space-y-6 text-center lg:text-left">
                <div className="space-y-4">
                   <Badge className="bg-primary/20 text-blue-400 border-transparent font-bold text-[10px] uppercase tracking-wider">Assistant IA Hopitel</Badge>
                   <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight leading-tight">Une question de santé ?</h2>
                </div>
                <p className="text-slate-400 text-lg lg:text-xl font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Besoin d'un conseil rapide ou d'une recommandation personnalisée ? Discutez avec notre intelligence artificielle pour un premier niveau d'analyse.
                </p>
                <div className="pt-4">
                  <Button onClick={() => navigate('/patient/ai-agent')} className="w-full lg:w-auto h-16 px-12 bg-primary text-white hover:bg-primary-dark rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                    Démarrer la discussion <Zap className="w-5 h-5 ml-2" />
                  </Button>
                </div>
             </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
