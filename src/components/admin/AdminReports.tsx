import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../lib/api';
import AdminLayout from '../layout/AdminLayout';
import { BarChart3, TrendingUp, Users, DollarSign, CheckSquare, Download, Calendar } from 'lucide-react';

export default function AdminReports() {
  const [stats, setStats] = useState<any>({
    users: 0,
    tasks: 0,
    pendingWithdraws: 0,
    totalEarned: '0.00',
  });
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchApi('/api/admin/stats').catch(() => ({})),
      fetchApi('/api/admin/withdrawals').catch(() => [])
    ]).then(([statsData, withdrawData]) => {
      if (statsData) setStats(statsData);
      if (Array.isArray(withdrawData)) setWithdrawals(withdrawData);
    }).finally(() => setLoading(false));
  }, []);

  const totalPayouts = withdrawals
    .filter(w => w.status === 'approved')
    .reduce((sum, w) => sum + parseFloat(w.amount || '0'), 0);

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 size={26} className="text-indigo-600" /> Platform Financial & Activity Reports
            </h1>
            <p className="text-xs text-slate-500 mt-1">Detailed overview of system earnings, user payouts, task metrics, and growth analytics</p>
          </div>

          <button 
            onClick={() => window.print()}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs flex items-center gap-2 self-start sm:self-auto"
          >
            <Download size={16} /> Export / Print Report
          </button>
        </header>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 bg-white border border-slate-200/80 rounded-3xl shadow-xs space-y-1">
            <p className="text-[10px] uppercase font-black text-slate-400">Total User Base</p>
            <p className="text-2xl font-black text-slate-900">{stats.users}</p>
            <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <TrendingUp size={12} /> Active Earners
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200/80 rounded-3xl shadow-xs space-y-1">
            <p className="text-[10px] uppercase font-black text-slate-400">Total User Earnings</p>
            <p className="text-2xl font-black text-emerald-600">৳{stats.totalEarned}</p>
            <p className="text-[11px] text-slate-500 font-medium">Distributed Rewards</p>
          </div>

          <div className="p-5 bg-white border border-slate-200/80 rounded-3xl shadow-xs space-y-1">
            <p className="text-[10px] uppercase font-black text-slate-400">Total Approved Payouts</p>
            <p className="text-2xl font-black text-indigo-600">৳{totalPayouts.toFixed(2)}</p>
            <p className="text-[11px] text-slate-500 font-medium">Verified Withdrawals</p>
          </div>

          <div className="p-5 bg-white border border-slate-200/80 rounded-3xl shadow-xs space-y-1">
            <p className="text-[10px] uppercase font-black text-slate-400">Pending Withdraw Queue</p>
            <p className="text-2xl font-black text-amber-600">{stats.pendingWithdraws}</p>
            <p className="text-[11px] text-amber-600 font-bold">Awaiting Verification</p>
          </div>
        </div>

        {/* Financial Summary Table */}
        <div className="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm">Recent Financial Transactions & Payout Logs</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-black uppercase text-[10px]">
                <tr>
                  <th className="p-3 rounded-l-xl">User</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Account Number</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3 rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400">No report records available.</td>
                  </tr>
                ) : (
                  withdrawals.slice(0, 10).map((w: any) => (
                    <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-900">{w.username || `User #${w.userId}`}</td>
                      <td className="p-3 font-bold uppercase text-indigo-600">{w.method}</td>
                      <td className="p-3 font-mono">{w.accountNumber}</td>
                      <td className="p-3 font-extrabold text-slate-900">৳{w.amount}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                          w.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                          w.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {w.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
