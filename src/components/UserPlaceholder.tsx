import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchApi } from '../lib/api';
import UserLayout from './layout/UserLayout';
import { Settings, Bell, HelpCircle, Construction } from 'lucide-react';

export default function UserPlaceholder() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/api/user/profile')
      .then((data) => {
        if (data.isAdmin) navigate('/admin');
        else setProfile(data);
      })
      .catch(() => {
        localStorage.removeItem('token');
        navigate('/');
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">Loading...</div>;

  let title = 'Under Construction';
  let icon = <Construction size={48} className="text-indigo-300 mb-6" />;
  
  if (location.pathname.includes('settings')) {
    title = 'Settings';
    icon = <Settings size={48} className="text-indigo-300 mb-6" />;
  } else if (location.pathname.includes('notifications')) {
    title = 'Notifications';
    icon = <Bell size={48} className="text-indigo-300 mb-6" />;
  } else if (location.pathname.includes('support')) {
    title = 'Support & Help';
    icon = <HelpCircle size={48} className="text-indigo-300 mb-6" />;
  }

  return (
    <UserLayout profile={profile}>
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-3xl shadow-sm border border-slate-100">
         {icon}
         <h1 className="text-3xl font-bold text-slate-900 mb-4">{title}</h1>
         <p className="text-slate-500 max-w-md text-lg">This page is currently being updated. Please check back later for new features.</p>
         <button onClick={() => navigate('/user')} className="mt-8 px-6 py-3 bg-indigo-50 text-indigo-700 rounded-xl font-bold hover:bg-indigo-100 transition-colors">
           Return to Dashboard
         </button>
      </div>
    </UserLayout>
  );
}
