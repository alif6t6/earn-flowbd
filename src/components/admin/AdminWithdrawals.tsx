import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../lib/api';
import AdminLayout from '../layout/AdminLayout';
import { useToast } from '../ui/Toast';
import { CreditCard, Search, Filter, CheckCircle2, XCircle, Trash2, Download, Clock, Send, Eye } from 'lucide-react';

export default function AdminWithdrawals() {
  const { addToast } = useToast();
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [note, setNote] = useState('');
  const [actionType, setActionType] = useState<'approved' | 'rejected' | null>(null);

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const loadWithdrawals = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/api/admin/withdrawals');
      setWithdrawals(data || []);
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: 'approved' | 'rejected') => {
    if (!selectedWithdrawal) return;
    try {
      await fetchApi(`/api/admin/withdrawals/${selectedWithdrawal.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, note }),
      });
      addToast(`Withdrawal request ${status} successfully!`, 'success');
      setSelectedWithdrawal(null);
      setNote('');
      setActionType(null);
      loadWithdrawals();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this withdrawal entry?')) return;
    try {
      await fetchApi(`/api/admin/withdrawals/${id}`, { method: 'DELETE' });
      addToast('Withdrawal record deleted', 'success');
      loadWithdrawals();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleExportCSV = () => {
    if (withdrawals.length === 0) return;
    const headers = ['ID,User,Method,Account,Amount,Status,Date,Note\n'];
    const rows = withdrawals.map(w => 
      `${w.id},${w.username},${w.method},${w.accountNumber},${w.amount},${w.status},${new Date(w.createdAt).toISOString()},"${w.note || ''}"`
    );
    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `withdrawals-export-${Date.now()}.csv`;
    a.click();
    addToast('Withdrawals exported to CSV', 'success');
  };

  const filteredList = withdrawals.filter(w => {
    const matchesTab = filterTab === 'all' ? true : w.status === filterTab;
    const matchesSearch = w.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          w.accountNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          w.method?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Withdrawal Requests</h1>
            <p className="text-xs text-slate-500">Review bKash, Nagad, and Binance USDT payout submissions</p>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-slate-900 text-white text-xs font-black rounded-2xl shadow-md hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <Download size={16} /> Export CSV
          </button>
        </header>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl w-full sm:w-auto">
            {(['pending', 'approved', 'rejected', 'all'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-4 py-2 text-xs font-black rounded-xl capitalize transition-all ${
                  filterTab === tab ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user or account..."
              className="pl-9 pr-4 py-2 bg-slate-50 border rounded-2xl text-xs font-medium focus:outline-none focus:border-indigo-600 w-full"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          </div>
        </div>

        {/* List Table */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border">Loading requests...</div>
        ) : filteredList.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <CreditCard size={40} className="mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">No Withdrawal Requests Found</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-3xl overflow-x-auto shadow-xs custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Method & Account</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                {filteredList.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">@{w.username}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{w.method}</p>
                      <p className="text-[10px] text-indigo-600 font-mono">{w.accountNumber}</p>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900">৳{w.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        w.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                        w.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[10px] text-slate-400">
                      {new Date(w.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {w.status === 'pending' && (
                          <>
                            <button
                              onClick={() => { setSelectedWithdrawal(w); setActionType('approved'); }}
                              className="px-3 py-1.5 bg-emerald-600 text-white font-extrabold text-[10px] rounded-xl hover:bg-emerald-700 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => { setSelectedWithdrawal(w); setActionType('rejected'); }}
                              className="px-3 py-1.5 bg-rose-600 text-white font-extrabold text-[10px] rounded-xl hover:bg-rose-700 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(w.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Action Modal (Approve / Reject with Note) */}
        {selectedWithdrawal && actionType && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b">
                <h3 className="font-extrabold text-slate-900 text-sm capitalize">
                  {actionType} Payout Request
                </h3>
                <button onClick={() => setSelectedWithdrawal(null)} className="text-slate-400 hover:text-slate-600">
                  <XCircle size={20} />
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1">
                <p><strong>User:</strong> @{selectedWithdrawal.username}</p>
                <p><strong>Amount:</strong> ৳{selectedWithdrawal.amount}</p>
                <p><strong>Method & Account:</strong> {selectedWithdrawal.method} ({selectedWithdrawal.accountNumber})</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Admin Note (Optional)</label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={actionType === 'approved' ? 'Sent via bKash TrxID #893241' : 'Invalid bKash number provided'}
                  className="w-full p-3 bg-slate-50 border rounded-2xl text-xs font-medium focus:outline-none focus:border-indigo-600"
                />
              </div>

              <button
                onClick={() => handleUpdateStatus(actionType)}
                className={`w-full py-3 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all ${
                  actionType === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Confirm {actionType.toUpperCase()}
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
