import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, ExternalLink, MessageSquare, FileText, ClipboardList, Award, Undo2, Megaphone } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { Card } from '@/shared/components/ui/Card';
import { useWebSocket } from '@/shared/hooks/useWebSocket';
import { useRouter } from 'next/navigation';

export const NotificationCenter = () => {
  const { user, token } = useAuthStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const resp = await fetch('http://localhost:3100/api/auth/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await resp.json();
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.isRead).length);
    } catch (err) { console.error(err); }
  };

  useWebSocket((msg) => {
    if (msg.type === 'notification') {
      setNotifications(prev => [msg.data, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show browser notification if permitted
      if (Notification.permission === 'granted') {
        new Notification(msg.data.title, { body: msg.data.message });
      }
    }
  }, user?.id);

  useEffect(() => {
    fetchNotifications();

    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`http://localhost:3100/api/auth/notifications/${id}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) { console.error(err); }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('http://localhost:3100/api/auth/notifications/read-all', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) { console.error(err); }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'announcement': return <Megaphone className="text-sky-400" size={16} />;
      case 'assignment': return <ClipboardList className="text-indigo-400" size={16} />;
      case 'test': return <FileText className="text-rose-400" size={16} />;
      case 'material': return <FileText className="text-emerald-400" size={16} />;
      case 'grade': return <Award className="text-amber-400" size={16} />;
      case 'assignment_returned': return <Undo2 className="text-orange-400" size={16} />;
      case 'chat_message': return <MessageSquare className="text-blue-400" size={16} />;
      default: return <Bell className="text-slate-400" size={16} />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
      >
        <Bell className={`text-slate-400 group-hover:text-white transition-colors ${unreadCount > 0 ? 'animate-bounce' : ''}`} size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-[10px] font-black text-white border-2 border-slate-950">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 max-h-[480px] bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Сповіщення</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider"
              >
                Прочитати всі
              </button>
            )}
          </div>

          <div className="overflow-y-auto max-h-[400px] custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <Bell className="mx-auto text-slate-700" size={32} />
                <p className="text-slate-500 text-xs font-medium">Сповіщень немає</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n._id}
                  onClick={() => {
                    if (!n.isRead) markAsRead(n._id);
                    if (n.link) router.push(n.link);
                    setIsOpen(false);
                  }}
                  className={`p-4 border-b border-white/5 cursor-pointer transition-all hover:bg-white/5 relative group ${!n.isRead ? 'bg-indigo-500/5' : ''}`}
                >
                  {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />}
                  <div className="flex gap-3">
                    <div className="mt-1 w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-white/20 transition-all">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-bold truncate ${!n.isRead ? 'text-white' : 'text-slate-400'}`}>
                          {n.title}
                        </p>
                        <span className="text-[9px] text-slate-500 font-medium">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

