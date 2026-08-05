import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchApi } from '../lib/api';
import AdminLayout from './layout/AdminLayout';
import { Construction } from 'lucide-react';

export default function AdminPlaceholder() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/api/user/profile')
      .then((data) => {
        if (!data.isAdmin) navigate('/user');
      })
      .catch(() => {
        localStorage.removeItem('token');
        navigate('/');
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;

  const pathName = location.pathname.split('/').pop();
  const title = pathName ? pathName.charAt(0).toUpperCase() + pathName.slice(1) : 'Under Construction';

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-3xl shadow-sm border border-slate-100">
         <Construction size={48} className="text-indigo-300 mb-6" />
         <h1 className="text-3xl font-bold text-slate-900 mb-4">{title} Module</h1>
         <p className="text-slate-500 max-w-md text-lg">This administrative section is currently being updated or built.</p>
         <button onClick={() => navigate('/admin')} className="mt-8 px-6 py-3 bg-indigo-50 text-indigo-700 rounded-xl font-bold hover:bg-indigo-100 transition-colors">
           Return to Dashboard
         </button>
      </div>
    </AdminLayout>
  );
}
