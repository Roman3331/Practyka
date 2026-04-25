'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Calendar, FileText, Upload, Send, 
  Download, Clock, CheckCircle2, AlertCircle,
  MessageSquare, User, File as FileIcon, ChevronRight, Eye, Star,
  CornerDownRight, Edit2, Trash2, Check, RotateCcw
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { useAuthStore } from '@/store/useAuthStore';
import { useWebSocket } from '@/shared/hooks/useWebSocket';
import { useConfirmStore } from '@/store/useConfirmStore';

interface AssignmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: any;
  subjectId: string;
  students: any[];
  onUpdate: () => void;
  onOpenPreview: (file: { url: string, name: string, type: string }) => void;
  initialTab?: 'work' | 'chat';
  initialStudentId?: string | null;
}

export const AssignmentDetailModal = ({ 
  isOpen, onClose, assignment, subjectId, students, onUpdate, onOpenPreview,
  initialTab, initialStudentId 
}: AssignmentDetailModalProps) => {
  const { user, token } = useAuthStore();
  const { confirm } = useConfirmStore();
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [gradingValues, setGradingValues] = useState<{ [key: string]: string | number }>({});
  
  const [activeTab, setActiveTab] = useState<'work' | 'chat'>('work');
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialTab) setActiveTab(initialTab);
      if (initialStudentId) setActiveStudentId(initialStudentId);
    }
  }, [isOpen, initialTab, initialStudentId]);
  const [chatMessage, setChatMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isTeacher = user?.role === 'teacher';

  const handleMarkAsRead = async (studentId: string) => {
    if (!assignment || !isTeacher || !studentId) return;
    try {
      await fetch(`http://localhost:3100/api/auth/subjects/${subjectId}/assignments/${assignment._id}/chat/read?studentId=${studentId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      onUpdate();
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (activeTab === 'chat' && isTeacher && activeStudentId) {
      handleMarkAsRead(activeStudentId);
    }
  }, [activeTab, activeStudentId, assignment?._id]);

  useWebSocket((data) => {
    if ((data.type === 'assignment_chat_message' || 
         data.type === 'assignment_chat_message_updated' || 
         data.type === 'assignment_chat_message_deleted') && 
        assignment && data.data.assignmentId === assignment._id) {
       onUpdate();
    }
  }, user?.id);

  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab, assignment]);

  if (!assignment) return null;

  const mySubmission = (assignment.submissions || []).find((s: any) => String(s.studentId) === String(user?.id));
  const hasRealSubmission = mySubmission && (mySubmission.files?.length > 0 || mySubmission.comment);
  const isExpired = assignment.deadline && new Date(assignment.deadline) < new Date();

  const getActiveChatMessages = () => {
    const studentId = isTeacher ? activeStudentId : user?.id;
    if (!studentId) return [];
    const submission = (assignment.submissions || []).find((s: any) => String(s.studentId) === String(studentId));
    return submission?.messages || [];
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    const studentId = isTeacher ? activeStudentId : user?.id;
    if (!studentId) return;
    try {
      const resp = await fetch(`http://localhost:3100/api/auth/subjects/${subjectId}/assignments/${assignment._id}/chat?studentId=${studentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ text: chatMessage })
      });
      if (resp.ok) { setChatMessage(''); onUpdate(); }
    } catch (err) { console.error(err); }
  };

  const handleUpdateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingText.trim() || !editingMessageId) return;
    const studentId = isTeacher ? activeStudentId : user?.id;
    try {
      const resp = await fetch(`http://localhost:3100/api/auth/subjects/${subjectId}/assignments/${assignment._id}/chat/${editingMessageId}?studentId=${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ text: editingText })
      });
      if (resp.ok) { setEditingMessageId(null); setEditingText(''); onUpdate(); }
    } catch (err) { console.error(err); }
  };

  const handleDeleteMessage = async (messageId: string) => {
    const studentId = isTeacher ? activeStudentId : user?.id;
    try {
      const resp = await fetch(`http://localhost:3100/api/auth/subjects/${subjectId}/assignments/${assignment._id}/chat/${messageId}?studentId=${studentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) { setDeletingMessageId(null); onUpdate(); }
    } catch (err) { console.error(err); }
  };

  const handleGradeSubmission = async (submissionId: string, grade: string | number) => {
    if (grade === '') return;
    try {
      const resp = await fetch(`http://localhost:3100/api/auth/subjects/${subjectId}/assignments/${assignment._id}/submissions/${submissionId}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ grade: Number(grade) })
      });
      if (resp.ok) onUpdate();
    } catch (err) { console.error(err); }
  };

  const handleHandleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;
    setLoading(true);
    try {
      const uploadedFiles = [];
      for (const f of files) {
        const formData = new FormData();
        formData.append('file', f);
        const uploadResp = await fetch(`http://localhost:3100/api/auth/subjects/${subjectId}/assignments/${assignment._id}/upload-submission`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });
        const uploadData = await uploadResp.json();
        if (uploadResp.ok) uploadedFiles.push({ url: uploadData.fileUrl, name: uploadData.fileName });
      }
      if (uploadedFiles.length === 0) throw new Error("Upload failed");
      const submitResp = await fetch(`http://localhost:3100/api/auth/subjects/${subjectId}/assignments/${assignment._id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ files: uploadedFiles, comment })
      });
      if (submitResp.ok) { onUpdate(); onClose(); }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleUnsubmit = async (studentId?: string) => {
    const isTeacherAction = !!studentId && isTeacher;
    confirm({
      title: isTeacherAction ? 'Повернення роботи' : 'Відміна здачі',
      message: isTeacherAction ? 'Ви дійсно хочете повернути цю роботу на доопрацювання?' : 'Ви дійсно хочете відмінити здачу цього завдання?',
      onConfirm: async () => {
        setLoading(true);
        try {
          const url = `http://localhost:3100/api/auth/subjects/${subjectId}/assignments/${assignment._id}/submit${studentId ? `?studentId=${studentId}` : ''}`;
          const resp = await fetch(url, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (resp.ok) onUpdate();
        } catch (err) { console.error(err); } finally { setLoading(false); }
      }
    });
  };

  const activeMessages = getActiveChatMessages();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }} className="relative w-full max-w-6xl h-[90vh] sm:h-[85vh] flex overflow-hidden lg:flex-row flex-col shadow-2xl rounded-2xl sm:rounded-3xl border border-white/10 mx-auto">
            <div className="flex-1 bg-white/5 p-4 sm:p-8 overflow-y-auto border-r border-white/10 custom-scrollbar relative">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
              <div className="flex justify-between items-start mb-6 sm:mb-10">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-500/20">Завдання</span>
                    {assignment.deadline && (<span className={`px-3 py-1 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-full border ${isExpired ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>{isExpired ? 'Термін минув' : 'Активно'}</span>)}
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tighter leading-tight">{assignment.title}</h2>
                </div>
                <button onClick={onClose} className="p-2 sm:p-3 bg-white/5 rounded-xl sm:rounded-2xl text-slate-400 hover:text-white transition-colors lg:hidden shrink-0 ml-4"><X size={20} className="sm:w-6 sm:h-6" /></button>
              </div>
              <div className="space-y-8">
                <div className={`grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 ${assignment.maxGrade ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
                  <Card blur="sm" className="p-3 sm:p-4 bg-white/5 border-white/5 flex items-center gap-4"><div className="p-2 sm:p-3 bg-indigo-500/10 rounded-xl text-indigo-400"><Calendar size={18} className="sm:w-5 sm:h-5" /></div><div><p className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">Термін до</p><p className="text-white text-xs sm:text-sm font-bold">{assignment.deadline ? new Date(assignment.deadline).toLocaleString() : 'Без терміну'}</p></div></Card>
                  <Card blur="sm" className="p-3 sm:p-4 bg-white/5 border-white/5 flex items-center gap-4"><div className="p-2 sm:p-3 bg-indigo-500/10 rounded-xl text-indigo-400"><Clock size={18} className="sm:w-5 sm:h-5" /></div><div><p className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">Створено</p><p className="text-white text-xs sm:text-sm font-bold">{new Date(assignment.createdAt).toLocaleDateString()}</p></div></Card>
                  {assignment.maxGrade && (
                    <Card blur="sm" className="p-3 sm:p-4 bg-white/5 border-white/5 flex items-center gap-4 relative overflow-hidden group/grade"><div className="absolute top-0 right-0 p-1 opacity-10 group-hover/grade:opacity-20 transition-opacity"><Star size={40} className="text-purple-400" /></div><div className="p-2 sm:p-3 bg-purple-500/10 rounded-xl text-purple-400 relative z-10"><Star size={18} className="sm:w-5 sm:h-5" /></div><div className="relative z-10"><p className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">Макс. бал</p><p className="text-white font-black text-lg sm:text-xl">{assignment.maxGrade}</p></div></Card>
                  )}
                </div>
                <div className="space-y-4"><h3 className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><FileText size={14} className="text-indigo-400" /> Опис завдання</h3><div className="text-slate-400 leading-relaxed text-base sm:text-lg bg-white/5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/5 whitespace-pre-wrap">{assignment.description || 'Опис відсутній.'}</div></div>
                {assignment.files && assignment.files.length > 0 && (
                  <div className="space-y-4"><h3 className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest">Прикріплені матеріали</h3><div className="grid gap-3">{assignment.files.map((file: any, idx: number) => (<div key={idx} className="p-3 sm:p-4 bg-indigo-500/5 rounded-xl sm:rounded-2xl border border-indigo-500/10 flex items-center justify-between group"><div className="flex items-center gap-3 sm:gap-4"><div className="p-2 sm:p-3 bg-indigo-500/10 rounded-xl text-indigo-400"><FileIcon size={20} className="sm:w-6 sm:h-6" /></div><div className="min-w-0"><p className="text-white text-xs sm:text-sm font-bold truncate max-w-[150px] sm:max-w-[200px]">{file.name}</p><p className="text-[8px] sm:text-[9px] text-slate-500 font-black uppercase tracking-widest">Матеріал вкладено</p></div></div><div className="flex items-center gap-2 shrink-0"><Button variant="secondary" size="sm" className="p-2 sm:p-3 bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all" onClick={() => onOpenPreview({ url: file.url, name: file.name, type: '' })}><Eye size={18} /></Button><a href={file.url} target="_blank" download><Button variant="secondary" size="sm" className="p-2 sm:p-3"><Download size={18} /></Button></a></div></div>))}</div></div>
                )}
              </div>
            </div>

            <div className="lg:w-[450px] w-full bg-slate-900/50 backdrop-blur-3xl flex flex-col relative h-[50vh] lg:h-full shrink-0">
               <div className="flex p-3 sm:p-4 border-b border-white/5 gap-2 shrink-0">
                  <button onClick={() => setActiveTab('work')} className={`flex-1 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'work' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}>Робота</button>
                  <button onClick={() => setActiveTab('chat')} className={`flex-1 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'chat' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}>Чат {activeMessages.length > 0 && <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-md">{activeMessages.length}</span>}</button>
                  <button onClick={onClose} className="p-2 sm:p-3 bg-white/5 rounded-xl sm:rounded-2xl text-slate-400 hover:text-white transition-colors lg:block hidden ml-auto shrink-0"><X size={18} className="sm:w-5 sm:h-5" /></button>
               </div>

               <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8">
                  {activeTab === 'work' ? (
                    isTeacher ? (
                      <div className="space-y-8">
                        <div className="space-y-2">
                          <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Студенти</h3>
                          <p className="text-slate-500 text-xs font-black uppercase tracking-widest">
                            Здано: {assignment.submissions?.filter((s: any) => s.files?.length > 0 || s.comment).length || 0} / {students.length}
                          </p>
                        </div>
                        <div className="space-y-4">
                          {students.length === 0 ? (
                            <div className="p-10 text-center space-y-4 bg-white/5 rounded-3xl border border-dashed border-white/10">
                              <AlertCircle className="mx-auto text-slate-600" size={40} />
                              <p className="text-slate-500 text-sm font-medium">Студентів не знайдено</p>
                            </div>
                          ) : (
                            students.map((student: any) => {
                              const sub = (assignment.submissions || []).find((s: any) => String(s.studentId) === String(student._id));
                              const isRealSub = sub && (sub.files?.length > 0 || sub.comment);
                              const hasUnread = isTeacher && sub && (sub.messages || []).some((m: any) => 
                                m.senderRole === 'student' && 
                                (!sub.lastViewedByTeacherAt || new Date(m.createdAt) > new Date(sub.lastViewedByTeacherAt))
                              );
                              const hasChat = sub && sub.messages?.length > 0;
                              
                              return (
                                <Card key={student._id} blur="sm" className={`p-4 bg-white/5 border-white/5 space-y-4 hover:border-indigo-500/30 transition-all cursor-pointer group ${activeStudentId === student._id ? 'border-indigo-500/50 bg-indigo-500/5' : ''}`} onClick={() => setActiveStudentId(student._id)}>
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-bold overflow-hidden border border-white/10 shadow-lg">
                                      {student.avatarUrl ? <img src={student.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : student.firstName[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-white font-bold text-sm tracking-tight truncate">{student.firstName} {student.lastName}</p>
                                      <div className="flex items-center gap-2">
                                        {isRealSub ? (
                                          <div className="flex items-center gap-2">
                                            <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest px-1.5 py-0.5 bg-emerald-500/5 border border-emerald-500/10 rounded-md">Здано</span>
                                            {hasUnread && <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" title="Нові повідомлення" />}
                                          </div>
                                        ) : (
                                          <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border ${hasUnread ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' : 'text-slate-500 bg-white/5 border-white/5'}`}>
                                            Не здав {hasUnread && '• Нове повідомлення'}
                                          </span>
                                        )}
                                        {sub?.grade !== undefined && (
                                          <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest px-1.5 py-0.5 bg-indigo-500/5 border border-indigo-500/10 rounded-md">Оцінка: {sub.grade}</span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="ml-auto flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                      {isRealSub && (
                                        <Button size="sm" variant="outline" className="h-8 px-3 text-[10px] font-black uppercase tracking-widest border-red-500/20 text-red-400 hover:bg-red-500/10" onClick={(e) => { e.stopPropagation(); handleUnsubmit(student._id); }}>
                                          Повернути
                                        </Button>
                                      )}
                                      <button className={`p-2 rounded-lg ${hasChat ? 'bg-indigo-500/10 text-indigo-400' : 'bg-white/5 text-slate-600'}`} onClick={(e) => { e.stopPropagation(); setActiveStudentId(student._id); setActiveTab('chat'); }}>
                                        <MessageSquare size={16} />
                                      </button>
                                    </div>
                                  </div>
                                  
                                  {isRealSub && activeStudentId === student._id && (
                                    <div className="pt-2 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                      <div className="flex items-center gap-3">
                                        <div className="flex-1 flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-2 border border-white/5 focus-within:border-indigo-500/30 transition-all">
                                          <Star size={14} className={sub.grade !== undefined ? 'text-yellow-400' : 'text-slate-600'} />
                                          <input 
                                            type="number" 
                                            placeholder="Оцінка" 
                                            className="bg-transparent border-none outline-none text-white text-xs font-bold w-full placeholder:text-slate-700" 
                                            defaultValue={sub.grade} 
                                            onChange={(e) => setGradingValues({ ...gradingValues, [sub._id]: e.target.value })} 
                                            onClick={(e) => e.stopPropagation()} 
                                          />
                                          {assignment.maxGrade && <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest whitespace-nowrap">/ {assignment.maxGrade}</span>}
                                        </div>
                                        <Button 
                                          size="sm" 
                                          className="h-9 px-4 text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all" 
                                          onClick={(e) => { e.stopPropagation(); handleGradeSubmission(sub._id, gradingValues[sub._id] !== undefined ? gradingValues[sub._id] : sub.grade); }}
                                        >
                                          Оцінити
                                        </Button>
                                      </div>

                                      <div className="space-y-2">
                                        {(sub.files || []).map((f: any, i: number) => (
                                          <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 text-[10px] font-black text-white uppercase truncate">
                                            <FileIcon size={14} className="text-indigo-400" /> {f.name}
                                            <div className="ml-auto flex items-center gap-2">
                                              <Button variant="ghost" size="sm" className="p-1.5 text-indigo-400 hover:bg-indigo-500/10" onClick={() => onOpenPreview({ url: f.url, name: f.name, type: '' })}>
                                                <Eye size={14} />
                                              </Button>
                                              <a href={f.url} target="_blank" className="text-slate-500 hover:text-white transition-colors">
                                                <Download size={14} />
                                              </a>
                                            </div>
                                          </div>
                                        ))}
                                        {sub.comment && (
                                          <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[10px] text-slate-400 italic">
                                            Коментар: "{sub.comment}"
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </Card>
                              );
                            })
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-8"><div className="space-y-2"><h3 className="text-2xl font-black text-white uppercase tracking-tighter">Ваша робота</h3><div className="flex items-center gap-2">{hasRealSubmission ? <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><CheckCircle2 size={14} /> Здано</span> : <span className="text-red-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><AlertCircle size={14} /> Не здано</span>}</div>{mySubmission && mySubmission.grade !== undefined && (<div className="flex flex-col items-end"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Оцінка</p><div className="flex items-center gap-2"><Star size={16} className="text-yellow-400 fill-yellow-400/20" /><span className="text-2xl font-black text-white">{mySubmission.grade}</span>{assignment.maxGrade && <span className="text-xs font-black text-slate-600 uppercase tracking-widest">/ {assignment.maxGrade}</span>}</div></div>)}</div>
                        {hasRealSubmission ? (
                          <Card blur="sm" className="p-6 bg-emerald-500/5 border-emerald-500/20 space-y-6"><div className="space-y-3">{ (mySubmission.files || []).map((f: any, i: number) => (<div key={i} className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5"><div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><FileIcon size={20} /></div><div className="overflow-hidden flex-1"><p className="text-white font-bold text-xs truncate">{f.name}</p></div><div className="flex items-center gap-2 ml-auto"><Button variant="ghost" size="sm" className="p-1.5 text-indigo-400 hover:bg-indigo-500/10" onClick={() => onOpenPreview({ url: f.url, name: f.name, type: '' })}><Eye size={16} /></Button><a href={f.url} target="_blank"><Download size={16} className="text-slate-500 hover:text-white transition-colors" /></a></div></div>))}<p className="text-[10px] text-slate-500 font-black uppercase text-center pt-2">Здано {new Date(mySubmission.submittedAt).toLocaleString()}</p></div>{mySubmission.comment && <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-slate-400 text-sm italic">"{mySubmission.comment}"</div>}<Button variant="outline" className="w-full text-xs uppercase font-black tracking-widest py-3 border-white/10 text-slate-400 hover:text-red-400 hover:border-red-400/30 transition-all" onClick={() => handleUnsubmit()} isLoading={loading} disabled={isExpired}>Відмінити здачу</Button></Card>
                        ) : (
                          <form onSubmit={handleHandleSubmit} className="space-y-6"><div className="space-y-4"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Upload size={14} className="text-indigo-400" /> Прикріпити файл</label><div className="relative group/upload h-32"><input type="file" required multiple className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={e => { const selectedFiles = Array.from(e.target.files || []); setFiles(prev => [...prev, ...selectedFiles]); }} /><div className="h-full bg-white/5 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-2 group-hover/upload:border-indigo-500/30 group-hover/upload:bg-indigo-500/5 transition-all"><Upload className={files.length > 0 ? 'text-indigo-400' : 'text-slate-600'} /><span className="text-xs font-bold text-slate-400 px-4 text-center">{files.length > 0 ? `Вибрано файлів: ${files.length}` : 'Натисніть або перетягніть файли'}</span></div></div>{files.length > 0 && (<div className="flex flex-wrap gap-2">{ files.map((f, i) => (<span key={i} className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] text-indigo-400 font-bold flex items-center gap-2 group/file"><FileIcon size={12} /> {f.name.slice(0, 20)}{f.name.length > 20 ? '...' : ''}<button type="button" onClick={(e) => { e.preventDefault(); setFiles(prev => prev.filter((_, idx) => idx !== i)); }} className="text-slate-500 hover:text-red-400 transition-colors"><X size={14} /></button></span>))}</div>)}</div><div className="space-y-4"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><MessageSquare size={14} className="text-indigo-400" /> Коментар до роботи</label><textarea placeholder="Додайте коментар для викладача..." className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all resize-none h-24 text-sm placeholder:text-slate-700" value={comment} onChange={e => setComment(e.target.value)} /></div><Button type="submit" className="w-full py-4 gap-3 shadow-indigo-500/20" isLoading={loading} disabled={files.length === 0 || isExpired}><Send size={18} /> Здати роботу</Button>{isExpired && <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest text-center">Термін здачі минув. Ви не можете здати роботу.</p>}</form>
                        )}
                      </div>
                    )
                  ) : (
                    <div className="flex flex-col h-full">
                       {isTeacher && !activeStudentId ? (
                         <div className="flex-1 flex flex-col items-center justify-center text-center p-10 space-y-4"><div className="p-6 bg-white/5 rounded-full text-slate-700"><MessageSquare size={40} /></div><p className="text-slate-500 font-medium text-sm">Виберіть студента зі списку "Робота", щоб почати чат</p><Button variant="outline" size="sm" onClick={() => setActiveTab('work')}>До списку робіт</Button></div>
                       ) : (
                         <div className="flex flex-col h-full">
                            {isTeacher && (
                              <div className="mb-4 pb-4 border-b border-white/5 flex items-center gap-3"><div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 cursor-pointer" onClick={() => setActiveTab('work')}><ChevronRight size={16} className="rotate-180" /></div><p className="text-xs font-black text-white uppercase tracking-widest">Чат з {assignment.submissions.find((s: any) => s.studentId === activeStudentId)?.studentName}</p></div>
                            )}
                            <div className="space-y-6">
                               {activeMessages.length === 0 ? (
                                 <div className="p-10 text-center space-y-2 opacity-50"><MessageSquare size={32} className="mx-auto text-slate-700" /><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Повідомлень ще немає</p></div>
                               ) : (
                                  activeMessages.map((msg: any) => {
                                    const isMe = String(msg.senderId) === String(user?.id);
                                    const isEditing = editingMessageId === msg._id;
                                    const isDeleting = deletingMessageId === msg._id;
                                    return (
                                      <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1 group`}>
                                         <div className="flex items-center gap-2">
                                            {isMe && !isEditing && !isDeleting && (
                                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { setEditingMessageId(msg._id); setEditingText(msg.text); }} className="p-1.5 text-slate-500 hover:text-indigo-400 transition-colors"><Edit2 size={12} /></button>
                                                <button onClick={() => setDeletingMessageId(msg._id)} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                                              </div>
                                            )}
                                            {isDeleting && (
                                               <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-1.5 animate-in fade-in zoom-in duration-200">
                                                 <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Видалити?</span>
                                                 <button onClick={() => handleDeleteMessage(msg._id)} className="text-red-400 hover:text-red-500 transition-colors"><Check size={14} /></button>
                                                 <button onClick={() => setDeletingMessageId(null)} className="text-slate-500 hover:text-white transition-colors"><X size={14} /></button>
                                               </div>
                                            )}
                                            <div className={`max-w-[240px] sm:max-w-[280px] p-3 sm:p-4 rounded-xl sm:rounded-2xl text-[11px] sm:text-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-none shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-slate-300 border border-white/10 rounded-bl-none'}`}>
                                               {isEditing ? (
                                                 <form onSubmit={handleUpdateMessage} className="flex flex-col gap-2 min-w-[180px] sm:min-w-[200px]">
                                                   <textarea autoFocus className="bg-white/10 border border-white/20 rounded-xl p-2 text-white text-[10px] sm:text-xs outline-none focus:border-white/40 transition-all resize-none" value={editingText} onChange={(e) => setEditingText(e.target.value)} />
                                                   <div className="flex justify-end gap-2"><button type="button" onClick={() => setEditingMessageId(null)} className="p-1 text-white/60 hover:text-white"><RotateCcw size={14} /></button><button type="submit" className="p-1 text-white/60 hover:text-white"><Check size={14} /></button></div>
                                                 </form>
                                               ) : msg.text}
                                            </div>
                                         </div>
                                         <span className="text-[7px] sm:text-[8px] font-black text-slate-600 uppercase tracking-widest">{msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                      </div>
                                    );
                                  })
                                )}
                                <div ref={chatEndRef} />
                             </div>
                          </div>
                        )}
                     </div>
                   )}
                </div>
                {activeTab === 'chat' && (activeStudentId || !isTeacher) && (
                  <div className="p-4 sm:p-6 bg-slate-900/80 backdrop-blur-xl border-t border-white/5 shrink-0">
                     <form onSubmit={handleSendMessage} className="flex gap-2 sm:gap-3 bg-white/5 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border border-white/10 focus-within:border-indigo-500/50 transition-all">
                        <input type="text" placeholder="Повідомлення..." className="flex-1 bg-transparent border-none outline-none px-3 sm:px-4 py-1.5 sm:py-2 text-white text-xs sm:text-sm placeholder:text-slate-600" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} />
                        <Button type="submit" size="sm" className="p-2 sm:p-3 shadow-indigo-500/20 rounded-lg sm:rounded-xl"><Send size={16} className="sm:w-5 sm:h-5" /></Button>
                     </form>
                  </div>
                )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
