'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Users, BookOpen, Clock,
  LayoutDashboard, FileText, Settings, Calendar, 
  User as UserIcon, Plus, ArrowRight, Zap, 
  CheckCircle2, AlertCircle, Loader2, BarChart3,
  CalendarDays, MessageSquare, Home
} from 'lucide-react';
import { Header } from '@/shared/components/ui/Header';
import { SideBar } from '@/shared/components/ui/SideBar';
import { teacherNavItems } from '@/shared/constants/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import Link from 'next/link';

export const TeacherPage = () => {
  const { user, token } = useAuthStore();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewDay, setViewDay] = useState<'today' | 'tomorrow'>('today');

  const fetchData = async () => {
    try {
      const [subjectsResp, assignmentsResp, schedulesResp] = await Promise.all([
        fetch('http://localhost:3100/api/auth/subjects', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3100/api/auth/assignments', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3100/api/auth/schedules', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (subjectsResp.ok) setSubjects(await subjectsResp.json());
      if (assignmentsResp.ok) setAssignments(await assignmentsResp.json());
      if (schedulesResp.ok) setSchedules(await schedulesResp.json());
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const DAYS = ["Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця", "Субота"];
  const getDayName = (offset = 0) => {
    const day = (new Date().getDay() + offset) % 7;
    return DAYS[day - 1] || DAYS[0];
  };

  const currentDayName = getDayName(viewDay === 'today' ? 0 : 1);
  
  // Find all lessons for this teacher on the selected day across all schedules
  const teachersLessons = schedules.flatMap(s => {
    const day = s.days?.find((d: any) => d.day === currentDayName);
    return (day?.lessons || []).map((l: any) => ({ ...l, targetClass: s.targetClass }));
  }).filter(l => l.teacherName?.toLowerCase().includes(user?.name?.toLowerCase() || ''));

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return 'Доброї ночі';
    if (hour < 12) return 'Доброго ранку';
    if (hour < 18) return 'Доброго дня';
    return 'Доброго вечора';
  };

  const totalStudents = Array.from(new Set(subjects.flatMap(s => s.studentIds || []))).length;
  const pendingGrading = assignments.reduce((acc, a) => {
    const ungraded = a.submissions?.filter((s: any) => s.grade === undefined && (s.files?.length > 0 || s.comment))?.length || 0;
    return acc + ungraded;
  }, 0);

  return (
    <div className="flex min-h-screen gradient-bg">
      <SideBar items={teacherNavItems} />

      <div className="flex-1 flex flex-col">
        <Header title="Кабінет Викладача" />

        <main className="p-8 space-y-8 overflow-y-auto">
          {/* Teacher Welcome Banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden p-10 rounded-[2.5rem] bg-slate-900 border border-white/5 shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 pointer-events-none" />
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="space-y-4 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-400 border border-indigo-500/20">
                  <GraduationCap size={12} /> Центр керування навчанням
                </div>
                <h1 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">
                  {getTimeGreeting()}, <span className="text-indigo-400">{user?.name?.split(' ')[0]}</span>!
                </h1>
                <p className="text-slate-400 max-w-md text-lg font-medium">
                  Сьогодні у вас <span className="text-white font-bold">{teachersLessons.length} занять</span> та <span className="text-white font-bold">{pendingGrading} робіт</span> на перевірку.
                </p>
              </div>

              <div className="flex gap-4">
                <Link href="/teacher/courses">
                   <Button className="px-8 py-6 rounded-2xl gap-3 shadow-indigo-500/20">
                      <Plus size={20} /> Створити курс
                   </Button>
                </Link>
                <Link href="/teacher/schedule">
                   <Button variant="secondary" className="px-8 py-6 rounded-2xl gap-3">
                      <CalendarDays size={20} /> Розклад
                   </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
               <div className="grid sm:grid-cols-3 gap-6">
                 <StatCard icon={Users} label="Учнів всього" value={totalStudents} color="bg-blue-500" subLabel="Активні студенти" />
                 <StatCard icon={BookOpen} label="Предмети" value={subjects.length} color="bg-purple-500" subLabel="Твої курси" />
                 <StatCard icon={BarChart3} label="До перевірки" value={pendingGrading} color="bg-rose-500" subLabel="Очікують оцінки" />
               </div>

               {/* Teacher's Today/Tomorrow Schedule Card */}
               <Card blur="lg" className="p-8 border-white/5 relative overflow-hidden group">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                         {viewDay === 'today' ? 'Мій розклад на сьогодні' : 'Мій розклад на завтра'}
                      </h2>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{currentDayName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                          <button 
                            onClick={() => setViewDay('today')}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${viewDay === 'today' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                          >
                            Сьогодні
                          </button>
                          <button 
                            onClick={() => setViewDay('tomorrow')}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${viewDay === 'tomorrow' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                          >
                            Завтра
                          </button>
                       </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {teachersLessons.length === 0 ? (
                      <div className="col-span-full py-12 text-center bg-white/5 rounded-3xl border border-dashed border-white/5">
                        <Clock className="mx-auto text-slate-700 mb-2" size={24} />
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Занять не заплановано</p>
                      </div>
                    ) : (
                      teachersLessons.map((lesson: any, idx: number) => (
                        <div key={idx} className="p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all group/lesson flex items-center gap-4">
                          <div className="w-16 text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/5 py-2 rounded-lg border border-indigo-500/10 text-center">
                            {lesson.time}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-black text-white uppercase tracking-tight truncate mb-0.5">{lesson.subjectName}</h4>
                            <div className="flex items-center gap-3 text-[8px] text-slate-500 font-bold uppercase tracking-widest">
                               <span className="flex items-center gap-1 text-indigo-400/80"><Users size={10} /> {lesson.targetClass}</span>
                               {lesson.room && <span className="flex items-center gap-1 text-emerald-400/80"><Home size={10} /> {lesson.room}</span>}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
               </Card>

               {/* Subjects List */}
               <Card blur="lg" className="p-8 border-white/5">
                 <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Мої предмети</h2>
                    <Link href="/teacher/courses" className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors">Всі курси</Link>
                 </div>

                 <div className="grid sm:grid-cols-2 gap-6">
                    {loading ? (
                      <div className="col-span-full py-10 flex justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>
                    ) : subjects.slice(0, 4).map((subject: any) => (
                        <Link key={subject._id} href={`/teacher/courses/${subject._id}`}>
                          <div className="p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.07] transition-all group cursor-pointer relative overflow-hidden">
                             <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <BookOpen size={60} />
                             </div>
                             <h3 className="text-lg font-black text-white uppercase tracking-tight group-hover:text-indigo-400 transition-colors truncate relative z-10">{subject.name}</h3>
                             <div className="flex items-center gap-4 mt-3 text-[9px] text-slate-500 font-bold uppercase tracking-widest relative z-10">
                                <span className="flex items-center gap-1"><Users size={12} /> {subject.studentIds?.length || 0} учнів</span>
                                <span className="text-[8px] font-black text-indigo-400 border border-indigo-400/20 px-2 py-0.5 rounded-full">{subject.joinCode}</span>
                             </div>
                          </div>
                        </Link>
                      ))
                    }
                 </div>
               </Card>
            </div>

            <div className="space-y-8">
               <Card blur="xl" className="p-8 border-white/5 bg-indigo-500/[0.02]">
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-6">Швидкі дії</h3>
                  <div className="grid gap-3">
                     <Link href="/teacher/courses">
                        <ActionButton icon={Plus} label="Створити завдання" description="Додати нову роботу" color="text-emerald-400" />
                     </Link>
                     <ActionButton icon={MessageSquare} label="Чати предметів" description="Відповісти учням" color="text-blue-400" />
                     <ActionButton icon={Settings} label="Налаштування" description="Профіль та приватність" color="text-slate-400" />
                  </div>
               </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, subLabel }: any) => (
  <Card blur="md" className="p-6 border-white/5 group relative overflow-hidden flex flex-col justify-between hover:border-white/10 transition-all">
    <div className={`absolute -right-2 -top-2 opacity-5 transition-transform group-hover:scale-110 group-hover:rotate-12`}>
      <Icon size={70} className="text-white" />
    </div>
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={`p-3 ${color} rounded-xl shadow-lg shadow-black/20`}>
        <Icon size={18} className="text-white" />
      </div>
    </div>
    <div className="relative z-10">
      <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
         <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
         {subLabel && <span className="text-[7px] text-slate-600 font-bold uppercase tracking-widest">{subLabel}</span>}
      </div>
    </div>
  </Card>
);

const ActionButton = ({ icon: Icon, label, description, color }: any) => (
  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/[0.08] transition-all cursor-pointer group w-full">
     <div className="flex items-center gap-4">
        <div className={`p-3 bg-white/5 rounded-xl ${color} group-hover:scale-110 transition-transform`}>
           <Icon size={18} />
        </div>
        <div className="text-left">
           <p className="text-xs font-black text-white uppercase tracking-tight">{label}</p>
           <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{description}</p>
        </div>
     </div>
  </div>
);

const StatusItem = ({ label, status, color }: any) => (
  <div className="flex items-center justify-between">
     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
     <div className="flex items-center gap-2">
        <span className="text-[9px] font-black text-white uppercase tracking-widest">{status}</span>
        <div className={`w-1.5 h-1.5 rounded-full ${color} shadow-[0_0_8px_rgba(16,185,129,0.5)]`} />
     </div>
  </div>
);
