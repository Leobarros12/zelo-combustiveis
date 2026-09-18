import { Home, Map, Heart, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { ScreenState } from '../../App';

interface BottomNavProps {
  currentScreen: ScreenState;
  navigateTo: (screen: ScreenState) => void;
}

const navItems = [
  { id: 'home', icon: Home, label: 'Início', screen: 'home' },
  { id: 'map', icon: Map, label: 'Mapa', screen: 'map' },
  { id: 'favorites', icon: Heart, label: 'Favoritos', screen: 'favorites' },
  { id: 'profile', icon: User, label: 'Perfil', screen: 'profile' },
];

export function BottomNav({ currentScreen, navigateTo }: BottomNavProps) {
  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 pb-safe z-50">
      <div className="flex justify-between items-center w-full">
        {navItems.map((item) => {
          const isActive = currentScreen === item.screen;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.screen as ScreenState)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-16 transition-colors",
                isActive ? "text-brand-500" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Icon 
                size={24} 
                className={cn("transition-transform duration-200", isActive && "scale-110", isActive && "fill-brand-500")}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
