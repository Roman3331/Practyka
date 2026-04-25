'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Clock, ChevronRight, 
  AlertCircle, CheckCircle2, Calendar, 
  BookOpen, ArrowRight, Loader2, Info, Award
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Header } from '@/shared/components/ui/Header';
import { SideBar } from '@/shared/components/ui/SideBar';
import { studentNavItems } from '@/shared/constants/navigation';
import Link from 'next/link';
import { AssignmentDetailModal } from '@/pages/components/home/AssignmentDetailModal';
import { FilePreviewModal } from '@/shared/components/ui/FilePreviewModal';

export default function StudentTasksPage() {
  const { user, token } = useAuthStore();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted'>('pending');
  
  // Modal states
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<any>(null);

  const fetchAssignments = async () => {
    try {
      const resp = await fetch('http://localhost:3100/api/auth/assignments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await resp.json();
      if (resp.ok) {
        setAssignments(data);
        // Refresh selected assignment if it exists
        if (selectedAssignment) {
          const updated = data.find((a: any) => a._id === selectedAssignment._id);
          if (updated) setSelectedAssignment(updated);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAssignments();
  }, [token]);

  const filteredAssignments = assignments.filter(a => {
    const isSubmitted = a.submissions?.some((s: any) => String(s.studentId) === String(user?.id));
    if (filter === 'pending') return !isSubmitted;
    if (filter === 'submitted') return isSubmitted;
    return true;
  }).sort((a, b) => {
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  return (
    <div className="flex min-h-screen gradient-bg">
      <SideBar items={studentNavItems} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Мої Завдання" />

        <main className="p-4 sm:p-8 space-y-6 sm:space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter text-gradient leading-tight">Навчальні Завдання</h2>
              <p className="text-slate-500 text-sm sm:text-base font-medium">Список всіх завдань з ваших предметів</p>
            </div>

            <div className="flex bg-white/5 p-1 rounded-xl sm:rounded-2xl border border-white/5 overflow-x-auto no-scrollbar shrink-0">
              {(['all', 'pending', 'submitted'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 sm:px-6 py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    filter === f 
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                      : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {f === 'all' ? 'Всі' : f === 'pending' ? 'До виконання' : 'Здані'}
                </button>
              ))}
            </div>
          </div>


          {loading ? (
            <div className="flex h-[40vh] items-center justify-center">
              <Loader2 className="animate-spin text-indigo-500" size={48} />
            </div>
          ) : filteredAssignments.length === 0 ? (
            <Card blur="lg" className="p-20 text-center space-y-6 bg-white/5 border-dashed border-white/10">
              <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mx-auto text-slate-700 border border-white/5 shadow-inner">
                <FileText size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Завдань не знайдено</h3>
                <p className="text-slate-500 max-w-sm mx-auto">У цій категорії поки немає завдань. Чудова робота!</p>
              </div>
            </Card>
          ) : (
            <div className="grid gap-6">
              <AnimatePresence mode="popLayout">
                {filteredAssignments.map((assignment, idx) => {
                  const isSubmitted = assignment.submissions?.some((s: any) => String(s.studentId) === String(user?.id));
                  const isOverdue = assignment.deadline && new Date(assignment.deadline) < new Date() && !isSubmitted;
                  
                  return (
                    <motion.div
                      key={assignment._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card 
                        blur="sm" 
                        className="p-6 border-white/5 hover:border-indigo-500/30 transition-all group relative overflow-hidden cursor-pointer"
                        onClick={() => setSelectedAssignment(assignment)}
                      >
                        <div className={`absolute top-0 left-0 w-1 h-full transition-all ${
                          isSubmitted ? 'bg-emerald-500' : isOverdue ? 'bg-red-500' : 'bg-indigo-500'
                        }`} />
                        
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex items-center gap-6">
                            <div className={`p-4 rounded-2xl transition-all shadow-lg ${
                              isSubmitted ? 'bg-emerald-500/10 text-emerald-400' : 
                              isOverdue ? 'bg-red-500/10 text-red-400' : 
                              'bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white'
                            }`}>
                              <FileText size={28} />
                            </div>
                            
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{assignment.subjectName}</p>
                              <h4 className="text-2xl font-bold text-white uppercase tracking-tight">{assignment.title}</h4>
                              <div className="flex items-center gap-4 text-slate-500">
                                <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                  <Calendar size={12} /> {assignment.deadline ? new Date(assignment.deadline).toLocaleString() : 'Без терміну'}
                                </span>
                                {assignment.maxGrade && (
                                  <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1 text-amber-500">
                                    <Award size={12} /> {assignment.maxGrade} балів макс.
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                             <div className="text-right hidden md:block">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Статус</p>
                                <div className="flex items-center gap-2">
                                  {isSubmitted ? (
                                    <>
                                      <CheckCircle2 size={16} className="text-emerald-500" />
                                      <span className="text-sm font-bold text-emerald-400">Здано</span>
                                    </>
                                  ) : isOverdue ? (
                                    <>
                                      <AlertCircle size={16} className="text-red-500" />
                                      <span className="text-sm font-bold text-red-400">Прострочено</span>
                                    </>
                                  ) : (
                                    <>
                                      <Clock size={16} className="text-indigo-400" />
                                      <span className="text-sm font-bold text-indigo-400">Очікує</span>
                                    </>
                                  )}
                                </div>
                             </div>
                             
                             <Button variant={isSubmitted ? 'outline' : 'default'} className="gap-2 group/btn">
                               Переглянути <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                             </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>

      <AssignmentDetailModal 
        isOpen={!!selectedAssignment} 
        onClose={() => setSelectedAssignment(null)} 
        assignment={selectedAssignment}
        subjectId={selectedAssignment?.subjectId}
        onUpdate={fetchAssignments}
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
}
