'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
}

export const Tabs = ({ tabs, defaultTab }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  return (
    <div className="w-full space-y-8">
      <div className="flex gap-1.5 sm:gap-2 p-1 sm:p-1.5 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl w-full sm:w-fit overflow-x-auto custom-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative px-6 py-2.5 rounded-xl text-sm font-bold transition-all
                ${isActive ? 'text-white' : 'text-slate-400 hover:text-slate-300'}
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {tabs.find(t => t.id === activeTab)?.content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
