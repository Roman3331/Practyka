'use client';

import React from 'react';
import { SideBar } from '@/shared/components/ui/SideBar';
import { Header } from '@/shared/components/ui/Header';
import { Profile } from '@/pages/components/home/profile';
import { teacherNavItems } from '@/shared/constants/navigation';

export default function TeacherProfilePage() {
  return (
    <div className="flex min-h-screen gradient-bg">
      <SideBar items={teacherNavItems} />
      <div className="flex-1 flex flex-col">
        <Header title="Мій Профіль" />
        <main className="p-8 overflow-y-auto">
          <Profile />
        </main>
      </div>
    </div>
  );
}
