import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { MapPin, Clock, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import type { ScreenState, Station } from '../App';
import { PriceReportModal } from '../components/ui/PriceReportModal';

interface ListScreenProps {
  navigateTo: (screen: ScreenState) => void;
  onSelectStation: (station: Station) => void;
}
const STATIONS = [
  {
    id: 1,
    name: 'Posto Shell Pituba',
    price: 5.49,
    distance: '1,2 km',
    address: 'Av. Manoel Dias da Silva, 1420 - Pituba',
    updated: 'Atualizado há 10 min',
    logoBg: 'bg-yellow-400',
    logoInitials: 'SH'
  },
  {
    id: 2,
    name: 'Posto Ipiranga Ce...',
    price: 5.52,
    distance: '2,5 km',
    address: 'Av. Sete de Setembro, 880 - Centro',
    updated: 'Atualizado há 14 min',
    logoBg: 'bg-blue-500',
    logoInitials: 'IP'
  },
  {
    id: 3,
    name: 'BR Mania Barra',
    price: 5.59,
    distance: '3,8 km',
    address: 'Av. Oceânica, 422 - Barra',
    updated: 'Atualizado há 25 min',
    logoBg: 'bg-green-500',
    logoInitials: 'BR'
  },
  {
    id: 4,
    name: 'Posto Ale Itapuã',
    price: 5.67,
    distance: '5,1 km',
    address: 'Rua Dorival Caymmi, 310 - Itapuã',
    updated: 'Atualizado há 40 min',
    logoBg: 'bg-red-500',
    logoInitials: 'AL'
  }
];

const FILTERS = ['Gasolina', 'Etanol', 'Diesel'];

export function ListScreen({ navigateTo, onSelectStation }: ListScreenProps) {
  const [activeFilter, setActiveFilter] = useState('Gasolina');
  const [reportStation, setReportStation] = useState<Station | null>(null);

  return (
    <div className="p-6 pb-24">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">Economize no combustível</h2>
        <p className="text-gray-500 text-sm">Compare preços em tempo real na sua região</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
        {FILTERS.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
              activeFilter === filter 
                ? "bg-brand-500 text-white shadow-md shadow-brand-500/20" 
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {STATIONS.map((station, i) => (
          <motion.div
            key={station.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card hoverable className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm", station.logoBg)}>
                    {station.logoInitials}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{station.name}</h3>
                    <div className="flex items-center text-gray-500 text-xs mt-0.5 gap-1">
                      <MapPin size={12} className="fill-gray-500" />
                      <span>{station.distance}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-brand-500 font-bold text-lg">
                    R$ {station.price.toFixed(2).replace('.', ',')}
                  </div>
                  <div className="text-[10px] text-gray-400 font-medium">/litro</div>
                </div>
              </div>

              <div className="text-xs text-gray-500 mt-1">
                {station.address}
              </div>

              <div className="flex justify-between items-center mt-2 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                  <Clock size={14} />
                  <span>{station.updated}</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Confirm/Report price button */}
                  <button
                    onClick={() => setReportStation(station)}
                    className="flex items-center gap-1 text-gray-400 hover:text-amber-500 active:scale-95 transition-all text-xs border border-gray-200 hover:border-amber-300 rounded-full px-2.5 py-1.5"
                  >
                    <MessageSquare size={13} />
                    <span>Preço</span>
                  </button>
                  <button
                    onClick={() => onSelectStation(station)}
                    className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors active:scale-95"
                  >
                    Ir agora &gt;
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Price Report Modal */}
      <PriceReportModal
        isOpen={!!reportStation}
        onClose={() => setReportStation(null)}
        station={reportStation}
      />
    </div>
  );
}
