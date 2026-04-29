// @ts-nocheck
import { useState, useEffect } from 'react';
import { api, endpoints } from '@/services/api';
// @ts-ignore
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
// @ts-ignore
import L from 'leaflet';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { Search, Star, ArrowLeft, MapPin, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Fix for default marker icons in Leaflet with React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 13);
  return null;
}

const itemVariants: any = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export default function NearbyHospitalsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [activeHospital, setActiveHospital] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([6.3533, 2.4411]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setIsLoading(true);
        const response = await api.get<any>(endpoints.hopitaux);
        const results = Array.isArray(response) ? response : response.results || [];
        const formatted = results.map((h: any) => ({
          id: h.id,
          name: h.nom,
          address: h.adresse,
          lat: parseFloat(h.latitude) || 6.3533,
          lng: parseFloat(h.longitude) || 2.4411,
          phone: h.telephone,
          rating: 4.8,
          distance: 'Segment_2KM',
          type: h.est_public ? 'PUBLIC_HUB' : 'PRIVATE_CORP',
          status: 'INDEXÉ_OUVERT'
        }));
        setHospitals(formatted);
        if (formatted.length > 0) {
          setActiveHospital(formatted[0]);
          setMapCenter([formatted[0].lat, formatted[0].lng]);
        }
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHospitals();
  }, []);

  const filteredHospitals = hospitals.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectHospital = (hospital: any) => {
    setActiveHospital(hospital);
    setMapCenter([hospital.lat, hospital.lng]);
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col lg:flex-row gap-8 overflow-hidden">
      {/* High-Contrast Navigator Sidebar */}
      <div className="w-full lg:w-[420px] flex flex-col gap-6 overflow-hidden">
        <motion.div initial="hidden" animate="visible" variants={itemVariants} className="space-y-6 shrink-0">
          <div className="flex items-center gap-3">
             <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="rounded-lg h-10 w-10 p-0 border-2">
                <ArrowLeft className="w-4 h-4 text-slate-950" />
             </Button>
             <div className="bg-slate-950 text-white border-2 border-slate-900 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest italic">
                GEO_LOCATOR.
             </div>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">Pôles Médicaux</h1>
          
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors z-10" />
            <input 
              placeholder="Scanner les centres par nom..." 
              className="w-full pl-11 h-12 rounded-xl bg-white border-2 border-slate-100 focus:border-primary text-slate-950 text-xs font-black transition-all shadow-sm italic placeholder:text-slate-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </motion.div>

        <div className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-4 pb-10">
          {isLoading ? (
             [...Array(5)].map((_, i) => <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />)
          ) : filteredHospitals.map(h => (
            <motion.div key={h.id} initial="hidden" animate="visible" variants={itemVariants}>
              <Card 
                onClick={() => handleSelectHospital(h)}
                className={`border-2 cursor-pointer transition-all duration-300 group ${activeHospital?.id === h.id ? 'border-primary bg-primary/5 shadow-xl' : 'border-slate-100 bg-white hover:border-slate-300 shadow-sm'}`}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="primary" className="text-[8px] px-3 font-black italic border-primary/20 bg-primary/10 text-primary">
                      {h.type}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-amber-500 font-black text-[10px] italic">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {h.rating}
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-slate-950 uppercase italic tracking-tighter leading-none mb-2">{h.name}</h3>
                  <div className="flex items-center gap-2 text-slate-400 font-bold text-[9px] uppercase tracking-widest italic mb-6">
                    <MapPin className="w-3.5 h-3.5 text-slate-300" />
                    {h.address} • {h.distance}
                  </div>
                  <div className="flex gap-3">
                     <Button variant="outline" size="sm" className="h-10 px-4 rounded-lg border-2 text-[9px] font-black italic flex-1">
                        ITINÉRAIRE
                     </Button>
                     <Button size="sm" className="h-10 px-4 rounded-lg text-[9px] font-black italic flex-1 shadow-lg shadow-primary/20">
                        DÉTAILS SYNC
                     </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Strategic Map Viewport */}
      <div className="flex-1 h-full rounded-2xl lg:rounded-3xl overflow-hidden border-2 border-slate-100 shadow-2xl relative">
        <MapContainer 
          center={mapCenter} 
          zoom={13} 
          className="h-full w-full z-0"
        >
          <ChangeView center={mapCenter} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {hospitals.map(h => (
            <Marker 
              key={h.id} 
              position={[h.lat, h.lng]}
              eventHandlers={{
                click: () => setActiveHospital(h),
              }}
            >
              <Popup>
                <div className="p-4 space-y-3 min-w-[200px]">
                  <h4 className="font-black text-slate-950 uppercase italic tracking-tighter text-sm leading-none">{h.name}</h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">{h.address}</p>
                  <Button size="sm" onClick={() => navigate(`/patient/hopital/${h.id}`)} className="w-full h-10 text-[9px] font-black italic uppercase rounded-lg shadow-lg shadow-primary/20">VISUALISER LE CENTRE</Button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Tactical Floating HUD */}
        <AnimatePresence>
          {activeHospital && (
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 20 }}
               className="absolute bottom-6 left-6 right-6 lg:left-auto lg:right-6 lg:w-[340px] z-[400]"
            >
               <Card className="bg-slate-950 border-2 border-white/5 shadow-3xl text-white overflow-hidden p-0 rounded-2xl">
                 <div className="bg-primary h-1.5 animate-pulse" />
                 <div className="p-8 space-y-6">
                   <div className="space-y-1">
                      <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none">{activeHospital.name}</h3>
                      <div className="flex items-center gap-3 mt-3">
                        <Badge variant="success" className="bg-emerald-500/10 text-emerald-500 border-2 border-emerald-500/20 text-[8px] font-black uppercase tracking-widest italic">{activeHospital.status}</Badge>
                        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest italic">{activeHospital.phone}</span>
                      </div>
                   </div>
                   <Button onClick={() => navigate(`/patient/hopital/${activeHospital.id}`)} className="w-full h-14 bg-white text-slate-950 hover:bg-slate-100 font-black italic uppercase text-[10px] rounded-xl shadow-2xl">
                     RESERVER UN SEGMENT <Zap className="w-4 h-4 ml-3" />
                   </Button>
                 </div>
               </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
