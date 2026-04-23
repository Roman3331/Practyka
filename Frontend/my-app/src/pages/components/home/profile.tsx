'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User as UserIcon, Mail, Shield, Check, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { Card } from '@/shared/components/ui/Card';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';

export const Profile = () => {
  const { user, token, login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    middleName: user?.middleName || '',
    email: user?.email || '',
  });

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
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      login(data.user, token!);
      setStatus({ type: 'success', message: 'Профіль успішно оновлено!' });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <header className="space-y-1">
        <h1 className="text-4xl font-bold text-white tracking-tight">Мій Профіль</h1>
        <p className="text-slate-400">Керуйте вашою особистою інформацією</p>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="space-y-6">
          <Card blur="lg" className="p-8 flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 border-2 border-indigo-500/30 overflow-hidden relative group shadow-2xl">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={48} />
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white uppercase">{user?.role}</h3>
              <p className="text-sm text-slate-400">{user?.firstName} {user?.lastName}</p>
            </div>
          </Card>

          <Card blur="lg" className="p-6 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Shield size={16} className="text-indigo-400" />
              Безпека
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-xs text-slate-400">Статус аккаунта</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <Check size={12} /> Активний
                </span>
              </div>
            </div>
          </Card>
        </div>

        <Card blur="lg" className="md:col-span-2 p-10">
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Ім'я"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                icon={UserIcon}
              />
              <Input
                label="Прізвище"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                icon={UserIcon}
              />
            </div>

            <Input
              label="По батькові"
              value={formData.middleName}
              onChange={(e) => setFormData({...formData, middleName: e.target.value})}
              icon={UserIcon}
            />

            <Input
              label="Електронна пошта"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              icon={Mail}
              type="email"
            />

            {status && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl flex items-center gap-3 text-sm border ${
                  status.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}
              >
                {status.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                {status.message}
              </motion.div>
            )}

            <div className="pt-4">
              <Button type="submit" isLoading={loading} className="w-full md:w-auto px-12">
                Зберегти зміни
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
