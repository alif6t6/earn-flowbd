import React, { useState, useEffect } from 'react';
import UserLayout from './layout/UserLayout';
import { fetchApi } from '../lib/api';
import { CreditCard, ArrowUpRight, Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function UserWithdrawHistory() {
  const [profile, setProfile] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/api/user/profile').then(setProfile).catch(console.error);
    fetchApi('/api/user/withdrawals')
      .then(setWithdrawals)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <UserLayout profile={profile}>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Withdrawal History</h1>
          <p className="text-xs text-slate-500">Track all your payout requests, approval status, and notes</p>
        </header>

        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border">Loading withdrawal history...</div>
        ) : withdrawals.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <CreditCard size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">No Withdrawal Requests Yet</p>
            <p className="text-xs text-slate-400 mt-1">You can request payouts via bKash, Nagad, or Binance USDT.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {withdrawals.map((w) => (
              <div key={w.id} className="p-4 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl ${
                    w.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                    w.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {w.status === 'approved' ? <CheckCircle2 size={18} /> : w.status === 'rejected' ? <XCircle size={18} /> : <Clock size={18} />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-xs break-words">{w.method} - {w.accountNumber}</p>
                    <p className="text-[10px] text-slate-400">{new Date(w.createdAt).toLocaleString()}</p>
                    {w.note && <p className="text-[10px] text-indigo-600 font-medium mt-0.5 break-words">Note: {w.note}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-sm text-slate-900">৳{w.amount}</p>
                  <span className={`inline-block px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                    w.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                    w.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {w.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
