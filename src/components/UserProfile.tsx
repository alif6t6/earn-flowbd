import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../lib/api';
import UserLayout from './layout/UserLayout';
import { Wallet, Crown, Link as LinkIcon, Calendar, Clock, CreditCard, Activity, LogOut, Trophy } from 'lucide-react';

export default function UserProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/api/user/profile')
      .then((data) => {
        if (data.isAdmin) navigate('/admin');
        else setProfile(data);
      })
      .catch(() => {
        localStorage.removeItem('token');
        navigate('/');
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">Loading...</div>;

  return (
    <UserLayout profile={profile}>
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Profile Header */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8 text-center md:text-left relative overflow-hidden">
          {profile?.isPremium && (
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Crown size={200} />
            </div>
          )}
          
          <div className="w-32 h-32 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-5xl font-bold border-4 border-white shadow-lg relative z-10">
            {profile?.username?.charAt(0).toUpperCase()}
            {profile?.isPremium && (
               <div className="absolute bottom-0 right-0 w-8 h-8 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center text-white shadow-sm">
                 <Crown size={16} />
               </div>
            )}
          </div>
          
          <div className="flex-1 relative z-10">
            <h1 className="text-3xl font-bold text-slate-900">@{profile?.username}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
               <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                  profile?.isPremium ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
               }`}>
                 {profile?.isPremium ? 'Premium Member' : 'Standard Member'}
               </span>
               <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                 {profile?.status || 'Active'}
               </span>
            </div>
          </div>
          
          <div className="w-full md:w-auto relative z-10">
             <button onClick={handleLogout} className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-rose-50 text-rose-600 rounded-xl font-bold hover:bg-rose-100 transition-colors">
                <LogOut size={18} /> Sign Out
             </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <Wallet size={20} />
            </div>
            <p className="text-sm text-slate-500 font-medium mb-1">Current Balance</p>
            <p className="text-xl font-bold text-slate-900">৳{profile?.balance || '0.00'}</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <Trophy size={20} />
            </div>
            <p className="text-sm text-slate-500 font-medium mb-1">Total Earnings</p>
            <p className="text-xl font-bold text-slate-900">৳{profile?.totalEarnings || '0.00'}</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <CreditCard size={20} />
            </div>
            <p className="text-sm text-slate-500 font-medium mb-1">Total Withdraw</p>
            <p className="text-xl font-bold text-slate-900">৳{profile?.totalWithdraw || '0.00'}</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <LinkIcon size={20} />
            </div>
            <p className="text-sm text-slate-500 font-medium mb-1">Referral Earnings</p>
            <p className="text-xl font-bold text-slate-900">৳{profile?.referralEarnings || '0.00'}</p>
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
             <Calendar size={20} className="text-slate-400" /> Account Details
          </h2>
          
          <div className="space-y-4">
             <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Username</span>
                <span className="font-bold text-slate-900">@{profile?.username}</span>
             </div>
             {profile?.phoneNumber && (
               <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Phone Number</span>
                  <span className="font-bold text-slate-900">{profile.phoneNumber}</span>
               </div>
             )}
             <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Pending Withdraw</span>
                <span className="font-bold text-amber-600">৳{profile?.pendingWithdraw || '0.00'}</span>
             </div>
             <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Today's Earnings</span>
                <span className="font-bold text-slate-900">৳{profile?.todaysEarnings || '0.00'}</span>
             </div>
             <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Completed Tasks</span>
                <span className="font-bold text-slate-900">{profile?.completedTasks || '0'}</span>
             </div>
             <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Total Referrals</span>
                <span className="font-bold text-slate-900">{profile?.totalReferrals || '0'}</span>
             </div>
             <div className="flex items-center justify-between py-3">
                <span className="text-slate-500 font-medium">Member Since</span>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                   <Clock size={16} className="text-slate-400" />
                   {new Date(profile?.createdAt || Date.now()).toLocaleDateString()}
                </span>
             </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
