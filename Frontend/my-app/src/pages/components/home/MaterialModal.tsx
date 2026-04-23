'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Upload, Type, Send, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Card } from '@/shared/components/ui/Card';

interface MaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
}

export const MaterialModal = ({ isOpen, onClose, onSubmit, initialData }: MaterialModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    files: [] as File[],
    existingFiles: [] as any[]
  });

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        name: initialData.name || '',
        files: [],
        existingFiles: initialData.files || []
      });
    } else if (isOpen) {
      setFormData({
        name: '',
        files: [],
        existingFiles: []
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
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
            className="relative w-full max-w-xl"
          >
            <Card blur="lg" className="p-8 border-white/10 shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-emerald-500" />
              
              <div className="flex justify-between items-center mb-10">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                    {initialData ? 'Редагувати матеріал' : 'Новий матеріал'}
                  </h2>
                  <p className="text-slate-500 text-xs font-black uppercase tracking-widest">
                    {initialData ? 'Оновіть назву та список файлів' : 'Завантажте навчальні матеріали для учнів'}
                  </p>
                </div>
                <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-colors hover:bg-white/10">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                       <Type size={14} className="text-indigo-400" /> Назва матеріалу
                    </label>
                    <Input 
                      placeholder="Наприклад: Тема 1. Вступ до курсу" 
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="bg-white/5 border-white/5 focus:border-indigo-500/50 py-4 text-lg"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                      <Upload size={14} className="text-indigo-400" /> Прикріпити файли
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
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Список прикріплених файлів</p>
                      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                        {/* Existing Files */}
                        {formData.existingFiles.map((f, i) => (
                          <div key={`existing-${i}`} className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl text-xs text-slate-300 font-bold group/file hover:border-red-500/30 transition-all">
                             <FileText size={16} className="text-indigo-400" />
                             <span className="truncate max-w-[150px]">{f.name}</span>
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
                             <span className="truncate max-w-[150px]">{f.name}</span>
                             <button 
                               type="button" 
                               onClick={() => removeNewFile(i)} 
                               className="ml-2 p-1 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                               title="Скасувати"
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
                  <Button type="submit" className="flex-1 py-4 gap-3 shadow-indigo-500/20" isLoading={loading} disabled={!formData.name.trim() || (!formData.existingFiles.length && !formData.files.length)}>
                    <Send size={18} /> {initialData ? 'Оновити матеріал' : 'Опублікувати матеріал'}
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
