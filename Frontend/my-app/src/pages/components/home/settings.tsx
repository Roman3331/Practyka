'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, Moon, Globe, Shield, Smartphone, ArrowRight,
  User as UserIcon, Mail, Check, AlertCircle, Loader2
} from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { Tabs } from '@/shared/components/ui/Tabs';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';

// --- Profile Edit Component ---
const ProfileEdit = () => {
  const { user, token, login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    middleName: user?.middleName || '',
    email: user?.email || '',
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3100/api/auth/profile/avatar', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');

      login(data.user, token!);
      setStatus({ type: 'success', message: 'Фото профілю оновлено!' });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch('http://localhost:3100/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Update failed');

      login(data.user, token!);
      setStatus({ type: 'success', message: 'Дані успішно оновлено!' });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
      {/* Avatar Section */}
      <Card blur="lg" className="p-6 sm:p-8 flex flex-col items-center text-center space-y-6">
        <div className="relative group">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl sm:rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 border-2 border-dashed border-indigo-500/30 overflow-hidden shadow-2xl">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <UserIcon size={48} className="sm:w-16 sm:h-16" />
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Loader2 className="animate-spin text-white" size={24} />
              </div>
            )}
            <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all cursor-pointer text-white">
              <span className="text-[9px] font-black uppercase tracking-widest">Змінити</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={uploading} />
            </label>
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tighter">{user?.role}</h3>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">{user?.firstName} {user?.lastName}</p>
        </div>
      </Card>

      {/* Form Section */}
      <Card blur="xl" className="md:col-span-2 p-6 sm:p-10">
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input label="Ім'я" value={form.firstName} onChange={(e) => setForm({...form, firstName: e.target.value})} icon={UserIcon} />
            <Input label="Прізвище" value={form.lastName} onChange={(e) => setForm({...form, lastName: e.target.value})} icon={UserIcon} />
          </div>
          <Input label="По батькові" value={form.middleName} onChange={(e) => setForm({...form, middleName: e.target.value})} icon={UserIcon} />
          <Input label="Електронна пошта" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} icon={Mail} type="email" />


          {status && (
            <div className={`p-4 rounded-xl flex items-center gap-3 text-sm border ${
              status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {status.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
              {status.message}
            </div>
          )}

          <Button type="submit" isLoading={loading}>Зберегти зміни</Button>
        </form>
      </Card>
    </div>
  );
};

// --- General Settings Component ---
const GeneralSettings = () => (
  <div className="grid gap-4">
    <SettingsSection icon={Bell} title="Сповіщення" description="Керуйте звуками та пуш-повідомленнями" status="Активно" />
    <SettingsSection icon={Moon} title="Зовнішній вигляд" description="Тема інтерфейсу" status="Темна" />
    <SettingsSection icon={Globe} title="Мова" description="Українська" status="UA" />
  </div>
);

// --- SettingsSection Component ---
const SettingsSection = ({ icon: Icon, title, description, status }: any) => (
  <Card blur="md" hoverable className="p-4 sm:p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 group">
    <div className="flex items-center gap-4 sm:gap-6">
      <div className="p-3 sm:p-4 bg-white/5 rounded-xl sm:rounded-2xl text-slate-400 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-all">
        <Icon size={20} className="sm:w-6 sm:h-6" />
      </div>
      <div>
        <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">{title}</h3>
        <p className="text-[10px] sm:text-sm text-slate-500 font-medium">{description}</p>
      </div>
    </div>
    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
      {status && <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full uppercase tracking-widest">{status}</span>}
      <ArrowRight size={18} className="text-slate-600 group-hover:text-white transition-colors sm:w-5 sm:h-5" />
    </div>
  </Card>
);

// --- Main Settings Page ---
export const Settings = () => {
  const tabs = [
    { id: 'profile', label: 'Редагувати профіль', content: <ProfileEdit /> },
    { id: 'general', label: 'Загальні налаштування', content: <GeneralSettings /> },
    { id: 'security', label: 'Безпека', content: <div className="p-10 text-center text-slate-500 font-black uppercase text-[10px] tracking-widest bg-white/5 rounded-3xl border border-dashed border-white/5">Налаштування безпеки будуть доступні незабаром</div> },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
      <header className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase text-gradient">Налаштування</h1>
        <p className="text-slate-400 text-sm sm:text-base font-medium">Керуйте своїм профілем та додатком</p>
      </header>

      <Tabs tabs={tabs} />
    </div>
  );
};

