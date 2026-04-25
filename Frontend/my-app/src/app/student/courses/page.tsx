'use client';

import React from 'react';
import { LayoutDashboard, User as UserIcon, BookOpen, FileText, Settings as SettingsIcon } from 'lucide-react';
import { SideBar } from '@/shared/components/ui/SideBar';
import { Header } from '@/shared/components/ui/Header';
import { SubjectManagement } from '@/pages/components/home/SubjectManagement';

const studentNavItems = [
  { icon: LayoutDashboard, label: 'Панель', href: '/student' },
  { icon: UserIcon, label: 'Профіль', href: '/student/profile' },
  { icon: BookOpen, label: 'Мої предмети', href: '/student/courses' },
  { icon: FileText, label: 'Завдання', href: '/student/tasks' },
  { icon: SettingsIcon, label: 'Налаштування', href: '/student/settings' },
];

export default function StudentCoursesPage() {
  return (
    <div className="flex min-h-screen gradient-bg">
      <SideBar items={studentNavItems} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Мої Предмети" />
        <main className="p-4 sm:p-8">

          <SubjectManagement />
        </main>
      </div>
    </div>
  );
}
