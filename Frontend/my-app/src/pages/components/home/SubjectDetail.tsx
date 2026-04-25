'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, BookOpen, Users, Calendar, ArrowLeft, 
  FileText, MessageSquare, Settings, Share2, 
  GraduationCap, ClipboardList, Info, Loader2,
  Upload, Download, Trash2, File as FileIcon, 
  CheckCircle2, Send, Plus, User as UserIcon,
  Eye, XCircle, Edit, X
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Tabs } from '@/shared/components/ui/Tabs';
import { Input } from '@/shared/components/ui/Input';
import { useWebSocket } from '@/shared/hooks/useWebSocket';
import { useConfirmStore } from '@/store/useConfirmStore';
import { AssignmentModal } from './AssignmentModal';
import { MaterialModal } from './MaterialModal';
import { AssignmentDetailModal } from './AssignmentDetailModal';
import { TestModal } from './TestModal';
import { TestTakeModal } from './TestTakeModal';
import { TestResultsModal } from './TestResultsModal';
import { FilePreviewModal } from '@/shared/components/ui/FilePreviewModal';
import Link from 'next/link';

interface SubjectDetailProps {
  id: string;
}

export const SubjectDetail = ({ id }: SubjectDetailProps) => {
  const { user, token } = useAuthStore();
  const { confirm } = useConfirmStore();
  const [subject, setSubject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubject = async () => {
    try {
      const response = await fetch(`http://localhost:3100/api/auth/subjects/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Subject not found');
      setSubject(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSubject();
    }
  }, [id, token]);

  useWebSocket((event) => {
    const { type, data } = event;
    if (data?.subjectId === id || data?.id === id) {
      fetchSubject();
    }
    if (type === 'subject_deleted' && data.id === id) {
      setError('Цей предмет було видалено викладачем.');
    }
  });

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ url: string, name: string, type: string } | null>(null);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<any>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<any>(null);
  const [isTestTakeOpen, setIsTestTakeOpen] = useState(false);
  const [activeTestId, setActiveTestId] = useState<string | null>(null);
  const [viewingResultsTest, setViewingResultsTest] = useState<any>(null);
  
  // Params handling
  const searchParams = useSearchParams();
  const [initialTab, setInitialTab] = useState<'work' | 'chat'>('work');
  const [initialStudentId, setInitialStudentId] = useState<string | null>(null);

  useEffect(() => {
    const assignmentId = searchParams.get('assignmentId');
    const studentId = searchParams.get('studentId');
    const tab = searchParams.get('tab');

    if (assignmentId && subject?.assignments) {
      const exists = subject.assignments.find((a: any) => a._id === assignmentId);
      if (exists) {
        setInitialTab(tab === 'chat' ? 'chat' : 'work');
        setInitialStudentId(studentId);
        setSelectedTaskId(assignmentId);
        setIsDetailOpen(true);
      }
    }
  }, [searchParams, subject?.assignments]);

  const selectedTask = (subject?.assignments || []).find((a: any) => a._id === (selectedTaskId || ''));

  const openTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsDetailOpen(true);
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="animate-spin text-indigo-500" size={48} />
    </div>
  );

  if (error || !subject) return (
    <Card blur="lg" className="p-20 text-center space-y-6">
      <div className="text-red-400 bg-red-400/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto border border-red-400/20 text-gradient">
        <Info size={40} />
      </div>
      <h2 className="text-3xl font-bold text-white uppercase tracking-tighter">Предмет не знайдено</h2>
      <Link href={`/${user?.role}/courses`}>
        <Button variant="outline">Вернутися до списку</Button>
      </Link>
    </Card>
  );

  const tabs = [
    { id: 'feed', label: 'Стрічка', content: <Feed subject={subject} onUpdate={fetchSubject} onOpenTask={openTask} onOpenPreview={setPreviewFile} /> },
    { 
      id: 'tasks', 
      label: 'Завдання', 
      content: <TasksList 
        subject={subject} 
        onUpdate={fetchSubject} 
        onOpenTask={openTask} 
        onOpenPreview={setPreviewFile} 
        onEditTask={(task: any) => {
          setEditingAssignment(task);
          setIsAssignmentModalOpen(true);
        }}
        onAddNew={() => {
          setEditingAssignment(null);
          setIsAssignmentModalOpen(true);
        }}
      /> 
    },
    { id: 'materials', label: 'Матеріали', content: <MaterialsList subjectId={id} materials={subject.materials || []} onUpdate={fetchSubject} onOpenPreview={setPreviewFile} /> },
    { 
      id: 'tests', 
      label: 'Тести', 
      content: <TestsList 
        subject={subject} 
        onUpdate={fetchSubject} 
        onOpenTest={(testId: string) => {
          setActiveTestId(testId);
          setIsTestTakeOpen(true);
        }}
        onEditTest={(test: any) => {
          setEditingTest(test);
          setIsTestModalOpen(true);
        }}
        onViewResults={(test: any) => {
          setViewingResultsTest(test);
        }}
        onAddNew={() => {
          setEditingTest(null);
          setIsTestModalOpen(true);
        }}
      /> 
    },
    { id: 'students', label: 'Учасники', content: <ParticipantsList subject={subject} /> },
  ];

  const handleCreateOrUpdateAssignment = async (data: any) => {
    const uploadedFiles: { url: string, name: string }[] = [...data.existingFiles];

    if (data.files && data.files.length > 0) {
      for (const file of data.files) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadResp = await fetch(`http://localhost:3100/api/auth/subjects/${id}/assignments/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });
        const uploadData = await uploadResp.json();
        if (uploadResp.ok) {
          uploadedFiles.push({ url: uploadData.fileUrl, name: uploadData.fileName });
        }
      }
    }

    const method = editingAssignment ? 'PATCH' : 'POST';
    const url = editingAssignment 
      ? `http://localhost:3100/api/auth/subjects/${id}/assignments/${editingAssignment._id}`
      : `http://localhost:3100/api/auth/subjects/${id}/assignments`;

    const resp = await fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({
        title: data.title,
        description: data.description,
        deadline: data.deadline,
        maxGrade: data.maxGrade ? Number(data.maxGrade) : undefined,
        files: uploadedFiles
      })
    });

    if (resp.ok) {
      fetchSubject();
    }
  };

  const handleCreateOrUpdateTest = async (data: any) => {
    const method = editingTest ? 'PATCH' : 'POST';
    const url = editingTest 
      ? `http://localhost:3100/api/auth/subjects/${id}/tests/${editingTest._id}`
      : `http://localhost:3100/api/auth/subjects/${id}/tests`;

    const resp = await fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(data)
    });

    if (resp.ok) {
      fetchSubject();
    }
  };

  return (
    <div className="space-y-12">
      <TestResultsModal 
        isOpen={!!viewingResultsTest} 
        onClose={() => setViewingResultsTest(null)} 
        test={viewingResultsTest} 
      />
      <div className="flex flex-col xl:flex-row gap-6 sm:gap-8 items-start justify-between">
        <div className="space-y-4 sm:space-y-6 w-full xl:max-w-3xl">
          <Link href={`/${user?.role}/courses`} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Назад до списку</span>
          </Link>
          <div className="space-y-2 sm:space-y-3">
            <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tighter text-gradient leading-tight sm:leading-[0.9] break-words">
              {subject.name}
            </h1>
            <p className="text-slate-400 max-w-2xl text-xs sm:text-lg leading-relaxed">
              {subject.description || 'Опис предмета відсутній.'}
            </p>
          </div>
        </div>


        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full xl:w-auto">
          {user?.role === 'teacher' && (
            <Card blur="sm" className="px-4 py-3 sm:px-6 sm:py-4 flex flex-1 sm:flex-none items-center justify-between sm:justify-start gap-4 sm:gap-6 border-indigo-500/20 bg-indigo-500/5 shadow-2xl hover:border-indigo-500/40 transition-all">
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-[8px] sm:text-[10px] font-black text-indigo-400 uppercase tracking-widest">Код приєднання</p>
                <code className="text-lg sm:text-2xl font-mono font-bold text-white tracking-[0.1em] sm:tracking-[0.2em]">{subject.joinCode}</code>
              </div>
              <Button size="sm" variant="ghost" className="p-1.5 sm:p-3 bg-white/5 rounded-lg sm:rounded-xl"><Share2 size={16} className="sm:w-[18px] sm:h-[18px]" /></Button>
            </Card>
          )}
          <Card blur="sm" className="px-4 py-3 sm:px-6 sm:py-4 flex flex-1 sm:flex-none items-center gap-4 sm:gap-6 bg-white/5 border-white/10 shadow-2xl">
            <div className="p-1.5 sm:p-3 bg-indigo-500/10 rounded-lg sm:rounded-2xl text-indigo-400 shrink-0"><Users size={18} className="sm:w-6 sm:h-6" /></div>
            <div className="space-y-0.5 sm:space-y-1">
              <p className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">Учнів</p>
              <p className="text-lg sm:text-2xl font-black text-white">{subject.studentIds?.length || 0}</p>
            </div>
          </Card>
        </div>

      </div>


      <Tabs tabs={tabs} />

      <AssignmentDetailModal 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        assignment={selectedTask}
        subjectId={id}
        students={subject.students || []}
        onUpdate={fetchSubject}
        onOpenPreview={setPreviewFile}
        initialTab={initialTab}
        initialStudentId={initialStudentId}
      />

      <FilePreviewModal 
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />

      <AssignmentModal 
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        onSubmit={handleCreateOrUpdateAssignment}
        initialData={editingAssignment}
      />

      <TestModal 
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        onSubmit={handleCreateOrUpdateTest}
        initialData={editingTest}
      />

      <TestTakeModal 
        isOpen={isTestTakeOpen}
        onClose={() => setIsTestTakeOpen(false)}
        testId={activeTestId || ''}
        subjectId={id}
        onFinished={fetchSubject}
      />
    </div>
  );
};

const TasksList = ({ subject, onUpdate, onOpenTask, onOpenPreview, onEditTask, onAddNew }: any) => {
  const { user, token } = useAuthStore();
  const { confirm } = useConfirmStore();
  
  // handleCreateAssignment removed from here, logic moved to parent SubjectDetail

  const handleDelete = async (assignmentId: string) => {
    confirm({
      title: 'Видалити завдання?',
      message: 'Ви впевнені, що хочете видалити це завдання? Усі здані роботи учнів також будуть видалені.',
      onConfirm: async () => {
        try {
          await fetch(`http://localhost:3100/api/auth/subjects/${subject._id}/assignments/${assignmentId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
          });
          onUpdate();
        } catch (err) { console.error(err); }
      }
    });
  };

  const assignments = subject.assignments || [];

  return (
    <div className="space-y-8 mt-4">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Навчальні завдання</h3>
        </div>
        {user?.role === 'teacher' && (
          <Button onClick={onAddNew} className="gap-3 shadow-indigo-500/20">
            <Plus size={20} /> Створити завдання
          </Button>
        )}
      </div>

      {assignments.length === 0 ? (
        <SectionPlaceholder 
          icon={FileText} 
          title="Завдань ще немає" 
          subtitle="Тут з'являтимуться всі лабораторні та практичні роботи" 
        />
      ) : (
        <div className="grid gap-6">
          {assignments.map((task: any) => (
            <Card 
              key={task._id} 
              blur="sm" 
              className="p-6 border-white/5 hover:border-indigo-500/30 transition-all group cursor-pointer"
              onClick={() => onOpenTask(task._id)}
            >
               <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      <ClipboardList size={24} />
                    </div>
                    <div>
                       <div className="flex items-center gap-3">
                         <h4 className="text-xl font-bold text-white uppercase tracking-tight">{task.title || 'Без назви'}</h4>
                         {user?.role === 'student' && task.submissions?.some((s: any) => String(s.studentId) === String(user?.id) && (s.files?.length > 0 || s.comment)) && (
                           <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1">
                             <CheckCircle2 size={12} className="text-emerald-500" />
                             <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Здано</span>
                           </div>
                         )}
                       </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                          <Calendar size={12} /> {task.deadline ? new Date(task.deadline).toLocaleString() : 'Без терміну'}
                        </span>
                        {task.files && task.files.length > 0 && (
                          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                            <FileIcon size={12} /> {task.files.length === 1 ? 'Прикріплено файл' : `Файлів: ${task.files.length}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {user?.role === 'teacher' && (
                    <div className="flex items-center gap-2">
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         className="p-2 text-slate-600 hover:text-indigo-400 hover:bg-indigo-500/10" 
                         onClick={(e) => {
                           e.stopPropagation();
                           onEditTask(task);
                         }}
                       >
                         <Edit size={20} />
                       </Button>
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10" 
                         onClick={(e) => {
                           e.stopPropagation();
                           handleDelete(task._id);
                         }}
                       >
                         <Trash2 size={20} />
                       </Button>
                    </div>
                  )}
               </div>

               {task.description && (
                 <p className="text-slate-400 text-sm mb-6 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                   {task.description}
                 </p>
               )}

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                   <div className="flex flex-col gap-2 w-full">
                     {task.files && task.files.map((file: any, idx: number) => (
                       <div key={idx} className="flex items-center gap-4 justify-between w-full">
                         <div className="flex items-center gap-4">
                           <Button 
                             variant="ghost" 
                             size="sm" 
                             className="flex items-center gap-2 text-[10px] font-black text-indigo-400 hover:text-white transition-colors uppercase tracking-widest p-0 h-auto"
                             onClick={(e) => {
                               e.stopPropagation();
                               onOpenPreview({ url: file.url, name: file.name, type: '' });
                             }}
                           >
                             <Eye size={12} /> Переглянути
                           </Button>
                           <a 
                             href={file.url} 
                             target="_blank" 
                             download
                             className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest"
                             onClick={(e) => e.stopPropagation()}
                           >
                             <Download size={12} /> {file.name}
                           </a>
                         </div>
                       </div>
                     ))}
                   </div>
                   <Button variant="outline" size="sm" className="text-[10px] uppercase font-black tracking-widest shrink-0 ml-4">
                     {user?.role === 'teacher' ? 'Переглянути відповіді' : 'Здати завдання'}
                   </Button>
                </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const Feed = ({ subject, onUpdate, onOpenTask, onOpenPreview }: any) => {
  const { user, token } = useAuthStore();
  const { confirm } = useConfirmStore();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const feedItems = [
    ...(subject.announcements || []).map((a: any) => ({ ...a, feedType: 'announcement' })),
    ...(subject.materials || []).map((m: any) => ({ ...m, feedType: 'material', createdAt: m.uploadedAt })),
    ...(subject.assignments || []).map((t: any) => ({ ...t, feedType: 'assignment' })),
    ...(subject.tests || []).map((t: any) => ({ ...t, feedType: 'test' })),
  ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      const resp = await fetch(`http://localhost:3100/api/auth/subjects/${subject._id}/announcements`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ content })
      });
      if (resp.ok) {
        setContent('');
        onUpdate();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    confirm({
      title: 'Видалити оголошення?',
      message: 'Ви впевнені, що хочете видалити це оголошення?',
      onConfirm: async () => {
        try {
          await fetch(`http://localhost:3100/api/auth/subjects/${subject._id}/announcements/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          onUpdate();
        } catch (err) { console.error(err); }
      }
    });
  };

  const handleUpdateAnnouncement = async (id: string) => {
    if (!editContent.trim()) return;
    try {
      await fetch(`http://localhost:3100/api/auth/subjects/${subject._id}/announcements/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ content: editContent })
      });
      setEditingId(null);
      onUpdate();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 mt-8">
      {user?.role === 'teacher' && (
        <Card blur="lg" className="p-4 sm:p-6 border-indigo-500/10 overflow-hidden relative">
          <form onSubmit={handlePost} className="space-y-4">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 overflow-hidden border-2 border-white/10">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user.firstName[0]
                )}
              </div>
              <textarea 
                placeholder="Поділіться чимось з групою..." 
                className="flex-1 bg-transparent border-none outline-none text-white resize-none py-2 text-lg placeholder:text-slate-600"
                rows={2}
                value={content}
                onChange={e => setContent(e.target.value)}
              />
            </div>
            <div className="flex justify-end pt-4 border-t border-white/5">
              <Button type="submit" size="sm" className="gap-3" isLoading={loading} disabled={!content.trim()}>
                <Send size={16} /> Опублікувати
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-6 relative pb-10">
        <div className="absolute left-[23px] top-4 bottom-4 w-0.5 bg-white/5" />
        
        {feedItems.length === 0 ? (
          <SectionPlaceholder icon={MessageSquare} title="Стрічка порожня" subtitle="Тут з'являтимуться всі новини, завдання та оголошення" />
        ) : (
          feedItems.map((item: any) => (
            <div key={item._id} className="relative pl-12 sm:pl-16">
                <div className={`absolute left-0 top-1 w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 sm:border-4 border-slate-950 z-10 ${
                  item.feedType === 'announcement' ? 'bg-indigo-500 text-white' : 
                  item.feedType === 'material' ? 'bg-emerald-500 text-white' : 
                  item.feedType === 'test' ? 'bg-amber-500 text-white' : 'bg-purple-500 text-white'
                }`}>
                   {item.feedType === 'announcement' ? <MessageSquare size={18} /> : 
                    item.feedType === 'material' ? <FileIcon size={18} /> : 
                    item.feedType === 'test' ? <GraduationCap size={18} /> : <ClipboardList size={18} />}
                </div>
               
               <Card blur="sm" className="p-6 space-y-4 hover:border-white/10 transition-all border-white/5 group">
                 <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-white uppercase tracking-tight">
                        {item.feedType === 'announcement' ? 'Оголошення від викладача' : 
                         item.feedType === 'material' ? 'Новий матеріал додано' : 
                         item.feedType === 'test' ? 'Новий тест додано' : 'Нове завдання'}
                      </p>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{new Date(item.createdAt).toLocaleString()}</span>
                    </div>

                    {item.feedType === 'announcement' && user?.role === 'teacher' && (
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setEditingId(item._id);
                            setEditContent(item.content);
                          }}
                          className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteAnnouncement(item._id)}
                          className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                 </div>

                 <div className="text-slate-400 leading-relaxed text-lg">
                    {item.feedType === 'announcement' ? (
                      editingId === item._id ? (
                        <div className="space-y-4">
                          <textarea 
                            className="w-full bg-white/5 border border-indigo-500/30 rounded-2xl p-4 text-white focus:outline-none focus:border-indigo-500 transition-all resize-none font-bold"
                            value={editContent}
                            onChange={e => setEditContent(e.target.value)}
                            rows={3}
                            autoFocus
                          />
                          <div className="flex gap-2">
                             <Button size="sm" onClick={() => handleUpdateAnnouncement(item._id)} className="gap-2"><Send size={14} /> Зберегти</Button>
                             <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>Скасувати</Button>
                          </div>
                        </div>
                      ) : <p className="whitespace-pre-wrap">{item.content}</p>
                    ) : item.feedType === 'assignment' ? (
                      <div className="space-y-4">
                        <div 
                          className="flex items-center gap-4 p-5 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 group/task cursor-pointer hover:border-indigo-500/30 transition-all"
                          onClick={() => onOpenTask(item._id)}
                        >
                           <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover/task:bg-indigo-500 group-hover/task:text-white transition-all"><ClipboardList size={24} /></div>
                           <div className="flex-1">
                             <div className="flex items-center gap-3">
                               <p className="text-white font-bold text-xl">{item.title}</p>
                               {item.files && item.files.length > 0 && (
                                 <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[8px] font-black text-indigo-400 uppercase tracking-widest">
                                   <FileIcon size={10} /> {item.files.length} файлів
                                 </span>
                               )}
                             </div>
                             <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Кінцевий термін: {item.deadline ? new Date(item.deadline).toLocaleString() : 'Без терміну'}</p>
                           </div>
                        </div>
                        {item.description && <p className="text-sm border-l-2 border-white/5 pl-4 ml-2">{item.description}</p>}
                      </div>
                    ) : item.feedType === 'test' ? (
                      <div className="space-y-4">
                        <div 
                          className="flex items-center gap-4 p-5 bg-amber-500/5 rounded-2xl border border-amber-500/10 group/test cursor-pointer hover:border-amber-500/30 transition-all"
                          onClick={() => {
                            // Switch to tests tab or open test
                          }}
                        >
                           <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 group-hover/test:bg-amber-500 group-hover/test:text-white transition-all"><GraduationCap size={24} /></div>
                           <div className="flex-1">
                             <p className="text-white font-bold text-xl">{item.title}</p>
                             <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">{item.questionsToShow} питань | {item.attemptsAllowed} спроб</p>
                           </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 p-5 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                           <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400"><FileIcon size={24} /></div>
                           <div>
                             <p className="text-white font-bold text-xl">{item.name}</p>
                             <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">{item.files?.length || 0} прикріплених файлів</p>
                           </div>
                        </div>
                        <div className="grid gap-2 pl-4 border-l border-white/5">
                           {item.files && item.files.map((f: any, i: number) => (
                             <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-transparent hover:border-white/10 transition-all">
                               <div className="flex items-center gap-3">
                                 <FileIcon size={14} className="text-slate-500" />
                                 <span className="text-xs font-bold text-slate-300">{f.name}</span>
                               </div>
                               <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm" className="p-2 text-indigo-400 hover:bg-indigo-500/10" onClick={() => onOpenPreview({ url: f.url, name: f.name, type: '' })}><Eye size={16} /></Button>
                                  <a href={f.url} target="_blank" download><Button variant="ghost" size="sm" className="p-2 text-emerald-400 hover:bg-emerald-500/10"><Download size={16} /></Button></a>
                               </div>
                             </div>
                           ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const MaterialsList = ({ subjectId, materials, onUpdate, onOpenPreview }: any) => {
  const { user, token } = useAuthStore();
  const { confirm } = useConfirmStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any>(null);

  const handleCreateOrUpdateMaterial = async (data: any) => {
    const uploadedFiles: { url: string, name: string }[] = [...(data.existingFiles || [])];

    if (data.files && data.files.length > 0) {
      for (const file of data.files) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadResp = await fetch(`http://localhost:3100/api/auth/subjects/${subjectId}/materials/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });
        const uploadData = await uploadResp.json();
        if (uploadResp.ok) {
          uploadedFiles.push({ url: uploadData.fileUrl, name: uploadData.fileName });
        }
      }
    }

    const method = editingMaterial ? 'PATCH' : 'POST';
    const url = editingMaterial 
      ? `http://localhost:3100/api/auth/subjects/${subjectId}/materials/${editingMaterial._id}`
      : `http://localhost:3100/api/auth/subjects/${subjectId}/materials`;

    const resp = await fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({
        name: data.name,
        files: uploadedFiles
      })
    });

    if (resp.ok) {
      onUpdate();
      setIsModalOpen(false);
      setEditingMaterial(null);
    }
  };

  const handleDelete = async (materialId: string) => {
    confirm({
      title: 'Видалити матеріал?',
      message: 'Ви впевнені, що хочете видалити цей навчальний матеріал?',
      onConfirm: async () => {
        try {
          await fetch(`http://localhost:3100/api/auth/subjects/${subjectId}/materials/${materialId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
          });
          onUpdate();
        } catch (err) { console.error(err); }
      }
    });
  };

  return (
    <div className="space-y-8 mt-4">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Навчальна бібліотека</h3>
        </div>
        {user?.role === 'teacher' && (
          <Button 
            onClick={() => {
              setEditingMaterial(null);
              setIsModalOpen(true);
            }} 
            className="gap-3 shadow-indigo-500/20"
          >
            <Plus size={20} /> Додати матеріал
          </Button>
        )}
      </div>
      <MaterialModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingMaterial(null);
        }} 
        onSubmit={handleCreateOrUpdateMaterial} 
        initialData={editingMaterial}
      />
      <div className="grid gap-4">
        {materials.map((material: any) => (
          <Card key={material._id} blur="sm" className="p-5 space-y-4 group hover:bg-white/5 transition-all border-white/5">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-5">
                 <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shrink-0">
                   <FileIcon size={26} />
                 </div>
                 <div>
                   <h4 className="font-bold text-white text-lg group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{material.name}</h4>
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{material.files?.length || 0} файлів у матеріалі</p>
                 </div>
               </div>
               
               {user?.role === 'teacher' && (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-3 text-slate-600 hover:text-indigo-400 hover:bg-indigo-500/10" 
                    onClick={() => {
                      setEditingMaterial(material);
                      setIsModalOpen(true);
                    }}
                  >
                    <Edit size={20} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-3 text-slate-600 hover:text-red-500 hover:bg-red-500/10" 
                    onClick={() => handleDelete(material._id)}
                  >
                    <Trash2 size={20} />
                  </Button>
                </div>
               )}
             </div>

             <div className="grid gap-2 pl-4 border-l border-white/10">
               {material.files && material.files.map((file: any, idx: number) => (
                 <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all border border-transparent hover:border-white/5">
                    <div className="flex items-center gap-3">
                      <FileIcon size={16} className="text-slate-500" />
                      <span className="text-xs font-bold text-slate-300 truncate max-w-[200px]">{file.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         className="p-2 text-indigo-400 hover:bg-indigo-500/10"
                         onClick={() => onOpenPreview({ url: file.url, name: file.name, type: '' })}
                       >
                         <Eye size={16} />
                       </Button>
                       <a href={file.url} target="_blank" download>
                         <Button variant="ghost" size="sm" className="p-2 text-emerald-400 hover:bg-emerald-500/10"><Download size={16} /></Button>
                       </a>
                    </div>
                  </div>
                ))}
              </div>
           </Card>
         ))}
       </div>
     </div>
   );
 };

const TestsList = ({ subject, onUpdate, onOpenTest, onEditTest, onViewResults, onAddNew }: any) => {
  const { user, token } = useAuthStore();
  const { confirm } = useConfirmStore();

  const handleDelete = async (testId: string) => {
    confirm({
      title: 'Видалити тест?',
      message: 'Ви впевнені, що хочете видалити цей тест? Усі результати учнів будуть видалені назавжди.',
      onConfirm: async () => {
        try {
          await fetch(`http://localhost:3100/api/auth/subjects/${subject._id}/tests/${testId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
          });
          onUpdate();
        } catch (err) { console.error(err); }
      }
    });
  };

  const tests = subject.tests || [];

  return (
    <div className="space-y-8 mt-4">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Оцінювальні тести</h3>
        </div>
        {user?.role === 'teacher' && (
          <Button onClick={onAddNew} className="gap-3 shadow-indigo-500/20">
            <Plus size={20} /> Створити тест
          </Button>
        )}
      </div>

      {tests.length === 0 ? (
        <SectionPlaceholder 
          icon={ClipboardList} 
          title="Тестів ще немає" 
          subtitle="Тут з'являтимуться тести для перевірки знань" 
        />
      ) : (
        <div className="grid gap-6">
          {tests.map((test: any) => {
            const studentResults = test.results?.filter((r: any) => String(r.studentId) === String(user?.id)) || [];
            const hasAttemptsLeft = studentResults.length < test.attemptsAllowed;
            const bestResult = studentResults.length > 0 
              ? Math.max(...studentResults.map((r: any) => r.score))
              : null;

            return (
              <Card 
                key={test._id} 
                blur="sm" 
                className="p-6 border-white/5 hover:border-indigo-500/30 transition-all group overflow-hidden relative"
              >
                 <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-5">
                      <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-lg">
                        <GraduationCap size={28} />
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold text-white uppercase tracking-tight">{test.title}</h4>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                            <Clock size={12} /> {test.attemptsAllowed} спроб дозволено
                          </span>
                          {test.timeLimit > 0 && (
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                              <Clock size={12} className="text-amber-500" /> {test.timeLimit} хв
                            </span>
                          )}
                          {test.deadline && (
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1">
                              <Calendar size={12} /> до {new Date(test.deadline).toLocaleString()}
                            </span>
                          )}
                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                            <Info size={12} /> {test.questionsToShow} питань з {test.questions?.length || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {user?.role === 'teacher' && (
                      <div className="flex items-center gap-2">
                         <Button 
                           variant="ghost" 
                           size="sm" 
                           className="p-2 text-slate-600 hover:text-indigo-400 hover:bg-indigo-500/10" 
                           onClick={() => onEditTest(test)}
                         >
                           <Edit size={20} />
                         </Button>
                         <Button 
                           variant="ghost" 
                           size="sm" 
                           className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10" 
                           onClick={() => handleDelete(test._id)}
                         >
                           <Trash2 size={20} />
                         </Button>
                      </div>
                    )}
                 </div>

                 <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex items-center gap-8">
                       <div className="space-y-1">
                         <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Максимальний бал</p>
                         <p className="text-xl font-black text-white">{test.maxGrade}</p>
                       </div>
                       
                       {user?.role === 'student' && studentResults.length > 0 && (
                         <div className="flex gap-6">
                            <div className="space-y-1">
                              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Найкращий результат</p>
                              <p className="text-xl font-black text-emerald-400">{bestResult} / {test.maxGrade}</p>
                            </div>
                            <div className="space-y-1">
                               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Всі спроби</p>
                               <div className="flex gap-1">
                                  {studentResults.map((r: any, i: number) => (
                                    <span key={i} className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-bold text-slate-400 border border-white/5">
                                      {r.score}
                                    </span>
                                  ))}
                               </div>
                            </div>
                         </div>
                       )}

                       {user?.role === 'teacher' && (
                         <div className="space-y-1">
                           <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Всього здано</p>
                           <p className="text-xl font-black text-white">{test.results?.length || 0}</p>
                         </div>
                       )}
                    </div>

                    <div className="flex items-center gap-4">
                      {user?.role === 'student' && (
                        <div className="text-right mr-4">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Використано спроб</p>
                          <p className="text-sm font-bold text-white">{studentResults.length} з {test.attemptsAllowed}</p>
                        </div>
                      )}
                      
                      {user?.role === 'student' ? (
                        <Button 
                          onClick={() => onOpenTest(test._id)} 
                          disabled={!hasAttemptsLeft}
                          variant={hasAttemptsLeft ? 'default' : 'outline'}
                          className="px-8"
                        >
                          {hasAttemptsLeft ? 'Пройти тест' : 'Спроби вичерпано'}
                        </Button>
                      ) : (
                        <Button variant="outline" className="text-[10px] uppercase font-black tracking-widest" onClick={() => onViewResults(test)}>
                          Статистика учнів
                        </Button>
                      )}
                    </div>
                 </div>

                 {/* Progress bar for student attempts */}
                 {user?.role === 'student' && (
                    <div className="absolute bottom-0 left-0 h-1 bg-white/5 w-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${(studentResults.length / test.attemptsAllowed) * 100}%` }}
                         className={`h-full ${studentResults.length >= test.attemptsAllowed ? 'bg-red-500' : 'bg-indigo-500'}`}
                       />
                    </div>
                 )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

const SectionPlaceholder = ({ icon: Icon, title, subtitle }: any) => (
  <Card blur="lg" className="p-24 text-center space-y-4 border-dashed border-white/10 bg-white/5">
    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto text-slate-700 border border-white/5 shadow-inner"><Icon size={40} /></div>
    <div className="space-y-1">
      <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{title}</h3>
      <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium">{subtitle}</p>
    </div>
  </Card>
);

const ParticipantsList = ({ subject }: any) => (
  <Card blur="lg" className="divide-y divide-white/5 overflow-hidden shadow-2xl">
    <div className="p-5 sm:p-8 bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
      <h3 className="font-black text-white flex items-center gap-3 uppercase tracking-tighter text-xl">
        <Users size={24} className="text-indigo-400" />
        Склад групи
      </h3>
      <div className="px-4 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20">
        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
          {subject.students?.length || 0} учнів
        </span>
      </div>
    </div>
    <div className="p-4 sm:p-6">
      <div className="grid md:grid-cols-2 gap-6">
        {(subject.students || []).map((student: any) => (
          <div key={student._id} className="flex items-center gap-3 sm:gap-5 p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-indigo-400 border border-indigo-500/20 font-black text-xl transition-all group-hover:scale-105 shadow-2xl relative overflow-hidden">
              {student.avatarUrl ? (
                <img src={student.avatarUrl} alt={student.firstName} className="w-full h-full object-cover" />
              ) : (
                <span className="relative z-10">{student.firstName?.[0]}{student.lastName?.[0]}</span>
              )}
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="space-y-1">
              <p className="text-white text-lg font-black uppercase tracking-tight leading-tight group-hover:text-indigo-400 transition-colors">
                {student.firstName} {student.lastName}
              </p>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-[0.2em]">Учень курсу</p>
              </div>
            </div>

            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
               <div className="p-2 bg-white/5 rounded-xl text-slate-400">
                  <GraduationCap size={18} />
               </div>
            </div>
          </div>
        ))}
      </div>
      
      {(!subject.students || subject.students.length === 0) && (
        <div className="py-20 text-center space-y-4">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-700">
            <Users size={40} />
          </div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">У цьому курсі ще немає учнів</p>
        </div>
      )}
    </div>
  </Card>
);

