import { motion } from 'framer-motion';
import type { ScreenState, User } from '../App';

interface SplashScreenProps {
  navigateTo: (screen: ScreenState) => void;
  setCurrentUser: (user: User | null) => void;
}

export function SplashScreen({ navigateTo, setCurrentUser }: SplashScreenProps) {
  return (
    <div className="h-full bg-brand-500 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Decorative background circle */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute top-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"
      />

      <div className="flex-1 flex flex-col items-center justify-center w-full z-10">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-lg mb-12"
        >
          <span className="text-brand-500 text-5xl font-bold tracking-tight">Zelo</span>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center space-y-4 mb-16"
        >
          <h1 className="text-white text-3xl font-bold leading-tight">
            Economize em cada<br/>abastecimento
          </h1>
          <p className="text-green-100 text-base max-w-[260px] mx-auto">
            Encontre os menores preços ao seu redor sem complicações.
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="w-full flex flex-col gap-3 z-10 pb-8"
      >
        {/* Primary CTA — enter as guest */}
        <button
          onClick={() => { setCurrentUser(null); navigateTo('home'); }}
          className="w-full bg-white text-brand-500 font-semibold text-lg py-4 rounded-full shadow-lg active:scale-95 transition-all"
        >
          Ver preços na região &gt;
        </button>

        {/* Register */}
        <button
          onClick={() => navigateTo('register')}
          className="w-full bg-white/20 border border-white/40 text-white font-semibold text-base py-3.5 rounded-full active:scale-95 transition-all backdrop-blur-sm"
        >
          Criar conta grátis
        </button>

        {/* Login link */}
        <button
          onClick={() => navigateTo('login')}
          className="text-white/80 text-sm font-medium pt-1 active:scale-95 transition-transform"
        >
          Já tenho conta — <span className="underline">Entrar</span>
        </button>
      </motion.div>
    </div>
  );
}
