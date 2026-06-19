
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api, endpoints } from '@/services/api';
import type { RendezVous } from '@/types/api';
import { toArray } from '@/types/api';
import { Avatar, Badge, Button, PageLoader } from '@/components/ui';
import {
  Calendar, FileText, Plus, ChevronRight, Bot,
  Activity, Phone, FlaskConical
} from 'lucide-react';

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(endpoints.rendezVous),
      api.get(endpoints.resultats),
    ]).then(([appData, resData]: any) => {
      const apps = Array.isArray(appData) ? appData : appData.results || [];
      const res  = Array.isArray(resData)  ? resData  : resData.results  || [];
      setAppointments(apps.slice(0, 4));
      setResults(res.slice(0, 3));
    }).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <PageLoader />;

  return (
    <div className="animate-fade-in space-y-8 lg:space-y-12">
      
      {/* ── Patient Welcome Hub ── */}
      <header className="section-card p-8 lg:p-10 relative group transition-all">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 text-center md:text-left">
            <Badge className="bg-primary/10 text-primary border-transparent font-bold uppercase tracking-widest text-[10px] px-3 mb-6">
              Portail Patient
            </Badge>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
              Bonjour, <span className="text-primary">{user?.first_name}</span>.
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl leading-relaxed mb-8">
              Accédez à vos soins médicaux, téléchargez vos résultats d'analyses et gérez vos consultations en quelques clics.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Button 
                onClick={() => navigate('/patient/appointments')}
                className="w-full sm:w-auto bg-primary text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Prendre rendez-vous
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/patient/results')}
                className="w-full sm:w-auto border-slate-200 text-slate-700 font-bold h-12 px-8 rounded-xl hover:bg-slate-50 transition-all"
              >
                <FileText className="w-4 h-4 mr-2" />
                Derniers résultats
              </Button>
            </div>
          </div>

          <div className="relative">
             <div className="w-32 h-32 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-center shadow-inner group-hover:rotate-3 transition-transform">
                <Activity className="w-12 h-12 text-primary animate-pulse" />
             </div>
             <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-6 h-6 rounded-full border-4 border-white shadow-lg" />
          </div>
        </div>
      </header>

      {/* ── Main Services Grid ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { 
            title: 'Dossier Médical', 
            desc: 'Consultez votre historique, vos allergies et vos prescriptions.', 
            icon: FileText, 
            color: 'text-blue-600',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            href: '/patient/profile',
          },
          { 
            title: 'Rendez-vous', 
            desc: 'Suivez l\'état de vos demandes et préparez vos consultations.', 
            icon: Calendar, 
            color: 'text-emerald-600',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            href: '/patient/appointments',
          },
          { 
            title: 'Résultats Labo', 
            desc: 'Accédez à vos rapports d\'analyses biologiques certifiés.', 
            icon: FlaskConical,
            color: 'text-amber-600',
            bg: 'bg-amber-50 dark:bg-amber-900/20',
            href: '/patient/results',
          }
        ].map((service, i) => (
          <Link key={i} to={service.href} className="stat-card group">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${service.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <service.icon className={`w-6 h-6 ${service.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{service.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{service.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-700 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </section>

      {/* ── Interactive Tools Section ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* AI Assistant Card */}
        <div className="bg-slate-900 rounded-3xl p-8 lg:p-10 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
              <Bot className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 tracking-tight">IA Santé Hopitel</h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8 max-w-sm">
              Discutez avec notre agent intelligent pour une orientation médicale ou des informations sur les services hospitaliers.
            </p>
            <div className="mt-auto">
              <Button 
                onClick={() => navigate('/patient/ai-agent')}
                className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100 font-bold h-11 px-6 rounded-xl transition-all"
              >
                Démarrer la discussion
              </Button>
            </div>
          </div>
        </div>

        {/* Support & Urgences */}
        <div className="section-card p-8 lg:p-10 flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Phone className="w-6 h-6 text-rose-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">Centre d'Assistance</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-8 max-w-sm">
              Une urgence ? Contactez les services de secours ou consultez les numéros de garde.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-rose-50/50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/30 gap-4">
             <div className="flex items-center gap-3">
               <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
               <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 tracking-tighter">112 / 113</span>
             </div>
             <Button 
               variant="ghost" 
               onClick={() => navigate('/emergency')}
               className="text-rose-700 dark:text-rose-400 font-bold hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-xl px-4"
             >
               Plus de numéros
             </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
