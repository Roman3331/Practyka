'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { LayoutDashboard, User as UserIcon, BookOpen, FileText, Settings as SettingsIcon } from 'lucide-react';
import { SideBar } from '@/shared/components/ui/SideBar';
import { Header } from '@/shared/components/ui/Header';
import { SubjectDetail } from '@/pages/components/home/SubjectDetail';

const studentNavItems = [
  { icon: LayoutDashboard, label: 'Панель', href: '/student' },
  { icon: UserIcon, label: 'Профіль', href: '/student/profile' },
  { icon: BookOpen, label: 'Мої предмети', href: '/student/courses' },
  { icon: FileText, label: 'Завдання', href: '/student/tasks' },
  { icon: SettingsIcon, label: 'Налаштування', href: '/student/settings' },
];

export default function StudentSubjectDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <div className="flex min-h-screen gradient-bg">
      <SideBar items={studentNavItems} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-8 overflow-y-auto">
          {id ? <SubjectDetail id={id} /> : <div>Помилка: ID не знайдено</div>}
        </main>
      </div>
    </div>
  );
}
