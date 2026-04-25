'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, Calendar, Plus, Edit2, Trash2, 
  Search, BookOpen, User, Home, Loader2,
  CalendarDays, ChevronLeft, ChevronRight, Filter
} from 'lucide-react';
import { Header } from '@/shared/components/ui/Header';
import { SideBar } from '@/shared/components/ui/SideBar';
import { studentNavItems, teacherNavItems } from '@/shared/constants/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { ScheduleModal } from '@/pages/components/home/ScheduleModal';
import { useConfirmStore } from '@/store/useConfirmStore';

const DAYS_ORDER = ["Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця", "Субота"];

export const SchedulePage = () => {
  const { user, token } = useAuthStore();
  const { confirm } = useConfirmStore();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [selectedDays, setSelectedDays] = useState<{[key: string]: string}>({});

  const isTeacher = user?.role === 'teacher';
  const navItems = isTeacher ? teacherNavItems : studentNavItems;

  const fetchSchedules = async () => {
    try {
      const resp = await fetch('http://localhost:3100/api/auth/schedules', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await resp.json();
      setSchedules(data);
      
      // Initialize selected days for each schedule
      const today = new Date().getDay();
      const currentDayName = DAYS_ORDER[today - 1] || DAYS_ORDER[0];
      const initialSelected: any = {};
      data.forEach((s: any) => {
        initialSelected[s._id] = currentDayName;
      });
      setSelectedDays(initialSelected);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (token) fetchSchedules();
  }, [token]);

  const handleCreateOrUpdate = async (data: any) => {
    const method = editingSchedule ? 'PUT' : 'POST';
    const url = editingSchedule 
      ? `http://localhost:3100/api/auth/schedules/${editingSchedule._id}`
      : 'http://localhost:3100/api/auth/schedules';

    try {
      const resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      if (resp.ok) fetchSchedules();
    } catch (err) { console.error(err); }
  };

  const handleDelete = (id: string) => {
    confirm({
      title: 'Видалити розклад?',
      message: 'Ви впевнені, що хочете видалити розклад для цього класу?',
      onConfirm: async () => {
        try {
          await fetch(`http://localhost:3100/api/auth/schedules/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          fetchSchedules();
        } catch (err) { console.error(err); }
      }
    });
  };

  const filteredSchedules = schedules.filter(s => 
    s.targetClass.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen gradient-bg">
      <SideBar items={navItems} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Розклад занять" />

        <main className="p-4 sm:p-8 space-y-6 sm:space-y-8">
          <div className="flex flex-col md:flex-row gap-4 sm:gap-6 justify-between items-stretch sm:items-start">
            <div className="relative w-full max-w-md group order-2 md:order-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Пошук за класом (напр. 4-А)..."
                className="pl-12 bg-white/5 border-white/10 focus:border-indigo-500/50 h-11 sm:h-12 rounded-xl sm:rounded-2xl text-sm"
              />
            </div>
            {isTeacher && (
              <Button onClick={() => { setEditingSchedule(null); setIsModalOpen(true); }} className="gap-3 shadow-indigo-500/20 px-6 sm:px-8 py-4 sm:py-6 rounded-xl sm:rounded-2xl order-1 md:order-2">
                <Plus size={20} /> <span className="sm:inline">Створити розклад</span>
              </Button>
            )}
          </div>


          {loading ? (
            <div className="flex h-[40vh] items-center justify-center">
              <Loader2 className="animate-spin text-indigo-500" size={48} />
            </div>
          ) : filteredSchedules.length === 0 ? (
            <Card blur="lg" className="p-20 text-center space-y-6 border-dashed border-white/10">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-700">
                <CalendarDays size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Розкладів не знайдено</h3>
                <p className="text-slate-500 max-w-xs mx-auto">Створіть свій перший розклад для класу, щоб учні могли бачити свої заняття.</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredSchedules.map((schedule) => {
                const selectedDay = selectedDays[schedule._id] || DAYS_ORDER[0];
                const dayData = schedule.days.find((d: any) => d.day === selectedDay);
                const lessons = dayData?.lessons || [];

                return (
                  <Card key={schedule._id} blur="sm" className="p-6 border-white/5 hover:border-indigo-500/30 transition-all group relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                      <Clock size={70} className="text-white" />
                    </div>

                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div>
                        <h4 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight">{schedule.targetClass}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                           <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{schedule.semesterName}</span>
                           {(schedule.startDate || schedule.endDate) && (
                              <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full">
                                {schedule.startDate && new Date(schedule.startDate).toLocaleDateString()} 
                                {schedule.endDate && ` — ${new Date(schedule.endDate).toLocaleDateString()}`}
                              </span>
                           )}
                        </div>
                      </div>
                      {isTeacher && (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => { setEditingSchedule(schedule); setIsModalOpen(true); }} className="p-1.5 text-indigo-400 hover:bg-indigo-500/10 rounded-lg">
                            <Edit2 size={14} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(schedule._id)} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg">
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Day Selector */}
                    <div className="flex flex-wrap sm:flex-nowrap sm:overflow-x-auto gap-1.5 mb-6 relative z-10 custom-scrollbar pb-1">

                      {DAYS_ORDER.map((day) => {
                        const isSelected = selectedDay === day;
                        const hasLessons = (schedule.days.find((d: any) => d.day === day)?.lessons?.length || 0) > 0;
                        
                        return (
                          <button
                            key={day}
                            onClick={() => setSelectedDays(prev => ({ ...prev, [schedule._id]: day }))}
                            className={`
                              px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all
                              ${isSelected 
                                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
                                : hasLessons 
                                  ? 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white' 
                                  : 'bg-transparent text-slate-700 cursor-not-allowed opacity-50'}
                            `}
                          >
                            {day.slice(0, 3)}
                          </button>
                        );
                      })}
                    </div>

                    {/* Lessons Display */}
                    <div className="flex-1 relative z-10 min-h-[200px]">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={selectedDay}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="space-y-3"
                        >
                          <div className="flex items-center justify-between mb-1">
                             <h5 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                                {selectedDay}
                             </h5>
                             <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{lessons.length} уроків</span>
                          </div>

                          <div className="space-y-2">
                            {lessons.length === 0 ? (
                              <div className="py-12 text-center space-y-2 bg-white/5 rounded-2xl border border-dashed border-white/5">
                                 <Clock className="mx-auto text-slate-700" size={24} />
                                 <p className="text-slate-500 text-[8px] font-black uppercase tracking-widest">Занять немає</p>
                              </div>
                            ) : (
                              lessons.map((lesson: any, idx: number) => (
                                <motion.div 
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: idx * 0.03 }}
                                  key={lesson.id} 
                                  className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-indigo-500/20 transition-all group/lesson"
                                >
                                  <div className="w-16 text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/5 px-2 py-1.5 rounded-lg border border-indigo-500/10 text-center">
                                    {lesson.time}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-white uppercase tracking-tight truncate leading-none mb-1 group-hover/lesson:text-indigo-400 transition-colors">
                                      {lesson.subjectName}
                                    </p>
                                    <div className="flex items-center gap-2 text-[8px] text-slate-500 font-bold uppercase tracking-widest">
                                      <span className="flex items-center gap-1"><User size={9} /> {lesson.teacherName}</span>
                                      {lesson.room && <span className="flex items-center gap-1 text-emerald-400/80"><Home size={9} /> {lesson.room}</span>}
                                    </div>
                                  </div>
                                </motion.div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[8px] text-slate-500 font-black uppercase tracking-widest relative z-10">
                      <span>{new Date(schedule.createdAt).toLocaleDateString()}</span>
                      <div className="flex items-center gap-1 text-indigo-400">
                        <BookOpen size={10} /> {schedule.days.reduce((acc: number, day: any) => acc + day.lessons.length, 0)} всього
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <ScheduleModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={editingSchedule}
      />
    </div>
  );
};
