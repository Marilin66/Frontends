// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { api, endpoints } from '@/services/api';
// @ts-ignore
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
// @ts-ignore
import L from 'leaflet';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { Search, Star, ArrowLeft, MapPin, Zap, Navigation, Loader2, AlertCircle, X, List, Map, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Fix icônes Leaflet avec React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.setView(center, 13); }, [center, map]);
  return null;
}

const itemVariants: any = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

// Coordonnées par défaut : Cotonou, Bénin
const DEFAULT_CENTER: [number, number] = [6.3533, 2.4411];

export default function NearbyHospitalsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [activeHospital, setActiveHospital] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [isLoading, setIsLoading] = useState(true);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle');
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [error, setError] = useState('');
  // Vue mobile : 'list' ou 'map'
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');

  // ── Récupérer les hôpitaux ─────────────────────────────────────────────────
  const fetchHospitals = useCallback(async (lat?: number, lng?: number) => {
    try {
      setIsLoading(true);
      setError('');
      let response: any;

      if (lat !== undefined && lng !== undefined) {
        response = await api.get<any>(endpoints.hopitauxNearby, { lat, lng, radius: 20 });
      } else {
        response = await api.get<any>(endpoints.hopitaux);
      }

      const results = Array.isArray(response) ? response : response.results || [];
      const formatted = results.map((h: any) => ({
        id: h.id,
        name: h.nom,
        address: h.adresse,
        lat: parseFloat(h.latitude) || DEFAULT_CENTER[0],
        lng: parseFloat(h.longitude) || DEFAULT_CENTER[1],
        phone: h.telephone,
        rating: 4.8,
        distance: h.distance_km ? `${parseFloat(h.distance_km).toFixed(1)} km` : null,
        type: h.est_public ? 'PUBLIC' : 'PRIVÉ',
        status: h.est_actif ? 'OUVERT' : 'FERMÉ',
        nombreServices: h.nombre_services || 0,
        nombreMedecins: h.nombre_medecins || 0,
      }));

      setHospitals(formatted);
      // Ne pas sélectionner automatiquement un hôpital — le HUD ne s'affiche que sur clic
      if (formatted.length > 0 && formatted[0].lat && formatted[0].lng) {
        setMapCenter([formatted[0].lat, formatted[0].lng]);
      }
    } catch (err) {
      console.error('Erreur chargement hôpitaux:', err);
      setError('Impossible de charger les hôpitaux. Vérifiez votre connexion.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Géolocalisation ────────────────────────────────────────────────────────
  const requestGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsStatus('denied');
      fetchHospitals();
      return;
    }
    setGpsStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setGpsStatus('granted');
        setUserPosition([latitude, longitude]);
        setMapCenter([latitude, longitude]);
        fetchHospitals(latitude, longitude);
      },
      () => {
        setGpsStatus('denied');
        fetchHospitals();
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  }, [fetchHospitals]);

  useEffect(() => {
    requestGPS();
  }, []);

  const filteredHospitals = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectHospital = (hospital: any) => {
    setActiveHospital(hospital);
    if (hospital.lat && hospital.lng) {
      setMapCenter([hospital.lat, hospital.lng]);
    }
    // Sur mobile, basculer vers la carte quand on sélectionne un hôpital
    setMobileView('map');
  };

  // ── Rendu ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-slate-50/50" style={{ height: 'calc(100dvh - 5rem)' }}>
      {/* ── Header Navigation ── */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-6 shrink-0">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                 <Badge className="bg-primary/10 text-primary border-transparent font-bold text-[10px] uppercase tracking-wider">Géolocalisation</Badge>
                 {gpsStatus === 'granted' && (
                   <span className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      GPS Actif
                   </span>
                 )}
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Centres de santé à proximité</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={requestGPS}
                disabled={gpsStatus === 'loading'}
                className="rounded-xl font-bold text-sm flex items-center gap-2 border-slate-200 h-11 px-6 hover:bg-slate-50 transition-all"
              >
                {gpsStatus === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                Actualiser ma position
              </Button>
              <Button 
                onClick={() => navigate(-1)}
                className="bg-slate-900 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-slate-900/10 active:scale-95 transition-all"
              >
                Retour
              </Button>
            </div>
          </div>

          {/* Barre de recherche Premium */}
          <div className="relative group max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10" />
            <input
              placeholder="Rechercher un hôpital, une clinique ou un centre spécialisé..."
              className="w-full pl-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 text-slate-900 text-sm font-medium transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Contenu principal (Split View) ── */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row min-h-0 bg-white">
        
        {/* Toggle Mobile Liste/Carte */}
        <div className="lg:hidden flex p-4 bg-white border-b border-slate-100 shrink-0 gap-2">
           <button 
             onClick={() => setMobileView('list')}
             className={`flex-1 h-11 rounded-2xl font-bold text-xs transition-all ${mobileView === 'list' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-slate-50 text-slate-500'}`}
           >
             Liste
           </button>
           <button 
             onClick={() => setMobileView('map')}
             className={`flex-1 h-11 rounded-2xl font-bold text-xs transition-all ${mobileView === 'map' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-slate-50 text-slate-500'}`}
           >
             Carte
           </button>
        </div>

        {/* Sidebar Liste */}
        <div className={`lg:w-[420px] lg:border-r border-slate-100 lg:flex flex-col bg-white overflow-hidden ${mobileView === 'list' ? 'flex flex-1' : 'hidden'}`}>
           <div className="p-4 lg:p-6 overflow-y-auto no-scrollbar space-y-4 pb-10">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-slate-50 rounded-2xl animate-pulse border border-slate-100" />
                ))
              ) : filteredHospitals.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                     <Search className="w-8 h-8 text-slate-200" />
                  </div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Aucun établissement trouvé</p>
                </div>
              ) : (
                filteredHospitals.map((h) => (
                  <motion.div 
                    key={h.id} 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleSelectHospital(h)}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer group relative overflow-hidden ${
                      activeHospital?.id === h.id 
                      ? 'border-primary bg-primary/[0.02] shadow-xl shadow-primary/5' 
                      : 'border-slate-50 bg-white hover:border-slate-200 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <Badge className={`${h.type === 'PUBLIC' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'} font-bold text-[9px] uppercase tracking-widest`}>
                        {h.type}
                      </Badge>
                      <div className="flex items-center gap-1.5 text-amber-500 font-bold text-xs">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        {h.rating}
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors text-lg leading-snug mb-1">{h.name}</h3>
                    
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-5">
                       <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                       <span className="truncate">{h.address}</span>
                    </div>

                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         {h.distance && (
                           <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                             {h.distance}
                           </span>
                         )}
                         <span className="text-[10px] font-bold text-slate-400">{h.nombreMedecins} Praticiens</span>
                       </div>
                       <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </motion.div>
                ))
              )}
           </div>
        </div>

        {/* Map Container */}
        <div className={`flex-1 relative overflow-hidden bg-slate-100 ${mobileView === 'map' ? 'flex flex-1' : 'hidden lg:flex lg:flex-col'}`}>
          <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }} className="z-0">
            <ChangeView center={mapCenter} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* User Marker */}
            {userPosition && (
              <Marker position={userPosition} icon={L.divIcon({
                  className: '',
                  html: '<div class="w-5 h-5 bg-primary border-4 border-white rounded-full shadow-lg ring-8 ring-primary/20"></div>',
                  iconSize: [20, 20],
                  iconAnchor: [10, 10],
                })}>
                <Popup><p className="font-bold text-sm">Votre position actuelle</p></Popup>
              </Marker>
            )}
            {/* Hospital Markers */}
            {hospitals.map((h) => (
              <Marker 
                key={h.id} 
                position={[h.lat, h.lng]}
                eventHandlers={{ click: () => setActiveHospital(h) }}
              >
                <Popup>
                  <div className="p-2 min-w-[180px]">
                    <h4 className="font-bold text-slate-900 text-sm mb-1">{h.name}</h4>
                    <p className="text-[10px] text-slate-500 font-medium mb-3">{h.address}</p>
                    <Button 
                      size="sm" 
                      onClick={() => navigate(`/patient/hopital/${h.id}`)}
                      className="w-full h-8 text-[10px] font-bold uppercase rounded-lg"
                    >
                      Consulter le centre
                    </Button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Quick HUD overlay */}
          <AnimatePresence>
            {activeHospital && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                className="absolute bottom-6 left-6 right-6 lg:left-auto lg:right-6 lg:w-[360px] z-[400]"
              >
                <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 p-1">
                  <div className="bg-slate-900 p-6 rounded-[1.4rem]">
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div className="flex-1 min-w-0">
                        <Badge className="bg-primary/20 text-blue-400 border-transparent mb-3 font-bold text-[9px]">{activeHospital.type}</Badge>
                        <h3 className="text-xl font-bold text-white truncate leading-tight">
                          {activeHospital.name}
                        </h3>
                        <p className="text-slate-400 text-xs font-medium mt-1 truncate">{activeHospital.address}</p>
                      </div>
                      <button 
                        onClick={() => setActiveHospital(null)}
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                       <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Status</p>
                          <p className={`text-xs font-bold ${activeHospital.status === 'OUVERT' ? 'text-emerald-400' : 'text-rose-400'}`}>{activeHospital.status}</p>
                       </div>
                       <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Distance</p>
                          <p className="text-xs font-bold text-white">{activeHospital.distance || '--'}</p>
                       </div>
                    </div>

                    <Button 
                      onClick={() => navigate(`/patient/hopital/${activeHospital.id}/rendezvous`)}
                      className="w-full h-12 bg-primary text-white hover:bg-primary-dark font-bold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                    >
                      Prendre rendez-vous <Zap className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
