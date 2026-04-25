'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { LayoutDashboard, User as UserIcon, Users, BookOpen, FileText, Calendar, Settings as SettingsIcon } from 'lucide-react';
import { SideBar } from '@/shared/components/ui/SideBar';
import { Header } from '@/shared/components/ui/Header';
import { SubjectDetail } from '@/pages/components/home/SubjectDetail';

import { teacherNavItems } from '@/shared/constants/navigation';

export default function TeacherSubjectDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <div className="flex min-h-screen gradient-bg">
      <SideBar items={teacherNavItems} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="p-4 sm:p-8">
          {id ? <SubjectDetail id={id} /> : <div>Помилка: ID не знайдено</div>}
        </main>

      </div>
    </div>
  );
}
