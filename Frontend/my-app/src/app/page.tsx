'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { ArrowRight, BookOpen, Clock, Shield, Sparkles } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, router]);

  if (!mounted || !isAuthenticated) return null;

  const Feature = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
    <div className="glass-card p-6 rounded-2xl space-y-3">
      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
        <Icon size={24} />
      </div>
      <h3 className="font-bold text-lg">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      {/* Navbar */}
      <nav className="p-6 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BookOpen className="text-white" size={24} />
          </div>
          <span className="text-xl font-black tracking-tight uppercase">EduFlow</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-white">{user?.name}</p>
            <p className="text-xs text-indigo-400 capitalize">{user?.role === 'teacher' ? 'Вчитель' : 'Учень'}</p>
          </div>
          <button 
            onClick={logout}
            className="text-sm text-slate-400 hover:text-white transition-colors px-4 py-2"
          >
            Вийти
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-16">
        <div className="max-w-4xl text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest">
              <Sparkles size={14} /> Ласкаво просимо
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-tight">
              Ваш шлях до <br />
              <span className="text-gradient">Сучасної Освіти</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Керуйте навчальним процесом, створюйте завдання та відстежуйте прогрес в одному місці. 
              Професійні інструменти для вчителів та зручне середовище для учнів.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button className="group relative w-full sm:w-auto px-8 py-4 bg-indigo-600 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/30 overflow-hidden">
              <span>Перейти в систему</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all">
              Дивитися документацію
            </button>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full"
        >
          <Feature 
            icon={Shield} 
            title="Безпека даних" 
            desc="Надійне збереження всіх навчальних матеріалів та персональної інформації користувачів." 
          />
          <Feature 
            icon={Clock} 
            title="Реальни час" 
            desc="Миттєві сповіщення про нові завдання, оцінки та оновлення від викладача." 
          />
          <Feature 
            icon={Sparkles} 
            title="Простий інтерфейс" 
            desc="Мінімалістичний та інтуїтивно зрозумілий дизайн для максимально зосередженого навчання." 
          />
        </motion.div>
      </main>

      {/* Footer Decoration */}
      <div className="h-24 bg-gradient-to-t from-indigo-500/5 to-transparent border-t border-white/5 flex items-center justify-center">
        <p className="text-slate-500 text-sm">© 2026 EduFlow System. Всі права захищені.</p>
      </div>
    </div>
  );
}

