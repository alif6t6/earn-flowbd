import React, { useState } from 'react';
import { Gift, Check, Lock, Sparkles, X, Clock, Flame, CalendarDays } from 'lucide-react';
import { fetchApi } from '../../lib/api';

interface DailyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkInInfo: {
    canClaim: boolean;
    claimedToday: boolean;
    currentStreak: number;
    nextDay: number;
    nextReward: number;
    renewTime: string;
    rewards: Array<{
      day: number;
      reward: number;
      status: 'claimed' | 'current' | 'locked';
    }>;
  } | null;
  onClaimSuccess: (data: any) => void;
}

export default function DailyCheckInModal({
  isOpen,
  onClose,
  checkInInfo,
  onClaimSuccess,
}: DailyCheckInModalProps) {
  const [claiming, setClaiming] = useState(false);

  if (!isOpen || !checkInInfo) return null;

  const totalDays = checkInInfo.rewards?.length || 8;

  const handleClaim = async () => {
    if (claiming || !checkInInfo.canClaim) return;
    setClaiming(true);
    try {
      const data = await fetchApi('/api/user/daily-checkin/claim', {
        method: 'POST',
      });

      onClaimSuccess(data);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error claiming reward');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative flex flex-col">
        {/* Top Banner */}
        <div className="relative p-7 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white overflow-hidden">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/25 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all cursor-pointer z-10 border border-white/10"
            aria-label="Close"
          >
            <X size={18} />
          </button>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/20 mb-3 border border-amber-300/40">
              <CalendarDays size={30} strokeWidth={2} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-300 mb-1 flex items-center gap-1 bg-amber-400/10 px-3 py-0.5 rounded-full border border-amber-400/20">
              <Sparkles size={12} /> Daily Cash Rewards
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight mb-1">
              Daily Check-in Reward
            </h2>
            <p className="text-xs text-slate-300 font-medium max-w-[320px] mx-auto leading-relaxed">
              Check in every day to claim increasing cash rewards! Resets daily at <span className="font-bold text-amber-300">{checkInInfo.renewTime || '06:00 AM'}</span>.
            </p>
          </div>
        </div>

        {/* Modal Body: Reward Streak Grid */}
        <div className="p-5 md:p-7 bg-slate-50/80 flex-1">
          <div className="flex items-center justify-between mb-5 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                <Flame size={22} className="fill-amber-500" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Streak Progress</p>
                <p className="text-sm font-black text-slate-900">
                  Day {checkInInfo.currentStreak || 0} <span className="text-slate-300 mx-1">/</span> {totalDays}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Renew Time</p>
              <div className="flex items-center gap-1.5 text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg mt-0.5">
                <Clock size={13} className="text-indigo-600" />
                {checkInInfo.renewTime || '06:00 AM'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2.5 mb-6">
            {(Array.isArray(checkInInfo?.rewards) ? checkInInfo.rewards : []).map((item) => {
              const isClaimed = item.status === 'claimed';
              const isCurrent = item.status === 'current';
              
              return (
                <div
                  key={item.day}
                  className={`relative p-2.5 rounded-2xl text-center transition-all flex flex-col items-center justify-center h-[92px] ${
                    isClaimed
                      ? 'bg-emerald-50/90 border-2 border-emerald-500/30 text-emerald-900 shadow-2xs'
                      : isCurrent
                      ? 'bg-white border-2 border-indigo-600 text-indigo-950 shadow-md ring-4 ring-indigo-500/15 scale-105 z-10'
                      : 'bg-white border border-slate-200/80 text-slate-400 opacity-75'
                  }`}
                >
                  <span className={`text-[10px] font-extrabold uppercase tracking-widest mb-0.5 ${isCurrent ? 'text-indigo-600' : isClaimed ? 'text-emerald-700' : 'text-slate-400'}`}>
                    Day {item.day}
                  </span>
                  
                  <div className={`font-black tracking-tight ${isCurrent ? 'text-xl text-indigo-950' : 'text-lg'}`}>
                    ৳{item.reward}
                  </div>
                  
                  <div className="absolute -bottom-2.5">
                    {isClaimed ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shadow-sm ring-2 ring-white">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    ) : isCurrent ? (
                      <div className="bg-indigo-600 text-white px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm ring-2 ring-white animate-pulse">
                        Claim
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-xs ring-2 ring-white">
                        <Lock size={10} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Button / Banner */}
          {checkInInfo.canClaim ? (
            <button
              onClick={handleClaim}
              disabled={claiming}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:active:scale-100 group"
            >
              <Gift size={20} className="text-amber-300 group-hover:scale-110 transition-transform" />
              {claiming ? 'Claiming Reward...' : `Claim Day ${checkInInfo.nextDay} (৳${checkInInfo.nextReward}) Reward`}
            </button>
          ) : (
            <div className="w-full py-3.5 bg-slate-200/80 text-slate-700 font-extrabold text-xs md:text-sm rounded-2xl text-center flex items-center justify-center gap-2 border border-slate-300/60 shadow-2xs">
              <Check size={18} className="text-emerald-600 stroke-[3]" />
              Already Claimed Today! Resets tomorrow at {checkInInfo.renewTime || '06:00 AM'}.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
