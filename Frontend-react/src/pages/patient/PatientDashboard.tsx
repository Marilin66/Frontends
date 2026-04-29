// @ts-nocheck
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { api, endpoints } from '@/services/api';
import { Card, CardHeader, CardContent, Avatar, Badge, Button, PageLoader, StatusBadge } from '@/components/ui';
import { 
  Calendar,
  FileText,
  MessageCircle,
  Search,
  Clock,
  Heart,
  Zap,
  AlertCircle,
  Phone,
  Activity,
  Bot
} from 'lucide-react';

interface Appointment {
  id: number;
  medecin_nom: string;
  specialite_nom: string;
  hopital_nom: string;
  date: string;
  heure: string;
  statut: string;
}

interface Resultat {
  id: number;
  type_analyse: string;
  patient_nom: string;
  date_resultat: string;
}

const containerVariants: any = {
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

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [results, setResults] = useState<Resultat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appData, resData] = await Promise.all([
          api.get<{ results: Appointment[] }>(endpoints.rendezVous),
          api.get<{ results: Resultat[] }>(endpoints.resultats),
        ]);
        setAppointments(appData.results.slice(0, 3));
        setResults(resData.results.slice(0, 3));
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const quickActions = [
    { icon: Calendar, label: 'Prendre RDV', href: '/patient/search', color: 'primary' },
    { icon: FileText, label: 'Résultats', href: '/results', color: 'primary' },
    { icon: Search, label: 'Spécialistes', href: '/patient/search', color: 'primary' },
    { icon: MessageCircle, label: 'Messages', href: '/messages', color: 'primary' },
  ];

  if (isLoading && appointments.length === 0) return <PageLoader />;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 lg:space-y-8 pb-10"
    >
      {/* SECTION SUPÉRIEURE : Bienvenue + Actions Rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Colonne Principale (2/3) */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          
          {/* Hero Banner Web Style */}
          <motion.div variants={itemVariants} className="relative overflow-hidden bg-white border border-slate-200 rounded-[2rem] p-8 lg:p-12 shadow-sm">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-1 bg-primary rounded-full" />
                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Tableau de Bord Santé</p>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-4">
                Heureux de vous revoir, <br />
                <span className="text-primary">{user?.first_name}</span> !
              </h1>
              <p className="text-slate-500 max-w-md text-lg">
                Toutes vos données cliniques et vos rendez-vous sont centralisés et sécurisés.
              </p>
            </div>
            {/* Décoration abstraite pour le style Web Premium */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl" />
            <div className="absolute bottom-0 right-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
          </motion.div>

          {/* Quick Actions - Format Web Grille Compacte */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link key={index} to={action.href} className="group">
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 lg:p-6 hover:shadow-md hover:border-primary transition-all text-center">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-slate-50 rounded-xl mx-auto mb-3 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5 lg:w-6 lg:h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">{action.label}</p>
                  </div>
                </Link>
              );
            })}
          </motion.div>

          {/* Agenda & Résultats - Côte à côte sur Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Agenda Card */}
            <Card className="border border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 p-5">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" /> Agenda
                </h3>
                <Link to="/patient/appointments" className="text-[10px] font-bold text-primary hover:underline">TOUT VOIR</Link>
              </CardHeader>
              <CardContent className="p-4">
                {appointments.length > 0 ? (
                  <div className="space-y-3">
                    {appointments.map((app) => (
                      <div key={app.id} className="p-3 bg-slate-50 rounded-xl flex items-center gap-3">
                        <Avatar name={app.medecin_nom} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{app.medecin_nom}</p>
                          <p className="text-[10px] text-slate-500">{app.specialite_nom}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-900">{app.heure}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-10 text-xs text-slate-400">Aucun rendez-vous</p>
                )}
              </CardContent>
            </Card>

            {/* Résultats Card */}
            <Card className="border border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 p-5">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" /> Analyses
                </h3>
                <Link to="/results" className="text-[10px] font-bold text-emerald-600 hover:underline">ARCHIVES</Link>
              </CardHeader>
              <CardContent className="p-4">
                {results.length > 0 ? (
                  <div className="space-y-3">
                    {results.map((res) => (
                      <div key={res.id} className="p-3 bg-slate-50 rounded-xl flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{res.type_analyse}</p>
                        </div>
                        <Badge variant="success" className="text-[9px]">Prêt</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-10 text-xs text-slate-400">Aucun résultat</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Colonne Latérale Desktop (1/3) */}
        <div className="space-y-6">
          
          {/* Panneau Profil / Santé Rapide */}
          <Card className="bg-slate-900 text-white rounded-[2rem] p-6 lg:p-8 border-none shadow-xl">
            <div className="flex items-center gap-4 mb-8">
              <Avatar name={user?.first_name} size="lg" className="border-2 border-primary" />
              <div>
                <p className="text-sm font-bold">{user?.first_name} {user?.last_name}</p>
                <Badge variant="outline" className="text-[9px] mt-1 text-primary-light border-primary/30">PATIENT PREMIUM</Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between border border-white/10">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-primary" />
                  <span className="text-xs font-medium text-slate-300">Groupe Sanguin</span>
                </div>
                <span className="text-sm font-bold">O+</span>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between border border-white/10">
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-rose-500" />
                  <span className="text-xs font-medium text-slate-300">Poids</span>
                </div>
                <span className="text-sm font-bold">72 kg</span>
              </div>
            </div>

            <Button className="w-full mt-8 bg-primary hover:bg-primary-dark text-white rounded-xl h-12 text-xs font-bold uppercase tracking-wider">
              Mettre à jour mes constantes
            </Button>
          </Card>

          {/* Assistant IA Focus */}
          <Card className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Assistant IA</p>
                <p className="text-[10px] text-emerald-500 font-bold uppercase">En ligne</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              "Besoin d'analyser un symptôme ou de comprendre un résultat ?"
            </p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/patient/ai-agent')}
              className="w-full rounded-xl border-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50"
            >
              Lancer une consultation IA
            </Button>
          </Card>

          {/* Urgence Médicale */}
          <div className="bg-rose-50 border border-rose-100 rounded-[2rem] p-6 text-center">
            <p className="text-[10px] font-bold text-rose-600 uppercase tracking-[0.2em] mb-4">Urgence Immédiate</p>
            <a href="tel:113" className="text-3xl font-black text-rose-600 tracking-tighter flex items-center justify-center gap-3">
              113 <Phone className="w-6 h-6" />
            </a>
            <p className="text-[10px] text-rose-400 mt-2 italic">Disponible 24h/24 &bull; 7j/7</p>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
