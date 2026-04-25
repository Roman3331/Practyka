import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, Menu, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { NotificationCenter } from '@/pages/components/home/NotificationCenter';
import { useAuthStore } from '@/store/useAuthStore';
import { useSidebarStore } from '@/store/useSidebarStore';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  title?: string;
  showUser?: boolean;
}

export const Header = ({ title, showUser = true }: HeaderProps) => {
  const { user, logout } = useAuthStore();
  const { toggleSidebar, isCollapsed, toggleCollapsed } = useSidebarStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  return (
    <header className="w-full h-20 px-4 sm:px-8 flex items-center justify-between bg-white/5 border-b border-white/10 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
        >
          <Menu size={24} />
        </button>

        {/* Desktop Collapse Toggle */}
        <button 
          onClick={toggleCollapsed}
          className="hidden lg:flex p-2 text-slate-500 hover:text-white transition-colors border border-white/5 rounded-lg bg-white/5"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        {title && (
          <h1 className="text-lg sm:text-2xl font-black text-white tracking-tighter uppercase ml-2 sm:ml-4 truncate max-w-[120px] sm:max-w-none">
            {title}
          </h1>
        )}

      </div>

      <div className="flex items-center gap-2 sm:gap-6">
        <NotificationCenter />

        {showUser && user && (
          <div className="flex items-center gap-3 sm:gap-4 pl-3 sm:pl-6 border-l border-white/10">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-white leading-none">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[10px] text-indigo-400 mt-1 uppercase font-black tracking-widest">
                {user.role}
              </p>
            </div>
            
            <div className="group relative">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30 cursor-pointer overflow-hidden shadow-inner">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={18} />
                )}
              </div>
              
              <div className="absolute right-0 mt-2 w-48 py-2 bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="px-4 py-2 border-b border-white/5 md:hidden">
                   <p className="text-xs font-bold text-white">{user.firstName} {user.lastName}</p>
                   <p className="text-[9px] text-indigo-400 uppercase font-black">{user.role}</p>
                </div>
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

