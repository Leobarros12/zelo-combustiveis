import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Mic, 
  Navigation2, 
  Star, 
  MapPin, 
  MessageSquare, 
  Crosshair, 
  X, 
  AlertCircle,
  Compass,
  Sparkles,
  Fuel,
  ArrowRight,
  TrendingDown,
  CornerUpRight,
  CornerUpLeft,
  ArrowUp,
  Volume2,
  VolumeX,
  ShieldCheck,
  StopCircle
} from 'lucide-react';
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
  durationText: string;
  totalDistanceMeters: number;
  totalDurationSeconds: number;
  instructions?: Array<{
    text: string;
    distance: number;
    time: number;
    type?: string;
  }>;
}

interface DestinationCity {
  name: string;
  state: string;
  lat: number;
  lng: number;
  popular?: boolean;
}

// Local Salvador Stations
const LOCAL_STATIONS: Station[] = [
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

// Highway & Interstate Stations (Rotas Rodoviárias)
const HIGHWAY_STATIONS: Station[] = [
  {
    id: 101,
    name: 'Posto Ipiranga Litoral Norte',
    price: 5.39,
    distance: '38 km de Salvador',
    address: 'BA-099 Km 28 - Arembepe, Camaçari - BA',
    updated: 'Atualizado há 15 min',
    logoBg: 'bg-blue-500',
    logoInitials: 'IP',
    lat: -12.7483,
    lng: -38.1742
  },
  {
    id: 102,
    name: 'Posto Shell Guarajuba',
    price: 5.29,
    distance: '52 km de Salvador',
    address: 'BA-099 Km 42 - Guarajuba, Camaçari - BA',
    updated: 'Atualizado há 20 min',
    logoBg: 'bg-yellow-400',
    logoInitials: 'SH',
    lat: -12.6450,
    lng: -38.0750
  },
  {
    id: 103,
    name: 'Posto Menor Preço Praia do Forte',
    price: 5.19,
    distance: '75 km de Salvador',
    address: 'BA-099 Km 60 - Mata de São João - BA',
    updated: 'Atualizado há 35 min',
    logoBg: 'bg-emerald-600',
    logoInitials: 'MP',
    lat: -12.5650,
    lng: -38.0120
  },
  {
    id: 104,
    name: 'Posto BR Parada Obrigatória - Conde',
    price: 4.89,
    distance: '168 km de Salvador',
    address: 'Linha Verde BA-099 Km 154 - Conde - BA',
    updated: 'Atualizado há 8 min',
    logoBg: 'bg-green-600',
    logoInitials: 'BR',
    lat: -11.8150,
    lng: -37.6100
  },
  {
    id: 105,
    name: 'Posto Ipiranga Estância',
    price: 5.15,
    distance: '255 km de Salvador',
    address: 'BR-101 Km 148 - Estância - SE',
    updated: 'Atualizado há 45 min',
    logoBg: 'bg-blue-500',
    logoInitials: 'IP',
    lat: -11.2680,
    lng: -37.4350
  },
  {
    id: 106,
    name: 'Posto Shell Trevo Aracaju',
    price: 5.25,
    distance: '318 km de Salvador',
    address: 'Av. Tancredo Neves, 1100 - Aracaju - SE',
    updated: 'Atualizado há 12 min',
    logoBg: 'bg-yellow-400',
    logoInitials: 'SH',
    lat: -10.9472,
    lng: -37.0731
  },
  {
    id: 107,
    name: 'Posto São Gonçalo BR-324',
    price: 5.09,
    distance: '85 km de Salvador',
    address: 'BR-324 Km 524 - São Gonçalo dos Campos - BA',
    updated: 'Atualizado há 22 min',
    logoBg: 'bg-red-600',
    logoInitials: 'SG',
    lat: -12.4300,
    lng: -38.8600
  },
  {
    id: 108,
    name: 'Posto Graal Feira de Santana',
    price: 4.95,
    distance: '108 km de Salvador',
    address: 'BR-324 Km 518 - Feira de Santana - BA',
    updated: 'Atualizado há 18 min',
    logoBg: 'bg-amber-500',
    logoInitials: 'GR',
    lat: -12.2660,
    lng: -38.9660
  },
  {
    id: 109,
    name: 'Posto Ipiranga Gandu BR-101',
    price: 5.08,
    distance: '200 km de Salvador',
    address: 'BR-101 Km 370 - Gandu - BA',
    updated: 'Atualizado há 1 hora',
    logoBg: 'bg-blue-500',
    logoInitials: 'IP',
    lat: -13.7430,
    lng: -39.4860
  },
  {
    id: 110,
    name: 'Posto Petrobras Ilhéus Orla',
    price: 5.38,
    distance: '310 km de Salvador',
    address: 'BA-001 Km 12 - Ilhéus - BA',
    updated: 'Atualizado há 30 min',
    logoBg: 'bg-green-600',
    logoInitials: 'BR',
    lat: -14.7880,
    lng: -39.0490
  }
];

// Popular Interstate Destinations
const POPULAR_DESTINATIONS: DestinationCity[] = [
  { name: 'Aracaju', state: 'SE', lat: -10.9472, lng: -37.0731, popular: true },
  { name: 'Feira de Santana', state: 'BA', lat: -12.2667, lng: -38.9667, popular: true },
  { name: 'Ilhéus', state: 'BA', lat: -14.7889, lng: -39.0494, popular: true },
  { name: 'Maceió', state: 'AL', lat: -9.6658, lng: -35.7353, popular: true },
  { name: 'Recife', state: 'PE', lat: -8.0476, lng: -34.8770, popular: true },
];

// Default Salvador location (Pituba)
const DEFAULT_USER_LOCATION: [number, number] = [-12.9922, -38.4685];

// Calculate bearing between two coordinates
function calculateBearing(startLat: number, startLng: number, destLat: number, destLng: number): number {
  const startLatRad = (startLat * Math.PI) / 180;
  const startLngRad = (startLng * Math.PI) / 180;
  const destLatRad = (destLat * Math.PI) / 180;
  const destLngRad = (destLng * Math.PI) / 180;

  const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
  const x =
    Math.cos(startLatRad) * Math.sin(destLatRad) -
    Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

export function MapScreen({ station: initialStation }: MapScreenProps) {
  // Mode state: 'local' (postos na cidade) vs 'travel' (Modo Viagem Interestadual)
  const [activeMode, setActiveMode] = useState<'local' | 'travel'>('local');

  // Active Guided Navigation Mode (GPS Turn-by-Turn estilo Waze)
  const [isNavigating, setIsNavigating] = useState(false);
  const [carHeading, setCarHeading] = useState<number>(0);
  const [voiceAlerts, setVoiceAlerts] = useState(true);

  const [selectedStation, setSelectedStation] = useState<Station>(() => {
    return initialStation || LOCAL_STATIONS[0];
  });
  const [reportOpen, setReportOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number]>(DEFAULT_USER_LOCATION);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  // Travel Mode Search States
  const [searchDestinationQuery, setSearchDestinationQuery] = useState('');
  const [destinationResults, setDestinationResults] = useState<DestinationCity[]>([]);
  const [isSearchingDestinations, setIsSearchingDestinations] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<DestinationCity | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routingControlRef = useRef<L.Routing.Control | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const destinationMarkerRef = useRef<L.Marker | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const prevCoordsRef = useRef<[number, number] | null>(null);

  // Sync selectedStation if initialStation prop updates
  useEffect(() => {
    if (initialStation) {
      setSelectedStation(initialStation);
      setActiveMode('local');
    }
  }, [initialStation]);

  // 1. Setup Geolocation Tracking with watchPosition when Navigating
  useEffect(() => {
    if ('geolocation' in navigator) {
      if (isNavigating) {
        // High accuracy GPS Watcher
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const newCoords: [number, number] = [position.coords.latitude, position.coords.longitude];
            
            // Calculate dynamic heading if not provided by device sensor
            let heading = position.coords.heading;
            if (heading === null || isNaN(heading)) {
              if (prevCoordsRef.current) {
                heading = calculateBearing(
                  prevCoordsRef.current[0],
                  prevCoordsRef.current[1],
                  newCoords[0],
                  newCoords[1]
                );
              } else {
                heading = 0;
              }
            }

            prevCoordsRef.current = newCoords;
            setUserLocation(newCoords);
            if (heading !== null && !isNaN(heading)) {
              setCarHeading(heading);
            }

            // Smoothly pan map to follow vehicle in navigation mode
            if (mapInstanceRef.current) {
              mapInstanceRef.current.panTo(newCoords, { animate: true, duration: 0.8 });
            }
          },
          (error) => {
            console.log('GPS watchPosition error:', error.message);
          },
          { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
        );
      } else {
        // Single shot position when not actively navigating
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
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isNavigating]);

  // 2. Stations to show
  const displayedStations = useMemo(() => {
    if (activeMode === 'travel') {
      return [...HIGHWAY_STATIONS, ...LOCAL_STATIONS];
    }
    return LOCAL_STATIONS;
  }, [activeMode]);

  // Cheapest station on route/view
  const cheapestStation = useMemo(() => {
    if (displayedStations.length === 0) return null;
    return [...displayedStations].sort((a, b) => a.price - b.price)[0];
  }, [displayedStations]);

  // 3. Initialize Leaflet Map
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

    // Layer group for stations
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 4. Update Vehicle / User Marker (with 3D Car Style & Heading Rotation)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
    }

    // Vehicle icon with dynamic heading
    const userVehicleIcon = L.divIcon({
      className: 'vehicle-marker-wrapper',
      html: isNavigating ? `
        <div style="transform: rotate(${carHeading}deg); transition: transform 0.4s ease-out;" class="relative flex items-center justify-center w-12 h-12">
          <!-- Light Beam Forward -->
          <div class="absolute -top-4 w-6 h-8 bg-gradient-to-t from-emerald-500/40 to-transparent rounded-t-full blur-xs"></div>
          <!-- Radar Pulse -->
          <div class="absolute w-12 h-12 rounded-full bg-emerald-500/20 animate-pulse-ring"></div>
          <!-- Vehicle / Navigation Arrow 3D -->
          <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-700 via-emerald-500 to-teal-400 border-2 border-white shadow-xl flex items-center justify-center">
            <div class="w-0 h-0 border-l-[5px] border-l-transparent border-b-[10px] border-b-white border-r-[5px] border-r-transparent -mt-1"></div>
          </div>
        </div>
      ` : `
        <div class="relative flex items-center justify-center w-8 h-8">
          <div class="absolute w-8 h-8 rounded-full bg-emerald-500/25 animate-pulse-ring"></div>
          <div class="w-4 h-4 rounded-full bg-emerald-600 border-2 border-white shadow-md"></div>
        </div>
      `,
      iconSize: isNavigating ? [48, 48] : [32, 32],
      iconAnchor: isNavigating ? [24, 24] : [16, 16],
    });

    const marker = L.marker(userLocation, { icon: userVehicleIcon, zIndexOffset: 1000 }).addTo(map);
    userMarkerRef.current = marker;
  }, [userLocation, carHeading, isNavigating]);

  // 5. Update station markers on map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    displayedStations.forEach((st) => {
      if (!st.lat || !st.lng) return;

      const isSelected = selectedStation.id === st.id;
      const isCheapest = cheapestStation?.id === st.id && activeMode === 'travel';

      const pinColor = isCheapest
        ? 'bg-amber-500 ring-2 ring-amber-300'
        : isSelected
        ? 'bg-emerald-700 ring-2 ring-emerald-400'
        : 'bg-emerald-600';

      const pinIcon = L.divIcon({
        className: `station-pin-${st.id}`,
        html: `
          <div class="cursor-pointer transition-transform transform hover:scale-115 active:scale-95 flex flex-col items-center">
            ${isCheapest ? '<div class="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md mb-0.5 shadow-xs uppercase tracking-wider">Mais Barato</div>' : ''}
            <div class="${pinColor} text-white font-bold text-[11px] px-2.5 py-1 rounded-full shadow-lg border border-white flex items-center gap-1 whitespace-nowrap">
              <span>R$ ${st.price.toFixed(2).replace('.', ',')}</span>
            </div>
            <div class="w-0 h-0 border-l-[5px] border-l-transparent border-t-[6px] ${isCheapest ? 'border-t-amber-500' : isSelected ? 'border-t-emerald-700' : 'border-t-emerald-600'} border-r-[5px] border-r-transparent"></div>
          </div>
        `,
        iconSize: [80, 40],
        iconAnchor: [40, 38],
      });

      const marker = L.marker([st.lat, st.lng], { icon: pinIcon }).addTo(markersLayer);
      marker.on('click', () => {
        setSelectedStation(st);
      });
    });
  }, [displayedStations, selectedStation, cheapestStation, activeMode]);

  // 6. Nominatim Geocoding API for Trip Destination Search
  useEffect(() => {
    if (!searchDestinationQuery.trim() || searchDestinationQuery.length < 3) {
      setDestinationResults([]);
      setIsSearchingDestinations(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingDestinations(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchDestinationQuery)}&countrycodes=br&limit=6&addressdetails=1`;
        const res = await fetch(url, { headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' } });
        const data = await res.json();
        
        if (Array.isArray(data)) {
          const formatted: DestinationCity[] = data.map((item: { display_name: string; address?: { state?: string; city?: string; town?: string }; lat: string; lon: string }) => {
            const cityName = item.address?.city || item.address?.town || item.display_name.split(',')[0];
            const stateName = item.address?.state || 'Brasil';
            return {
              name: cityName,
              state: stateName,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
            };
          });
          setDestinationResults(formatted);
        }
      } catch (err) {
        console.error('Nominatim search error:', err);
      } finally {
        setIsSearchingDestinations(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchDestinationQuery]);

  // 7. Clear route helper
  const clearRoute = () => {
    if (routingControlRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }
    if (destinationMarkerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(destinationMarkerRef.current);
      destinationMarkerRef.current = null;
    }
    setRouteInfo(null);
    setIsNavigating(false);
    setSelectedDestination(null);
    setRouteError(null);
  };

  // 8. Calculate and draw Route
  const calculateRouteToPoint = (targetLat: number, targetLng: number, title?: string, autoStartNavigation = false) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    clearRoute();
    setIsCalculatingRoute(true);
    setRouteError(null);

    try {
      const startPoint = L.latLng(userLocation[0], userLocation[1]);
      const endPoint = L.latLng(targetLat, targetLng);

      // Add Destination Pin
      const destIcon = L.divIcon({
        className: 'destination-marker-icon',
        html: `
          <div class="flex flex-col items-center">
            <div class="bg-red-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-lg border border-white">
              ${title || 'Destino'}
            </div>
            <div class="w-3 h-3 bg-red-600 rounded-full border-2 border-white shadow-md -mt-1"></div>
          </div>
        `,
        iconSize: [100, 30],
        iconAnchor: [50, 26],
      });

      const destMarker = L.marker([targetLat, targetLng], { icon: destIcon }).addTo(map);
      destinationMarkerRef.current = destMarker;

      const routingControl = L.Routing.control({
        waypoints: [startPoint, endPoint],
        routeWhileDragging: false,
        addWaypoints: false,
        showAlternatives: false,
        fitSelectedRoutes: !autoStartNavigation,
        show: false,
        lineOptions: {
          styles: [
            { color: '#047857', opacity: 0.9, weight: 7 },
            { color: '#34d399', opacity: 0.8, weight: 3 },
          ],
          extendToWaypoints: true,
          missingRouteStyles: [{ color: '#f59e0b', opacity: 0.7, weight: 4 }],
          missingRouteTolerance: 1,
        },
      });

      routingControl.on('routesfound', (e: { routes: Array<{ summary: { totalDistance: number; totalTime: number }; instructions?: Array<{ text: string; distance: number; time: number; type?: string }> }> }) => {
        setIsCalculatingRoute(false);
        if (e.routes && e.routes[0]) {
          const route = e.routes[0];
          const summary = route.summary;
          const distKmNum = summary.totalDistance / 1000;
          const distKmStr = distKmNum > 10
            ? Math.round(distKmNum) + ' km'
            : distKmNum.toFixed(1).replace('.', ',') + ' km';

          // Duration string
          const totalMinutes = Math.round(summary.totalTime / 60);
          let durationStr = `${totalMinutes} min`;
          if (totalMinutes >= 60) {
            const hours = Math.floor(totalMinutes / 60);
            const mins = totalMinutes % 60;
            durationStr = mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
          }

          setRouteInfo({
            distanceKm: distKmStr,
            durationText: durationStr,
            totalDistanceMeters: summary.totalDistance,
            totalDurationSeconds: summary.totalTime,
            instructions: route.instructions || [],
          });

          if (autoStartNavigation) {
            setIsNavigating(true);
            map.setView(userLocation, 17, { animate: true });
          } else {
            const bounds = L.latLngBounds([startPoint, endPoint]);
            map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
          }
        }
      });

      routingControl.on('routingerror', () => {
        setIsCalculatingRoute(false);
        setRouteError('Não foi possível calcular o trajeto. Tente novamente.');
      });

      routingControl.addTo(map);
      routingControlRef.current = routingControl;
    } catch (err) {
      console.error('Error instantiating routing control:', err);
      setIsCalculatingRoute(false);
      setRouteError('Erro ao inicializar cálculo de rota.');
    }
  };

  // Start Guided Navigation Mode (GPS estilo Waze)
  const startLiveNavigation = () => {
    if (!selectedStation.lat || !selectedStation.lng) return;
    calculateRouteToPoint(selectedStation.lat, selectedStation.lng, selectedStation.name, true);
  };

  // Select a destination city in trip mode
  const handleSelectDestination = (city: DestinationCity) => {
    setSelectedDestination(city);
    setSearchDestinationQuery('');
    setDestinationResults([]);
    calculateRouteToPoint(city.lat, city.lng, `${city.name} - ${city.state}`);
  };

  // Center map on user
  const handleCenterUser = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(userLocation, isNavigating ? 17 : 14, { duration: 1 });
    }
  };

  // Center map on selected station
  const handleCenterStation = () => {
    if (mapInstanceRef.current && selectedStation.lat && selectedStation.lng) {
      mapInstanceRef.current.flyTo([selectedStation.lat, selectedStation.lng], 14, { duration: 1 });
    }
  };

  // Estimated arrival time (ETA)
  const etaTime = useMemo(() => {
    if (!routeInfo) return '';
    const now = new Date();
    now.setSeconds(now.getSeconds() + routeInfo.totalDurationSeconds);
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [routeInfo]);

  // Next Turn-by-Turn Instruction
  const nextInstruction = useMemo(() => {
    if (!routeInfo?.instructions || routeInfo.instructions.length === 0) {
      return { text: `Siga em frente rumo a ${selectedStation.name}`, distance: 'Direto' };
    }
    const first = routeInfo.instructions[0];
    const distText = first.distance > 1000 
      ? `${(first.distance / 1000).toFixed(1)} km` 
      : `${Math.round(first.distance)} m`;
    return {
      text: first.text || `Continue em direção a ${selectedStation.name}`,
      distance: distText
    };
  }, [routeInfo, selectedStation]);

  // External GPS Launchers
  const openWaze = () => {
    const lat = selectedDestination ? selectedDestination.lat : selectedStation.lat;
    const lng = selectedDestination ? selectedDestination.lng : selectedStation.lng;
    if (lat && lng) {
      window.open(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`, '_blank');
    }
  };

  const openGoogleMaps = () => {
    const lat = selectedDestination ? selectedDestination.lat : selectedStation.lat;
    const lng = selectedDestination ? selectedDestination.lng : selectedStation.lng;
    if (lat && lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    }
  };

  return (
    <div className={`relative w-full h-full flex flex-col overflow-hidden bg-gray-950 ${isNavigating ? 'fixed inset-0 z-[1000]' : ''}`}>
      {/* ─────────────────────────────────────────────────────────────
          1. NORMAL HEADER OVERLAYS (Hidden when in Live Navigation)
         ───────────────────────────────────────────────────────────── */}
      {!isNavigating && (
        <div className="absolute top-3 left-3 right-3 z-[500] flex flex-col gap-2">
          {/* Mode Switcher Pills */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-1 shadow-md border border-gray-100 flex items-center gap-1">
            <button
              onClick={() => {
                setActiveMode('local');
                clearRoute();
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeMode === 'local'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Fuel size={14} />
              <span>Postos Locais</span>
            </button>
            <button
              onClick={() => {
                setActiveMode('travel');
                clearRoute();
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeMode === 'travel'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Compass size={14} />
              <span>Modo Viagem 🚗</span>
            </button>
          </div>

          {/* Search or Trip Destination */}
          {activeMode === 'local' ? (
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3 border border-gray-100">
              <Search size={18} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar posto ou combustível..." 
                className="flex-1 bg-transparent outline-none text-gray-800 text-sm placeholder:text-gray-400"
              />
              <Mic size={18} className="text-gray-400 cursor-pointer hover:text-emerald-600 transition-colors" />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg p-3 border border-gray-100 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 px-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="truncate">Origem: Salvador, BA (Sua localização)</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200">
                  <MapPin size={16} className="text-red-500 shrink-0" />
                  <input 
                    type="text" 
                    value={searchDestinationQuery}
                    onChange={(e) => setSearchDestinationQuery(e.target.value)}
                    placeholder="Para onde você vai? Ex: Aracaju, Feira..." 
                    className="flex-1 bg-transparent outline-none text-gray-800 text-sm placeholder:text-gray-400"
                  />
                  {isSearchingDestinations && (
                    <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {searchDestinationQuery && !isSearchingDestinations && (
                    <button 
                      onClick={() => setSearchDestinationQuery('')}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Autocomplete Dropdown */}
                {destinationResults.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden mt-1 divide-y divide-gray-100 max-h-48 overflow-y-auto">
                    {destinationResults.map((dest, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectDestination(dest)}
                        className="w-full px-3 py-2.5 text-left text-xs hover:bg-emerald-50 transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin size={13} className="text-gray-400 group-hover:text-emerald-600" />
                          <span className="font-semibold text-gray-800">{dest.name}</span>
                          <span className="text-gray-400 text-[11px]">{dest.state}</span>
                        </div>
                        <ArrowRight size={13} className="text-gray-300 group-hover:text-emerald-600" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Quick Destination Chips */}
                {!selectedDestination && destinationResults.length === 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase shrink-0">Populares:</span>
                    {POPULAR_DESTINATIONS.map((dest) => (
                      <button
                        key={dest.name}
                        onClick={() => handleSelectDestination(dest)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-emerald-100 hover:text-emerald-800 text-gray-700 whitespace-nowrap transition-colors flex items-center gap-1"
                      >
                        <span>{dest.name}</span>
                        <span className="text-[10px] opacity-70">({dest.state})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* "Cheapest Gas Station on Route" Banner Alert */}
          <AnimatePresence>
            {activeMode === 'travel' && cheapestStation && (
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                onClick={() => {
                  setSelectedStation(cheapestStation);
                  if (mapInstanceRef.current && cheapestStation.lat && cheapestStation.lng) {
                    mapInstanceRef.current.flyTo([cheapestStation.lat, cheapestStation.lng], 14);
                  }
                }}
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl p-3 shadow-xl cursor-pointer active:scale-[0.99] transition-transform border border-amber-400/30 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Sparkles size={18} className="text-white fill-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-white text-amber-600 px-1.5 py-0.2 rounded-md">
                        Melhor Parada
                      </span>
                      <span className="text-xs font-extrabold text-white">R$ {cheapestStation.price.toFixed(2).replace('.', ',')}/L</span>
                    </div>
                    <p className="text-xs text-amber-50 font-medium line-clamp-1 mt-0.5">
                      {cheapestStation.name} • {cheapestStation.distance}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold bg-white/15 px-2.5 py-1.5 rounded-xl">
                  <TrendingDown size={14} />
                  <span>Ver posto</span>
                </div>
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
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. LIVE GUIDED NAVIGATION HUD (Waze / Google Maps Style)
         ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isNavigating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 z-[600] flex flex-col justify-between p-4"
          >
            {/* Top Navigation Banner: Turn-by-Turn Instruction */}
            <motion.div 
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="pointer-events-auto bg-emerald-900/95 backdrop-blur-xl border border-emerald-500/30 text-white rounded-3xl p-4 shadow-2xl flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div className="w-13 h-13 rounded-2xl bg-emerald-500/30 border border-emerald-400/40 flex items-center justify-center shrink-0 shadow-inner">
                  {nextInstruction.text.toLowerCase().includes('direita') ? (
                    <CornerUpRight size={28} className="text-emerald-300" />
                  ) : nextInstruction.text.toLowerCase().includes('esquerda') ? (
                    <CornerUpLeft size={28} className="text-emerald-300" />
                  ) : (
                    <ArrowUp size={28} className="text-emerald-300" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-300 bg-emerald-800/80 px-2 py-0.5 rounded-lg">
                      Em {nextInstruction.distance}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white leading-snug truncate mt-0.5">
                    {nextInstruction.text}
                  </h3>
                </div>
              </div>

              {/* Exit Navigation & Voice Toggle */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setVoiceAlerts(!voiceAlerts)}
                  className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-90 transition-all flex items-center justify-center text-emerald-200 hover:text-white"
                  title="Alertas de voz"
                >
                  {voiceAlerts ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>
                <button
                  onClick={clearRoute}
                  className="w-10 h-10 rounded-2xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 active:scale-90 transition-all flex items-center justify-center text-red-200 hover:text-white"
                  title="Encerrar navegação"
                >
                  <X size={18} />
                </button>
              </div>
            </motion.div>

            {/* Bottom HUD: Live GPS Metrics & Trip Panel */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="pointer-events-auto bg-white/95 backdrop-blur-xl border border-gray-200/80 text-gray-900 rounded-3xl p-5 shadow-2xl flex flex-col gap-3.5"
            >
              <div className="flex items-center justify-between">
                {/* Time & ETA */}
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-emerald-700 tracking-tight">
                      {routeInfo ? routeInfo.durationText : 'Calculando...'}
                    </span>
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg">
                      Chegada: {etaTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mt-0.5">
                    <span>{routeInfo ? routeInfo.distanceKm : selectedStation.distance} restante</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <ShieldCheck size={13} /> Rota mais econômica
                    </span>
                  </div>
                </div>

                {/* Re-center GPS button */}
                <button
                  onClick={handleCenterUser}
                  className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-200 shadow-sm flex items-center justify-center active:scale-90 transition-transform"
                  title="Centralizar no veículo"
                >
                  <Navigation2 size={20} className="fill-emerald-700 rotate-45" />
                </button>
              </div>

              {/* Station Info Pill */}
              <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-3 border border-gray-100">
                <div className="flex items-center gap-2.5 truncate">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 ${selectedStation.logoBg}`}>
                    {selectedStation.logoInitials}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-gray-900 truncate leading-tight">{selectedStation.name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{selectedStation.address}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-extrabold text-emerald-700">R$ {selectedStation.price.toFixed(2).replace('.', ',')}</span>
                  <p className="text-[9px] text-gray-400 font-medium">Gasolina</p>
                </div>
              </div>

              {/* Stop Trip Button */}
              <Button
                onClick={clearRoute}
                variant="danger"
                className="w-full py-3 text-xs font-bold rounded-2xl gap-2 shadow-md shadow-red-500/20"
              >
                <StopCircle size={17} />
                Encerrar Navegação
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
          3. FLOATING MAP CONTROLS (Recentering / Reset View)
         ───────────────────────────────────────────────────────────── */}
      {!isNavigating && (
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
            title="Ver posto selecionado"
          >
            <MapPin size={18} />
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. LEAFLET MAP CANVAS
         ───────────────────────────────────────────────────────────── */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* ─────────────────────────────────────────────────────────────
          5. BOTTOM SHEET CARD (Preview & Action Card)
         ───────────────────────────────────────────────────────────── */}
      {!isNavigating && (
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
                {/* Live Navigation CTA Button */}
                <Button 
                  onClick={startLiveNavigation} 
                  disabled={isCalculatingRoute}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2.5 text-sm font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-600/25 active:scale-[0.98] transition-all"
                >
                  <Navigation2 size={19} className="fill-white rotate-45" />
                  {isCalculatingRoute ? 'Iniciando GPS...' : 'Iniciar Navegação Guiada (GPS Zelo)'}
                </Button>

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
      )}

      {/* Price Report Modal */}
      <PriceReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        station={selectedStation}
      />
    </div>
  );
}



