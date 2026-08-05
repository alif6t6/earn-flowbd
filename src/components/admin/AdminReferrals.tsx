import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../lib/api';
import AdminLayout from '../layout/AdminLayout';
import { useToast } from '../ui/Toast';
import { Share2, Users, Save, Trophy, Percent, RefreshCw } from 'lucide-react';

export default function AdminReferrals() {
  const { addToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commissionRate, setCommissionRate] = useState(15);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/api/admin/referrals');
      setData(res);
      setCommissionRate(res.commissionRate || 15);
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetchApi('/api/admin/referrals/commission', {
        method: 'POST',
        body: JSON.stringify({ rate: Number(commissionRate) }),
      });
      addToast('Commission rate updated successfully', 'success');
      loadData();
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Referral & Affiliate System</h1>
          <p className="text-xs text-slate-500">Configure global referral commissions, view network statistics and top referrers</p>
        </header>

        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border">Loading referral metrics...</div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase">Total Referral Connections</p>
                <p className="text-2xl font-black text-indigo-900">{data?.totalReferralCount || 0}</p>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase">Total Referral Commission Paid</p>
                <p className="text-2xl font-black text-emerald-600">৳{data?.totalReferralEarningsPaid || '0.00'}</p>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase">Active Commission Rate</p>
                <p className="text-2xl font-black text-purple-600">{commissionRate}%</p>
              </div>
            </div>

            {/* Config Form */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs max-w-xl space-y-4">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Percent size={18} className="text-indigo-600" /> Configure Global Commission Rate
              </h2>

              <form onSubmit={handleSaveCommission} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Referral Commission (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-50 border rounded-2xl font-black text-sm focus:outline-none focus:border-indigo-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    This percentage is rewarded to referrers when their referred friends earn money by completing tasks.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-indigo-600 text-white font-extrabold text-xs rounded-2xl shadow-md hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Save size={16} /> Save Commission Rate
                </button>
              </form>
            </div>

            {/* Top Referrers */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <Trophy size={16} className="text-amber-500" /> Top System Referrers
              </h3>

              <div className="space-y-2">
                {!Array.isArray(data?.topReferrers) || data.topReferrers.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No referral records logged yet.</p>
                ) : (
                  data.topReferrers.map((ref: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 font-extrabold text-[10px] flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900">@{ref.username}</p>
                          <p className="text-[10px] text-slate-400">TotalInvites: {ref.count}</p>
                        </div>
                      </div>
                      <span className="font-black text-emerald-600">৳{ref.earnings || '0.00'}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
