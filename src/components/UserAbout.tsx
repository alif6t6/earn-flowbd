import React, { useState, useEffect } from 'react';
import UserLayout from './layout/UserLayout';
import { fetchApi } from '../lib/api';
import { Info, Sparkles, Award, ShieldCheck, Users } from 'lucide-react';

export default function UserAbout() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchApi('/api/user/profile').then(setProfile).catch(console.error);
  }, []);

  return (
    <UserLayout profile={profile}>
      <div className="space-y-6 max-w-3xl mx-auto">
        <header className="text-center py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-3xl p-8 shadow-xl">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center font-black text-2xl mx-auto mb-3">
            EF
          </div>
          <h1 className="text-3xl font-black tracking-tight">About Earn Flow</h1>
          <p className="text-xs text-indigo-100 mt-2 max-w-md mx-auto leading-relaxed">
            Leading International Micro Job & Reward Platform. Completing tasks, watching video ads, and inviting friends to earn instant payouts.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200/80 p-5 rounded-3xl text-center space-y-1 shadow-xs">
            <Award className="mx-auto text-indigo-600" size={28} />
            <p className="font-black text-slate-900 text-xl">100%</p>
            <p className="text-xs text-slate-500 font-bold">Trusted Payouts</p>
          </div>
          <div className="bg-white border border-slate-200/80 p-5 rounded-3xl text-center space-y-1 shadow-xs">
            <Users className="mx-auto text-emerald-600" size={28} />
            <p className="font-black text-slate-900 text-xl">50,000+</p>
            <p className="text-xs text-slate-500 font-bold">Active Members</p>
          </div>
          <div className="bg-white border border-slate-200/80 p-5 rounded-3xl text-center space-y-1 shadow-xs">
            <ShieldCheck className="mx-auto text-purple-600" size={28} />
            <p className="font-black text-slate-900 text-xl">Instant</p>
            <p className="text-xs text-slate-500 font-bold">bKash / USDT</p>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
