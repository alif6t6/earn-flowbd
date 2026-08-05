import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../lib/api';
import AdminLayout from './layout/AdminLayout';

export default function AdminPanel() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/api/admin/stats')
      .then(setStats)
      .catch((err) => {
        if (err.message.includes('401') || err.message.includes('403')) {
          localStorage.removeItem('token');
          navigate('/');
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">Loading...</div>;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">Admin Mode</span>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-slate-400 text-sm font-medium">Total Users</h3>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.users || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-slate-400 text-sm font-medium">Active Tasks</h3>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.tasks || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-slate-400 text-sm font-medium">Total User Income</h3>
            <p className="text-3xl font-bold text-emerald-600 mt-2">৳{stats?.totalEarned || '0.00'}</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

