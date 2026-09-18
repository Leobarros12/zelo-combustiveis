import { TopHeader } from './TopHeader';
import { BottomNav } from './BottomNav';
import type { ScreenState } from '../../App';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface MainLayoutProps {
  children: ReactNode;
  currentScreen: ScreenState;
  navigateTo: (screen: ScreenState) => void;
}

export function MainLayout({ children, currentScreen, navigateTo }: MainLayoutProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full w-full"
    >
      <TopHeader />
      <main className="flex-1 overflow-y-auto pb-24 no-scrollbar relative">
        {children}
      </main>
      <BottomNav currentScreen={currentScreen} navigateTo={navigateTo} />
    </motion.div>
  );
}
