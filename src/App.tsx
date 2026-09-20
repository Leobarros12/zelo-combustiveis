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
};

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('welcome');
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

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
          <MainLayout currentScreen={currentScreen} navigateTo={navigateTo} key="main">
            <MapScreen station={selectedStation} />
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
    <div className="bg-gray-900 min-h-screen w-full flex items-center justify-center font-sans antialiased">
      {/* Viewport Simulator */}
      <div className="w-full max-w-[412px] h-[100dvh] max-h-[846px] bg-gray-50 relative md:rounded-[40px] md:shadow-2xl overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {renderScreen()}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
