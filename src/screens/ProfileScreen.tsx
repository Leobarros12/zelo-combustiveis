import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { User, ToggleLeft, ToggleRight, UserCheck, LogIn, UserPlus } from 'lucide-react';
import type { User as UserType, ScreenState } from '../App';

interface ProfileScreenProps {
  currentUser: UserType | null;
  navigateTo: (screen: ScreenState) => void;
}

export function ProfileScreen({ currentUser, navigateTo }: ProfileScreenProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // ─── Guest / Empty State ──────────────────────────────────────────
  if (!currentUser) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 pb-24">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="flex flex-col items-center text-center"
        >
          {/* Illustration */}
          <div className="relative mb-6">
            <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center">
              <User size={52} className="text-gray-300" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center">
              <span className="text-white text-lg leading-none">?</span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">Navegando como visitante</h2>
          <p className="text-gray-500 text-sm max-w-[240px] leading-relaxed mb-8">
            Crie uma conta gratuita para salvar postos favoritos, contribuir com preços e personalizar sua experiência.
          </p>

          {/* Benefit pills */}
          <div className="w-full space-y-2 mb-8">
            {[
              { icon: '⭐', text: 'Salve postos favoritos' },
              { icon: '📊', text: 'Histórico de abastecimentos' },
              { icon: '🔔', text: 'Alertas de queda de preço' },
            ].map((b) => (
              <div key={b.text} className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 text-left">
                <span className="text-lg">{b.icon}</span>
                <span className="text-sm text-gray-700 font-medium">{b.text}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="w-full space-y-3">
            <Button
              onClick={() => navigateTo('register')}
              className="w-full gap-2 rounded-2xl h-13 text-base"
            >
              <UserPlus size={20} />
              Criar conta grátis
            </Button>
            <Button
              variant="outline"
              onClick={() => navigateTo('login')}
              className="w-full gap-2 rounded-2xl h-13 text-base"
            >
              <LogIn size={20} />
              Fazer Login
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Logged-in Profile ────────────────────────────────────────────
  return (
    <div className="p-6 pb-24">
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-xl font-bold text-brand-500">Meu Perfil</h2>
          <UserCheck size={20} className="text-brand-500" />
        </div>

        <div className="w-20 h-20 bg-brand-100 rounded-full mb-3 flex items-center justify-center overflow-hidden border-2 border-brand-200 shadow-md">
          <span className="text-brand-500 text-2xl font-bold">
            {currentUser.name.charAt(0).toUpperCase()}
          </span>
        </div>

        <h3 className="text-lg font-bold text-gray-900">{currentUser.name}</h3>
        <p className="text-sm font-semibold text-brand-500/70">Motorista Colaborador</p>
      </div>

      <div className="space-y-4">
        <Card className="p-5">
          <div className="space-y-3 text-sm">
            <div className="flex">
              <span className="font-semibold text-gray-700 w-32">Nome completo:</span>
              <span className="text-gray-500">{currentUser.name}</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-700 w-32">E-mail:</span>
              <span className="text-gray-500">{currentUser.email}</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-700 w-32">Telefone:</span>
              <span className="text-gray-500">—</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-700 w-32">Cidade:</span>
              <span className="text-gray-500">Salvador, BA</span>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="space-y-4 text-sm">
            <div className="flex">
              <span className="font-semibold text-gray-700 w-36">Combustível Padrão:</span>
              <span className="text-gray-500">Gasolina Comum</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-700 w-36">Veículo Principal:</span>
              <span className="text-gray-500">Carro</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex">
                <span className="font-semibold text-gray-700">Notificações de Preço:</span>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className="flex items-center gap-2 active:scale-95 transition-transform"
              >
                <span className="text-gray-500 text-xs">{notificationsEnabled ? 'Ativado' : 'Desativado'}</span>
                {notificationsEnabled ? (
                  <ToggleRight size={28} className="text-brand-500 fill-brand-500" />
                ) : (
                  <ToggleLeft size={28} className="text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </Card>

        <div className="pt-4">
          <Button variant="danger" className="w-full font-bold">
            Sair da Conta
          </Button>
        </div>
      </div>
    </div>
  );
}
