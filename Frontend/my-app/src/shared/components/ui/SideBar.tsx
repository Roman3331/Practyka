'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

interface SideBarProps {
  items: SidebarItem[];
  collapsed?: boolean;
}

export const SideBar = ({ items, collapsed = false }: SideBarProps) => {
  const pathname = usePathname();

  return (
    <aside className={`
      h-screen bg-slate-950/20 border-r border-white/10 backdrop-blur-xl sticky top-0
      transition-all duration-500 ease-in-out z-40
      ${collapsed ? 'w-24' : 'w-72'}
    `}>
      <div className="h-20 flex items-center px-8 border-b border-white/5">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg shrink-0 shadow-lg shadow-indigo-500/20" />
        {!collapsed && (
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ml-4 font-black text-xl text-white tracking-tighter uppercase"
          >
            EduFlow
          </motion.span>
        )}
      </div>

      <nav className="p-4 space-y-1 mt-4 relative">
        {items.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <Link key={index} href={item.href} className="block relative">
              <div className={`
                flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all relative z-10
                ${isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'}
              `}>
                <item.icon 
                  size={22} 
                  className={`transition-colors duration-300 ${isActive ? 'text-white' : 'group-hover:text-white'}`} 
                />
                {!collapsed && (
                  <span className="font-bold text-sm tracking-wide transition-all duration-300">
                    {item.label}
                  </span>
                )}
              </div>

              {isActive && (
                <motion.div
                  layoutId="sidebar-active-tab"
                  className="absolute inset-0 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20 z-0"
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="absolute bottom-8 left-8 right-8">
          <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col gap-4">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] text-center">Система</p>
            <p className="text-xs text-slate-400 text-center leading-relaxed">
              Керуйте навчанням в один клік
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};
