import React, { useState, useEffect } from 'react';
import UserLayout from './layout/UserLayout';
import { fetchApi } from '../lib/api';
import { useToast } from './ui/Toast';
import { Bell, CheckCircle2, Gift, Info, AlertTriangle } from 'lucide-react';

export default function UserNotifications() {
  const { addToast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/api/user/profile').then(setProfile).catch(console.error);
    fetchApi('/api/user/notifications')
      .then(res => setNotifications(Array.isArray(res) ? res : []))
      .catch(err => {
        addToast(err.message, 'error');
        setNotifications([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const markRead = (id: number) => {
    fetchApi(`/api/user/notifications/${id}/read`, { method: 'POST' })
      .then(() => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      })
      .catch(console.error);
  };

  return (
    <UserLayout profile={profile}>
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notifications</h1>
            <p className="text-xs text-slate-500">System announcements, gift alerts, and reward updates</p>
          </div>
          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-extrabold rounded-full border border-indigo-100">
            {(Array.isArray(notifications) ? notifications : []).filter(n => !n.isRead).length} New
          </span>
        </header>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium bg-white rounded-3xl border border-slate-200">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs">
            <Bell size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="font-bold text-slate-700">No Notifications Yet</p>
            <p className="text-xs text-slate-400 mt-1">You will receive system alerts and reward notifications here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div 
                key={n.id}
                onClick={() => !n.isRead && markRead(n.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  n.isRead 
                    ? 'bg-white border-slate-200/80' 
                    : 'bg-gradient-to-r from-indigo-50/60 to-purple-50/40 border-indigo-200 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl ${
                    n.type === 'gift' ? 'bg-amber-100 text-amber-700' :
                    n.type === 'warning' ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {n.type === 'gift' ? <Gift size={20} /> : n.type === 'warning' ? <AlertTriangle size={20} /> : <Info size={20} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-sm">{n.title}</h3>
                      <span className="text-[10px] text-slate-400">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
