import { useState } from 'react';
import { MapPin, ChevronDown, Bell } from 'lucide-react';
import { LocationModal } from '../ui/LocationModal';

export function TopHeader() {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <button 
          onClick={() => setIsLocationModalOpen(true)}
          className="flex items-center gap-1 text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors active:scale-95"
        >
          <MapPin size={16} className="text-brand-500 fill-brand-500" />
          <span className="text-sm font-medium">Salvador, BA</span>
          <ChevronDown size={14} />
        </button>
        
        <div className="absolute left-1/2 -translate-x-1/2">
          <h1 className="text-brand-500 font-bold text-xl tracking-tight">Zelo</h1>
        </div>
        
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors relative active:scale-95">
          <Bell size={24} className="text-gray-700" />
        </button>
      </header>

      <LocationModal 
        isOpen={isLocationModalOpen} 
        onClose={() => setIsLocationModalOpen(false)} 
      />
    </>
  );
}
