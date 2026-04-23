'use client';

import React from 'react';
import { SideBar } from '@/shared/components/ui/SideBar';
import { Header } from '@/shared/components/ui/Header';
import { Settings } from '@/pages/components/home/settings';
import { teacherNavItems } from '@/shared/constants/navigation';

export default function TeacherSettingsPage() {
  return (
    <div className="flex min-h-screen gradient-bg">
      <SideBar items={teacherNavItems} />
      <div className="flex-1 flex flex-col">
        <Header title="Налаштування" />
        <main className="p-8 overflow-y-auto">
          <Settings />
        </main>
      </div>
    </div>
  );
}
