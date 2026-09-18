import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Mic, Navigation2, Star, MapPin, MessageSquare } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PriceReportModal } from '../components/ui/PriceReportModal';
import type { Station } from '../App';

interface MapScreenProps {
  station: Station | null;
}

export function MapScreen({ station }: MapScreenProps) {
  const [reportOpen, setReportOpen] = useState(false);
  // Use selected station or a default one for the map view
  const displayStation = station || {
    name: 'Posto Shell Pituba',
    price: 5.39,
    distance: '1,2 km',
    address: 'Av. Manoel Dias da Silva, 1245',
    logoBg: 'bg-yellow-400',
    logoInitials: 'SH'
  };

  return (
    <div className="relative h-full flex flex-col">
      {/* Search Bar Overlay */}
      <div className="absolute top-4 left-4 right-4 z-20">
        <div className="bg-white rounded-full shadow-md px-4 py-3 flex items-center gap-3 border border-gray-100">
          <Search size={20} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar posto..." 
            className="flex-1 bg-transparent outline-none text-gray-700 text-sm placeholder:text-gray-400"
          />
          <Mic size={20} className="text-gray-400 cursor-pointer hover:text-brand-500 transition-colors" />
        </div>
      </div>

      {/* Map Background (Mockup) */}
      <div className="absolute inset-0 bg-[#E8F5E9] z-0 overflow-hidden">
        {/* Simple map grid pattern */}
        <div className="absolute inset-0 opacity-50" 
             style={{ backgroundImage: 'linear-gradient(#cfd8dc 1px, transparent 1px), linear-gradient(90deg, #cfd8dc 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>
        
        {/* Decorative Map Blocks */}
        <div className="absolute top-32 left-10 w-24 h-24 bg-white/40 rounded-lg backdrop-blur-sm" />
        <div className="absolute top-48 right-12 w-32 h-16 bg-white/40 rounded-lg backdrop-blur-sm" />
        <div className="absolute top-[40%] left-1/3 w-40 h-32 bg-white/50 rounded-lg backdrop-blur-sm" />
        <div className="absolute bottom-1/3 right-8 w-20 h-40 bg-brand-500/10 rounded-lg backdrop-blur-sm" />
        
        {/* Map Pins */}
        <div className="absolute top-1/3 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-brand-500 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-md border-2 border-white relative z-10">
            R$ {displayStation.price.toFixed(2).replace('.', ',')}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-t-[6px] border-t-brand-500 border-r-[6px] border-r-transparent"></div>
          </div>
        </div>

        <div className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-white text-gray-700 font-bold text-xs px-3 py-1.5 rounded-full shadow-md border border-gray-200 relative">
            R$ 5,67
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-t-[6px] border-t-white border-r-[6px] border-r-transparent"></div>
          </div>
        </div>
        
        <div className="absolute top-[45%] right-1/4 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-white text-gray-700 font-bold text-xs px-3 py-1.5 rounded-full shadow-md border border-gray-200 relative">
            R$ 5,71
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-t-[6px] border-t-white border-r-[6px] border-r-transparent"></div>
          </div>
        </div>
      </div>

      {/* Bottom Sheet Card */}
      <div className="absolute bottom-4 left-4 right-4 z-20">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <Card className="p-5 shadow-xl border-t border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm ${displayStation.logoBg}`}>
                  {displayStation.logoInitials}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">{displayStation.name}</h3>
                  <div className="flex items-center text-gray-500 text-xs mt-1 gap-2">
                    <span>Gasolina Comum</span>
                    <span className="flex items-center text-yellow-500 gap-0.5 font-medium">
                      <Star size={12} className="fill-yellow-500" /> 4.5
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-brand-500 font-bold text-xl leading-tight">
                  R$ {displayStation.price.toFixed(2).replace('.', ',')}
                </div>
                <div className="text-[10px] text-gray-400 font-medium">/litro</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 mb-5">
              <div className="flex flex-col gap-1">
                 <div className="flex items-center gap-1.5">
                   <MapPin size={14} className="text-gray-400" />
                   <span>{displayStation.address}</span>
                 </div>
              </div>
              <div className="font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-md">{displayStation.distance}</div>
            </div>

            <div className="flex flex-col gap-2">
              <Button className="w-full gap-2 text-sm font-semibold rounded-xl">
                <Navigation2 size={18} className="fill-white" />
                Ir com Waze
              </Button>
              <Button variant="outline" className="w-full gap-2 text-sm font-semibold rounded-xl">
                <MapPin size={18} />
                Ir com Google Maps
              </Button>
              {/* Report / Confirm price */}
              <button
                onClick={() => setReportOpen(true)}
                className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-amber-500 text-xs font-medium py-2.5 border border-gray-200 hover:border-amber-300 rounded-xl transition-all active:scale-[0.98]"
              >
                <MessageSquare size={15} />
                Confirmar ou reportar preço
              </button>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Price Report Modal */}
      <PriceReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        station={displayStation}
      />
    </div>
  );
}
