import React, { useState, useEffect } from 'react';
import UserLayout from './layout/UserLayout';
import { fetchApi } from '../lib/api';
import { ShieldCheck, Lock, Eye, Server, UserCheck, RefreshCw } from 'lucide-react';

export default function UserPrivacy() {
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
              <ShieldCheck size={14} /> Official Privacy & Data Protection Policy
            </div>
            <h1 className="text-3xl font-black tracking-tight">Privacy Policy</h1>
            <p className="text-xs text-indigo-100 mt-2 max-w-xl leading-relaxed font-medium">
              Earn Flow values your trust and is committed to protecting your personal information. This Privacy Policy details how we collect, store, safeguard, and use your data across our platform.
            </p>
          </div>
        </header>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-xs space-y-6 text-xs text-slate-600 leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Eye className="text-indigo-600" size={16} /> 1. Information We Collect
            </h2>
            <p>
              To provide secure micro-job, advertisement reward, and withdrawal services, Earn Flow collects minimal essential user data upon registration and account usage:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-500 font-medium">
              <li><strong>Account Credentials:</strong> Username, encrypted password hash, and profile configurations.</li>
              <li><strong>Contact & Payment Details:</strong> Mobile phone numbers and payment account numbers (bKash, Nagad, Binance USDT) provided for payout processing.</li>
              <li><strong>Device & Activity Information:</strong> IP address, device identifiers, login timestamps, and task completion logs to ensure security and prevent fraud.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Lock className="text-indigo-600" size={16} /> 2. How We Use Your Data
            </h2>
            <p>
              Your data is strictly processed to operate and enhance your Earn Flow experience:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-500 font-medium">
              <li>Authenticating account access and securing user sessions.</li>
              <li>Verifying task completions, advertisement views, and daily check-in reward distributions.</li>
              <li>Processing monetary withdrawals directly to your designated bKash, Nagad, or Binance accounts.</li>
              <li>Detecting fraudulent activities, duplicate accounts, bot scripts, or VPN violations to maintain platform integrity.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Server className="text-indigo-600" size={16} /> 3. Data Protection & Security
            </h2>
            <p>
              We enforce strict industry-standard security protocols to safeguard your credentials and financial records:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-500 font-medium">
              <li>Passwords are hashed using salted Bcrypt algorithms and are never stored in plain text.</li>
              <li>All server interactions and API transmissions are encrypted over Secure Sockets Layer (SSL/TLS).</li>
              <li>Financial payout records and phone numbers are stored securely with restricted access.</li>
              <li>We strictly <strong>never sell, lease, or trade</strong> your personal information to third parties.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <UserCheck className="text-indigo-600" size={16} /> 4. User Rights & Controls
            </h2>
            <p>
              As a registered user on Earn Flow, you maintain full control over your personal profile:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-500 font-medium">
              <li>You can update your phone number, password, and account settings at any time in the Settings page.</li>
              <li>You have the right to request account review or data deletion by reaching out through Official Support.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <RefreshCw className="text-indigo-600" size={16} /> 5. Updates to Policy
            </h2>
            <p>
              Earn Flow reserves the right to update this Privacy Policy periodically to align with platform enhancements and regulatory requirements. Continued use of the platform constitutes acceptance of updated terms.
            </p>
          </section>
        </div>
      </div>
    </UserLayout>
  );
}

