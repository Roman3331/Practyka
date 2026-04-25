import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Loader2, Trophy, Clock } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { useConfirmStore } from '@/store/useConfirmStore';

interface TestTakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  testId: string;
  subjectId: string;
  onFinished: () => void;
}

export const TestTakeModal = ({ isOpen, onClose, testId, subjectId, onFinished }: TestTakeModalProps) => {
  const { token } = useAuthStore();
  const { confirm, alert } = useConfirmStore();
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && testId) {
      fetchTest();
    } else {
      setTest(null);
      setAnswers({});
      setResult(null);
      setError(null);
      setTimeLeft(null);
    }
  }, [isOpen, testId]);

  useEffect(() => {
    if (test?.timeLimit > 0 && !result && !loading) {
      setTimeLeft(test.timeLimit * 60);
    }
  }, [test, result, loading]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || result) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, result]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchTest = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`http://localhost:3100/api/auth/subjects/${subjectId}/tests/${testId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Failed to load test');
      setTest(data.test);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (questionId: string, optionId: string) => {
    if (result) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    const isAutoSubmit = timeLeft === 0;
    
    const executeSubmit = async () => {
      setSubmitting(true);
      try {
        const resp = await fetch(`http://localhost:3100/api/auth/subjects/${subjectId}/tests/${testId}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({ questionId, selectedOptionId }))
          })
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || 'Failed to submit test');
        setResult(data);
        onFinished();
      } catch (err: any) {
        alert({ title: 'Помилка', message: err.message, variant: 'danger' });
      } finally {
        setSubmitting(false);
      }
    };

    if (!isAutoSubmit) {
      const answeredCount = Object.keys(answers).length;
      if (answeredCount < test.questions.length) {
        confirm({
          title: 'Завершити тест?',
          message: `Ви відповіли лише на ${answeredCount} з ${test.questions.length} питань. Ви дійсно хочете завершити тест зараз?`,
          confirmText: 'Так, завершити',
          cancelText: 'Продовжити тест',
          onConfirm: executeSubmit
        });
        return;
      }
      confirm({
        title: 'Завершити тест?',
        message: 'Ви впевнені, що хочете здати свої відповіді?',
        onConfirm: executeSubmit
      });
    } else {
      executeSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl" onClick={result ? onClose : undefined} />
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-4xl max-h-[85vh] flex flex-col">
          <Card blur="lg" className="flex flex-col border-white/10 shadow-2xl overflow-hidden h-full min-h-0">
            <div className="p-4 sm:p-6 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-indigo-500/10 rounded-xl sm:rounded-2xl text-indigo-400">
                  <Clock size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div>
                   <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter leading-tight">
                     {test?.title || 'Проходження тесту'}
                   </h2>
                   <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1">
                     <p className="text-slate-500 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]">Спроба {test?.attemptNumber} з {test?.attemptsAllowed}</p>
                     {timeLeft !== null && (
                       <div className="flex items-center gap-2 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                          <Clock size={12} className={timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-amber-500'} />
                          <span className={`text-[9px] font-black uppercase tracking-widest ${timeLeft < 60 ? 'text-red-500' : 'text-amber-500'}`}>{formatTime(timeLeft)}</span>
                       </div>
                     )}
                   </div>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white shrink-0 ml-4">
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar min-h-0">

              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4"><Loader2 className="animate-spin text-indigo-500" size={48} /><p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Генерація вашого варіанту...</p></div>
              ) : error ? (
                <div className="p-12 text-center space-y-6">
                   <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500 border border-red-500/20 shadow-lg shadow-red-500/10"><AlertCircle size={40} /></div>
                   <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Помилка доступу</h3>
                   <p className="text-slate-400 max-w-md mx-auto">{error}</p>
                   <Button onClick={onClose} variant="outline">Закрити</Button>
                </div>
              ) : result ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-12 text-center space-y-8">
                   <div className="w-32 h-32 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500 border border-emerald-500/20 shadow-2xl relative">
                      <Trophy size={64} className="relative z-10" />
                      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-emerald-500 rounded-full blur-2xl" />
                   </div>
                   <div className="space-y-2"><h3 className="text-4xl font-black text-white uppercase tracking-tighter">Тест завершено!</h3><p className="text-slate-500 font-black uppercase tracking-[0.2em]">Ваш результат зберігся в системі</p></div>
                   <div className="flex justify-center gap-12 pt-4"><div className="text-center"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Ваша оцінка</p><p className="text-6xl font-black text-white text-gradient">{result.score}</p></div><div className="text-center"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Максимально</p><p className="text-6xl font-black text-slate-700">{result.maxScore}</p></div></div>
                   <Button onClick={onClose} size="lg" className="px-12 mt-8">Вернутися до курсу</Button>
                </motion.div>
              ) : (
                <div className="space-y-8 sm:space-y-12">
                   {test.questions.map((q: any, idx: number) => (
                     <div key={q.id} className="space-y-4 sm:space-y-6">
                        <div className="flex gap-3 sm:gap-4 items-start">
                          <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black shrink-0 border border-indigo-500/20 text-sm sm:text-lg shadow-lg">{idx + 1}</span>
                          <h4 className="text-xl sm:text-2xl font-bold text-white leading-tight mt-0.5 sm:mt-1">{q.text}</h4>
                        </div>
                        <div className="grid gap-3 sm:gap-4 ml-0 sm:ml-14">
                          {q.options.map((o: any) => (
                             <button 
                               key={o.id} 
                               onClick={() => handleSelect(q.id, o.id)} 
                               className={`group relative p-4 sm:p-5 rounded-2xl sm:rounded-3xl border text-left transition-all overflow-hidden ${answers[q.id] === o.id ? 'bg-indigo-500/10 border-indigo-500 shadow-lg shadow-indigo-500/10' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                             >
                               <div className="flex items-center gap-3 sm:gap-4 relative z-10">
                                 <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all ${answers[q.id] === o.id ? 'bg-indigo-500 border-indigo-500 scale-110' : 'border-slate-700 group-hover:border-slate-500'}`}>
                                   {answers[q.id] === o.id && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white" />}
                                 </div>
                                 <span className={`text-base sm:text-lg font-bold transition-colors ${answers[q.id] === o.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>{o.text}</span>
                               </div>
                               {answers[q.id] === o.id && <motion.div layoutId="active-bg" className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent" />}
                             </button>
                           ))}
                        </div>
                     </div>
                   ))}
                </div>

              )}
            </div>

            {!result && !loading && !error && (
              <div className="p-4 sm:p-6 border-t border-white/5 bg-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
                 <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                   <div className="flex-1 sm:w-48 h-2 bg-white/5 rounded-full overflow-hidden">
                     <motion.div initial={{ width: 0 }} animate={{ width: `${(Object.keys(answers).length / test.questions.length) * 100}%` }} className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                   </div>
                   <p className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">{Object.keys(answers).length} / {test.questions.length}</p>
                 </div>
                 <div className="flex gap-3 sm:gap-4 w-full sm:w-auto">
                   <Button variant="ghost" onClick={onClose} className="flex-1 sm:flex-none">Закрити</Button>
                   <Button onClick={handleSubmit} isLoading={submitting} className="flex-[2] sm:flex-none sm:px-12" disabled={submitting}>Завершити</Button>
                 </div>
              </div>
            )}

          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
