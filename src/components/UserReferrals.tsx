import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../lib/api';
import UserLayout from './layout/UserLayout';
import { Gift, Link as LinkIcon, Users, Copy } from 'lucide-react';
import { useToast } from './ui/Toast';

export default function UserReferrals() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [referralData, setReferralData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [profData, refData] = await Promise.all([
        fetchApi('/api/user/profile'),
        fetchApi('/api/user/referrals')
      ]);
      if (profData.isAdmin) {
        navigate('/admin');
        return;
      }
      setProfile(profData);
      setReferralData(refData);
    } catch (err: any) {
      localStorage.removeItem('token');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (referralData?.referralCode) {
      navigator.clipboard.writeText(referralData.referralCode);
      addToast('Referral code copied!', 'success');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">Loading...</div>;

  return (
    <UserLayout profile={profile}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Banner */}
        <div className="text-center bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white rounded-3xl p-8 shadow-xl">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-md">
            <Gift size={28} />
          </div>
          <h1 className="text-2xl font-black tracking-tight mb-2">Invite Friends & Earn Commission</h1>
          <p className="text-xs text-indigo-100 max-w-md mx-auto leading-relaxed">
            Earn <span className="font-black text-amber-300">{referralData?.commissionRate || 15}% commission</span> every time your friends complete tasks and watch videos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Share Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <LinkIcon size={18} className="text-indigo-600" /> Share Referral Link
            </h2>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Your Referral Code</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono text-indigo-700 font-extrabold tracking-widest text-center">
                    {referralData?.referralCode || 'EF-USER123'}
                  </code>
                  <button onClick={copyCode} className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer">
                    <Copy size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Users size={18} className="text-indigo-600" /> Referral Statistics
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Total Referred</p>
                <p className="text-2xl font-black text-indigo-900">{referralData?.totalReferrals || 0}</p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Referral Earnings</p>
                <p className="text-2xl font-black text-emerald-700">৳{referralData?.referralEarnings || '0.00'}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500">
              💡 Commissions are credited automatically when referred friends finish task offers.
            </div>
          </div>
        </div>

        {/* Referred Users List */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Your Referred Members</h3>
          {!Array.isArray(referralData?.referredUsers) || referralData.referredUsers.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No referred users yet. Share your code above!</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {referralData.referredUsers.map((u: any) => (
                <div key={u.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">@{u.username}</p>
                    <p className="text-[10px] text-slate-400">Joined: {new Date(u.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="font-black text-emerald-600">৳{u.totalEarnings}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
