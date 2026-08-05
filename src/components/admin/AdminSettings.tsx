import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../lib/api';
import AdminLayout from '../layout/AdminLayout';
import { useToast } from '../ui/Toast';
import { 
  Settings, Globe, Eye, FileText, Save, CheckCircle2, 
  HelpCircle, Info, ShieldCheck, PhoneCall, Layout, Layers, Gift, Clock, Plus, Trash2
} from 'lucide-react';

export default function AdminSettings() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'content' | 'pages' | 'checkin'>('general');

  const [form, setForm] = useState({
    siteName: 'Earn Flow',
    minWithdraw: '500',
    referralCommission: '15',
    referralEnabled: 'true',
    adCountdown: '10',
    taskAutoRenewTime: '06:00',
    dailyCheckInEnabled: 'true',
    dailyRewards: JSON.stringify({1:2, 2:4, 3:8, 4:10, 5:15, 6:20, 7:20, 8:30}),
    logoUrl: '',
    faviconUrl: '',
    heroTitle: 'Earn Money Online with Micro Jobs',
    heroSubtitle: 'Complete simple online tasks, watch short video ads, and withdraw instant cash directly to your bKash, Nagad, or Binance wallet.',
    buttonStartText: 'Start Earning Now',
    footerText: 'Earn Flow is Bangladesh & Worldwide trusted micro job and advertisement reward platform.',
    copyrightText: '© 2026 Earn Flow. All rights reserved.',
    navDashboardName: 'Dashboard',
    navTasksName: 'Tasks',
    navWithdrawName: 'Withdraw',
    navProfileName: 'Profile',
    faqContent: 'Q: How do I earn money on Earn Flow?\nA: Go to Tasks, click Start Task, view the 10-second sponsor ad, complete the required instructions, and claim instant cash rewards.\n\nQ: What is the minimum withdrawal limit?\nA: The minimum withdrawal is ৳500.',
    aboutContent: 'Earn Flow is an innovative digital rewards platform where active users connect with global sponsors. Users perform micro tasks like visiting websites, watching promotional video guides, and inviting friends while receiving verified payouts.',
    contactContent: 'Support Email: support@earnflow.app\nTelegram Official: @EarnFlowOfficial\nWorking Hours: 24/7 Fast Payouts',
    termsContent: 'By using Earn Flow, you agree to follow our micro-job guidelines. Cheating, using VPNs for fake completion, or creating multiple accounts on the same device will result in account suspension.',
    privacyContent: 'Your privacy is paramount. Earn Flow collects minimal data required for account authentication and secure withdrawal processing. We never share your credentials with third parties.',

    // User Pages Content & Texts
    referralPageContent: 'Invite friends using your unique referral link or code to earn 15% instant lifetime commission on all task completion earnings!',
    withdrawContent: 'Request fast payouts directly to your bKash, Nagad, or Binance wallet. Minimum withdrawal amount is ৳500. Verification takes 1-24 hours.',
    announcementsContent: 'Check current system broadcasts, daily reward updates, and exclusive earning events in your inbox.',
    offersPageContent: 'Complete high-reward sponsor video offers and micro jobs to build your daily earnings quickly.',
    leaderboardContent: 'Top earners and active referrers in Bangladesh and globally updated live every hour.',

    // Page Visibility Settings
    page_referral_enabled: 'true',
    page_support_enabled: 'true',
    page_withdraw_enabled: 'true',
    page_announcements_enabled: 'true',
    page_offers_enabled: 'true',
    page_statistics_enabled: 'true',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/api/admin/settings');
      if (Array.isArray(data)) {
        const mapped: any = { ...form };
        data.forEach((s: any) => {
          if (s.key && s.value !== null && s.value !== undefined) mapped[s.key] = s.value;
        });
        setForm(mapped);
      }
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetchApi('/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify({ settings: form }),
      });
      addToast('All website settings and content saved successfully!', 'success');
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Website Content & Page Visibility Manager</h1>
            <p className="text-xs text-slate-500">Edit every visible text on Earn Flow and control page visibility without modifying source code</p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-indigo-600 text-white font-black text-xs rounded-2xl shadow-md hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </header>

        {/* Tab Selector */}
        <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center max-w-md">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'general' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            <Settings size={15} /> General Config
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'content' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            <FileText size={15} /> Content & Texts
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pages')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'pages' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            <Eye size={15} /> Page Visibility
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('checkin')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'checkin' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            <Gift size={15} /> Daily Check-in
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border">Loading settings...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* 1. GENERAL CONFIG TAB */}
            {activeTab === 'general' && (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-6">
                <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2 pb-3 border-b">
                  <Globe size={18} className="text-indigo-600" /> Site Identity & Financial Defaults
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                  <div>
                    <label className="block text-slate-700 uppercase mb-1">Website Name</label>
                    <input
                      type="text"
                      value={form.siteName}
                      onChange={(e) => handleChange('siteName', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 uppercase mb-1">Minimum Withdraw Amount (৳)</label>
                    <input
                      type="number"
                      value={form.minWithdraw}
                      onChange={(e) => handleChange('minWithdraw', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 uppercase mb-1">Referral Commission Rate (%)</label>
                    <input
                      type="number"
                      value={form.referralCommission}
                      onChange={(e) => handleChange('referralCommission', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 uppercase mb-1">Sponsor Ad Countdown (Seconds)</label>
                    <input
                      type="number"
                      value={form.adCountdown}
                      onChange={(e) => handleChange('adCountdown', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 uppercase mb-1">Task & Check-in Renew Time (24h Format)</label>
                    <input
                      type="text"
                      placeholder="06:00"
                      value={form.taskAutoRenewTime}
                      onChange={(e) => handleChange('taskAutoRenewTime', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl font-bold"
                    />
                    <span className="text-[10px] text-slate-400 font-normal">Daily tasks and check-in rewards reset for users at this time (default: 06:00 AM).</span>
                  </div>

                  <div>
                    <label className="block text-slate-700 uppercase mb-1">Custom Logo URL (Optional)</label>
                    <input
                      type="text"
                      placeholder="https://domain.com/logo.png"
                      value={form.logoUrl}
                      onChange={(e) => handleChange('logoUrl', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 uppercase mb-1">Custom Favicon URL (Optional)</label>
                    <input
                      type="text"
                      placeholder="https://domain.com/favicon.ico"
                      value={form.faviconUrl}
                      onChange={(e) => handleChange('faviconUrl', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. CONTENT & TEXTS TAB */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                {/* Hero & Navigation Names */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
                  <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2 pb-3 border-b">
                    <Layout size={18} className="text-indigo-600" /> Hero Section & Button Labels
                  </h2>

                  <div className="space-y-4 text-xs font-semibold">
                    <div>
                      <label className="block text-slate-700 uppercase mb-1">Hero Title Heading</label>
                      <input
                        type="text"
                        value={form.heroTitle}
                        onChange={(e) => handleChange('heroTitle', e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 uppercase mb-1">Hero Subtitle Description</label>
                      <textarea
                        rows={2}
                        value={form.heroSubtitle}
                        onChange={(e) => handleChange('heroSubtitle', e.target.value)}
                        className="w-full p-3 bg-slate-50 border rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 uppercase mb-1">Primary Action Button Text</label>
                        <input
                          type="text"
                          value={form.buttonStartText}
                          onChange={(e) => handleChange('buttonStartText', e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 uppercase mb-1">Footer Copyright Text</label>
                        <input
                          type="text"
                          value={form.copyrightText}
                          onChange={(e) => handleChange('copyrightText', e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer & Navigation Labels */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
                  <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2 pb-3 border-b">
                    <Layers size={18} className="text-indigo-600" /> Navigation Names
                  </h2>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-semibold">
                    <div>
                      <label className="block text-slate-700 uppercase mb-1">Nav: Dashboard</label>
                      <input
                        type="text"
                        value={form.navDashboardName}
                        onChange={(e) => handleChange('navDashboardName', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 uppercase mb-1">Nav: Tasks</label>
                      <input
                        type="text"
                        value={form.navTasksName}
                        onChange={(e) => handleChange('navTasksName', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 uppercase mb-1">Nav: Withdraw</label>
                      <input
                        type="text"
                        value={form.navWithdrawName}
                        onChange={(e) => handleChange('navWithdrawName', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 uppercase mb-1">Nav: Profile</label>
                      <input
                        type="text"
                        value={form.navProfileName}
                        onChange={(e) => handleChange('navProfileName', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Legal & Static Pages Content */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
                  <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2 pb-3 border-b">
                    <FileText size={18} className="text-indigo-600" /> Legal & Information Page Content
                  </h2>

                  <div className="space-y-4 text-xs font-semibold">
                    <div>
                      <label className="block text-slate-700 uppercase mb-1">Referral Program Page Description</label>
                      <textarea
                        rows={2}
                        value={form.referralPageContent}
                        onChange={(e) => handleChange('referralPageContent', e.target.value)}
                        className="w-full p-3 bg-slate-50 border rounded-xl font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 uppercase mb-1">Support & Help Details & Contact Info</label>
                      <textarea
                        rows={3}
                        value={form.contactContent}
                        onChange={(e) => handleChange('contactContent', e.target.value)}
                        className="w-full p-3 bg-slate-50 border rounded-xl font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 uppercase mb-1">Withdrawal Page Instructions & Notice</label>
                      <textarea
                        rows={2}
                        value={form.withdrawContent}
                        onChange={(e) => handleChange('withdrawContent', e.target.value)}
                        className="w-full p-3 bg-slate-50 border rounded-xl font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 uppercase mb-1">Announcements & Notifications Notice</label>
                      <textarea
                        rows={2}
                        value={form.announcementsContent}
                        onChange={(e) => handleChange('announcementsContent', e.target.value)}
                        className="w-full p-3 bg-slate-50 border rounded-xl font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 uppercase mb-1">Sponsor Offers & Video Ads Page Guidance</label>
                      <textarea
                        rows={2}
                        value={form.offersPageContent}
                        onChange={(e) => handleChange('offersPageContent', e.target.value)}
                        className="w-full p-3 bg-slate-50 border rounded-xl font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 uppercase mb-1">User Leaderboard & Community Stats Description</label>
                      <textarea
                        rows={2}
                        value={form.leaderboardContent}
                        onChange={(e) => handleChange('leaderboardContent', e.target.value)}
                        className="w-full p-3 bg-slate-50 border rounded-xl font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 uppercase mb-1">FAQ Content (Frequently Asked Questions)</label>
                      <textarea
                        rows={4}
                        value={form.faqContent}
                        onChange={(e) => handleChange('faqContent', e.target.value)}
                        className="w-full p-3 bg-slate-50 border rounded-xl font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 uppercase mb-1">About Us Content</label>
                      <textarea
                        rows={3}
                        value={form.aboutContent}
                        onChange={(e) => handleChange('aboutContent', e.target.value)}
                        className="w-full p-3 bg-slate-50 border rounded-xl font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 uppercase mb-1">Terms & Conditions Text</label>
                      <textarea
                        rows={3}
                        value={form.termsContent}
                        onChange={(e) => handleChange('termsContent', e.target.value)}
                        className="w-full p-3 bg-slate-50 border rounded-xl font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 uppercase mb-1">Privacy Policy Text</label>
                      <textarea
                        rows={3}
                        value={form.privacyContent}
                        onChange={(e) => handleChange('privacyContent', e.target.value)}
                        className="w-full p-3 bg-slate-50 border rounded-xl font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. PAGE VISIBILITY MANAGER TAB */}
            {activeTab === 'pages' && (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-6">
                <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2 pb-3 border-b">
                  <Eye size={18} className="text-indigo-600" /> Page Visibility Manager
                </h2>
                <p className="text-xs text-slate-500">Enable or disable entire modules and pages across the platform</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
                  {[
                    { key: 'page_referral_enabled', label: 'Referral Program Page', desc: 'Displays invite links and affiliate commission tracking' },
                    { key: 'page_support_enabled', label: 'Support & Help Page', desc: 'Contact details and help center' },
                    { key: 'page_withdraw_enabled', label: 'Withdrawal Page', desc: 'Money cashout request form' },
                    { key: 'page_announcements_enabled', label: 'Announcements & Notifications', desc: 'User inbox and global broadcast notifications' },
                    { key: 'page_offers_enabled', label: 'Sponsor Offers & Video Ads', desc: 'Video and sponsor offer tasks tab' },
                    { key: 'page_statistics_enabled', label: 'User Leaderboard & Statistics', desc: 'Top referrers and community stats' },
                  ].map((p) => {
                    const isVisible = form[p.key as keyof typeof form] !== 'false';

                    return (
                      <div key={p.key} className="p-4 bg-slate-50 border rounded-2xl flex items-center justify-between gap-3">
                        <div>
                          <p className="text-slate-900 font-extrabold text-sm">{p.label}</p>
                          <p className="text-[11px] text-slate-400 font-normal">{p.desc}</p>
                        </div>

                        <select
                          value={form[p.key as keyof typeof form]}
                          onChange={(e) => handleChange(p.key, e.target.value)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase cursor-pointer border ${
                            isVisible ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300'
                          }`}
                        >
                          <option value="true">Show Page (Enabled)</option>
                          <option value="false">Hide Page (Disabled)</option>
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. DAILY CHECK-IN REWARD MANAGER TAB */}
            {activeTab === 'checkin' && (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-6">
                <h2 className="font-extrabold text-slate-900 text-base flex items-center justify-between pb-3 border-b">
                  <span className="flex items-center gap-2">
                    <Gift size={18} className="text-amber-500" /> Daily Check-In Reward Settings
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                    form.dailyCheckInEnabled !== 'false' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {form.dailyCheckInEnabled !== 'false' ? 'Active' : 'Deactive'}
                  </span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
                  <div className="p-4 bg-slate-50 border rounded-2xl flex items-center justify-between gap-3">
                    <div>
                      <p className="text-slate-900 font-extrabold text-sm">Daily Check-In Feature Status</p>
                      <p className="text-[11px] text-slate-400 font-normal">Enable or deactivate the daily check-in modal for users</p>
                    </div>

                    <select
                      value={form.dailyCheckInEnabled}
                      onChange={(e) => handleChange('dailyCheckInEnabled', e.target.value)}
                      className={`px-3 py-2 rounded-xl text-xs font-black uppercase cursor-pointer border ${
                        form.dailyCheckInEnabled !== 'false' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}
                    >
                      <option value="true">Active (Enabled)</option>
                      <option value="false">Deactive (Disabled)</option>
                    </select>
                  </div>

                  <div className="p-4 bg-slate-50 border rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-slate-900 font-extrabold text-sm">Reset / Renew Time</p>
                      <p className="text-[11px] text-slate-400 font-normal">Daily check-in streak reset time (e.g. 06:00 AM)</p>
                    </div>

                    <input
                      type="text"
                      placeholder="06:00 AM"
                      value={form.taskAutoRenewTime}
                      onChange={(e) => handleChange('taskAutoRenewTime', e.target.value)}
                      className="w-32 px-3 py-2 bg-white border border-slate-300 rounded-xl font-black text-center text-xs text-indigo-900"
                    />
                  </div>
                </div>

                {/* Day-by-day Amounts */}
                <div className="pt-2">
                  <h3 className="text-sm font-extrabold text-slate-800 mb-3 flex items-center gap-2">
                    <Clock size={16} className="text-indigo-600" /> Daily Reward Amounts (৳ Cash per Day)
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">Set the exact cash reward users earn when checking in on each day of their streak.</p>

                  {(() => {
                    let rewardsObj: Record<string, number> = { "1": 2, "2": 4, "3": 8, "4": 10, "5": 15, "6": 20, "7": 20, "8": 30 };
                    try {
                      if (form.dailyRewards) rewardsObj = JSON.parse(form.dailyRewards);
                    } catch (e) {}

                    const days = Object.keys(rewardsObj).map(Number).sort((a, b) => a - b);

                    const updateDayAmount = (dayNum: number, amountVal: number) => {
                      const newObj = { ...rewardsObj, [dayNum]: amountVal };
                      handleChange('dailyRewards', JSON.stringify(newObj));
                    };

                    const addDay = () => {
                      const nextDayNum = (days.length > 0 ? Math.max(...days) : 0) + 1;
                      const newObj = { ...rewardsObj, [nextDayNum]: 10 };
                      handleChange('dailyRewards', JSON.stringify(newObj));
                    };

                    const removeDay = (dayNum: number) => {
                      if (days.length <= 1) return;
                      const newObj = { ...rewardsObj };
                      delete newObj[dayNum];
                      handleChange('dailyRewards', JSON.stringify(newObj));
                    };

                    return (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {days.map((dayNum) => (
                            <div key={dayNum} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-black text-indigo-700 uppercase tracking-wider">Day {dayNum}</span>
                                {days.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeDay(dayNum)}
                                    className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                                    title="Delete Day"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500/20">
                                <span className="text-xs font-extrabold text-slate-400">৳</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  value={rewardsObj[dayNum]}
                                  onChange={(e) => updateDayAmount(dayNum, parseFloat(e.target.value) || 0)}
                                  className="w-full text-sm font-black text-slate-900 focus:outline-none"
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={addDay}
                          className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5"
                        >
                          <Plus size={15} /> Add Streak Day
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 bg-indigo-600 text-white font-black text-sm rounded-2xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              <Save size={18} /> {saving ? 'Saving Configurations...' : 'Save All Settings & Content'}
            </button>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
