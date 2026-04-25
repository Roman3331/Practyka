import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebarStore } from '@/store/useSidebarStore';

interface SidebarItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

interface SideBarProps {
  items: SidebarItem[];
}

export const SideBar = ({ items }: SideBarProps) => {
  const pathname = usePathname();
  const { isOpen, isCollapsed, setIsOpen } = useSidebarStore();

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className={`hidden lg:block transition-all duration-500 ease-in-out ${isCollapsed ? 'w-24' : 'w-[280px]'}`} />

      <aside className={`
        fixed inset-y-0 left-0 h-screen bg-slate-950/40 border-r border-white/10 backdrop-blur-2xl
        transition-all duration-500 ease-in-out z-[70]
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'w-24' : 'w-[280px] max-w-[85vw]'}
      `}>

        {/* Mobile Close Button */}
        <button 
          onClick={() => setIsOpen(false)}
          className="lg:hidden absolute right-4 top-6 text-slate-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="h-20 flex items-center px-8 border-b border-white/5">
          <div className="w-9 h-9 bg-indigo-500 rounded-xl shrink-0 shadow-lg shadow-indigo-500/30 flex items-center justify-center">
             <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
          </div>
          {(!isCollapsed || isOpen) && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="ml-4 font-black text-2xl text-white tracking-tighter uppercase"
            >
              EduFlow
            </motion.span>
          )}
        </div>

        <nav className="p-4 space-y-1 mt-4 relative">
          {items.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={index} 
                href={item.href} 
                className="block relative group"
                onClick={() => setIsOpen(false)}
              >
                <div className={`
                  flex items-center gap-4 px-5 py-4 rounded-2xl transition-all relative z-10
                  ${isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'}
                `}>
                  <item.icon 
                    size={22} 
                    className={`transition-all duration-300 ${isActive ? 'text-white scale-110' : 'group-hover:text-white'}`} 
                  />
                  {(!isCollapsed || isOpen) && (
                    <span className="font-bold text-[15px] tracking-wide transition-all duration-300">
                      {item.label}
                    </span>
                  )}
                </div>

                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-tab"
                    className="absolute inset-0 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/30 z-0"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {(!isCollapsed || isOpen) && (
          <div className="absolute bottom-10 left-6 right-6">
            <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col gap-4 overflow-hidden relative">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-indigo-500/10 rounded-full blur-2xl" />
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] text-center">Система</p>
              <p className="text-[13px] font-bold text-slate-300 text-center leading-relaxed">
                Навчання нового <br /> покоління
              </p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

