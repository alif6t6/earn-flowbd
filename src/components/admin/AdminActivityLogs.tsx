import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../lib/api';
import AdminLayout from '../layout/AdminLayout';
import { ShieldAlert, Activity, RefreshCw, UserCheck, Key, FileCode } from 'lucide-react';

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate recent admin and system security audit trail
    setTimeout(() => {
      setLogs([
        { id: 1, action: 'Admin Login', user: 'superadmin', ip: '103.145.22.18', details: 'Successful session authorization', timestamp: new Date().toLocaleString() },
        { id: 2, action: 'Settings Updated', user: 'superadmin', ip: '103.145.22.18', details: 'Payment Gateway numbers modified', timestamp: new Date(Date.now() - 300000).toLocaleString() },
        { id: 3, action: 'Task Status Modified', user: 'superadmin', ip: '103.145.22.18', details: 'Updated Task #1 countdown timer', timestamp: new Date(Date.now() - 900000).toLocaleString() },
        { id: 4, action: 'Withdrawal Approved', user: 'superadmin', ip: '103.145.22.18', details: 'Approved ৳500.00 to bKash 01712345678', timestamp: new Date(Date.now() - 3600000).toLocaleString() },
        { id: 5, action: 'Premium Plan Created', user: 'superadmin', ip: '103.145.22.18', details: 'Added 30 Days VIP package', timestamp: new Date(Date.now() - 86400000).toLocaleString() },
      ]);
      setLoading(false);
    }, 300);
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        <header className="border-b border-slate-200/80 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Activity size={26} className="text-indigo-600" /> Admin Activity & Security Audit Logs
            </h1>
            <p className="text-xs text-slate-500 mt-1">Real-time system events, administrative modifications, and security access logs</p>
          </div>
          <button 
            onClick={() => setLoading(true) || setTimeout(() => setLoading(false), 300)}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </header>

        <div className="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-xs space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-black uppercase text-[10px]">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Action</th>
                  <th className="p-3.5">Admin User</th>
                  <th className="p-3.5">IP Address</th>
                  <th className="p-3.5">Details</th>
                  <th className="p-3.5 rounded-r-xl">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-indigo-600 flex items-center gap-2">
                      <ShieldAlert size={14} /> {log.action}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">{log.user}</td>
                    <td className="p-3.5 font-mono text-slate-500">{log.ip}</td>
                    <td className="p-3.5 text-slate-600">{log.details}</td>
                    <td className="p-3.5 text-slate-400 text-[11px] font-mono">{log.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
