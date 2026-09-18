import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import type { ScreenState, User } from '../App';
import { Button } from '../components/ui/Button';

interface LoginScreenProps {
  navigateTo: (screen: ScreenState) => void;
  setCurrentUser: (user: User | null) => void;
}

export function LoginScreen({ navigateTo, setCurrentUser }: LoginScreenProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');

  return (
    <div className="h-full bg-white flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center p-6 pt-12 relative z-10">
        <button 
          onClick={() => navigateTo('welcome')}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all"
        >
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 px-8 pt-4 flex flex-col"
      >
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Entrar</h1>
          <p className="text-gray-500">Acesse sua conta para continuar economizando.</p>
        </div>

        <div className="space-y-5 flex-1">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 ml-1">E-mail</label>
            <div className="relative">
              <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 ml-1">Senha</label>
            <div className="relative">
              <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••" 
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-11 pr-12 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 active:scale-95 transition-all p-1"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="flex justify-end pt-1">
              <button className="text-brand-500 text-xs font-semibold hover:underline">
                Esqueci minha senha
              </button>
            </div>
          </div>
        </div>

        <div className="pb-8 pt-4">
          <Button
            onClick={() => {
              setCurrentUser({ name: email.split('@')[0] || 'Usuário', email });
              navigateTo('home');
            }}
            className="w-full h-14 text-lg rounded-2xl shadow-lg shadow-brand-500/20 active:scale-95 transition-transform"
          >
            Entrar
          </Button>
          
          <div className="mt-6 text-center">
            <span className="text-gray-500 text-sm">Não tem uma conta? </span>
            <button
              onClick={() => navigateTo('register')}
              className="text-brand-500 text-sm font-bold hover:underline"
            >
              Cadastre-se
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
