'use client';

import React from 'react';
import { SideBar } from '@/shared/components/ui/SideBar';
import { Header } from '@/shared/components/ui/Header';
import { Settings } from '@/pages/components/home/settings';
import { studentNavItems } from '@/shared/constants/navigation';

export default function StudentSettingsPage() {
  return (
    <div className="flex min-h-screen gradient-bg">
      <SideBar items={studentNavItems} />
      <div className="flex-1 flex flex-col">
        <Header title="Налаштування" />
        <main className="p-4 sm:p-8">

          <Settings />
        </main>
      </div>
    </div>
  );
}
