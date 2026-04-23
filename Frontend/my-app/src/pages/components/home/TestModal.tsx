'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { useConfirmStore } from '@/store/useConfirmStore';

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
  correctOptionId: string;
}

interface TestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
}

export const TestModal = ({ isOpen, onClose, onSubmit, initialData }: TestModalProps) => {
  const { alert } = useConfirmStore();
  const [title, setTitle] = useState('');
  const [attemptsAllowed, setAttemptsAllowed] = useState(1);
  const [maxGrade, setMaxGrade] = useState(12);
  const [questionsToShow, setQuestionsToShow] = useState(10);
  const [timeLimit, setTimeLimit] = useState(0);
  const [deadline, setDeadline] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setAttemptsAllowed(initialData.attemptsAllowed || 1);
      setMaxGrade(initialData.maxGrade || 12);
      setQuestionsToShow(initialData.questionsToShow || 10);
      setTimeLimit(initialData.timeLimit || 0);
      setDeadline(initialData.deadline || '');
      setQuestions(initialData.questions || []);
    } else {
      setTitle('');
      setAttemptsAllowed(1);
      setMaxGrade(12);
      setQuestionsToShow(10);
      setTimeLimit(0);
      setDeadline('');
      setQuestions([]);
    }
  }, [initialData, isOpen]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      text: '',
      options: [
        { id: Math.random().toString(36).substr(2, 9), text: '' },
        { id: Math.random().toString(36).substr(2, 9), text: '' }
      ],
      correctOptionId: ''
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestionText = (index: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[index].text = text;
    setQuestions(newQuestions);
  };

  const addOption = (qIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push({
      id: Math.random().toString(36).substr(2, 9),
      text: ''
    });
    setQuestions(newQuestions);
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    const newQuestions = [...questions];
    const optionId = newQuestions[qIndex].options[oIndex].id;
    if (newQuestions[qIndex].correctOptionId === optionId) {
      newQuestions[qIndex].correctOptionId = '';
    }
    newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== oIndex);
    setQuestions(newQuestions);
  };

  const updateOptionText = (qIndex: number, oIndex: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex].text = text;
    setQuestions(newQuestions);
  };

  const setCorrectOption = (qIndex: number, optionId: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].correctOptionId = optionId;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (questions.length === 0) {
      return alert({ title: 'Помилка валідації', message: 'Додайте хоча б одне питання для тесту', variant: 'danger' });
    }
    if (questions.some(q => !q.text || q.options.some(o => !o.text) || !q.correctOptionId)) {
      return alert({ 
        title: 'Неповні дані', 
        message: 'Будь ласка, заповніть всі питання, варіанти відповідей та обов\'язково позначте правильний варіант.', 
        variant: 'danger' 
      });
    }

    setLoading(true);
    try {
      await onSubmit({
        title,
        attemptsAllowed: Number(attemptsAllowed),
        maxGrade: Number(maxGrade),
        questionsToShow: Number(questionsToShow),
        timeLimit: Number(timeLimit),
        deadline,
        questions
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      alert({ title: 'Помилка збереження', message: err.message || 'Не вдалося зберегти тест', variant: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={onClose} />
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-4xl max-h-[85vh] flex flex-col">
          <Card blur="lg" className="flex flex-col border-white/10 shadow-2xl overflow-hidden min-h-0 h-full">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0">
              <div><h2 className="text-2xl font-black text-white uppercase tracking-tighter">{initialData ? 'Редагувати тест' : 'Створити новий тест'}</h2><p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Налаштування параметрів та питань</p></div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar min-h-0">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Назва тесту</label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Наприклад: Підсумковий тест за темою 1" required /></div>
                <div className="grid grid-cols-3 gap-4">
                   <div className="space-y-2"><label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Спроб</label><Input type="number" value={attemptsAllowed} onChange={e => setAttemptsAllowed(Number(e.target.value))} min={1} required /></div>
                   <div className="space-y-2"><label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Макс. бал</label><Input type="number" value={maxGrade} onChange={e => setMaxGrade(Number(e.target.value))} min={1} required /></div>
                   <div className="space-y-2"><label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Питань у тесті</label><Input type="number" value={questionsToShow} onChange={e => setQuestionsToShow(Number(e.target.value))} min={1} required /></div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Обмеження часу (хв, 0 - без обмежень)</label><Input type="number" value={timeLimit} onChange={e => setTimeLimit(Number(e.target.value))} min={0} placeholder="Наприклад: 45" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Дедлайн (до якого часу відкритий тест)</label><Input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} /></div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center"><h3 className="text-xl font-black text-white uppercase tracking-tighter">Питання ({questions.length})</h3><Button type="button" onClick={addQuestion} variant="outline" size="sm" className="gap-2"><Plus size={16} /> Додати питання</Button></div>
                {questions.length === 0 && (<div className="p-12 text-center border-2 border-dashed border-white/5 rounded-3xl space-y-4"><div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-slate-700"><AlertCircle size={32} /></div><p className="text-slate-500 font-medium">Ще не додано жодного питання. Натисніть кнопку вище, щоб почати.</p></div>)}
                <div className="space-y-6">
                  {questions.map((q, qIndex) => (
                    <Card key={q.id} blur="sm" className="p-6 border-white/5 bg-white/5 relative group/q">
                      <button type="button" onClick={() => removeQuestion(qIndex)} className="absolute top-4 right-4 p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover/q:opacity-100"><Trash2 size={18} /></button>
                      <div className="space-y-4">
                        <div className="flex gap-4 items-start"><span className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black shrink-0 border border-indigo-500/20">{qIndex + 1}</span><textarea value={q.text} onChange={e => updateQuestionText(qIndex, e.target.value)} placeholder="Введіть текст питання..." className="w-full bg-transparent border-none outline-none text-white text-lg font-bold resize-none py-1 placeholder:text-slate-700" rows={2} /></div>
                        <div className="grid gap-3 ml-12">
                          {q.options.map((o, oIndex) => (
                            <div key={o.id} className="flex items-center gap-3 group/opt">
                              <button type="button" onClick={() => setCorrectOption(qIndex, o.id)} className={`p-2 rounded-lg transition-all ${q.correctOptionId === o.id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-slate-700 hover:text-emerald-500 hover:bg-emerald-500/10 border border-white/5'}`}><CheckCircle2 size={18} /></button>
                              <input value={o.text} onChange={e => updateOptionText(qIndex, oIndex, e.target.value)} placeholder={`Варіант ${oIndex + 1}`} className="flex-1 bg-white/5 border border-transparent focus:border-indigo-500/30 rounded-xl px-4 py-2 text-sm text-slate-300 outline-none transition-all placeholder:text-slate-700" />
                              {q.options.length > 2 && (<button type="button" onClick={() => removeOption(qIndex, oIndex)} className="p-2 text-slate-700 hover:text-red-500 transition-colors"><X size={16} /></button>)}
                            </div>
                          ))}
                          <button type="button" onClick={() => addOption(qIndex)} className="flex items-center gap-2 text-[10px] font-black text-indigo-400 hover:text-white transition-colors uppercase tracking-widest w-fit mt-2 ml-1"><Plus size={12} /> Додати варіант</button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </form>
            <div className="p-6 border-t border-white/5 bg-white/5 flex justify-end gap-4 shrink-0"><Button type="button" variant="ghost" onClick={onClose}>Скасувати</Button><Button onClick={handleSubmit} isLoading={loading} className="px-8">{initialData ? 'Зберегти зміни' : 'Створити тест'}</Button></div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
