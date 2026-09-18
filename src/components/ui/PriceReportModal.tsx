import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ThumbsUp, Edit3, CheckCircle2, AlertCircle, DollarSign } from 'lucide-react';
import { Button } from './Button';
import type { Station } from '../../App';

interface PriceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  station: Pick<Station, 'name' | 'price'> | null;
}

export function PriceReportModal({ isOpen, onClose, station }: PriceReportModalProps) {
  const [mode, setMode] = useState<'idle' | 'confirm' | 'report' | 'success'>('idle');
  const [newPrice, setNewPrice] = useState('');

  const handleClose = () => {
    setMode('idle');
    setNewPrice('');
    onClose();
  };

  const handleConfirm = () => {
    setMode('success');
    setTimeout(handleClose, 2200);
  };

  const handleReport = () => {
    setMode('success');
    setTimeout(handleClose, 2200);
  };

  if (!station) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 overflow-hidden"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            <div className="px-6 pb-8">
              {/* Header */}
              <div className="flex justify-between items-start mb-4 mt-2">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Confirmar ou Reportar</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{station.name}</p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              {/* Current Price Pill */}
              <div className="flex items-center justify-center gap-2 bg-brand-50 border border-brand-100 rounded-2xl py-3 mb-5">
                <DollarSign size={18} className="text-brand-500" />
                <span className="text-gray-600 text-sm font-medium">Preço atual no sistema:</span>
                <span className="text-brand-500 font-bold text-lg">
                  R$ {station.price.toFixed(2).replace('.', ',')}
                </span>
              </div>

              <AnimatePresence mode="wait">
                {mode === 'success' ? (
                  /* Success State */
                  <motion.div
                    key="success"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center py-4 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mb-3">
                      <CheckCircle2 size={36} className="text-brand-500" />
                    </div>
                    <h3 className="text-gray-900 font-bold text-lg mb-1">Obrigado!</h3>
                    <p className="text-gray-500 text-sm max-w-[220px]">
                      Sua confirmação ajuda outros motoristas a economizarem.
                    </p>
                  </motion.div>
                ) : mode === 'report' ? (
                  /* Report new price */
                  <motion.div
                    key="report"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-2xl p-3">
                      <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-amber-700 text-xs leading-relaxed">
                        Informe o preço que você viu no painel do posto. Sua contribuição é verificada pela comunidade.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700 ml-1">Novo preço observado (R$/litro)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0,00"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2.5">
                      <Button
                        variant="outline"
                        onClick={() => setMode('idle')}
                        className="flex-1 rounded-2xl text-sm"
                      >
                        Voltar
                      </Button>
                      <Button
                        onClick={handleReport}
                        className="flex-1 rounded-2xl text-sm"
                        disabled={!newPrice}
                      >
                        Atualizar Preço
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  /* Default — choose action */
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-3"
                  >
                    {/* Confirm button */}
                    <button
                      onClick={handleConfirm}
                      className="w-full flex items-center gap-4 bg-brand-50 border-2 border-brand-200 hover:border-brand-400 hover:bg-brand-100 active:scale-[0.98] rounded-2xl px-4 py-4 transition-all text-left"
                    >
                      <div className="w-11 h-11 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-brand-500/30">
                        <ThumbsUp size={20} className="text-white fill-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">O preço está correto</p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          R$ {station.price.toFixed(2).replace('.', ',')} — confirmar este valor
                        </p>
                      </div>
                    </button>

                    {/* Report button */}
                    <button
                      onClick={() => setMode('report')}
                      className="w-full flex items-center gap-4 bg-amber-50 border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-100 active:scale-[0.98] rounded-2xl px-4 py-4 transition-all text-left"
                    >
                      <div className="w-11 h-11 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-400/30">
                        <Edit3 size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">O preço mudou</p>
                        <p className="text-gray-500 text-xs mt-0.5">Informar o novo valor que vi no posto</p>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
