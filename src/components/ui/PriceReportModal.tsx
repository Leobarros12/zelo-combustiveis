import { useState, useEffect } from 'react';
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

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    setMode('idle');
    setNewPrice('');
    onClose();
  };

  const handleConfirm = () => {
    setMode('success');
    setTimeout(handleClose, 2000);
  };

  const handleReport = () => {
    setMode('success');
    setTimeout(handleClose, 2000);
  };

  if (!station) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4">
          {/* Dark Backdrop / Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Centered Modal Card */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl relative z-[80] overflow-hidden border border-gray-100 max-h-[85vh] flex flex-col"
          >
            <div className="overflow-y-auto flex-1 p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 leading-tight">Confirmar ou Reportar</h2>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{station.name}</p>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors active:scale-95"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Current Price Pill */}
            <div className="flex items-center justify-center gap-2 bg-brand-50 border border-brand-100 rounded-2xl py-3 mb-5">
              <DollarSign size={18} className="text-brand-500" />
              <span className="text-gray-600 text-xs font-medium">Preço no sistema:</span>
              <span className="text-brand-500 font-extrabold text-base">
                R$ {station.price.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <AnimatePresence mode="wait">
              {mode === 'success' ? (
                /* Success State */
                <motion.div
                  key="success"
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.85, opacity: 0 }}
                  className="flex flex-col items-center py-4 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mb-3">
                    <CheckCircle2 size={36} className="text-brand-500" />
                  </div>
                  <h3 className="text-gray-900 font-bold text-lg mb-1">Obrigado!</h3>
                  <p className="text-gray-500 text-xs max-w-[220px]">
                    Sua contribuição mantém os preços de combustível atualizados para todos.
                  </p>
                </motion.div>
              ) : mode === 'report' ? (
                /* Report new price */
                <motion.div
                  key="report"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-2xl p-3">
                    <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-amber-800 text-xs leading-relaxed">
                      Informe o preço que você viu na bomba do posto.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 ml-1">Novo preço observado (R$/litro)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        autoFocus
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-sm font-semibold outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-1">
                    <Button
                      variant="outline"
                      onClick={() => setMode('idle')}
                      className="flex-1 rounded-2xl text-xs py-2.5"
                    >
                      Voltar
                    </Button>
                    <Button
                      onClick={handleReport}
                      className="flex-1 rounded-2xl text-xs py-2.5 bg-brand-500 hover:bg-brand-600 text-white"
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
                    className="w-full flex items-center gap-3.5 bg-brand-50 border-2 border-brand-200 hover:border-brand-400 hover:bg-brand-100 active:scale-[0.98] rounded-2xl px-4 py-3.5 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center shrink-0 shadow-md shadow-brand-500/20">
                      <ThumbsUp size={18} className="text-white fill-white" />
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
                    className="w-full flex items-center gap-3.5 bg-amber-50 border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-100 active:scale-[0.98] rounded-2xl px-4 py-3.5 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center shrink-0 shadow-md shadow-amber-400/20">
                      <Edit3 size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">O preço mudou</p>
                      <p className="text-gray-500 text-xs mt-0.5">Informar o novo valor observado</p>
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

