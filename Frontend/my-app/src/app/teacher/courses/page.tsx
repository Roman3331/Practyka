'use client';

import React from 'react';
import { LayoutDashboard, User as UserIcon, Users, BookOpen, FileText, Calendar, Settings as SettingsIcon } from 'lucide-react';
import { SideBar } from '@/shared/components/ui/SideBar';
import { Header } from '@/shared/components/ui/Header';
import { SubjectManagement } from '@/pages/components/home/SubjectManagement';

import { teacherNavItems } from '@/shared/constants/navigation';

export default function TeacherCoursesPage() {
  return (
    <div className="flex min-h-screen gradient-bg">
      <SideBar items={teacherNavItems} />
      <div className="flex-1 flex flex-col">
        <Header title="Керування Предметами" />
        <main className="p-8 overflow-y-auto">
          <SubjectManagement />
        </main>
      </div>
    </div>
  );
}
