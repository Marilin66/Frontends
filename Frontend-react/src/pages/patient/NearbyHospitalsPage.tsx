// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { api, endpoints } from '@/services/api';
// @ts-ignore
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
// @ts-ignore
import L from 'leaflet';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { Search, Star, ArrowLeft, MapPin, Zap, Navigation, Loader2, AlertCircle } from 'lucide-react';
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

  // ── Récupérer les hôpitaux (avec ou sans GPS) ──────────────────────────────
  const fetchHospitals = useCallback(async (lat?: number, lng?: number) => {
    try {
      setIsLoading(true);
      setError('');
      let response: any;

      if (lat !== undefined && lng !== undefined) {
        // Utiliser l'endpoint nearby avec les coordonnées GPS
        response = await api.get<any>(endpoints.hopitauxNearby, { lat, lng, radius: 20 });
      } else {
        // Fallback : liste complète sans tri par distance
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
      if (formatted.length > 0) {
        setActiveHospital(formatted[0]);
        if (formatted[0].lat && formatted[0].lng) {
          setMapCenter([formatted[0].lat, formatted[0].lng]);
        }
      }
    } catch (err) {
      console.error('Erreur chargement hôpitaux:', err);
      setError('Impossible de charger les hôpitaux. Vérifiez votre connexion.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Demander la géolocalisation ────────────────────────────────────────────
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
        fetchHospitals(); // Fallback sans GPS
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
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col lg:flex-row gap-8 overflow-hidden">
      {/* Sidebar */}
      <div className="w-full lg:w-[420px] flex flex-col gap-6 overflow-hidden">
        <motion.div initial="hidden" animate="visible" variants={itemVariants} className="space-y-4 shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="rounded-lg h-10 w-10 p-0 border-2">
              <ArrowLeft className="w-4 h-4 text-slate-950" />
            </Button>
            <div className="bg-slate-950 text-white border-2 border-slate-900 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest italic">
              GEO_LOCATOR.
            </div>
            {/* Bouton relancer GPS */}
            <button
              onClick={requestGPS}
              disabled={gpsStatus === 'loading'}
              className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest border border-primary/20 hover:bg-primary/20 transition-all disabled:opacity-50"
            >
              {gpsStatus === 'loading' ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Navigation className="w-3 h-3" />
              )}
              {gpsStatus === 'granted' ? 'GPS actif' : 'Localiser'}
            </button>
          </div>

          <h1 className="text-3xl lg:text-4xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">
            Pôles Médicaux
          </h1>

          {/* Statut GPS */}
          {gpsStatus === 'denied' && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <p className="text-[10px] font-bold text-amber-700">
                GPS non disponible — affichage de tous les hôpitaux
              </p>
            </div>
          )}
          {gpsStatus === 'granted' && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <Navigation className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <p className="text-[10px] font-bold text-emerald-700">
                Hôpitaux triés par distance depuis votre position
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-[10px] font-bold text-red-700">{error}</p>
            </div>
          )}

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors z-10" />
            <input
              placeholder="Rechercher un hôpital..."
              className="w-full pl-11 h-12 rounded-xl bg-white border-2 border-slate-100 focus:border-primary text-slate-950 text-xs font-black transition-all shadow-sm italic placeholder:text-slate-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </motion.div>

        <div className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-4 pb-10">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
            ))
          ) : filteredHospitals.length === 0 ? (
            <div className="text-center py-16">
              <MapPin className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-sm font-black text-slate-400 uppercase italic">Aucun hôpital trouvé</p>
            </div>
          ) : (
            filteredHospitals.map((h) => (
              <motion.div key={h.id} initial="hidden" animate="visible" variants={itemVariants}>
                <Card
                  onClick={() => handleSelectHospital(h)}
                  className={`border-2 cursor-pointer transition-all duration-300 group ${
                    activeHospital?.id === h.id
                      ? 'border-primary bg-primary/5 shadow-xl'
                      : 'border-slate-100 bg-white hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <Badge
                        variant="primary"
                        className="text-[8px] px-3 font-black italic border-primary/20 bg-primary/10 text-primary"
                      >
                        {h.type}
                      </Badge>
                      <div className="flex items-center gap-2">
                        {h.distance && (
                          <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                            📍 {h.distance}
                          </span>
                        )}
                        <div className="flex items-center gap-1 text-amber-500 font-black text-[10px] italic">
                          <Star className="w-3 h-3 fill-current" />
                          {h.rating}
                        </div>
                      </div>
                    </div>
                    <h3 className="text-lg font-black text-slate-950 uppercase italic tracking-tighter leading-none mb-1">
                      {h.name}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-[9px] uppercase tracking-widest italic mb-4">
                      <MapPin className="w-3 h-3 text-slate-300" />
                      {h.address}
                    </div>
                    {(h.nombreServices > 0 || h.nombreMedecins > 0) && (
                      <div className="flex gap-3 mb-4">
                        {h.nombreServices > 0 && (
                          <span className="text-[9px] font-black text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">
                            {h.nombreServices} services
                          </span>
                        )}
                        {h.nombreMedecins > 0 && (
                          <span className="text-[9px] font-black text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">
                            {h.nombreMedecins} médecins
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2">
                      {h.phone && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 px-3 rounded-lg border-2 text-[9px] font-black italic flex-1"
                          onClick={(e: any) => { e.stopPropagation(); window.open(`tel:${h.phone}`); }}
                        >
                          APPELER
                        </Button>
                      )}
                      <Button
                        size="sm"
                        className="h-9 px-3 rounded-lg text-[9px] font-black italic flex-1 shadow-lg shadow-primary/20"
                        onClick={(e: any) => { e.stopPropagation(); navigate(`/patient/hopital/${h.id}`); }}
                      >
                        DÉTAILS
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Carte */}
      <div className="flex-1 h-full rounded-2xl lg:rounded-3xl overflow-hidden border-2 border-slate-100 shadow-2xl relative">
        <MapContainer center={mapCenter} zoom={13} className="h-full w-full z-0">
          <ChangeView center={mapCenter} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Marqueur position utilisateur */}
          {userPosition && (
            <Marker
              position={userPosition}
              icon={L.divIcon({
                className: '',
                html: '<div style="width:16px;height:16px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(59,130,246,0.3)"></div>',
                iconSize: [16, 16],
                iconAnchor: [8, 8],
              })}
            >
              <Popup>
                <p className="font-bold text-sm">Votre position</p>
              </Popup>
            </Marker>
          )}
          {/* Marqueurs hôpitaux */}
          {hospitals.map((h) => (
            <Marker
              key={h.id}
              position={[h.lat, h.lng]}
              eventHandlers={{ click: () => setActiveHospital(h) }}
            >
              <Popup>
                <div className="p-3 space-y-2 min-w-[180px]">
                  <h4 className="font-black text-slate-950 uppercase italic tracking-tighter text-sm leading-none">
                    {h.name}
                  </h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">
                    {h.address}
                  </p>
                  {h.distance && (
                    <p className="text-[10px] font-black text-emerald-600">📍 {h.distance}</p>
                  )}
                  <Button
                    size="sm"
                    onClick={() => navigate(`/patient/hopital/${h.id}`)}
                    className="w-full h-9 text-[9px] font-black italic uppercase rounded-lg"
                  >
                    VOIR LE CENTRE
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* HUD flottant hôpital actif */}
        <AnimatePresence>
          {activeHospital && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-6 left-6 right-6 lg:left-auto lg:right-6 lg:w-[320px] z-[400]"
            >
              <Card className="bg-slate-950 border-2 border-white/5 shadow-3xl text-white overflow-hidden p-0 rounded-2xl">
                <div className="bg-primary h-1.5" />
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-black italic uppercase tracking-tighter leading-none">
                      {activeHospital.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant="success"
                        className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-black uppercase tracking-widest italic"
                      >
                        {activeHospital.status}
                      </Badge>
                      {activeHospital.distance && (
                        <span className="text-[9px] font-black text-white/50 italic">
                          📍 {activeHospital.distance}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate(`/patient/hopital/${activeHospital.id}`)}
                    className="w-full h-12 bg-white text-slate-950 hover:bg-slate-100 font-black italic uppercase text-[10px] rounded-xl shadow-2xl"
                  >
                    PRENDRE RDV <Zap className="w-4 h-4 ml-2" />
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
