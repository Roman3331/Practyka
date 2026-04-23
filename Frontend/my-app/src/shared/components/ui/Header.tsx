'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, User } from 'lucide-react';
import { NotificationCenter } from '@/pages/components/home/NotificationCenter';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  title?: string;
  showUser?: boolean;
}

export const Header = ({ title, showUser = true }: HeaderProps) => {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  return (
    <header className="w-full h-20 px-8 flex items-center justify-between bg-white/5 border-b border-white/10 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center gap-4">
        {title && (
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-6">
        <NotificationCenter />

        {showUser && user && (
          <div className="flex items-center gap-4 pl-6 border-l border-white/10">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-white leading-none">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-indigo-400 mt-1 capitalize">
                {user.role}
              </p>
            </div>
            
            <div className="group relative">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30 cursor-pointer overflow-hidden shadow-inner">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={20} />
                )}
              </div>
              
              {/* Dropdown - simple implementation */}
              <div className="absolute right-0 mt-2 w-48 py-2 bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <button 
                  onClick={handleLogout}
                  className="w-full px-4 py-2 flex items-center gap-3 text-red-400 hover:bg-white/5 transition-colors text-sm font-medium"
                >
                  <LogOut size={16} />
                  Вийти
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
