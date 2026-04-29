import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Star, 
  Building, 
  Activity,
  Zap,
  Map as MapIcon,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { api, endpoints } from '@/services/api';

interface Hospital {
  id: number;
  nom: string;
  adresse: string;
  ville: string;
  description: string;
  services: any[];
}

export default function SearchPage() {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const response = await api.get<any>(endpoints.hopitaux);
      const raw = Array.isArray(response) ? response : (response.results || []);
      // Normalize: extract only primitive-safe fields
      const normalized = raw.map((h: any) => ({
        id: h.id,
        nom: typeof h.nom === 'string' ? h.nom : (h.nom?.nom || ''),
        adresse: typeof h.adresse === 'string' ? h.adresse : '',
        ville: typeof h.ville === 'string' ? h.ville : (h.ville?.nom || ''),
        description: typeof h.description === 'string' ? h.description : '',
        services: Array.isArray(h.services) ? h.services : [],
      }));
      setHospitals(normalized);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHospitals = hospitals.filter(h =>
    (h.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (h.ville || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 lg:space-y-12">
      {/* High-Contrast Discovery Hub */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 bg-slate-100 p-8 lg:p-10 rounded-2xl border-2 border-slate-200">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
             </div>
             <div className="bg-primary/10 text-primary border-2 border-primary/20 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest italic">
                SATELLITE_INDEX.
             </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">Explorateur Local.</h1>
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mt-4 italic">{filteredHospitals.length} Segment(s) Localisé(s)</p>
        </motion.div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-80 group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors z-10" />
             <input 
               placeholder="Filtrer les archives..." 
               className="w-full pl-12 h-12 rounded-xl bg-white border-2 border-slate-200 focus:border-primary text-slate-950 text-xs font-black transition-all shadow-sm italic uppercase placeholder:text-slate-300"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <Button variant="primary" size="md" className="h-12 px-8 rounded-xl text-[10px] w-full sm:w-auto italic">
            <MapIcon className="w-4 h-4 mr-2" /> VUE DIRECTE
          </Button>
        </div>
      </section>

      {/* Discovery Architecture */}
      <div className="grid grid-cols-1 gap-6 lg:gap-10">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-200 rounded-2xl animate-pulse" />
          ))
        ) : filteredHospitals.length > 0 ? (
          filteredHospitals.map((hospital, idx) => (
            <motion.div
              key={hospital.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card variant="default" className="group overflow-hidden border-2 border-slate-100 bg-white hover:border-primary transition-all duration-300 shadow-sm">
                <div className="flex flex-col lg:flex-row min-h-[320px] lg:min-h-[200px]">
                   <div className="w-full lg:w-48 xl:w-64 bg-slate-50 flex items-center justify-center p-12 border-b-2 lg:border-b-0 lg:border-r-2 border-slate-100 relative overflow-hidden flex-shrink-0">
                      <Building className="w-16 h-16 text-slate-300 relative z-10 group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>

                   <CardContent className="flex-1 p-6 lg:p-10 flex flex-col lg:flex-row justify-between gap-8 lg:items-center">
                     <div className="space-y-6 max-w-2xl">
                        <div className="flex items-center gap-3">
                           <div className="bg-primary text-white text-[8px] px-3 py-1 rounded-lg font-black uppercase">Core Facility</div>
                           <div className="flex items-center gap-2 text-amber-500 bg-amber-50 px-3 py-1 rounded-lg border-2 border-amber-100">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span className="text-[10px] font-black uppercase tracking-widest italic">4.9 Performance</span>
                           </div>
                        </div>
                        
                        <div className="space-y-3">
                           <h2 className="text-3xl lg:text-4xl font-black text-slate-950 tracking-tighter uppercase italic leading-none group-hover:text-primary transition-colors">
                             {hospital.nom}
                           </h2>
                           <div className="flex flex-wrap items-center gap-4 text-slate-500">
                              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border-2 border-slate-200">
                                 <MapPin className="w-4 h-4 text-primary" />
                                 <span className="text-[10px] font-black uppercase tracking-widest italic text-slate-950">{hospital.ville}</span>
                              </div>
                              <span className="text-xs font-bold text-slate-400 italic max-w-xs">{hospital.adresse}</span>
                           </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                           {(hospital.services || []).slice(0, 5).map((service, i) => (
                             <Badge key={i} variant="secondary" className="text-[8px] border-slate-300 bg-white text-slate-900 font-black px-4 py-1 shadow-sm">
                                {typeof service === 'object' ? service.nom : service}
                             </Badge>
                           ))}
                        </div>
                     </div>

                     <div className="flex flex-col lg:items-end gap-8 border-t-2 lg:border-t-0 pt-8 lg:pt-0 border-slate-100">
                        <div className="text-left lg:text-right bg-slate-900 p-6 rounded-2xl w-full lg:w-auto shadow-2xl">
                           <p className="text-4xl lg:text-5xl font-black text-white tracking-tighter leading-none italic uppercase">24/7</p>
                           <p className="text-[9px] font-black text-primary uppercase tracking-[0.4em] mt-3 italic flex lg:justify-end gap-2 items-center">
                              Active Matrix <Zap className="w-3 h-3" />
                           </p>
                        </div>
                        <Button 
                          size="lg" 
                          onClick={() => navigate(`/patient/hopital/${hospital.id}`)}
                          className="h-14 lg:h-16 px-12 rounded-2xl group/btn overflow-hidden shadow-2xl shadow-primary/20 w-fit"
                        >
                           <span className="relative z-10 flex items-center gap-4 text-[11px] font-black italic">
                              ENTRER DANS LE HUB <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                           </span>
                       </Button>
                     </div>
                   </CardContent>
                </div>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="py-32 text-center bg-slate-100 rounded-3xl border-2 border-slate-200 border-dashed">
             <AlertCircle className="w-20 h-20 text-slate-300 mx-auto mb-8" />
             <p className="text-2xl font-black text-slate-400 uppercase tracking-[0.2em] italic">Aucun segment localisé</p>
          </div>
        )}
      </div>
    </div>
  );
}
