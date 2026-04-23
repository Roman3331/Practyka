import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, User, Calendar, GraduationCap } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';

interface TestResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  test: any;
}

export const TestResultsModal = ({ isOpen, onClose, test }: TestResultsModalProps) => {
  if (!isOpen || !test) return null;

  const results = test.results || [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
          onClick={onClose}
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl max-h-[85vh] flex flex-col"
        >
          <Card blur="lg" className="flex flex-col border-white/10 shadow-2xl overflow-hidden h-full min-h-0">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400"><Trophy size={24} /></div>
                <div>
                   <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Результати: {test.title}</h2>
                   <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Всього здано: {results.length} робіт</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar min-h-0">
              {results.length === 0 ? (
                <div className="p-20 text-center space-y-4">
                   <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto text-slate-700 border border-white/5 shadow-inner">
                     <GraduationCap size={40} />
                   </div>
                   <div className="space-y-1">
                     <h3 className="text-xl font-black text-white uppercase tracking-tighter">Результатів ще немає</h3>
                     <p className="text-slate-500 text-sm max-w-xs mx-auto">Жоден учень ще не пройшов цей тест.</p>
                   </div>
                </div>
              ) : (
                <div className="space-y-4">
                   <table className="w-full text-left border-separate border-spacing-y-2">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Учень</th>
                          <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Спроба</th>
                          <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Оцінка</th>
                          <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Дата</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()).map((result: any, idx: number) => (
                          <motion.tr 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={idx} 
                            className="bg-white/5 group hover:bg-white/10 transition-all"
                          >
                            <td className="px-6 py-4 rounded-l-2xl border-l border-t border-b border-white/5">
                               <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400 border border-indigo-500/10 font-bold">
                                   <User size={18} />
                                 </div>
                                 <span className="font-bold text-white">{result.studentName}</span>
                               </div>
                            </td>
                            <td className="px-6 py-4 border-t border-b border-white/5 text-center">
                               <span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-bold text-slate-400 border border-white/5">
                                 №{result.attemptNumber}
                               </span>
                            </td>
                            <td className="px-6 py-4 border-t border-b border-white/5 text-center">
                               <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                 <span className="text-xl font-black text-emerald-400">{result.score}</span>
                                 <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">/ {test.maxGrade}</span>
                               </div>
                            </td>
                            <td className="px-6 py-4 rounded-r-2xl border-r border-t border-b border-white/5 text-center">
                               <div className="flex flex-col items-center">
                                 <span className="text-xs font-bold text-slate-300">{new Date(result.submittedAt).toLocaleDateString()}</span>
                                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{new Date(result.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                               </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                   </table>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/5 bg-white/5 flex justify-end shrink-0">
              <Button onClick={onClose}>Закрити</Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
