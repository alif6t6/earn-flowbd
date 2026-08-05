import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../lib/api';
import { getActiveAds } from '../lib/adCache';
import { Wallet, Gift, TrendingUp, Trophy, Clock, CheckCircle2, Ticket, Sparkles, Flame, Coins, Activity } from 'lucide-react';
import UserLayout from './layout/UserLayout';
import { useToast } from './ui/Toast';
import AdRenderer from './common/AdRenderer';
import DailyCheckInModal from './common/DailyCheckInModal';

export default function UserPanel() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adsList, setAdsList] = useState<any[]>([]);
  
  const [promoCode, setPromoCode] = useState('');
  const [claimingPromo, setClaimingPromo] = useState(false);
  const [claimingCampaign, setClaimingCampaign] = useState(false);

  const [checkInInfo, setCheckInInfo] = useState<any>(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);

  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  const handleClaimCampaign = async () => {
    if (claimingCampaign) return;
    setClaimingCampaign(true);
    try {
      const data = await fetchApi('/api/user/campaign/claim', {
        method: 'POST',
      });
      addToast(data.message || 'Promotion bonus claimed successfully!', 'success');
      const updatedProfile = await fetchApi('/api/user/profile');
      setProfile(updatedProfile);
    } catch (err: any) {
      addToast(err.message || 'Failed to claim campaign bonus', 'error');
    } finally {
      setClaimingCampaign(false);
    }
  };

  useEffect(() => {
    if (!profile?.createdAt || profile?.hasClaimedPromo) {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const createdTime = new Date(profile.createdAt).getTime();
      const expiryTime = createdTime + 6 * 60 * 60 * 1000;
      const diff = expiryTime - Date.now();

      if (diff <= 0) {
        setTimeLeft(null);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [profile]);

  const handleClaimPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    
    setClaimingPromo(true);
    try {
      const data = await fetchApi('/api/user/promo-code/claim', {
        method: 'POST',
        body: JSON.stringify({ code: promoCode.trim() })
      });
      addToast(data.message || 'Promo code claimed successfully!', 'success');
      setPromoCode('');
      // Reload profile to reflect new balance
      const newProfile = await fetchApi('/api/user/profile');
      setProfile(newProfile);
    } catch (err: any) {
      addToast(err.message || 'Failed to claim promo code', 'error');
    } finally {
      setClaimingPromo(false);
    }
  };

  const loadDailyCheckIn = async () => {
    try {
      const data = await fetchApi('/api/user/daily-checkin');
      setCheckInInfo(data);
      if (data?.canClaim) {
        setShowCheckInModal(true);
      }
    } catch (err) {
      console.warn('Failed to load daily check-in status', err);
    }
  };

  useEffect(() => {
    Promise.all([
      fetchApi('/api/user/profile'),
      getActiveAds(),
      fetchApi('/api/user/daily-checkin').catch(() => null)
    ])
      .then(([data, adsData, checkInData]) => {
        if (data.isAdmin) navigate('/admin');
        else {
          setProfile(data);
          setAdsList(Array.isArray(adsData) ? adsData : []);
          if (checkInData) {
            setCheckInInfo(checkInData);
            if (checkInData.canClaim) {
              setShowCheckInModal(true);
            }
          }
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        navigate('/');
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleCheckInClaimSuccess = async (resData: any) => {
    addToast(resData.message || 'Daily reward claimed successfully!', 'success');
    // Refresh profile & checkin status
    try {
      const [updatedProfile, updatedCheckIn] = await Promise.all([
        fetchApi('/api/user/profile'),
        fetchApi('/api/user/daily-checkin')
      ]);
      setProfile(updatedProfile);
      setCheckInInfo(updatedCheckIn);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">Loading...</div>;

  const welcomeAd = adsList.find(a => a.type === 'Welcome Ads') || null;
  const promoAd = adsList.find(a => a.type === 'Promo Ads' && a.id !== welcomeAd?.id) || adsList.find(a => a.id !== welcomeAd?.id) || null;

  const showPromoSection = !profile?.hasClaimedPromo && timeLeft !== null;

  return (
    <UserLayout profile={profile}>
      <div className="space-y-6 max-w-5xl mx-auto">
        
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-8 text-white shadow-lg shadow-indigo-900/20">
           <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {profile?.username}! 👋</h1>
           {welcomeAd && (
             <div className="w-full mt-4 flex items-center justify-center">
               <AdRenderer
                 content={welcomeAd.content}
                 type={welcomeAd.type}
                 imageUrl={welcomeAd.imageUrl}
                 destinationUrl={welcomeAd.destinationUrl}
                 title={welcomeAd.title}
                 description={welcomeAd.description}
                 buttonText={welcomeAd.buttonText}
                 adRatio={welcomeAd.adRatio}
                 className="w-full"
               />
             </div>
           )}
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
               <Wallet size={28} />
            </div>
            <div>
               <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Current Balance</p>
               <p className="text-3xl font-bold text-slate-900">৳{profile?.balance || '0.00'}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
               <TrendingUp size={28} />
            </div>
            <div>
               <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Today's Earnings</p>
               <p className="text-3xl font-bold text-slate-900">৳{profile?.todaysEarnings || '0.00'}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
               <Trophy size={28} />
            </div>
            <div>
               <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Earnings</p>
               <p className="text-3xl font-bold text-slate-900">৳{profile?.totalEarnings || '0.00'}</p>
            </div>
          </div>
        </div>

        {/* Daily Check-in Bonus Banner Card */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner shrink-0">
              <Gift size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white text-orange-900 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Sparkles size={10} /> Daily Bonus
                </span>
                {checkInInfo?.canClaim && (
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-400 text-emerald-950 px-2 py-0.5 rounded-full animate-bounce">
                    Ready to Claim
                  </span>
                )}
              </div>
              <h3 className="text-lg font-black mt-1">Daily Check-in Reward</h3>
              <p className="text-xs text-amber-100 font-medium">
                {checkInInfo?.canClaim
                  ? `Claim Day ${checkInInfo.nextDay} reward (৳${checkInInfo.nextReward}) now!`
                  : `Current Streak: Day ${checkInInfo?.currentStreak || 0} / 8. Resets daily at ${checkInInfo?.renewTime || '06:00 AM'}.`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCheckInModal(true)}
            className="w-full sm:w-auto px-6 py-3 bg-white text-orange-950 hover:bg-amber-50 font-black text-xs rounded-2xl shadow-md transition-all active:scale-95 whitespace-nowrap cursor-pointer"
          >
            {checkInInfo?.canClaim ? '🎁 Claim Reward Now' : 'View Check-in Streak'}
          </button>
        </div>

          {/* Active Promotion Campaign Banner */}
        {profile?.activeCampaign && !profile.activeCampaign.hasClaimed && (
          <div className="bg-gradient-to-r from-purple-800 via-indigo-900 to-purple-900 rounded-3xl p-6 text-white shadow-xl border border-purple-500/30 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg shrink-0 border border-amber-300/40">
                <Sparkles size={28} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full">
                    🔥 Active Campaign
                  </span>
                  <span className="text-xs font-black text-amber-300">
                    Reward: ৳{profile.activeCampaign.bonusAmount} Cash
                  </span>
                </div>
                <h3 className="text-xl font-black tracking-tight">{profile.activeCampaign.name}</h3>
                <p className="text-xs text-purple-200 font-medium mt-0.5">
                  Claim your exclusive promotion campaign bonus now and boost your balance!
                </p>
              </div>
            </div>

            <div className="relative z-10 w-full sm:w-auto shrink-0">
              <button
                onClick={handleClaimCampaign}
                disabled={claimingCampaign}
                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-60 disabled:active:scale-100 whitespace-nowrap"
              >
                {claimingCampaign ? 'Claiming...' : `🎉 Claim ৳${profile.activeCampaign.bonusAmount} Bonus`}
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
          
          {promoAd && (
            <div className="w-full flex items-center justify-center mb-6">
              <AdRenderer
                content={promoAd.content}
                type={promoAd.type}
                imageUrl={promoAd.imageUrl}
                destinationUrl={promoAd.destinationUrl}
                title={promoAd.title}
                description={promoAd.description}
                buttonText={promoAd.buttonText}
                adRatio={promoAd.adRatio}
                className="w-full"
              />
            </div>
          )}

          {/* Promo Code Section */}
          {showPromoSection && (
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl shadow-lg border border-indigo-500/50 p-6 md:p-8 mb-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h2 className="text-xl font-black flex items-center gap-2">
                        <Ticket size={24} className="text-amber-300" /> Have a Promo Code?
                      </h2>
                      {timeLeft && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-amber-950 text-xs font-black rounded-full shadow-md">
                          <Clock size={14} className="animate-spin" style={{ animationDuration: '4s' }} /> 
                          {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
                        </span>
                      )}
                    </div>
                    <p className="text-indigo-100 text-sm font-medium">Claim your creator referral or special promo code for instant bonus cash.</p>
                  </div>
                <form onSubmit={handleClaimPromo} className="w-full md:w-auto flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter Code..."
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="px-4 py-3 rounded-2xl bg-white/20 border border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 min-w-[200px] font-bold text-sm uppercase"
                    disabled={claimingPromo}
                  />
                  <button
                    type="submit"
                    disabled={claimingPromo || !promoCode.trim()}
                    className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 whitespace-nowrap"
                  >
                    {claimingPromo ? 'Claiming...' : 'Claim'}
                  </button>
                </form>
              </div>
            </div>
          )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Tasks Overview */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Task Overview</h2>
              <button onClick={() => navigate('/user/tasks')} className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View All</button>
            </div>
            <div className="space-y-4">
               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center"><CheckCircle2 size={20} /></div>
                     <div>
                        <p className="font-bold text-slate-900">Completed Tasks</p>
                        <p className="text-xs text-slate-500">Total tasks completed</p>
                     </div>
                  </div>
                  <p className="text-xl font-bold text-slate-900">{profile?.completedTasks || '0'}</p>
               </div>
               <div className="flex items-center justify-between p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center"><Clock size={20} /></div>
                     <div>
                        <p className="font-bold text-slate-900">Pending Withdraw</p>
                        <p className="text-xs text-slate-500">Awaiting processing</p>
                     </div>
                  </div>
                  <p className="text-xl font-bold text-amber-600">৳{profile?.pendingWithdraw || '0.00'}</p>
               </div>
               <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><Gift size={20} /></div>
                     <div>
                        <p className="font-bold text-slate-900">Referral Earnings</p>
                        <p className="text-xs text-slate-500">Total from invites</p>
                     </div>
                  </div>
                  <p className="text-xl font-bold text-emerald-600">৳{profile?.referralEarnings || '0.00'}</p>
               </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
            </div>
            
            <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-2xl border border-slate-100 h-[280px]">
               <Activity size={48} className="text-slate-300 mb-4" />
               <p className="text-slate-500 font-medium">No recent activity.</p>
               <p className="text-sm text-slate-400 mt-1">Start completing tasks to see your history here.</p>
            </div>
          </div>
        </div>
      </div>

      <DailyCheckInModal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        checkInInfo={checkInInfo}
        onClaimSuccess={handleCheckInClaimSuccess}
      />
    </UserLayout>
  );
}

