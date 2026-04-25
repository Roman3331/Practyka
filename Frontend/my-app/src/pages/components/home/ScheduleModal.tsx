import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Clock, BookOpen, User, Home, Save } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { Input } from '@/shared/components/ui/Input';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

const DAYS = ["Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця", "Субота"];

export const ScheduleModal = ({ isOpen, onClose, onSubmit, initialData }: ScheduleModalProps) => {
  const [targetClass, setTargetClass] = useState('');
  const [semesterName, setSemesterName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [days, setDays] = useState<any[]>(DAYS.map(day => ({ day, lessons: [] })));

  useEffect(() => {
    if (initialData) {
      setTargetClass(initialData.targetClass || '');
      setSemesterName(initialData.semesterName || '');
      setStartDate(initialData.startDate || '');
      setEndDate(initialData.endDate || '');
      setDays(initialData.days || DAYS.map(day => ({ day, lessons: [] })));
    } else {
      setTargetClass('');
      setSemesterName('');
      setStartDate('');
      setEndDate('');
      setDays(DAYS.map(day => ({ day, lessons: [] })));
    }
  }, [initialData, isOpen]);

  const addLesson = (dayIndex: number) => {
    const newDays = [...days];
    newDays[dayIndex].lessons.push({
      id: crypto.randomUUID(),
      time: '',
      subjectName: '',
      teacherName: '',
      room: ''
    });
    setDays(newDays);
  };

  const removeLesson = (dayIndex: number, lessonId: string) => {
    const newDays = [...days];
    newDays[dayIndex].lessons = newDays[dayIndex].lessons.filter((l: any) => l.id !== lessonId);
    setDays(newDays);
  };

  const updateLesson = (dayIndex: number, lessonId: string, field: string, value: string) => {
    const newDays = [...days];
    const lesson = newDays[dayIndex].lessons.find((l: any) => l.id === lessonId);
    if (lesson) {
      lesson[field] = value;
    }
    setDays(newDays);
  };

  const handleSave = () => {
    if (!targetClass.trim() || !semesterName.trim()) return;
    onSubmit({ targetClass, semesterName, startDate, endDate, days });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden"
        >
          <Card blur="xl" className="flex flex-col h-full border-white/10 shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-white/5 flex items-center justify-between bg-white/5 shrink-0">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-indigo-500/10 rounded-xl sm:rounded-2xl text-indigo-400">
                  <Clock size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter leading-tight">
                    {initialData ? 'Редагувати розклад' : 'Створити розклад'}
                  </h2>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Налаштування занять на семестр</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-500 hover:text-white shrink-0 ml-4">
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8 custom-scrollbar min-h-0">

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Назва класу</p>
                  <Input 
                    value={targetClass} 
                    onChange={(e) => setTargetClass(e.target.value)}
                    placeholder="Напр. 4-А"
                    className="text-sm font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Семестр / Назва</p>
                  <Input 
                    value={semesterName} 
                    onChange={(e) => setSemesterName(e.target.value)}
                    placeholder="Напр. I семестр 2023-2024"
                    className="text-sm font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Період дії (з - до)</p>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="date"
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)}
                      className="text-xs font-bold h-10"
                    />
                    <Input 
                      type="date"
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)}
                      className="text-xs font-bold h-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-8">
                {days.map((dayObj, dayIdx) => (
                  <div key={dayObj.day} className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        {dayObj.day}
                      </h3>
                      <Button variant="ghost" size="sm" onClick={() => addLesson(dayIdx)} className="text-indigo-400 hover:text-white gap-2">
                        <Plus size={16} /> Додати урок
                      </Button>
                    </div>

                    <div className="grid gap-3">
                      {dayObj.lessons.length === 0 ? (
                        <p className="text-slate-600 text-xs font-medium italic p-4 bg-white/5 rounded-2xl border border-dashed border-white/10">Уроків не додано</p>
                      ) : (
                        dayObj.lessons.map((lesson: any) => (
                          <div key={lesson.id} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-3 rounded-xl bg-white/5 border border-white/10 group hover:border-white/20 transition-all relative">
                            <div className="space-y-1">
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                <Clock size={10} /> Час
                              </p>
                              <Input 
                                value={lesson.time} 
                                onChange={(e) => updateLesson(dayIdx, lesson.id, 'time', e.target.value)}
                                placeholder="08:30 - 09:15"
                                className="h-8 text-[10px] font-bold px-2"
                              />
                            </div>
                            <div className="space-y-1">
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                <BookOpen size={10} /> Предмет
                              </p>
                              <Input 
                                value={lesson.subjectName} 
                                onChange={(e) => updateLesson(dayIdx, lesson.id, 'subjectName', e.target.value)}
                                placeholder="Математика"
                                className="h-8 text-[10px] font-bold px-2"
                              />
                            </div>
                            <div className="space-y-1">
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                <User size={10} /> Вчитель
                              </p>
                              <Input 
                                value={lesson.teacherName} 
                                onChange={(e) => updateLesson(dayIdx, lesson.id, 'teacherName', e.target.value)}
                                placeholder="Іванов І.І."
                                className="h-8 text-[10px] font-bold px-2"
                              />
                            </div>
                            <div className="space-y-1">
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                <Home size={10} /> Кабінет
                              </p>
                              <Input 
                                value={lesson.room} 
                                onChange={(e) => updateLesson(dayIdx, lesson.id, 'room', e.target.value)}
                                placeholder="302"
                                className="h-8 text-[10px] font-bold px-2"
                              />
                            </div>
                            <div className="flex items-end">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => removeLesson(dayIdx, lesson.id)}
                                className="w-full h-8 text-red-400 hover:bg-red-400/10 rounded-lg"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-white/5 bg-white/5 flex justify-end gap-4 shrink-0">
              <Button variant="outline" onClick={onClose} className="px-8">Скасувати</Button>
              <Button onClick={handleSave} className="px-8 gap-2 shadow-indigo-500/20">
                <Save size={18} /> Зберегти розклад
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
