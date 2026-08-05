import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../lib/api';
import { getActiveAds } from '../lib/adCache';
import UserLayout from './layout/UserLayout';
import { useToast } from './ui/Toast';
import AdRenderer from './common/AdRenderer';
import { 
  CheckSquare, Search, Filter, Play, Clock, Sparkles, Crown, 
  Eye, ExternalLink, X, ShieldAlert, CheckCircle2, Video, Image as ImageIcon
} from 'lucide-react';

export default function UserTasks() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'tasks' | 'videos'>('tasks');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Ad Modal state
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [adsList, setAdsList] = useState<any[]>([]);
  const [adCountdown, setAdCountdown] = useState(10);
  const [initialAdCountdown, setInitialAdCountdown] = useState(10);
  const [adFinished, setAdFinished] = useState(false);
  const [taskTimer, setTaskTimer] = useState<number | null>(null);
  const [taskInProgress, setTaskInProgress] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [isAway, setIsAway] = useState(false);

  // Live Cooldown Timer to next reset time (e.g. 06:00 AM)
  const [resetCooldown, setResetCooldown] = useState<{ hours: number; minutes: number; seconds: number }>({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const getNextResetDate = (renewTimeStr: string = '06:00') => {
      const parts = (renewTimeStr || '06:00').split(':');
      let renewHour = parseInt(parts[0], 10);
      let renewMinute = parseInt(parts[1], 10);
      if (isNaN(renewHour)) renewHour = 6;
      if (isNaN(renewMinute)) renewMinute = 0;

      const now = new Date();
      const nextReset = new Date(now.getFullYear(), now.getMonth(), now.getDate(), renewHour, renewMinute, 0, 0);
      if (now.getTime() >= nextReset.getTime()) {
        nextReset.setDate(nextReset.getDate() + 1);
      }
      return nextReset;
    };

    const updateTimer = () => {
      const renewTime = tasks.length > 0 && tasks[0].autoRenewTime ? tasks[0].autoRenewTime : '06:00';
      const targetDate = getNextResetDate(renewTime);
      const diff = targetDate.getTime() - Date.now();

      if (diff <= 0) {
        setResetCooldown({ hours: 0, minutes: 0, seconds: 0 });
        loadData();
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setResetCooldown({ hours, minutes, seconds });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [tasks]);

  useEffect(() => {
    fetchApi('/api/user/profile')
      .then((data) => {
        if (data.isAdmin) navigate('/admin');
        else setProfile(data);
      })
      .catch(() => {
        localStorage.removeItem('token');
        navigate('/');
      });

    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tasksRes, videosRes, adRes] = await Promise.all([
        fetchApi('/api/tasks'),
        fetchApi('/api/videos'),
        getActiveAds()
      ]);
      setTasks(tasksRes || []);
      setVideos(videosRes || []);
      setAdsList(Array.isArray(adRes) ? adRes : []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Open Ad Overlay for Task
  const handleStartTaskClick = (task: any) => {
    setSelectedTask(task);
    const time = task.adTimer || 10;
    setAdCountdown(time);
    setInitialAdCountdown(time);
    setAdFinished(false);
    setTaskInProgress(false);
  };

  // Open Ad Overlay for Video
  const handleStartVideoClick = (video: any) => {
    setSelectedVideo(video);
    setAdCountdown(10);
    setInitialAdCountdown(10);
    setAdFinished(false);
    setTaskInProgress(false);
  };

  // Ad 10-second countdown effect
  useEffect(() => {
    let timer: any = null;
    if ((selectedTask || selectedVideo) && adCountdown > 0) {
      timer = setInterval(() => {
        setAdCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setAdFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [selectedTask, selectedVideo, adCountdown]);

  // Task countdown after ad finishes (Only when page is hidden)
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsAway(document.hidden);
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    setIsAway(document.hidden); // check initial state

    let timer: any = null;
    if (taskInProgress && taskTimer !== null && taskTimer > 0) {
      timer = setInterval(() => {
        if (document.hidden) {
          setTaskTimer(prev => (prev && prev > 1 ? prev - 1 : 0));
        }
      }, 1000);
    }
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [taskInProgress, taskTimer]);

  const handleCloseAdModal = () => {
    if (!adFinished) {
      addToast('Advertisement closed early. Task remains locked.', 'error');
    }
    setSelectedTask(null);
    setSelectedVideo(null);
    setTaskInProgress(false);
    setTaskTimer(null);
  };

  const handleExecuteTask = () => {
    const targetUrl = selectedTask?.taskUrl || selectedTask?.link || selectedVideo?.videoUrl || activeAd?.destinationUrl;
    if (targetUrl) {
      window.open(targetUrl, '_blank');
    }
    setTaskInProgress(true);
    setTaskTimer(selectedTask ? (selectedTask.countdownTimer || 10) : (selectedVideo?.duration || 15));
  };

  
  const checkAdblocker = async () => {
    try {
      await fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', { mode: 'no-cors', cache: 'no-store' });
      // Also try to detect elements hidden by css blockers if needed, but fetch usually catches DNS blockers.
      return false;
    } catch (e) {
      return true;
    }
  };

  const handleClaimTaskReward = async () => {
    setCompleting(true);
    const isAdblocked = await checkAdblocker();
    if (isAdblocked) {
       addToast("⚠️ Ad-Blocker / Custom DNS Detected! Apnar phone e DNS ba Ad-Blocker on kora ache. Task complete korte abong reward claim korte onugroho kore apnar Ad-Blocker ba Private DNS disable korun.", 'error');
       setCompleting(false);
       return;
    }

    try {
      if (selectedTask) {
        const res = await fetchApi('/api/user/tasks/complete', {
          method: 'POST',
          body: JSON.stringify({ taskId: selectedTask.id })
        });
        addToast(res.message, 'success');
      } else if (selectedVideo) {
        const res = await fetchApi('/api/user/videos/complete', {
          method: 'POST',
          body: JSON.stringify({ videoId: selectedVideo.id })
        });
        addToast(res.message, 'success');
      }
      setSelectedTask(null);
      setSelectedVideo(null);
      setTaskInProgress(false);
      // Refresh profile balance & tasks data
      const updatedProfile = await fetchApi('/api/user/profile');
      setProfile(updatedProfile);
      loadData();
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setCompleting(false);
    }
  };

  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredVideos = videos.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const sponsorAd = adsList.find(a => a.type === 'Task Advertisement' || a.type === 'Sponsor') || null;
  const bannerAds = adsList.filter(a => (a.type === 'Task Advertisement' || a.type === 'Sponsor') && a.id !== sponsorAd?.id);
  const activeAd = adsList.find(a => (a.type === 'Task Advertisement' || a.location === 'task_modal') && a.id !== sponsorAd?.id) || sponsorAd || null;

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    if (bannerAds.length === 0) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % bannerAds.length);
    }, 15000); // 15s banner rotation
    return () => clearInterval(interval);
  }, [bannerAds.length]);

  const currentBanner = bannerAds.length > 0 ? bannerAds[currentBannerIndex] : null;

  return (
    <UserLayout profile={profile}>
      <div className="space-y-6">
        {/* Top Title & Search Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Earn Flow Rewards</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Complete micro jobs and video tasks to earn instant cash</p>
          </div>
          
          {/* Search */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-xs font-semibold focus:outline-none focus:border-indigo-600 shadow-xs"
            />
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          </div>
        </div>

        {/* Global Sponsor Ad & Rotating Banner */}
        <div className="grid grid-cols-1 gap-4">
          {sponsorAd && (
            <div className="w-full flex items-center justify-center">
              <AdRenderer
                content={sponsorAd.content}
                type={sponsorAd.type}
                imageUrl={sponsorAd.imageUrl}
                destinationUrl={sponsorAd.destinationUrl}
                title={sponsorAd.title}
                description={sponsorAd.description}
                buttonText={sponsorAd.buttonText}
                adRatio={sponsorAd.adRatio}
                className="w-full"
              />
            </div>
          )}
          
          {currentBanner && (
            <div className="w-full flex items-center justify-center">
              <AdRenderer
                content={currentBanner.content}
                type={currentBanner.type}
                imageUrl={currentBanner.imageUrl}
                destinationUrl={currentBanner.destinationUrl}
                title={currentBanner.title}
                description={currentBanner.description}
                buttonText={currentBanner.buttonText}
                adRatio={currentBanner.adRatio}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Content Section - All Tasks directly displayed */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/80 font-medium">
            Loading tasks...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs">
            <CheckSquare size={48} className="mx-auto text-slate-300 mb-3" />
            <h3 className="font-extrabold text-slate-800 text-base">No tasks available right now</h3>
            <p className="text-xs text-slate-400 mt-1">Check back soon! New sponsor tasks are added daily.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((t) => {
              const finalReward = parseFloat(t.reward || '10.00');

              return (
                <div key={t.id} className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <img 
                        src={t.image && t.image !== '$' ? t.image : 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=150'} 
                        alt="Task" 
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shrink-0"
                        loading="lazy"
                      />
                      <div>
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-md">
                          {t.type || 'Sponsor Task'}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm mt-1 leading-snug line-clamp-2">{t.title}</h3>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{t.instructions || 'Complete step-by-step instructions to claim reward.'}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Task Reward</p>
                      <p className="text-base font-black text-indigo-900">
                        ৳{finalReward.toFixed(2)}
                        {profile?.isPremium && <span className="text-[10px] font-bold text-amber-600 ml-1">(3X VIP)</span>}
                      </p>
                    </div>

                    {t.isCompletedToday ? (
                      <div className="flex flex-col items-end gap-1">
                        <button
                          disabled
                          className="px-3.5 py-2 bg-slate-100 text-slate-500 font-bold text-xs rounded-2xl border border-slate-200/80 flex items-center gap-1.5 cursor-not-allowed opacity-90"
                        >
                          <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                          <span>Completed</span>
                        </button>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-900 text-[10px] font-black rounded-full border border-amber-200/80 shadow-2xs">
                          <Clock size={11} className="text-amber-600 animate-spin" style={{ animationDuration: '4s' }} />
                          {String(resetCooldown.hours).padStart(2, '0')}h {String(resetCooldown.minutes).padStart(2, '0')}m {String(resetCooldown.seconds).padStart(2, '0')}s
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartTaskClick(t)}
                        className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-black text-xs rounded-2xl shadow-md shadow-indigo-600/20 hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Play size={14} className="fill-white" /> {t.buttonText || 'Start Task'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* MANDATORY ADVERTISEMENT OVERLAY MODAL                              */}
        {/* 10-Second Ad Countdown before unlocking task execution              */}
        {/* ------------------------------------------------------------------- */}
        {(selectedTask || selectedVideo) && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-ping" />
                  <p className="font-extrabold text-slate-900 text-sm">Sponsored Ads</p>
                </div>
                <button
                  onClick={handleCloseAdModal}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                  title="Close Ad"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body: Render Administrator's Selected Advertisement */}
              <div className="p-6 space-y-5">
                {/* 1. Premium Advertisement Card */}
                {(activeAd?.imageUrl || activeAd?.content) && (
                  <div className="w-full flex items-center justify-center">
                    <AdRenderer
                      content={activeAd.content}
                      type={activeAd.type}
                      imageUrl={activeAd.imageUrl}
                      destinationUrl={activeAd.destinationUrl}
                      title={activeAd.title}
                      description={activeAd.description}
                      buttonText={activeAd.buttonText}
                      adRatio={activeAd.adRatio}
                      className="w-full"
                    />
                  </div>
                )}

                {/* 2. Countdown Section (Only before ad finishes and not during task) */}
                {!taskInProgress && (
                  <div className="space-y-3">
                    {!adFinished ? (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                        <p className="text-sm font-bold text-slate-700 flex items-center justify-center gap-2 mb-3">
                          <Clock size={16} className="text-indigo-600 animate-spin" /> Viewing Advertisement
                        </p>
                        
                        {/* Animated Progress Bar */}
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mb-3">
                          <div 
                            className="h-full bg-indigo-600 transition-all duration-1000 ease-linear"
                            style={{ width: `${Math.max(0, Math.min(100, ((initialAdCountdown - adCountdown) / initialAdCountdown) * 100))}%` }} 
                          />
                        </div>
                        
                        <p className="text-[11px] font-bold text-slate-500">
                          <span className="text-indigo-600">{adCountdown} Seconds</span> Remaining
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center animate-in fade-in zoom-in-95">
                        <p className="text-sm font-extrabold text-emerald-700 flex items-center justify-center gap-2">
                          <CheckCircle2 size={18} className="text-emerald-500" /> Advertisement Completed Successfully.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Instructions / Task Execution */}
                {taskInProgress ? (
                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-center space-y-2">
                    <p className="text-xs font-extrabold text-indigo-900">Task In Progress</p>
                    {selectedTask?.instructions && (
                      <p className="text-xs text-indigo-700 bg-white/80 p-2.5 rounded-xl border border-indigo-100">{selectedTask.instructions}</p>
                    )}
                    
                    {taskTimer > 0 && !isAway ? (
                      <div className="p-3 bg-rose-100 border border-rose-200 rounded-xl">
                        <p className="text-xs font-bold text-rose-700 mb-1">⚠️ Timer Paused!</p>
                        <p className="text-[10px] text-rose-600">Please return to the sponsor website and stay there for {taskTimer} seconds to resume the countdown.</p>
                      </div>
                    ) : (
                      <p className="text-sm font-black text-indigo-700">Timer: {taskTimer}s</p>
                    )}
                    
                    {taskTimer === 0 && (
                      <button
                        onClick={handleClaimTaskReward}
                        disabled={completing}
                        className="w-full py-3 bg-emerald-600 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 active:scale-95 transition-all"
                      >
                        {completing ? 'Claiming Reward...' : 'Claim ৳ Reward Now 🎉'}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="pt-2">
                    <button
                      disabled={!adFinished}
                      onClick={handleExecuteTask}
                      className={`w-full py-3.5 font-black text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 ${
                        adFinished
                          ? 'bg-emerald-600 text-white shadow-emerald-600/30 hover:bg-emerald-700 active:scale-95'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Play size={18} /> {adFinished ? (selectedTask?.buttonText || activeAd?.buttonText || 'Visit Sponsor') : `Locked (${adCountdown}s)`}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
