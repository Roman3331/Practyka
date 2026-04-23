'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, UserCircle, ArrowLeft, BadgeCheck, LucideIcon } from 'lucide-react';
import { UserRole } from '@/store/useAuthStore';
import { LoginForm } from '@/pages/components/auth/LoginForm';
import { RegisterForm } from '@/pages/components/auth/RegisterForm';
import { Card } from '@/shared/components/ui/Card';

interface RoleCardProps {
  role: UserRole;
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: (role: UserRole) => void;
}

const RoleCard = ({ role, title, description, icon: Icon, onClick }: RoleCardProps) => (
  <Card
    blur="md"
    hoverable
    onClick={() => onClick(role)}
    className="p-8 flex flex-col items-center text-center gap-4 w-full max-w-sm group"
  >
    <div className="p-4 rounded-full bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-lg shadow-indigo-500/20">
      <Icon size={48} />
    </div>
    <h3 className="text-2xl font-bold tracking-tight text-white">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
  </Card>
);

export default function AuthPage() {
  const [step, setStep] = useState<'role' | 'auth'>('role');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep('auth');
    setSuccessMsg(null);
  };

  const handleRegisterSuccess = () => {
    setMode('login');
    setSuccessMsg('Реєстрація успішна! Тепер ви можете увійти.');
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-6 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />
      </div>

      <AnimatePresence mode="wait">
        {step === 'role' ? (
          <motion.div
            key="role-selection"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="flex flex-col items-center gap-12 w-full max-w-4xl"
          >
            <div className="text-center space-y-4">
              <h1 className="text-5xl md:text-7xl font-black text-gradient uppercase tracking-tighter">
                Оберіть Свій Шлях
              </h1>
              <p className="text-slate-400 text-xl font-light">Розпочніть подорож у світ знань сьогодні</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 w-full px-4">
              <RoleCard
                role="teacher"
                title="Наставник"
                description="Діліться знаннями, надихайте та керуйте навчальним процесом з потужними інструментами"
                icon={GraduationCap}
                onClick={handleRoleSelect}
              />
              <RoleCard
                role="student"
                title="Учень"
                description="Досліджуйте нові горизонти, виконуйте цікаві завдання та ставайте кращими щодня"
                icon={UserCircle}
                onClick={handleRoleSelect}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="auth-form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-lg"
          >
            <button
              onClick={() => setStep('role')}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-all mb-8 group bg-white/5 px-4 py-2 rounded-full border border-white/5"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Вернутися до вибору</span>
            </button>

            <Card blur="xl" className="p-10 shadow-2xl backdrop-blur-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                {selectedRole === 'teacher' ? <GraduationCap size={120} /> : <UserCircle size={120} />}
              </div>

              <div className="space-y-8 relative z-10">
                <div className="space-y-2">
                  <h2 className="text-4xl font-bold tracking-tight text-white">
                    {mode === 'login' ? 'З поверненням!' : 'Створити акаунт'}
                  </h2>
                  <p className="text-indigo-400 font-medium flex items-center gap-2">
                    <BadgeCheck size={18} />
                    Акаунт {selectedRole === 'teacher' ? 'Вчителя' : 'Учня'}
                  </p>
                </div>

                {successMsg && (
                  <div className="p-4 rounded-xl text-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    {successMsg}
                  </div>
                )}

                {mode === 'login' ? (
                  <LoginForm />
                ) : (
                  <RegisterForm 
                    selectedRole={selectedRole} 
                    onSuccess={handleRegisterSuccess} 
                  />
                )}

                <div className="text-center">
                  <button
                    onClick={() => {
                      setMode(mode === 'login' ? 'register' : 'login');
                      setSuccessMsg(null);
                    }}
                    className="text-slate-400 hover:text-white text-sm font-medium transition-colors border-b border-transparent hover:border-indigo-500 py-1"
                  >
                    {mode === 'login' 
                      ? 'Немає акаунта? Приєднатися зараз' 
                      : 'Вже маєте акаунт? Авторизуватися'}
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
