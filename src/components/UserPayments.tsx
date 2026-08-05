import React, { useState, useEffect } from 'react';
import UserLayout from './layout/UserLayout';
import { fetchApi } from '../lib/api';
import { CreditCard, Crown, ArrowUpRight } from 'lucide-react';

export default function UserPayments() {
  const [profile, setProfile] = useState<any>(null);
  const [payments, setPayments] = useState<any>({ withdrawals: [], premiumPayments: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/api/user/profile').then(setProfile).catch(console.error);
    fetchApi('/api/user/payments')
      .then(setPayments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <UserLayout profile={profile}>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Payment & Billing History</h1>
          <p className="text-xs text-slate-500">Record of all your withdrawals and premium membership upgrades</p>
        </header>

        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border">Loading payments...</div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Crown size={18} className="text-amber-500" /> Premium Membership Submissions
              </h2>
              {payments.premiumPayments?.length === 0 ? (
                <div className="p-6 bg-white border border-slate-200/80 rounded-2xl text-xs text-slate-400 text-center">
                  No premium upgrade submissions found.
                </div>
              ) : (
                <div className="space-y-2">
                  {payments.premiumPayments.map((p: any) => (
                    <div key={p.id} className="p-4 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-xs break-words">Method: {p.method} ({p.senderNumber})</p>
                        <p className="text-[10px] text-slate-400 font-mono break-all">TrxID: {p.transactionId}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-xs text-slate-900">৳{p.amount}</p>
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          p.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                          p.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {p.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
