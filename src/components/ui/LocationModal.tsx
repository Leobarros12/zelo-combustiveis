import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, X, Navigation2 } from 'lucide-react';
import { Button } from './Button';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CITIES = [
  'Salvador, BA',
  'Lauro de Freitas, BA',
  'Camaçari, BA',
  'Simões Filho, BA',
];

export function LocationModal({ isOpen, onClose }: LocationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 z-50 backdrop-blur-sm"
          />
          
          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6 flex flex-col max-h-[85vh]"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Onde você está?</h2>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <Button 
              className="w-full gap-2 mb-6"
            >
              <Navigation2 size={18} className="fill-white" />
              Usar minha localização atual
            </Button>

            <div className="relative mb-6">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar bairro ou cidade..." 
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Cidades populares na região</h3>
              <ul className="space-y-1">
                {CITIES.map((city) => (
                  <li key={city}>
                    <button 
                      onClick={onClose}
                      className="w-full flex items-center gap-3 py-3 px-2 rounded-xl hover:bg-gray-50 active:scale-95 transition-all text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center">
                        <MapPin size={16} className="text-brand-500" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{city}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
