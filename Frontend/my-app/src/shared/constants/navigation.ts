import { 
  LayoutDashboard, User as UserIcon, BookOpen, 
  FileText, Calendar, Settings, Award, Clock
} from 'lucide-react';

export const studentNavItems = [
  { icon: LayoutDashboard, label: 'Панель', href: '/student' },
  { icon: UserIcon, label: 'Профіль', href: '/student/profile' },
  { icon: BookOpen, label: 'Мої предмети', href: '/student/courses' },
  { icon: FileText, label: 'Завдання', href: '/student/tasks' },
  { icon: Clock, label: 'Розклад', href: '/student/schedule' },
  { icon: Settings, label: 'Налаштування', href: '/student/settings' },
];

export const teacherNavItems = [
  { icon: LayoutDashboard, label: 'Панель', href: '/teacher' },
  { icon: UserIcon, label: 'Профіль', href: '/teacher/profile' },
  { icon: BookOpen, label: 'Предмети', href: '/teacher/courses' },
  { icon: Clock, label: 'Розклад', href: '/teacher/schedule' },
  { icon: Settings, label: 'Налаштування', href: '/teacher/settings' },
];
