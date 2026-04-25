'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, FileText, Upload, Type, AlignLeft, Send, Trash2, Star } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Card } from '@/shared/components/ui/Card';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
}

export const AssignmentModal = ({ isOpen, onClose, onSubmit, initialData }: AssignmentModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    maxGrade: '' as string | number,
    files: [] as File[],
    existingFiles: [] as any[]
  });

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        deadline: initialData.deadline ? new Date(initialData.deadline).toISOString().slice(0, 16) : '',
        maxGrade: initialData.maxGrade || '',
        files: [],
        existingFiles: initialData.files || []
      });
    } else if (isOpen) {
      setFormData({
        title: '',
        description: '',
        deadline: '',
        maxGrade: '',
        files: [],
        existingFiles: []
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeExistingFile = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      existingFiles: prev.existingFiles.filter((_, i) => i !== idx)
    }));
  };

  const removeNewFile = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== idx)
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-2xl sm:rounded-3xl"
          >
            <Card blur="lg" className="p-5 sm:p-8 border-white/10 shadow-2xl relative group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
              
              <div className="flex justify-between items-start mb-6 sm:mb-10">
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter leading-tight">
                    {initialData ? 'Редагувати завдання' : 'Нове завдання'}
                  </h2>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    {initialData ? 'Оновіть деталі та матеріали' : 'Створіть завдання для своїх учнів'}
                  </p>
                </div>
                <button onClick={onClose} className="p-2 sm:p-3 bg-white/5 rounded-xl sm:rounded-2xl text-slate-400 hover:text-white transition-colors hover:bg-white/10 shrink-0 ml-4">
                  <X size={20} className="sm:w-6 sm:h-6" />
                </button>
              </div>


              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                       <Type size={14} className="text-indigo-400" /> Назва завдання
                    </label>
                    <Input 
                      placeholder="Наприклад: Лабораторна робота №1" 
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      className="bg-white/5 border-white/5 focus:border-indigo-500/50 py-4 text-lg"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                       <AlignLeft size={14} className="text-indigo-400" /> Опис та інструкції
                    </label>
                    <textarea 
                      placeholder="Детально опишіть кроки виконання..." 
                      className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all resize-none min-h-[120px] text-lg placeholder:text-slate-600"
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                        <Calendar size={14} className="text-indigo-400" /> Термін виконання
                      </label>
                      <Input 
                        type="datetime-local" 
                        value={formData.deadline}
                        onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                        className="bg-white/5 border-white/5 focus:border-indigo-500/50"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                        <Star size={14} className="text-indigo-400" /> Максимальна оцінка (необов'язково)
                      </label>
                      <Input 
                        type="number" 
                        placeholder="Наприклад: 100"
                        value={formData.maxGrade}
                        onChange={e => setFormData({ ...formData, maxGrade: e.target.value })}
                        className="bg-white/5 border-white/5 focus:border-indigo-500/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                      <Upload size={14} className="text-indigo-400" /> Прикріпити матерiали
                    </label>
                    <div className="relative group/upload">
                      <input 
                        type="file" 
                        multiple
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        onChange={e => {
                          const newFiles = Array.from(e.target.files || []);
                          setFormData({ ...formData, files: [...formData.files, ...newFiles] });
                        }}
                      />
                      <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between group-hover/upload:border-indigo-500/30 transition-all">
                        <span className="text-slate-400 text-sm truncate max-w-[200px]">
                          Виберіть файли з комп'ютера...
                        </span>
                        <Button type="button" variant="secondary" size="sm" className="pointer-events-none p-2">
                          <Upload size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {(formData.existingFiles.length > 0 || formData.files.length > 0) && (
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Прикріплені файли</p>
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar p-1">
                        {/* Existing Files */}
                        {formData.existingFiles.map((f, i) => (
                          <div key={`existing-${i}`} className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl text-xs text-slate-300 font-bold group/file hover:border-red-500/30 transition-all">
                             <FileText size={16} className="text-indigo-400" />
                             <span className="truncate max-w-[120px]">{f.name}</span>
                             <button 
                               type="button" 
                               onClick={() => removeExistingFile(i)} 
                               className="ml-2 p-1 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                               title="Видалити файл"
                             >
                               <Trash2 size={16} />
                             </button>
                          </div>
                        ))}
                        {/* New Files */}
                        {formData.files.map((f, i) => (
                          <div key={`new-${i}`} className="flex items-center gap-3 bg-indigo-500/5 border border-indigo-500/20 px-4 py-2 rounded-2xl text-xs text-indigo-400 font-bold group/file hover:border-red-500/30 transition-all">
                             <FileText size={16} />
                             <span className="truncate max-w-[120px]">{f.name}</span>
                             <button 
                               type="button" 
                               onClick={() => removeNewFile(i)} 
                               className="ml-2 p-1 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                               title="Скасувати завантаження"
                             >
                               <Trash2 size={16} />
                             </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="ghost" className="flex-1 py-4 uppercase font-black tracking-widest text-xs" onClick={onClose}>
                    Скасувати
                  </Button>
                  <Button type="submit" className="flex-1 py-4 gap-3 shadow-indigo-500/20" isLoading={loading}>
                    <Send size={18} /> {initialData ? 'Зберегти зміни' : 'Створити завдання'}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
