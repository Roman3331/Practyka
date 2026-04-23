'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { File as FileIcon, XCircle, Download } from 'lucide-react';
import { Button } from './Button';

interface FilePreviewModalProps {
  file: { url: string, name: string, type: string } | null;
  onClose: () => void;
}

export const FilePreviewModal = ({ file, onClose }: FilePreviewModalProps) => {
  if (!file) return null;

  const isImage = file.type?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(file.url);
  const isPDF = file.type === 'application/pdf' || file.url.toLowerCase().endsWith('.pdf');

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 bg-slate-950/90 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full h-full max-w-6xl bg-slate-900 rounded-3xl border border-white/10 flex flex-col overflow-hidden shadow-2xl"
      >
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                <FileIcon size={20} />
             </div>
             <h3 className="text-white font-bold uppercase tracking-tight truncate max-w-xs md:max-w-md">{file.name}</h3>
          </div>
          <Button onClick={onClose} variant="ghost" size="sm" className="p-2 text-slate-400 hover:text-white hover:bg-white/10">
            <XCircle size={24} />
          </Button>
        </div>
        
        <div className="flex-1 bg-slate-950 relative flex items-center justify-center">
          {isPDF ? (
            <iframe 
              src={`${file.url}#toolbar=0`} 
              className="w-full h-full border-none"
              title={file.name}
            />
          ) : isImage ? (
            <img 
              src={file.url} 
              alt={file.name} 
              className="max-w-full max-h-full object-contain shadow-2xl"
            />
          ) : (
            <div className="text-center space-y-4">
               <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-700">
                  <FileIcon size={40} />
               </div>
               <p className="text-slate-400">Перегляд цього формату недоступний у браузері</p>
               <a href={file.url} download>
                  <Button className="gap-2"><Download size={18} /> Завантажити для перегляду</Button>
               </a>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
