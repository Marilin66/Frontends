
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { api, endpoints } from '@/services/api';
import { 
  Card, 
  Button, 
  Badge, 
  PageLoader
} from '@/components/ui';
import { 
  MapPin, 
  Phone, 
  Globe, 
  ArrowLeft, 
  Share,
  Building,
  Stethoscope,
  Star,
  ArrowRight,
  Clock,
  Calendar
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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
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
      className="max-w-7xl mx-auto space-y-8 lg:space-y-12 pb-20"
    >
      {/* ── Header & Navigation ── */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <motion.div variants={itemVariants} className="space-y-4">
          <Link to="/patient/search" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary font-bold text-sm transition-colors group">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Retour à la recherche
          </Link>
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {hospital.nom}
            </h1>
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{hospital.ville}, Bénin</span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex items-center gap-3">
          <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50">
            <Share className="w-4 h-4 mr-2" /> Partager
          </Button>
          <Button 
            onClick={() => navigate(`/patient/hopital/${hospital.id}/rendezvous`)}
            className="h-12 px-8 rounded-2xl bg-primary text-white font-bold shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Calendar className="w-4 h-4 mr-2" /> Prendre rendez-vous
          </Button>
        </motion.div>
      </section>

      {/* ── Hospital Identity Card ── */}
      <motion.div variants={itemVariants}>
        <div className="relative bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl p-8 lg:p-12 group">
          <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px] -ml-24 -mb-24" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row gap-10 lg:items-center">
            {/* Logo Wrapper */}
            <div className="w-32 h-32 lg:w-48 lg:h-48 bg-white rounded-3xl flex items-center justify-center p-6 shadow-2xl transition-transform duration-500 group-hover:scale-105">
               {hospital.logo ? (
                 <img src={hospital.logo} alt={hospital.nom} className="w-full h-full object-contain" />
               ) : (
                 <Building className="w-16 h-16 text-slate-200" />
               )}
            </div>

            <div className="flex-1 space-y-8">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-transparent px-4 py-1.5 font-bold rounded-xl text-[10px] uppercase tracking-wider">
                    Opérationnel 24/7
                  </Badge>
                  <Badge className="bg-primary/20 text-primary-foreground border-transparent px-4 py-1.5 font-bold rounded-xl text-[10px] uppercase tracking-wider">
                    Centre Agréé Hopitel
                  </Badge>
                </div>
                <p className="text-slate-300 text-lg lg:text-xl font-medium leading-relaxed max-w-3xl">
                  {hospital.description || "Établissement de santé partenaire engagé dans l'excellence opérationnelle et la prise en charge patient de haute qualité."}
                </p>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-white/10">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Localisation</p>
                  <p className="text-white font-bold text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" /> {hospital.adresse}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contact</p>
                  <p className="text-white font-bold text-sm flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" /> {hospital.telephone || "+229 01 00 00 00"}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Plateforme Web</p>
                  <a href={hospital.site_web || "#"} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-white font-bold text-sm flex items-center gap-2 transition-colors">
                    <Globe className="w-4 h-4" /> {hospital.site_web ? hospital.site_web.replace(/^https?:\/\//, '') : "hopitel.bj"}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Services Section ── */}
      <section className="space-y-8">
        <motion.div variants={itemVariants} className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">Services Cliniques</h2>
          </div>
          <p className="text-slate-500 font-medium pl-14">
            {services.length} unités de spécialisation disponibles pour vous.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((s) => (
            <motion.div key={s.id} variants={itemVariants}>
              <Card 
                className="h-full border border-slate-100 bg-white dark:bg-slate-900 hover:border-primary transition-all duration-300 group p-8 flex flex-col justify-between shadow-sm hover:shadow-xl rounded-[2rem] cursor-pointer"
                onClick={() => navigate(`/patient/hopital/${hospital.id}/service/${s.service}`)}
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                      <Building className="w-7 h-7" />
                    </div>
                    <div className="flex items-center gap-1">
                       {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 text-amber-400 fill-current" />)}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-xl lg:text-2xl font-bold text-slate-900 group-hover:text-primary transition-colors tracking-tight leading-tight">
                      {s.service_nom}
                    </h3>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-3">
                      {s.service_description || "Prise en charge spécialisée avec des protocoles cliniques de pointe."}
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-500 font-bold text-[10px] uppercase tracking-wider">
                     <Clock className="w-4 h-4" />
                     Disponible
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
