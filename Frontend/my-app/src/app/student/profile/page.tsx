'use client';

import React from 'react';
import { SideBar } from '@/shared/components/ui/SideBar';
import { Header } from '@/shared/components/ui/Header';
import { Profile } from '@/pages/components/home/profile';
import { studentNavItems } from '@/shared/constants/navigation';

export default function StudentProfilePage() {
  return (
    <div className="flex min-h-screen gradient-bg">
      <SideBar items={studentNavItems} />
      <div className="flex-1 flex flex-col">
        <Header title="Мій Профіль" />
        <main className="p-4 sm:p-8">

          <Profile />
        </main>
      </div>
    </div>
  );
}
