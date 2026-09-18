import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User, UserCheck } from 'lucide-react';
import type { ScreenState, User as UserType } from '../App';
import { Button } from '../components/ui/Button';

interface RegisterScreenProps {
  navigateTo: (screen: ScreenState) => void;
  setCurrentUser: (user: UserType | null) => void;
}

export function RegisterScreen({ navigateTo, setCurrentUser }: RegisterScreenProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Informe seu nome completo.';
    if (!email.includes('@')) e.email = 'E-mail inválido.';
    if (password.length < 6) e.password = 'Mínimo 6 caracteres.';
    if (password !== confirm) e.confirm = 'As senhas não coincidem.';
    if (!accepted) e.terms = 'Você precisa aceitar os termos.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setCurrentUser({ name, email });
    navigateTo('home');
  };

  const Field = ({
    label, icon: Icon, type, value, onChange, showToggle, onToggle, show, errorKey,
    placeholder,
  }: {
    label: string; icon: typeof User; type: string; value: string;
    onChange: (v: string) => void; showToggle?: boolean; onToggle?: () => void;
    show?: boolean; errorKey: string; placeholder: string;
  }) => (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-gray-700 ml-1">{label}</label>
      <div className="relative">
        <Icon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type={showToggle ? (show ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={w-full bg-gray-50 border rounded-2xl py-3.5 pl-11 pr-12 text-sm outline-none transition-all }
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
          >
            {show ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {errors[errorKey] && (
        <p className="text-red-500 text-xs ml-1">{errors[errorKey]}</p>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="h-full bg-white flex flex-col"
    >
      {/* Green Header */}
      <div className="bg-brand-500 px-6 pt-12 pb-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />
        <button
          onClick={() => navigateTo('welcome')}
          className="p-2 -ml-2 rounded-full bg-white/20 active:scale-95 transition-all mb-4 relative z-10"
        >
          <ArrowLeft size={22} className="text-white" />
        </button>
        <div className="relative z-10">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-md">
            <UserCheck size={26} className="text-brand-500" />
          </div>
          <h1 className="text-white text-2xl font-bold leading-tight">Criar conta grátis</h1>
          <p className="text-green-100 text-sm mt-1">Junte-se a milhares de motoristas econômicos.</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4 no-scrollbar">
        <div className="space-y-4">
          <Field
            label="Nome Completo"
            icon={User}
            type="text"
            placeholder="João da Silva"
            value={name}
            onChange={setName}
            errorKey="name"
          />
          <Field
            label="E-mail"
            icon={Mail}
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={setEmail}
            errorKey="email"
          />
          <Field
            label="Senha"
            icon={Lock}
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={setPassword}
            showToggle
            onToggle={() => setShowPassword(!showPassword)}
            show={showPassword}
            errorKey="password"
          />
          <Field
            label="Confirmar Senha"
            icon={Lock}
            type="password"
            placeholder="Repita sua senha"
            value={confirm}
            onChange={setConfirm}
            showToggle
            onToggle={() => setShowConfirm(!showConfirm)}
            show={showConfirm}
            errorKey="confirm"
          />

          {/* Terms checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="relative mt-0.5 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all }
                >
                  {accepted && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-gray-600 leading-relaxed">
                Li e aceito os{' '}
                <span className="text-brand-500 font-semibold">Termos de Uso</span>
                {' '}e a{' '}
                <span className="text-brand-500 font-semibold">Política de Privacidade</span>.
              </span>
            </label>
            {errors.terms && <p className="text-red-500 text-xs ml-8 mt-1">{errors.terms}</p>}
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="px-6 pb-8 pt-3 border-t border-gray-100 bg-white">
        <Button onClick={handleSubmit} className="w-full h-14 text-base rounded-2xl shadow-lg shadow-brand-500/20">
          Criar minha conta
        </Button>
        <p className="text-center text-gray-500 text-sm mt-4">
          Já tem conta?{' '}
          <button onClick={() => navigateTo('login')} className="text-brand-500 font-bold hover:underline">
            Entrar
          </button>
        </p>
      </div>
    </motion.div>
  );
}
