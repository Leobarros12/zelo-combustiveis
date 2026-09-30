import { useState } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { SplashScreen } from './screens/SplashScreen';
import { ListScreen } from './screens/ListScreen';
import { MapScreen } from './screens/MapScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { AnimatePresence } from 'framer-motion';

export type ScreenState = 'welcome' | 'login' | 'register' | 'home' | 'map' | 'favorites' | 'profile';

export type User = {
  name: string;
  email: string;
};
export type Station = {
  id: number;
  name: string;
  price: number;
  distance: string;
  address: string;
  updated: string;
  logoBg: string;
  logoInitials: string;
  lat?: number;
  lng?: number;
};

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('welcome');
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const navigateTo = (screen: ScreenState) => {
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <SplashScreen navigateTo={navigateTo} setCurrentUser={setCurrentUser} key="welcome" />;
      case 'login':
        return <LoginScreen navigateTo={navigateTo} setCurrentUser={setCurrentUser} key="login" />;
      case 'register':
        return <RegisterScreen onNavigate={navigateTo} onLogin={(user) => setCurrentUser(user)} key="register" />;
      case 'home':
        return (
          <MainLayout currentScreen={currentScreen} navigateTo={navigateTo} key="main">
            <ListScreen
              navigateTo={navigateTo}
              onSelectStation={(station) => {
                setSelectedStation(station);
                navigateTo('map');
              }}
            />
          </MainLayout>
        );
      case 'favorites':
        return (
          <MainLayout currentScreen={currentScreen} navigateTo={navigateTo} key="favorites">
            <ListScreen
              navigateTo={navigateTo}
              onSelectStation={(station) => {
                setSelectedStation(station);
                navigateTo('map');
              }}
            />
          </MainLayout>
        );
      case 'map':
        return (
          <MainLayout currentScreen={currentScreen} navigateTo={navigateTo} key="main" hideChrome={isNavigating}>
            <MapScreen station={selectedStation} onNavigatingChange={setIsNavigating} />
          </MainLayout>
        );
      case 'profile':
        return (
          <MainLayout currentScreen={currentScreen} navigateTo={navigateTo} key="main-profile">
            <ProfileScreen currentUser={currentUser} navigateTo={navigateTo} />
          </MainLayout>
        );
      default:
        return <SplashScreen navigateTo={navigateTo} setCurrentUser={setCurrentUser} key="welcome" />;
    }
  };

  return (
    <div className="w-full min-w-full w-screen min-h-screen h-[100dvh] bg-gray-50 relative overflow-hidden flex flex-col font-sans antialiased selection:bg-brand-500 selection:text-white">
      <AnimatePresence mode="wait">
        {renderScreen()}
      </AnimatePresence>
    </div>
  );
}

export default App;
