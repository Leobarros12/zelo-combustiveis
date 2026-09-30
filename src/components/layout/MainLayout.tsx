import { TopHeader } from './TopHeader';
import { BottomNav } from './BottomNav';
import type { ScreenState } from '../../App';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface MainLayoutProps {
  children: ReactNode;
  currentScreen: ScreenState;
  navigateTo: (screen: ScreenState) => void;
  /** When true, hides the TopHeader and BottomNav (e.g., during GPS navigation) */
  hideChrome?: boolean;
}

export function MainLayout({ children, currentScreen, navigateTo, hideChrome = false }: MainLayoutProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full w-full"
    >
      {!hideChrome && <TopHeader />}
      <main className={`flex-1 overflow-y-auto no-scrollbar relative ${hideChrome ? '' : 'pb-28'}`}>
        {children}
      </main>
      {!hideChrome && <BottomNav currentScreen={currentScreen} navigateTo={navigateTo} />}
    </motion.div>
  );
}
