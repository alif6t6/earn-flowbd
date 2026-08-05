import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../lib/api';
import AdminLayout from '../layout/AdminLayout';
import { useToast } from '../ui/Toast';
import { CreditCard, Save, CheckCircle2, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

export default function AdminPaymentSettings() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    bkashNumber: '01712345678',
    nagadNumber: '01812345678',
    binanceWallet: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    paymentInstructions: '1. Send total amount using Send Money option to our official Personal bKash or Nagad number.\n2. For Binance, transfer USDT (TRC20) to the wallet address.\n3. Enter your Sender Mobile Number / Wallet and 10-character Transaction ID (TrxID) in the form below.',
    paymentNotice: 'Please double-check all details before submitting. Processing time is usually 5-15 minutes after verification.',
    paymentStatus: 'active',
  });

  useEffect(() => {
    loadPaymentSettings();
  }, []);

  const loadPaymentSettings = async () => {
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
      addToast(err.message || 'Failed to load settings', 'error');
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
      addToast('Payment Settings saved successfully!', 'success');
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <RefreshCw className="animate-spin text-indigo-600" size={32} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <CreditCard size={26} className="text-indigo-600" /> Payment Gateway Settings
            </h1>
            <p className="text-xs text-slate-500 mt-1">Configure bKash, Nagad, Binance payment accounts and instructions shown to users</p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </header>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Status Switcher */}
          <div className="p-5 bg-white border border-slate-200/80 rounded-3xl shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-black text-slate-900 block">Payment Gateway Status</label>
                <p className="text-xs text-slate-500">Enable or disable user deposit and premium payment submissions</p>
              </div>
              <select
                value={form.paymentStatus}
                onChange={e => handleChange('paymentStatus', e.target.value)}
                className={`px-4 py-2 rounded-xl font-bold text-xs border focus:outline-none ${
                  form.paymentStatus === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-amber-50 text-amber-700 border-amber-300'
                }`}
              >
                <option value="active">🟢 Active & Accepting Payments</option>
                <option value="maintenance">🟡 Maintenance Mode</option>
              </select>
            </div>
          </div>

          {/* Account Numbers Section */}
          <div className="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-xs space-y-5">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 border-b pb-3">
              <ShieldCheck size={20} className="text-emerald-600" /> Admin Wallet Numbers & Addresses
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">bKash Personal Number</label>
                <input
                  type="text"
                  value={form.bkashNumber}
                  onChange={e => handleChange('bkashNumber', e.target.value)}
                  placeholder="01712345678"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-indigo-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Nagad Personal Number</label>
                <input
                  type="text"
                  value={form.nagadNumber}
                  onChange={e => handleChange('nagadNumber', e.target.value)}
                  placeholder="01812345678"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-indigo-600 font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Binance USDT Wallet Address (TRC20)</label>
                <input
                  type="text"
                  value={form.binanceWallet}
                  onChange={e => handleChange('binanceWallet', e.target.value)}
                  placeholder="TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-indigo-600 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Instructions & Notice */}
          <div className="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-xs space-y-5">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 border-b pb-3">
              <AlertCircle size={20} className="text-indigo-600" /> Instructions & Notice for Users
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Payment Instructions</label>
              <textarea
                rows={4}
                value={form.paymentInstructions}
                onChange={e => handleChange('paymentInstructions', e.target.value)}
                placeholder="Write step by step instructions for sending money..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-600 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Important Notice Banner</label>
              <textarea
                rows={2}
                value={form.paymentNotice}
                onChange={e => handleChange('paymentNotice', e.target.value)}
                placeholder="Notice shown at bottom of payment page..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
            >
              {saving ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
              {saving ? 'Saving...' : 'Save Payment Settings'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
