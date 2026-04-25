'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConfirmStore } from '@/store/useConfirmStore';
import { Button } from './Button';
import { AlertCircle, X, CheckCircle2, Info } from 'lucide-react';

export const ConfirmModal = () => {
  const { isOpen, options, close } = useConfirmStore();

  if (!isOpen || !options) return null;

  const isDanger = options.variant === 'danger' || (!options.variant && !options.isAlert);
  const isInfo = options.variant === 'info' || options.isAlert;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl ${
                isDanger ? 'bg-red-500/10 text-red-400' : 
                isInfo ? 'bg-blue-500/10 text-blue-400' : 'bg-indigo-500/10 text-indigo-400'
              }`}>
                {isDanger ? <AlertCircle size={28} className="sm:w-8 sm:h-8" /> : 
                 isInfo ? <Info size={28} className="sm:w-8 sm:h-8" /> : <CheckCircle2 size={28} className="sm:w-8 sm:h-8" />}
              </div>
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter leading-tight">
                  {options.title || (options.isAlert ? 'Сповіщення' : 'Підтвердження')}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm font-medium leading-relaxed">
                  {options.message}
                </p>
              </div>
            </div>


            <div className="flex gap-3 pt-2">
              {!options.isAlert && (
                <Button 
                  variant="outline" 
                  className="flex-1 py-4 uppercase font-black tracking-widest text-[10px] border-white/5 hover:bg-white/5 transition-all" 
                  onClick={close}
                >
                  {options.cancelText || 'Скасувати'}
                </Button>
              )}
              <Button 
                className={`flex-1 py-4 uppercase font-black tracking-widest text-[10px] shadow-lg transition-all ${
                  isDanger 
                    ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' 
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
                }`} 
                onClick={() => {
                  if (options.onConfirm) options.onConfirm();
                  close();
                }}
              >
                {options.confirmText || (options.isAlert ? 'Зрозуміло' : 'Підтвердити')}
              </Button>
            </div>
          </div>
          
          <button onClick={close} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
