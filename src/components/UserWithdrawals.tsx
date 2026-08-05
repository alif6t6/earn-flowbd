import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../lib/api';
import { getActiveAds } from '../lib/adCache';
import UserLayout from './layout/UserLayout';
import { CreditCard, Wallet, Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { useToast } from './ui/Toast';
import AdRenderer from './common/AdRenderer';

export default function UserWithdrawals() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [adsList, setAdsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bKash');
  const [accountNumber, setAccountNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [profData, withData, adsRes] = await Promise.all([
        fetchApi('/api/user/profile'),
        fetchApi('/api/user/withdrawals'),
        getActiveAds()
      ]);
      if (profData.isAdmin) {
        navigate('/admin');
        return;
      }
      setProfile(profData);
      setWithdrawals(withData || []);
      setAdsList(Array.isArray(adsRes) ? adsRes : []);
    } catch (err: any) {
      localStorage.removeItem('token');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount < 500) {
      addToast('Minimum withdrawal amount is ৳500', 'error');
      return;
    }

    const cleanAcc = accountNumber.trim();
    if (!cleanAcc) {
      addToast('Please enter your payment account or wallet number', 'error');
      return;
    }

    if (method === 'bKash' || method === 'Nagad') {
      if (cleanAcc.length !== 11 || !/^\d+$/.test(cleanAcc)) {
        addToast(`${method} number must be exactly 11 digits`, 'error');
        return;
      }
      const validPrefixes = ['013', '014', '015', '016', '017', '018', '019'];
      const prefix = cleanAcc.substring(0, 3);
      if (!validPrefixes.includes(prefix)) {
        addToast(`${method} number must start with 013, 014, 015, 016, 017, 018, or 019`, 'error');
        return;
      }
    }

    setSubmitting(true);
    try {
      await fetchApi('/api/user/withdrawals', {
        method: 'POST',
        body: JSON.stringify({
          amount: numAmount,
          method,
          accountNumber: cleanAcc
        }),
      });
      addToast('Withdrawal request submitted successfully', 'success');
      setAmount('');
      setAccountNumber('');
      loadData();
    } catch (err: any) {
      addToast(err.message || 'Failed to submit withdrawal request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">Loading...</div>;

  const withdrawAd = adsList.find(a => a.type === 'Withdraw Earnings') || null;
  const recentReqAd = adsList.find(a => a.type === 'Recent Req Ads' && a.id !== withdrawAd?.id) || adsList.find(a => a.id !== withdrawAd?.id) || null;

  return (
    <UserLayout profile={profile}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Withdraw Earnings</h1>
          {withdrawAd && (
            <div className="w-full mt-2 flex items-center justify-center">
              <AdRenderer
                content={withdrawAd.content}
                type={withdrawAd.type}
                imageUrl={withdrawAd.imageUrl}
                destinationUrl={withdrawAd.destinationUrl}
                title={withdrawAd.title}
                description={withdrawAd.description}
                buttonText={withdrawAd.buttonText}
                adRatio={withdrawAd.adRatio}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-200/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">Available Balance</p>
              <p className="text-xl font-black text-indigo-900">৳{profile?.balance || '0.00'}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-200/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">Pending Withdraw</p>
              <p className="text-xl font-black text-amber-700">৳{profile?.pendingWithdraw || '0.00'}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-200/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">Total Paid Out</p>
              <p className="text-xl font-black text-emerald-700">৳{profile?.totalWithdraw || '0.00'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Withdraw Form */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80">
              <h2 className="text-base font-extrabold text-slate-900 mb-5 flex items-center gap-2">
                <CreditCard size={20} className="text-indigo-600" /> Payout Request
              </h2>

              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'bKash', label: 'bKash' },
                      { id: 'Nagad', label: 'Nagad' },
                      { id: 'Binance USDT', label: 'Binance USDT' }
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMethod(m.id)}
                        className={`py-3 px-2 rounded-2xl border-2 text-xs font-black transition-all ${
                          method === m.id
                            ? 'border-indigo-600 text-indigo-700 bg-indigo-50/80 ring-2 ring-indigo-500/20 shadow-xs'
                            : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-slate-50'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Amount (৳)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="500"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-semibold text-sm bg-slate-50 focus:bg-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Minimum payout: ৳500</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                    {method === 'Binance USDT' ? 'Binance Pay ID / USDT TRC20 Address' : `${method} Phone Number`}
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder={method === 'Binance USDT' ? 'Enter Binance Pay ID or USDT TRC20 Address' : '01*********'}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-semibold text-sm bg-slate-50 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl font-black text-sm hover:opacity-95 transition-all disabled:opacity-70 flex justify-center items-center gap-2 shadow-lg shadow-indigo-600/25 active:scale-95"
                >
                  {submitting ? 'Submitting Request...' : 'Submit Withdrawal Request'}
                </button>
              </form>
            </div>
          </div>

          {/* Rules & History */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-100/80 rounded-3xl p-5 border border-slate-200/60">
              <h3 className="font-bold text-slate-900 text-xs mb-3 flex items-center gap-1.5">
                <AlertCircle size={16} className="text-amber-500" /> Payout Rules
              </h3>
              <ul className="space-y-2 text-xs text-slate-600 font-medium leading-relaxed">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                  Payouts are verified and sent within 1 to 24 hours.
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                  Ensure account details are correct before submitting.
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80">
              {recentReqAd && (
                <div className="w-full mb-4 flex items-center justify-center">
                  <AdRenderer
                    content={recentReqAd.content}
                    type={recentReqAd.type}
                    imageUrl={recentReqAd.imageUrl}
                    destinationUrl={recentReqAd.destinationUrl}
                    title={recentReqAd.title}
                    description={recentReqAd.description}
                    buttonText={recentReqAd.buttonText}
                    adRatio={recentReqAd.adRatio}
                    className="w-full"
                  />
                </div>
              )}
              <h3 className="font-extrabold text-slate-900 text-xs mb-3">Recent Withdrawal Requests</h3>
              {withdrawals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                  <Clock size={20} className="text-slate-300 mb-1" />
                  <p className="text-xs text-slate-400 font-medium">No payout requests yet.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {withdrawals.slice(0, 5).map((w) => (
                    <div key={w.id} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{w.method}</p>
                        <p className="text-[10px] text-slate-400">{w.accountNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-900">৳{w.amount}</p>
                        <span className={`text-[9px] font-black uppercase ${
                          w.status === 'approved' ? 'text-emerald-600' :
                          w.status === 'rejected' ? 'text-rose-600' : 'text-amber-600'
                        }`}>
                          {w.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
