

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, MessageSquare, FlaskConical, ClipboardList, 
  ArrowLeft, FileText, User, Clock, CheckCircle2, 
  AlertCircle, ChevronRight, Search, Download
} from 'lucide-react';
import { api, endpoints } from '@/services/api';
import { Badge, Button, PageLoader, Avatar } from '@/components/ui';

export default function AdminPatientJourneyPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientId) {
      api.get(endpoints.parcoursPatient(patientId))
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [patientId]);

  if (loading) return <PageLoader />;
  if (!data) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-900">Patient introuvable</h3>
      <p className="text-slate-500 max-w-xs mt-2">Le parcours de ce patient n'est pas disponible ou l'ID est incorrect.</p>
      <Button variant="outline" className="mt-6" onClick={() => navigate(-1)}>Retour</Button>
    </div>
  );

  const { patient, chronologie } = data;

  return (
    <div className="animate-fade-in space-y-8 max-w-4xl mx-auto pb-20">
      {/* ── Patient Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <div className="flex items-center gap-4">
            <Avatar size="lg" src={patient.photo} name={patient.nom_complet} />
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{patient.nom_complet}</h1>
              <div className="flex items-center gap-3 mt-1">
                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-slate-200 text-slate-500">ID: #{patient.id}</Badge>
                <span className="text-xs text-slate-400 font-medium">Parcours Hospitalier</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" size="sm" className="rounded-xl font-bold text-xs">
             <Download className="w-4 h-4 mr-2" /> Dossier Complet
           </Button>
        </div>
      </div>

      {/* ── Timeline Section ── */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-800" />

        <div className="space-y-12">
          {chronologie.map((event: any, i: number) => (
            <TimelineItem key={i} event={event} index={i} />
          ))}
        </div>

        {chronologie.length === 0 && (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-10 text-center border border-dashed border-slate-200 dark:border-slate-800">
             <Clock className="w-8 h-8 text-slate-300 mx-auto mb-3" />
             <p className="text-slate-500 font-medium">Aucun événement enregistré dans le parcours.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineItem({ event, index }: { event: any, index: number }) {
  const isConsultation = event.type === 'consultation';
  const isLabo = event.type === 'demande_analyse' || event.type === 'resultat_labo';
  const isRDV = event.type === 'rendez_vous';
  const isPreReg = event.type === 'pre_enregistrement';

  const configMap: Record<string, { icon: any; color: string; bg: string; text: string; label: string }> = {
    rendez_vous: { icon: Calendar, color: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600', label: 'Rendez-vous' },
    pre_enregistrement: { icon: ClipboardList, color: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600', label: 'Check-in Patient' },
    consultation: { icon: MessageSquare, color: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600', label: 'Consultation Médicale' },
    demande_analyse: { icon: FlaskConical, color: 'bg-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20', text: 'text-cyan-600', label: 'Demande de Labo' },
    resultat_labo: { icon: FileText, color: 'bg-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600', label: 'Résultat Biologique' }
  };
  const config = configMap[event.type as string] || { icon: Clock, color: 'bg-slate-500', bg: 'bg-slate-50', text: 'text-slate-600', label: 'Événement' };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative pl-14"
    >
      {/* Icon Node */}
      <div className={`absolute left-2.5 top-0 w-8 h-8 ${config.color} rounded-xl border-4 border-white dark:border-slate-950 shadow-sm flex items-center justify-center z-10`}>
         <config.icon className="w-4 h-4 text-white" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all group">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black uppercase tracking-widest ${config.text} ${config.bg} px-2 py-0.5 rounded`}>
              {config.label}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {new Date(event.date).toLocaleString('fr-FR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          {event.statut && (
             <Badge variant={event.statut === 'termine' || event.statut === 'cloture' ? 'success' : 'warning'} size="sm">
               {event.statut}
             </Badge>
          )}
        </div>

        {/* Content based on type */}
        <div className="space-y-3">
          {isRDV && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Rendez-vous avec {event.medecin}</p>
                {event.motif && <p className="text-xs text-slate-500 mt-0.5">Motif: {event.motif}</p>}
              </div>
              <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-primary transition-colors" />
            </div>
          )}

          {isPreReg && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Symptômes déclarés</p>
               <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">"{event.symptomes}"</p>
            </div>
          )}

          {isConsultation && (
            <div className="space-y-3">
               <div>
                 <p className="text-sm font-bold text-slate-900 dark:text-white">Rapport Médical</p>
                 <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{event.diagnostic}</p>
               </div>
               <div className="flex items-center gap-3">
                 {event.prescription_presente && (
                   <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[10px] font-bold">ORDONNANCE ÉMISE</Badge>
                 )}
                 <button className="text-xs text-primary font-bold hover:underline">Voir le rapport complet</button>
               </div>
            </div>
          )}

          {isLabo && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{event.type_analyse || event.titre}</p>
                {event.code_acces && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">Code: {event.code_acces}</span>
                  </div>
                )}
              </div>
              {event.type === 'resultat_labo' && (
                <Button size="sm" variant="outline" className="h-8 rounded-lg text-[10px] font-black uppercase">
                  Ouvrir PDF
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
