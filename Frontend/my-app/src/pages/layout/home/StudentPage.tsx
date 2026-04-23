'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User as UserIcon, Book, Star,
  LayoutDashboard, BookOpen, FileText, Settings,
  Clock, AlertCircle, CheckCircle2, ArrowRight, Loader2,
  Calendar, Award, Zap, TrendingUp, Bell
} from 'lucide-react';
import { Header } from '@/shared/components/ui/Header';
import { SideBar } from '@/shared/components/ui/SideBar';
import { studentNavItems } from '@/shared/constants/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { AssignmentDetailModal } from '@/pages/components/home/AssignmentDetailModal';
import { FilePreviewModal } from '@/shared/components/ui/FilePreviewModal';
import Link from 'next/link';

export const StudentPage = () => {
  const { user, token } = useAuthStore();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<any>(null);

  const fetchDashboardData = async () => {
    try {
      const [assignmentsResp, schedulesResp] = await Promise.all([
        fetch('http://localhost:3100/api/auth/assignments', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3100/api/auth/schedules', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (assignmentsResp.ok) {
        const data = await assignmentsResp.json();
        setAssignments(data);
      }
      if (schedulesResp.ok) {
        const data = await schedulesResp.json();
        setSchedules(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchDashboardData();
  }, [token]);

  const pendingAssignments = assignments
    .filter(a => !a.submissions?.some((s: any) => String(s.studentId) === String(user?.id) && (s.files?.length > 0 || s.comment)))
    .sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    })
    .slice(0, 3);

  const completedCount = assignments.filter(a => a.submissions?.some((s: any) => String(s.studentId) === String(user?.id) && (s.files?.length > 0 || s.comment))).length;
  
  const grades = assignments
    .flatMap(a => a.submissions || [])
    .filter(s => String(s.studentId) === String(user?.id) && s.grade !== undefined)
    .map(s => s.grade);
  
  const avgGrade = grades.length > 0 ? (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(1) : '0.0';

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return 'Доброї ночі';
    if (hour < 12) return 'Доброго ранку';
    if (hour < 18) return 'Доброго дня';
    return 'Доброго вечора';
  };

  const [viewDay, setViewDay] = useState<'today' | 'tomorrow'>('today');

  const DAYS = ["Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця", "Субота"];
  const getDayName = (offset = 0) => {
    const day = (new Date().getDay() + offset) % 7;
    return DAYS[day - 1] || DAYS[0]; // Map Sunday(0) to Monday(0) for simplicity or keep as is
  };

  const currentDayName = getDayName(viewDay === 'today' ? 0 : 1);
  const todaySchedule = schedules[0]?.days?.find((d: any) => d.day === currentDayName)?.lessons || [];

  return (
    <div className="flex min-h-screen gradient-bg">
      <SideBar items={studentNavItems} />

      <div className="flex-1 flex flex-col">
        <Header title="Мій Кабінет" />

        <main className="p-8 space-y-8 overflow-y-auto">
          {/* Welcome Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden p-10 rounded-[2.5rem] bg-indigo-600 shadow-2xl shadow-indigo-500/20"
          >
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white">
                <Zap size={12} fill="currentColor" /> Твій успіх залежить від тебе
              </div>
              <h1 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">
                {getTimeGreeting()}, {user?.name?.split(' ')[0]}!
              </h1>
              <p className="text-indigo-100 max-w-md text-lg font-medium">
                Сьогодні у тебе <span className="text-white font-bold">{todaySchedule.length} занять</span> та <span className="text-white font-bold">{pendingAssignments.length} активних завдань</span>. Бажаємо успіхів у навчанні!
              </p>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Stats & Schedule */}
            <div className="lg:col-span-2 space-y-8">
              <div className="grid sm:grid-cols-2 gap-6">
                <StatCard icon={Book} label="Виконано" value={completedCount} total={assignments.length} color="bg-blue-500" />
                <StatCard icon={Star} label="Середній бал" value={avgGrade} color="bg-amber-500" subLabel="Навчальний прогрес" />
              </div>

              {/* Today's Schedule Card */}
              <Card blur="lg" className="p-8 border-white/5 relative overflow-hidden group">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                       {viewDay === 'today' ? 'Розклад на сьогодні' : 'Розклад на завтра'}
                    </h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{currentDayName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 mr-4">
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
                     <Link href="/student/schedule">
                       <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-white">Повний</Button>
                     </Link>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {todaySchedule.length === 0 ? (
                    <div className="col-span-full py-10 text-center bg-white/5 rounded-3xl border border-dashed border-white/5">
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Сьогодні занять немає</p>
                    </div>
                  ) : (
                    todaySchedule.slice(0, 4).map((lesson: any, idx: number) => (
                      <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all group/lesson">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2">{lesson.time}</span>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight truncate mb-1">{lesson.subjectName}</h4>
                        <div className="flex items-center gap-1.5 text-[8px] text-slate-500 font-bold uppercase tracking-widest">
                          <span className="truncate">{lesson.teacherName}</span>
                          {lesson.room && <span className="text-emerald-400/80">• {lesson.room}</span>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>

            {/* Right Column: Recent Activity / Assignments */}
            <div className="space-y-8">
              <Card blur="xl" className="p-8 border-white/5 flex flex-col h-full bg-white/[0.02]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">Термінові завдання</h3>
                  <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 animate-pulse">
                    <Bell size={16} />
                  </div>
                </div>

                <div className="space-y-4 flex-1">
                  {loading ? (
                    <div className="flex justify-center p-10"><Loader2 className="animate-spin text-indigo-500" size={24} /></div>
                  ) : pendingAssignments.length === 0 ? (
                    <div className="p-10 text-center space-y-4">
                      <CheckCircle2 className="mx-auto text-emerald-500" size={32} />
                      <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Усі завдання здано!</p>
                    </div>
                  ) : (
                    pendingAssignments.map((a: any) => {
                      const isOverdue = a.deadline && new Date(a.deadline) < new Date();
                      return (
                        <div 
                          key={a._id}
                          onClick={() => setSelectedAssignment(a)}
                          className="group cursor-pointer p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-indigo-500/20 transition-all"
                        >
                          <div className="flex justify-between items-start mb-2">
                             <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest truncate max-w-[120px]">{a.subjectName}</span>
                             {isOverdue && <span className="text-[7px] font-black text-red-400 uppercase tracking-widest border border-red-400/20 px-1.5 py-0.5 rounded-full">Терміново</span>}
                          </div>
                          <h4 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-indigo-400 transition-colors mb-2 line-clamp-1">{a.title}</h4>
                          <div className="flex items-center gap-2 text-[8px] text-slate-500 font-bold uppercase tracking-widest">
                            <Clock size={10} /> {a.deadline ? new Date(a.deadline).toLocaleDateString() : 'Без дедлайну'}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <Link href="/student/tasks" className="mt-6">
                  <Button variant="secondary" size="sm" className="w-full text-[10px] font-black uppercase tracking-[0.2em] py-4 rounded-xl">
                    Усі завдання <ArrowRight size={14} className="ml-2" />
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <AssignmentDetailModal 
        isOpen={!!selectedAssignment} 
        onClose={() => setSelectedAssignment(null)} 
        assignment={selectedAssignment}
        subjectId={selectedAssignment?.subjectId}
        onUpdate={fetchDashboardData}
        onOpenPreview={(file) => {
          setPreviewFile(file);
          setIsPreviewOpen(true);
        }}
      />

      <FilePreviewModal 
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, total, subLabel }: any) => (
  <Card blur="md" className="p-6 border-white/5 group relative overflow-hidden flex flex-col justify-between hover:border-white/10 transition-all">
    <div className={`absolute -right-2 -top-2 opacity-5 transition-transform group-hover:scale-110 group-hover:rotate-12`}>
      <Icon size={70} className="text-white" />
    </div>
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={`p-3 ${color} rounded-xl shadow-lg shadow-black/20`}>
        <Icon size={18} className="text-white" />
      </div>
      {total && (
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
          {value} / {total} одиниць
        </span>
      )}
    </div>
    <div className="relative z-10">
      <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
         <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
         {subLabel && <span className="text-[7px] text-slate-600 font-bold uppercase tracking-widest">{subLabel}</span>}
      </div>
    </div>
    {total && (
      <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
         <div className={`h-full ${color}`} style={{ width: `${(value / total) * 100}%` }} />
      </div>
    )}
  </Card>
);
