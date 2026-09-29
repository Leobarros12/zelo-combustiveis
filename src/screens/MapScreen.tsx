import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mic, Navigation2, Star, MapPin, MessageSquare, Crosshair, X, AlertCircle } from 'lucide-react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PriceReportModal } from '../components/ui/PriceReportModal';
import type { Station } from '../App';

// Fix Leaflet marker icons in bundlers
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapScreenProps {
  station: Station | null;
}

interface RouteInfo {
  distanceKm: string;
  durationMin: number;
}

const ALL_STATIONS: Station[] = [
  {
    id: 1,
    name: 'Posto Shell Pituba',
    price: 5.49,
    distance: '1,2 km',
    address: 'Av. Manoel Dias da Silva, 1420 - Pituba',
    updated: 'Atualizado há 10 min',
    logoBg: 'bg-yellow-400',
    logoInitials: 'SH',
    lat: -13.0038,
    lng: -38.4608
  },
  {
    id: 2,
    name: 'Posto Ipiranga Centro',
    price: 5.52,
    distance: '2,5 km',
    address: 'Av. Sete de Setembro, 880 - Centro',
    updated: 'Atualizado há 14 min',
    logoBg: 'bg-blue-500',
    logoInitials: 'IP',
    lat: -12.9835,
    lng: -38.5135
  },
  {
    id: 3,
    name: 'BR Mania Barra',
    price: 5.59,
    distance: '3,8 km',
    address: 'Av. Oceânica, 422 - Barra',
    updated: 'Atualizado há 25 min',
    logoBg: 'bg-green-500',
    logoInitials: 'BR',
    lat: -13.0094,
    lng: -38.5284
  },
  {
    id: 4,
    name: 'Posto Ale Itapuã',
    price: 5.67,
    distance: '5,1 km',
    address: 'Rua Dorival Caymmi, 310 - Itapuã',
    updated: 'Atualizado há 40 min',
    logoBg: 'bg-red-500',
    logoInitials: 'AL',
    lat: -12.9348,
    lng: -38.3615
  }
];

// Default Salvador location (Pituba)
const DEFAULT_USER_LOCATION: [number, number] = [-12.9922, -38.4685];

export function MapScreen({ station: initialStation }: MapScreenProps) {
  const [selectedStation, setSelectedStation] = useState<Station>(() => {
    return initialStation || ALL_STATIONS[0];
  });
  const [reportOpen, setReportOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number]>(DEFAULT_USER_LOCATION);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routingControlRef = useRef<L.Routing.Control | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Sync selectedStation if initialStation prop updates
  useEffect(() => {
    if (initialStation) {
      setSelectedStation(initialStation);
    }
  }, [initialStation]);

  // 1. Get user geolocation
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(coords);
          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng(coords);
          }
        },
        (error) => {
          console.log('Using default geolocation due to:', error.message);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialCenter = selectedStation.lat && selectedStation.lng
      ? [selectedStation.lat, selectedStation.lng] as [number, number]
      : DEFAULT_USER_LOCATION;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 14,
      zoomControl: false,
    });

    // Clean and modern CartoDB Voyager tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // User location marker
    const userIcon = L.divIcon({
      className: 'user-marker-container',
      html: `
        <div class="relative flex items-center justify-center w-8 h-8">
          <div class="absolute w-8 h-8 rounded-full bg-emerald-500/20 animate-pulse-ring"></div>
          <div class="w-4 h-4 rounded-full bg-emerald-600 border-2 border-white shadow-md"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const userMarker = L.marker(userLocation, { icon: userIcon }).addTo(map);
    userMarker.bindPopup('<b style="font-family: sans-serif;">Você está aqui</b>');
    userMarkerRef.current = userMarker;

    // Add station markers
    ALL_STATIONS.forEach((st) => {
      if (!st.lat || !st.lng) return;

      const isSelected = selectedStation.id === st.id;
      const pinIcon = L.divIcon({
        className: `station-pin-${st.id}`,
        html: `
          <div class="cursor-pointer transition-transform transform hover:scale-110 active:scale-95 flex flex-col items-center">
            <div class="${isSelected ? 'bg-emerald-700 ring-2 ring-emerald-400' : 'bg-emerald-600'} text-white font-bold text-[11px] px-2.5 py-1 rounded-full shadow-lg border border-white flex items-center gap-1 whitespace-nowrap">
              <span>R$ ${st.price.toFixed(2).replace('.', ',')}</span>
            </div>
            <div class="w-0 h-0 border-l-[5px] border-l-transparent border-t-[6px] ${isSelected ? 'border-t-emerald-700' : 'border-t-emerald-600'} border-r-[5px] border-r-transparent"></div>
          </div>
        `,
        iconSize: [60, 30],
        iconAnchor: [30, 28],
      });

      const marker = L.marker([st.lat, st.lng], { icon: pinIcon }).addTo(map);
      marker.on('click', () => {
        setSelectedStation(st);
      });
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 3. Clear route helper
  const clearRoute = () => {
    if (routingControlRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }
    setRouteInfo(null);
    setIsNavigating(false);
    setRouteError(null);
  };

  // 4. Calculate route when user requests or when station changes while navigating
  const calculateRoute = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!selectedStation.lat || !selectedStation.lng) {
      setRouteError('Coordenadas do posto indisponíveis.');
      return;
    }

    clearRoute();
    setIsCalculatingRoute(true);
    setRouteError(null);

    try {
      const startPoint = L.latLng(userLocation[0], userLocation[1]);
      const endPoint = L.latLng(selectedStation.lat, selectedStation.lng);

      const routingControl = L.Routing.control({
        waypoints: [startPoint, endPoint],
        routeWhileDragging: false,
        addWaypoints: false,
        showAlternatives: false,
        fitSelectedRoutes: true,
        show: false,
        lineOptions: {
          styles: [
            { color: '#047857', opacity: 0.9, weight: 6 },
            { color: '#34d399', opacity: 0.8, weight: 3 },
          ],
          extendToWaypoints: true,
          missingRouteStyles: [{ color: '#f59e0b', opacity: 0.7, weight: 4 }],
          missingRouteTolerance: 1,
        },
      });

      routingControl.on('routesfound', (e: { routes: Array<{ summary: { totalDistance: number; totalTime: number } }> }) => {
        setIsCalculatingRoute(false);
        setIsNavigating(true);
        if (e.routes && e.routes[0]) {
          const summary = e.routes[0].summary;
          const distKm = (summary.totalDistance / 1000).toFixed(1).replace('.', ',') + ' km';
          const durMin = Math.max(1, Math.round(summary.totalTime / 60));
          setRouteInfo({
            distanceKm: distKm,
            durationMin: durMin,
          });
        }
      });

      routingControl.on('routingerror', () => {
        setIsCalculatingRoute(false);
        setRouteError('Não foi possível calcular o trajeto via OSRM. Tente novamente.');
      });

      routingControl.addTo(map);
      routingControlRef.current = routingControl;
    } catch (err) {
      console.error('Error instantiating routing control:', err);
      setIsCalculatingRoute(false);
      setRouteError('Erro ao inicializar cálculo de rota.');
    }
  };

  // Center map on user
  const handleCenterUser = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(userLocation, 15, { duration: 1 });
    }
  };

  // Center map on selected station
  const handleCenterStation = () => {
    if (mapInstanceRef.current && selectedStation.lat && selectedStation.lng) {
      mapInstanceRef.current.flyTo([selectedStation.lat, selectedStation.lng], 15, { duration: 1 });
    }
  };

  // External GPS Launchers
  const openWaze = () => {
    if (selectedStation.lat && selectedStation.lng) {
      window.open(`https://waze.com/ul?ll=${selectedStation.lat},${selectedStation.lng}&navigate=yes`, '_blank');
    }
  };

  const openGoogleMaps = () => {
    if (selectedStation.lat && selectedStation.lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedStation.lat},${selectedStation.lng}`, '_blank');
    }
  };

  return (
    <div className="relative h-full w-full flex flex-col overflow-hidden bg-gray-100">
      {/* Search Bar & Actions Overlay */}
      <div className="absolute top-4 left-4 right-4 z-[500] flex flex-col gap-2">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3 border border-gray-100">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar posto ou combustível..." 
            className="flex-1 bg-transparent outline-none text-gray-800 text-sm placeholder:text-gray-400"
          />
          <Mic size={18} className="text-gray-400 cursor-pointer hover:text-emerald-600 transition-colors" />
        </div>

        {/* Real-time Navigation Banner */}
        <AnimatePresence>
          {isNavigating && routeInfo && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="bg-emerald-700 text-white rounded-2xl p-3.5 shadow-xl flex items-center justify-between border border-emerald-500/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Navigation2 size={20} className="fill-white rotate-45" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-lg leading-tight">{routeInfo.durationMin} min</span>
                    <span className="text-xs text-emerald-200 font-medium">({routeInfo.distanceKm})</span>
                  </div>
                  <p className="text-xs text-emerald-100 line-clamp-1">
                    Rota até {selectedStation.name}
                  </p>
                </div>
              </div>
              <button
                onClick={clearRoute}
                className="p-1.5 rounded-full hover:bg-white/20 active:scale-90 transition-all text-white/80 hover:text-white"
                title="Fechar rota"
              >
                <X size={18} />
              </button>
            </motion.div>
          )}

          {routeError && (
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 text-xs flex items-center gap-2 shadow-sm"
            >
              <AlertCircle size={16} className="shrink-0 text-red-500" />
              <span>{routeError}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Map Controls */}
      <div className="absolute right-4 bottom-72 z-[500] flex flex-col gap-2">
        <button
          onClick={handleCenterUser}
          className="w-10 h-10 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-700 hover:text-emerald-600 active:scale-90 transition-all"
          title="Minha localização"
        >
          <Crosshair size={18} />
        </button>
        <button
          onClick={handleCenterStation}
          className="w-10 h-10 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-700 hover:text-emerald-600 active:scale-90 transition-all"
          title="Ver posto"
        >
          <MapPin size={18} />
        </button>
      </div>

      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Bottom Sheet Card */}
      <div className="absolute bottom-4 left-4 right-4 z-[500]">
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
        >
          <Card className="p-4 shadow-2xl border border-gray-100/80 bg-white/95 backdrop-blur-md rounded-3xl">
            <div className="flex justify-between items-start mb-3">
              <div className="flex gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-xs shadow-sm ${selectedStation.logoBg}`}>
                  {selectedStation.logoInitials}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base leading-tight">{selectedStation.name}</h3>
                  <div className="flex items-center text-gray-500 text-xs mt-0.5 gap-2">
                    <span>Gasolina Comum</span>
                    <span className="flex items-center text-amber-500 gap-0.5 font-semibold">
                      <Star size={11} className="fill-amber-500" /> 4.5
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-emerald-600 font-extrabold text-xl leading-tight">
                  R$ {selectedStation.price.toFixed(2).replace('.', ',')}
                </div>
                <div className="text-[10px] text-gray-400 font-medium">/litro</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 mb-4 bg-gray-50 p-2.5 rounded-xl">
              <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                <MapPin size={13} className="text-gray-400 shrink-0" />
                <span className="truncate">{selectedStation.address}</span>
              </div>
              <div className="font-bold text-gray-800 bg-white px-2 py-0.5 rounded-md shadow-xs shrink-0">
                {routeInfo ? routeInfo.distanceKm : selectedStation.distance}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              {isNavigating ? (
                <div className="flex gap-2">
                  <Button 
                    onClick={clearRoute} 
                    variant="outline" 
                    className="flex-1 text-xs font-semibold py-2.5 rounded-2xl border-gray-300 text-gray-700"
                  >
                    Encerrar Trajeto
                  </Button>
                  <Button 
                    onClick={calculateRoute} 
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 rounded-2xl gap-1.5"
                  >
                    <Navigation2 size={15} className="fill-white" />
                    Recalcular
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={calculateRoute} 
                  disabled={isCalculatingRoute}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-sm font-bold py-3 rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all"
                >
                  <Navigation2 size={18} className="fill-white" />
                  {isCalculatingRoute ? 'Calculando trajeto...' : 'Traçar rota no mapa (Zelo)'}
                </Button>
              )}

              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  onClick={openWaze}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 border border-gray-200 hover:border-gray-300 text-gray-600 rounded-xl text-xs font-medium hover:bg-gray-50 active:scale-95 transition-all"
                >
                  <Navigation2 size={13} />
                  <span>Waze</span>
                </button>
                <button
                  onClick={openGoogleMaps}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 border border-gray-200 hover:border-gray-300 text-gray-600 rounded-xl text-xs font-medium hover:bg-gray-50 active:scale-95 transition-all"
                >
                  <MapPin size={13} />
                  <span>Google Maps</span>
                </button>
              </div>

              {/* Report / Confirm price */}
              <button
                onClick={() => setReportOpen(true)}
                className="w-full flex items-center justify-center gap-1.5 text-gray-500 hover:text-amber-600 text-xs font-medium py-2 rounded-xl transition-colors"
              >
                <MessageSquare size={13} />
                <span>Confirmar ou reportar preço</span>
              </button>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Price Report Modal */}
      <PriceReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        station={selectedStation}
      />
    </div>
  );
}

