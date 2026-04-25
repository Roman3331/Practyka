'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BookOpen, Key, Users, Calendar, AlertCircle, Loader2, X, Hash, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useConfirmStore } from '@/store/useConfirmStore';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import Link from 'next/link';

export const SubjectManagement = () => {
  const { user, token } = useAuthStore();
  const { confirm } = useConfirmStore();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  
  const [newSubject, setNewSubject] = useState({ name: '', description: '' });
  const [createLoading, setCreateLoading] = useState(false);
  
  const [joinCode, setJoinCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const fetchSubjects = async () => {
    try {
      const response = await fetch('http://localhost:3100/api/auth/subjects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setSubjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();

    const ws = new WebSocket('ws://localhost:3100/ws');
    ws.onopen = () => console.log('Connected to WebSocket');
    ws.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);
      if (type === 'subject_created') {
        if (user?.role === 'teacher' && data.teacherId === user.userId) {
          setSubjects(prev => [...prev, data]);
        }
      }
      if (type === 'subject_deleted') {
        setSubjects(prev => prev.filter(s => s._id !== data.id));
      }
      if (type === 'student_joined') {
        if (user?.role === 'teacher') {
          setSubjects(prev => prev.map(s => 
            s._id === data.subjectId 
              ? { ...s, studentIds: [...(s.studentIds || []), data.studentId] } 
              : s
          ));
        }
      }
    };
    return () => ws.close();
  }, [token, user?.userId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setStatus(null);
    try {
      const response = await fetch('http://localhost:3100/api/auth/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newSubject),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create subject');
      setSubjects([...subjects, data]);
      setShowCreateModal(false);
      setNewSubject({ name: '', description: '' });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinLoading(true);
    setStatus(null);
    try {
      const response = await fetch('http://localhost:3100/api/auth/subjects/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ joinCode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to join');
      fetchSubjects();
      setShowJoinModal(false);
      setJoinCode('');
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setJoinLoading(false);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    confirm({
      title: 'Видалити предмет?',
      message: 'Ви впевнені, що хочете видалити цей предмет? Усі пов\'язані дані (завдання, матеріали, оцінки) будуть назавжди видалені.',
      onConfirm: async () => {
        try {
          const response = await fetch(`http://localhost:3100/api/auth/subjects/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            setSubjects(subjects.filter(s => s._id !== id));
          } else {
            const data = await response.json();
            setStatus({ type: 'error', message: data.error || 'Failed to delete' });
          }
        } catch (err) { console.error(err); }
      }
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter text-gradient uppercase">Мої Предмети</h2>
        {user?.role === 'teacher' ? (
          <Button onClick={() => setShowCreateModal(true)} className="gap-2 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl shrink-0">
            <Plus size={18} /> <span className="text-xs sm:text-sm">Створити предмет</span>
          </Button>
        ) : (
          <Button onClick={() => setShowJoinModal(true)} variant="secondary" className="gap-2 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl shrink-0">
            <Key size={18} /> <span className="text-xs sm:text-sm">Приєднатися</span>
          </Button>
        )}
      </div>



      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin text-indigo-500" size={48} /></div>
      ) : subjects.length === 0 ? (
        <Card blur="lg" className="p-20 text-center space-y-4 border-dashed border-white/5">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-500"><BookOpen size={40} /></div>
          <div className="space-y-1"><p className="text-xl font-bold text-white uppercase tracking-tight">Предметів не знайдено</p><p className="text-slate-400">{user?.role === 'teacher' ? 'Час створити свій перший предмет!' : 'Введіть код від вчителя, щоб приєднатися.'}</p></div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <Link key={subject._id} href={`/${user?.role}/courses/${subject._id}`}>
              <Card blur="md" hoverable className="p-5 sm:p-6 group flex flex-col justify-between h-full cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors" />
                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-start gap-2">
                    <div className="p-2.5 sm:p-3 bg-indigo-500/10 rounded-xl sm:rounded-2xl text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-lg shadow-indigo-500/5 shrink-0"><BookOpen size={20} className="sm:w-6 sm:h-6" /></div>
                    {user?.role === 'teacher' && (
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex flex-col items-end gap-0.5 min-w-0">
                          <span className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none truncate w-full text-right">Код доступу</span>
                          <code className="bg-white/5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg text-indigo-400 font-mono font-bold border border-white/5 text-xs sm:text-sm">{subject.joinCode}</code>
                        </div>
                        <button onClick={(e) => handleDelete(e, subject._id)} className="p-1.5 sm:p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all shrink-0" title="Видалити предмет"><Trash2 size={16} sm:size={18} /></button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{subject.name}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{subject.description || 'Опис відсутній'}</p>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between relative z-10 text-slate-400 group-hover:text-white transition-colors">
                  <div className="flex items-center gap-2"><Users size={16} className="group-hover:text-indigo-400" /><span className="text-xs font-bold">{subject.studentIds?.length || 0} учнів</span></div>
                  <div className="flex items-center gap-2"><span className="text-xs font-medium uppercase tracking-widest">Відкрити</span><Plus size={14} className="rotate-45" /></div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreateModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="w-full max-w-lg relative">
              <Card blur="xl" className="p-10 space-y-8 border-indigo-500/20 shadow-indigo-500/10">
                <div className="flex justify-between items-center"><h3 className="text-2xl font-bold text-white uppercase tracking-tighter">Новий предмет</h3><X className="text-slate-500 cursor-pointer hover:text-white" onClick={() => setShowCreateModal(false)} /></div>
                <form onSubmit={handleCreate} className="space-y-6">
                  <Input label="Назва предмету" placeholder="Напр. Вища математика" value={newSubject.name} onChange={e => setNewSubject({...newSubject, name: e.target.value})} icon={BookOpen} required />
                  <Input label="Опис" placeholder="Короткий опис курсу" value={newSubject.description} onChange={e => setNewSubject({...newSubject, description: e.target.value})} icon={Hash} />
                  {status && (<div className="p-4 rounded-xl flex items-center gap-3 text-sm bg-red-500/10 border border-red-500/20 text-red-400"><AlertCircle size={18} /> {status.message}</div>)}
                  <Button type="submit" isLoading={createLoading} className="w-full">Створити зараз</Button>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showJoinModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowJoinModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="w-full max-w-md relative">
              <Card blur="xl" className="p-10 space-y-8 border-indigo-500/20">
                <div className="flex justify-between items-center"><h3 className="text-2xl font-bold text-white uppercase tracking-tighter">Приєднатися</h3><X className="text-slate-500 cursor-pointer hover:text-white" onClick={() => setShowJoinModal(false)} /></div>
                <div className="text-center space-y-2"><p className="text-slate-400 text-sm">Введіть 8-значний код доступу, наданий вашим викладачем.</p></div>
                <form onSubmit={handleJoin} className="space-y-6">
                  <Input placeholder="КОД-ДОСТУПУ" className="text-center font-mono text-xl uppercase tracking-[0.3em]" value={joinCode} onChange={e => setJoinCode(e.target.value)} icon={Key} required maxLength={8} />
                  {status && (<div className="p-4 rounded-xl flex items-center gap-3 text-sm bg-red-500/10 border border-red-500/20 text-red-400"><AlertCircle size={18} /> {status.message}</div>)}
                  <Button type="submit" isLoading={joinLoading} className="w-full">Відправити запит</Button>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
