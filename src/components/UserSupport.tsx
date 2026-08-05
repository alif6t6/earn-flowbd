import React, { useState, useEffect } from 'react';
import UserLayout from './layout/UserLayout';
import { fetchApi } from '../lib/api';
import { MessageSquare, ShieldCheck } from 'lucide-react';

export default function UserSupport() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchApi('/api/user/profile').then(setProfile).catch(console.error);
  }, []);

  return (
    <UserLayout profile={profile}>
      <div className="space-y-6 max-w-3xl mx-auto">
        <header>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Support & Help Center</h1>
          <p className="text-xs text-slate-500">Need assistance? Reach out to our 24/7 Earn Flow support team</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center font-bold">
              <MessageSquare size={20} />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">Live Telegram Support</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Join our official Telegram support channel for instant payment updates and live chat assistance.</p>
            <a href="https://t.me" target="_blank" rel="noreferrer" className="inline-block px-4 py-2 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-xl hover:bg-indigo-100 transition-colors">
              Join Telegram Community
            </a>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center font-bold">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">Withdraw Guarantee</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Withdrawals are processed within 1 to 24 hours via bKash, Nagad, and Binance USDT.</p>
            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200">
              Verified Platform
            </span>
          </div>
        </div>


      </div>
    </UserLayout>
  );
}
