import React, { useState, useEffect } from 'react';
import UserLayout from './layout/UserLayout';
import { fetchApi } from '../lib/api';
import { FileText, ShieldAlert, CheckCircle, AlertTriangle, CreditCard, Ban } from 'lucide-react';

export default function UserTerms() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchApi('/api/user/profile').then(setProfile).catch(console.error);
  }, []);

  return (
    <UserLayout profile={profile}>
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black mb-3 text-indigo-100 border border-white/20">
              <FileText size={14} /> Official Terms of Service & User Agreement
            </div>
            <h1 className="text-3xl font-black tracking-tight">Terms & Conditions</h1>
            <p className="text-xs text-indigo-100 mt-2 max-w-xl leading-relaxed font-medium">
              Please read these Terms and Conditions carefully before using Earn Flow. By creating an account or using our platform, you agree to strictly follow these rules and guidelines.
            </p>
          </div>
        </header>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-xs space-y-6 text-xs text-slate-600 leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <CheckCircle className="text-indigo-600" size={16} /> 1. Account Eligibility & Registration
            </h2>
            <p>
              By registering an account on Earn Flow, you confirm that:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-500 font-medium">
              <li>You provide accurate, genuine profile details including a valid mobile number.</li>
              <li>You are strictly allowed <strong>only ONE account per person/device</strong>.</li>
              <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Ban className="text-rose-600" size={16} /> 2. Fair Play & Prohibited Activities
            </h2>
            <p>
              Earn Flow operates an automated security monitoring system to maintain an authentic reward system. The following activities are strictly forbidden and will result in an <strong>immediate permanent account ban</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-500 font-medium">
              <li>Creating multiple accounts, self-referrals, or fake referral loops.</li>
              <li>Using VPNs, proxies, TOR nodes, or IP spoofing tools during task completion.</li>
              <li>Using automated bots, clickers, or scripts to skip ad timers or auto-claim rewards.</li>
              <li>Attempting to exploit system bugs, inject malicious code, or tamper with API calls.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <AlertTriangle className="text-amber-600" size={16} /> 3. Tasks, Advertisements & Reward Calculation
            </h2>
            <p>
              Rewards are credited to your account upon verified completion of tasks, video ads, promo codes, and daily check-ins:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-500 font-medium">
              <li>Users must complete the required advertisement countdown duration to claim rewards.</li>
              <li>Daily check-in streaks reset at 06:00 AM daily.</li>
              <li>Total Earnings reflect all verified task income, gift bonuses, and promo code rewards.</li>
              <li>Earn Flow reserves the right to audit task completions and adjust invalid balance credits.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <CreditCard className="text-emerald-600" size={16} /> 4. Withdrawal & Payment Policies
            </h2>
            <p>
              Payouts are processed according to the following strict financial guidelines:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-500 font-medium">
              <li>Minimum withdrawal threshold is <strong>৳500</strong>.</li>
              <li>Payouts are supported via bKash, Nagad, and Binance USDT.</li>
              <li>Users must provide valid 11-digit phone numbers for bKash and Nagad.</li>
              <li>Withdrawal processing typically takes between 1 to 24 hours after admin verification.</li>
              <li>If a withdrawal request is rejected by administration, funds are refunded back to the user balance.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <ShieldAlert className="text-indigo-600" size={16} /> 5. Account Termination & Liability
            </h2>
            <p>
              Earn Flow reserves the right to suspend or terminate accounts that violate these terms without prior notice. Forfeited balances from banned accounts cannot be claimed or refunded.
            </p>
          </section>
        </div>
      </div>
    </UserLayout>
  );
}

