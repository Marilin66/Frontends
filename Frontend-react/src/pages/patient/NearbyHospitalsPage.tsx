// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { api, endpoints } from '@/services/api';
// @ts-ignore
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
// @ts-ignore
import L from 'leaflet';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { Search, Star, ArrowLeft, MapPin, Zap, Navigation, Loader2, AlertCircle, X, List, Map } from 'lucide-react';
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
    <div className="flex flex-col h-full" style={{ height: 'calc(100dvh - 8rem)' }}>

      {/* ── En-tête ── */}
      <div className="shrink-0 space-y-3 pb-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="rounded-lg h-10 w-10 p-0 border-2 shrink-0">
            <ArrowLeft className="w-4 h-4 text-slate-950" />
          </Button>
          <div className="bg-slate-950 text-white border-2 border-slate-900 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest italic shrink-0">
            GEO_LOCATOR.
          </div>
          <button
            onClick={requestGPS}
            disabled={gpsStatus === 'loading'}
            className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest border border-primary/20 hover:bg-primary/20 transition-all disabled:opacity-50 shrink-0"
          >
            {gpsStatus === 'loading' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
            {gpsStatus === 'granted' ? 'GPS actif' : 'Localiser'}
          </button>
        </div>

        <h1 className="text-2xl lg:text-4xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">
          Pôles Médicaux
        </h1>

        {/* Statuts */}
        {gpsStatus === 'denied' && (
          <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-[10px] font-bold text-amber-700">GPS non disponible — affichage de tous les hôpitaux</p>
          </div>
        )}
        {gpsStatus === 'granted' && (
          <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
            <Navigation className="w-4 h-4 text-emerald-600 shrink-0" />
            <p className="text-[10px] font-bold text-emerald-700">Hôpitaux triés par distance depuis votre position</p>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <p className="text-[10px] font-bold text-red-700">{error}</p>
          </div>
        )}

        {/* Barre de recherche */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors z-10" />
          <input
            placeholder="Rechercher un hôpital..."
            className="w-full pl-11 h-11 rounded-xl bg-white border-2 border-slate-100 focus:border-primary text-slate-950 text-xs font-black transition-all shadow-sm italic placeholder:text-slate-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Toggle Liste / Carte — mobile uniquement */}
        <div className="flex lg:hidden gap-2">
          <button
            onClick={() => setMobileView('list')}
            className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${
              mobileView === 'list'
                ? 'bg-slate-950 text-white border-slate-950'
                : 'bg-white text-slate-500 border-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" /> Liste
          </button>
          <button
            onClick={() => setMobileView('map')}
            className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${
              mobileView === 'map'
                ? 'bg-slate-950 text-white border-slate-950'
                : 'bg-white text-slate-500 border-slate-200'
            }`}
          >
            <Map className="w-3.5 h-3.5" /> Carte
          </button>
        </div>
      </div>

      {/* ── Contenu principal ── */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-4 min-h-0">

        {/* Sidebar liste — visible sur desktop, ou sur mobile si mobileView='list' */}
        <div className={`lg:w-[400px] lg:flex flex-col overflow-hidden ${mobileView === 'list' ? 'flex flex-1' : 'hidden'}`}>
          <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-3 pb-4">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
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
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <Badge
                          variant="primary"
                          className="text-[8px] px-2 font-black italic border-primary/20 bg-primary/10 text-primary"
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
                      <h3 className="text-base font-black text-slate-950 uppercase italic tracking-tighter leading-none mb-1">
                        {h.name}
                      </h3>
                      <div className="flex items-center gap-2 text-slate-400 font-bold text-[9px] uppercase tracking-widest italic mb-3">
                        <MapPin className="w-3 h-3 text-slate-300 shrink-0" />
                        <span className="truncate">{h.address}</span>
                      </div>
                      <div className="flex gap-2">
                        {h.phone && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 rounded-lg border-2 text-[9px] font-black italic flex-1"
                            onClick={(e: any) => { e.stopPropagation(); window.open(`tel:${h.phone}`); }}
                          >
                            APPELER
                          </Button>
                        )}
                        <Button
                          size="sm"
                          className="h-8 px-3 rounded-lg text-[9px] font-black italic flex-1 shadow-lg shadow-primary/20"
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

        {/* Carte — visible sur desktop, ou sur mobile si mobileView='map' */}
        <div className={`flex-1 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-xl relative min-h-0 ${mobileView === 'map' ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'}`}>
          <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }} className="z-0 flex-1">
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
                <Popup><p className="font-bold text-sm">Votre position</p></Popup>
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
                  <div className="p-2 space-y-2 min-w-[160px]">
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
                      className="w-full h-8 text-[9px] font-black italic uppercase rounded-lg"
                    >
                      VOIR LE CENTRE
                    </Button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* HUD hôpital actif — affiché uniquement si l'utilisateur a cliqué sur un hôpital */}
          <AnimatePresence>
            {activeHospital && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:w-[300px] z-[400]"
              >
                <div className="bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                  <div className="bg-primary h-1" />
                  <div className="p-4 space-y-3">
                    {/* Bouton fermer */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-black italic uppercase tracking-tighter leading-none text-white truncate">
                          {activeHospital.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`text-[8px] font-black uppercase tracking-widest italic px-2 py-0.5 rounded-md border ${
                            activeHospital.status === 'OUVERT'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {activeHospital.status}
                          </span>
                          {activeHospital.distance && (
                            <span className="text-[9px] font-black text-white/50 italic">
                              📍 {activeHospital.distance}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Bouton fermer le HUD */}
                      <button
                        onClick={() => setActiveHospital(null)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-all shrink-0"
                      >
                        <X className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                    <Button
                      onClick={() => navigate(`/patient/hopital/${activeHospital.id}`)}
                      className="w-full h-10 bg-white text-slate-950 hover:bg-slate-100 font-black italic uppercase text-[10px] rounded-xl"
                    >
                      PRENDRE RDV <Zap className="w-3.5 h-3.5 ml-2" />
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
