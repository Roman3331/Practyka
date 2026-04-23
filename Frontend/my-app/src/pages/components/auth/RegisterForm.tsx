'use client';

import React, { useState } from 'react';
import { User as UserIcon, Mail, Lock, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserRole } from '@/store/useAuthStore';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';

interface RegisterFormProps {
  selectedRole: UserRole;
  onSuccess: () => void;
}

export const RegisterForm = ({ selectedRole, onSuccess }: RegisterFormProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3100/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role: selectedRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-3 p-4 rounded-xl text-sm border ${
            error.includes('успішна') 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          {error.includes('успішна') ? <ShieldCheck size={18} /> : <AlertCircle size={18} />}
          {error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          name="firstName"
          placeholder="Ім'я"
          icon={UserIcon}
          value={form.firstName}
          onChange={handleChange}
          required
        />
        <Input
          name="lastName"
          placeholder="Прізвище"
          icon={UserIcon}
          value={form.lastName}
          onChange={handleChange}
          required
        />
        <Input
          name="middleName"
          placeholder="По батькові (необов'язково)"
          icon={UserIcon}
          value={form.middleName}
          onChange={handleChange}
          containerClassName="md:col-span-2"
        />
      </div>

      <Input
        name="email"
        type="email"
        placeholder="Електронна пошта"
        icon={Mail}
        value={form.email}
        onChange={handleChange}
        required
      />

      <Input
        name="password"
        type="password"
        placeholder="Пароль"
        icon={Lock}
        value={form.password}
        onChange={handleChange}
        required
      />

      <Button
        type="submit"
        isLoading={loading}
        className="w-full mt-6"
      >
        Створити мій акаунт
      </Button>
    </form>
  );
};
