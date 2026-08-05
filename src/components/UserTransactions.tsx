import React, { useState, useEffect } from 'react';
import UserLayout from './layout/UserLayout';
import { fetchApi } from '../lib/api';
import { History, ArrowDownRight, ArrowUpRight, Gift } from 'lucide-react';

export default function UserTransactions() {
  const [profile, setProfile] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/api/user/profile').then(setProfile).catch(console.error);
    fetchApi('/api/user/transactions')
      .then(res => setTransactions(Array.isArray(res) ? res : []))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <UserLayout profile={profile}>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Transaction History</h1>
          <p className="text-xs text-slate-500">All task rewards, referral bonuses, and balance adjustments</p>
        </header>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium bg-white rounded-3xl border">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <History size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">No Transactions Found</p>
            <p className="text-xs text-slate-400 mt-1">Complete tasks or invite friends to generate earnings.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
            <div className="divide-y divide-slate-100">
              {transactions.map((tx) => {
                const isPositive = !String(tx.amount).startsWith('-');
                return (
                  <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-2xl ${isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {isPositive ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-xs break-words">{tx.description}</p>
                        <p className="text-[10px] text-slate-400">{new Date(tx.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <span className={`font-black text-sm ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isPositive ? `+৳${tx.amount}` : `৳${tx.amount}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
