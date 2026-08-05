import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../lib/api';
import AdminLayout from '../layout/AdminLayout';
import { useToast } from '../ui/Toast';
import { Bell, Send, Users, Gift, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminNotifications() {
  const { addToast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [sending, setSending] = useState(false);

  const [form, setForm] = useState({
    targetType: 'all', // 'all' or 'specific'
    userId: '',
    title: '',
    message: '',
    giftAmount: '0',
  });

  useEffect(() => {
    fetchApi('/api/admin/users')
      .then(res => Array.isArray(res) && setUsers(res))
      .catch(() => {});
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.message) {
      addToast('Please provide both title and message', 'error');
      return;
    }

    setSending(true);
    try {
      if (form.targetType === 'all') {
        for (const u of users) {
          await fetchApi(`/api/admin/users/${u.id}/notify`, {
            method: 'POST',
            body: JSON.stringify({
              title: form.title,
              message: form.message,
              giftAmount: form.giftAmount !== '0' ? form.giftAmount : undefined
            })
          });
        }
        addToast(`Broadcast notification sent to all ${users.length} users!`, 'success');
      } else {
        if (!form.userId) {
          addToast('Please select a specific user', 'error');
          setSending(false);
          return;
        }
        await fetchApi(`/api/admin/users/${form.userId}/notify`, {
          method: 'POST',
          body: JSON.stringify({
            title: form.title,
            message: form.message,
            giftAmount: form.giftAmount !== '0' ? form.giftAmount : undefined
          })
        });
        addToast('Notification sent to user successfully!', 'success');
      }

      setForm({ targetType: 'all', userId: '', title: '', message: '', giftAmount: '0' });
    } catch (err: any) {
      addToast(err.message || 'Failed to send notification', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <header className="border-b border-slate-200/80 pb-4">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Bell size={26} className="text-indigo-600" /> Push Notifications & Announcement Broadcast
          </h1>
          <p className="text-xs text-slate-500 mt-1">Send targeted inbox alerts, reward bonuses, or global site announcements to users</p>
        </header>

        <form onSubmit={handleSend} className="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-xs space-y-5">
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase mb-2">Target Audience</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, targetType: 'all' })}
                className={`p-3.5 rounded-2xl border-2 text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  form.targetType === 'all' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Users size={16} /> Broadcast to All Users ({users.length})
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, targetType: 'specific' })}
                className={`p-3.5 rounded-2xl border-2 text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  form.targetType === 'specific' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Bell size={16} /> Select Specific User
              </button>
            </div>
          </div>

          {form.targetType === 'specific' && (
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase mb-1.5">Select User</label>
              <select
                value={form.userId}
                onChange={e => setForm({ ...form, userId: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-indigo-600"
              >
                <option value="">-- Select Target User --</option>
                {users.map((u: any) => (
                  <option key={u.id} value={u.id}>
                    {u.username} (ID: {u.id} - Phone: {u.phoneNumber || 'N/A'})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase mb-1.5">Notification Title</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Special Holiday Bonus Claimed!"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase mb-1.5">Message Content</label>
            <textarea
              rows={4}
              required
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              placeholder="Write clear notification instructions or details..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase mb-1.5 flex items-center gap-1">
              <Gift size={14} className="text-amber-500" /> Optional Bonus Cash Gift (BDT)
            </label>
            <input
              type="number"
              step="1"
              value={form.giftAmount}
              onChange={e => setForm({ ...form, giftAmount: e.target.value })}
              placeholder="0"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-amber-700 focus:outline-none focus:border-amber-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">If set above 0, amount will be credited directly to recipient balance.</p>
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
          >
            <Send size={16} />
            {sending ? 'Sending Broadcast...' : 'Send Notification Now'}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
