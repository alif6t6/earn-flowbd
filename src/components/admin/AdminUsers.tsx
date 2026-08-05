import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../lib/api';
import AdminLayout from '../layout/AdminLayout';
import { useToast } from '../ui/Toast';
import { 
  Users, Search, Shield, ShieldOff, ShieldCheck, Crown, DollarSign, Key, Bell, 
  Trash2, Eye, Edit2, CheckCircle2, XCircle, Lock, RefreshCw, X, Gift, Smartphone, History, Link as LinkIcon
} from 'lucide-react';

export default function AdminUsers() {
  const { addToast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'premium' | 'banned'>('all');

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [userModalTab, setUserModalTab] = useState<'profile' | 'balance' | 'password' | 'notify' | 'history' | 'device'>('profile');
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<number | null>(null);

  // Form states
  const [profileForm, setProfileForm] = useState({ username: '', phone: '', status: 'active', isPremium: false });
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceAction, setBalanceAction] = useState<'add' | 'subtract'>('add');
  const [balanceReason, setBalanceReason] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMsg, setNotificationMsg] = useState('');
  const [giftAmount, setGiftAmount] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/api/admin/users');
      setUsers(data || []);
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUserModal = async (u: any) => {
    setSelectedUser(u);
    setProfileForm({
      username: u.username || '',
      phone: u.phoneNumber || u.phone || '',
      status: u.status || 'active',
      isPremium: Boolean(u.isPremium)
    });
    setUserModalTab('profile');
    
    // Load detailed history
    setLoadingDetails(true);
    try {
      const details = await fetchApi(`/api/admin/users/${u.id}/details`);
      setUserDetails(details);
    } catch (err) {
      setUserDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(profileForm),
      });
      addToast('User profile updated successfully', 'success');
      loadUsers();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleToggleBan = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'banned' ? 'active' : 'banned';
    try {
      await fetchApi(`/api/admin/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      addToast(`User set to ${newStatus}`, 'success');
      loadUsers();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleTogglePremium = async (id: number, currentPremium: boolean) => {
    try {
      await fetchApi(`/api/admin/users/${id}/premium`, {
        method: 'PATCH',
        body: JSON.stringify({ isPremium: !currentPremium }),
      });
      addToast(`VIP Premium ${!currentPremium ? 'granted' : 'removed'}`, 'success');
      loadUsers();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!balanceAmount || isNaN(Number(balanceAmount))) return;
    try {
      await fetchApi(`/api/admin/users/${selectedUser.id}/balance`, {
        method: 'POST',
        body: JSON.stringify({ amount: Number(balanceAmount), action: balanceAction, reason: balanceReason }),
      });
      addToast(`User balance updated`, 'success');
      setBalanceAmount('');
      setBalanceReason('');
      setSelectedUser(null);
      loadUsers();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }
    try {
      await fetchApi(`/api/admin/users/${selectedUser.id}/password`, {
        method: 'POST',
        body: JSON.stringify({ password: newPassword }),
      });
      addToast('User password reset successfully', 'success');
      setNewPassword('');
      setSelectedUser(null);
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notificationMsg) return;
    try {
      await fetchApi(`/api/admin/users/${selectedUser.id}/notify`, {
        method: 'POST',
        body: JSON.stringify({ 
          title: notificationTitle || 'Official Admin Message', 
          message: notificationMsg,
          giftAmount: giftAmount || '0'
        }),
      });
      addToast('Notification / Gift sent successfully', 'success');
      setNotificationTitle('');
      setNotificationMsg('');
      setGiftAmount('');
      setSelectedUser(null);
      loadUsers();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleDeleteUser = async () => {
    if (confirmDeleteUserId === null) return;
    const id = confirmDeleteUserId;
    setConfirmDeleteUserId(null);
    try {
      await fetchApi(`/api/admin/users/${id}`, { method: 'DELETE' });
      addToast('User deleted', 'success');
      loadUsers();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const filteredUsers = users.filter(u => {
    const userPhone = u.phoneNumber || u.phone || '';
    const matchesSearch = 
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userPhone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.referralCode?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterRole === 'premium') return matchesSearch && u.isPremium;
    if (filterRole === 'banned') return matchesSearch && u.status === 'banned';
    return matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">User Management Center</h1>
            <p className="text-xs text-slate-500">Edit profiles, change usernames, adjust balance, reset passwords, grant VIP, and inspect login histories</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterRole}
              onChange={(e: any) => setFilterRole(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200/80 rounded-2xl text-xs font-bold focus:outline-none"
            >
              <option value="all">All Users ({users.length})</option>
              <option value="premium">VIP Premium Only</option>
              <option value="banned">Banned Users</option>
            </select>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search username or phone..."
                className="pl-9 pr-4 py-2 bg-white border border-slate-200/80 rounded-2xl text-xs font-medium focus:outline-none focus:border-indigo-600 w-full"
              />
              <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            </div>
          </div>
        </header>

        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border">Loading accounts...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <Users size={40} className="mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">No Users Found</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-3xl overflow-x-auto shadow-xs custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">User Identity</th>
                  <th className="px-6 py-4">Balance</th>
                  <th className="px-6 py-4">Status & Role</th>
                  <th className="px-6 py-4">VIP Premium</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 ${
                          u.isAdmin ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                          u.isPremium ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                          'bg-indigo-50 text-indigo-600 border border-indigo-100'
                        }`}>
                          {u.isAdmin ? <Shield size={16} /> : u.isPremium ? <Crown size={16} /> : u.username?.substring(0, 1).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 flex items-center gap-1.5">
                            @{u.username}
                            {u.isPremium && <Crown size={12} className="text-amber-500 fill-amber-500" />}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {u.phoneNumber || u.phone || '01*********'} • Ref: {u.referralCode || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-indigo-900">৳{u.balance || '0.00'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          u.status === 'banned' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {u.status || 'active'}
                        </span>
                        {u.isAdmin && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-black">ADMIN</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePremium(u.id, u.isPremium)}
                        className={`px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 transition-all ${
                          u.isPremium ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        <Crown size={12} /> {u.isPremium ? 'VIP Active' : 'Standard'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenUserModal(u)}
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 flex items-center gap-1 text-[11px]"
                          title="Manage User Account"
                        >
                          <Eye size={14} /> Manage
                        </button>
                        {u.username?.toLowerCase() === 'alif6t6' ? (
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-800 font-black text-[10px] rounded-xl border border-amber-200 flex items-center gap-1">
                            <Shield size={12} className="text-amber-600" /> Super Admin
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleToggleBan(u.id, u.status)}
                              className={`p-1.5 rounded-lg ${u.status === 'banned' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-amber-600 hover:bg-amber-50'}`}
                              title={u.status === 'banned' ? 'Unban User' : 'Ban User'}
                            >
                              {u.status === 'banned' ? <ShieldCheck size={16} /> : <ShieldOff size={16} />}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteUserId(u.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                              title="Delete Account"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* User Manage Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-2xl w-full border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between pb-3 border-b">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    @{selectedUser.username}
                    {selectedUser.isPremium && <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full">VIP 3X</span>}
                  </h3>
                  <p className="text-[10px] text-slate-400">ID #{selectedUser.id} • Balance: ৳{selectedUser.balance}</p>
                </div>
                <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setUserModalTab('profile')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${userModalTab === 'profile' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500'}`}
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setUserModalTab('balance')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${userModalTab === 'balance' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500'}`}
                >
                  Balance (+/-)
                </button>
                <button
                  onClick={() => setUserModalTab('password')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${userModalTab === 'password' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500'}`}
                >
                  Password
                </button>
                <button
                  onClick={() => setUserModalTab('notify')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${userModalTab === 'notify' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500'}`}
                >
                  Gift & Notify
                </button>
                <button
                  onClick={() => setUserModalTab('history')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${userModalTab === 'history' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500'}`}
                >
                  Withdraw & Referrals
                </button>
                <button
                  onClick={() => setUserModalTab('device')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${userModalTab === 'device' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500'}`}
                >
                  Device & Logins
                </button>
              </div>

              {/* TAB 1: Edit Profile */}
              {userModalTab === 'profile' && (
                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-semibold pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 uppercase mb-1">Username</label>
                      <input
                        type="text"
                        required
                        value={profileForm.username}
                        onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 uppercase mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 uppercase mb-1">Account Status</label>
                      <select
                        value={profileForm.status}
                        onChange={(e) => setProfileForm({ ...profileForm, status: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                      >
                        <option value="active font-bold text-emerald-600">Active (Normal)</option>
                        <option value="banned">Banned / Suspended</option>
                        <option value="disabled">Deactivated</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 uppercase mb-1">VIP Premium Tier</label>
                      <select
                        value={profileForm.isPremium ? 'true' : 'false'}
                        onChange={(e) => setProfileForm({ ...profileForm, isPremium: e.target.value === 'true' })}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                      >
                        <option value="false">Standard Member</option>
                        <option value="true">VIP Premium 3X Member</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-black text-xs rounded-xl shadow-md">
                    Save Profile Changes
                  </button>
                </form>
              )}

              {/* TAB 2: Balance */}
              {userModalTab === 'balance' && (
                <form onSubmit={handleAdjustBalance} className="space-y-3 text-xs pt-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setBalanceAction('add')}
                      className={`flex-1 py-2 rounded-xl font-bold ${balanceAction === 'add' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                    >
                      + Add Balance
                    </button>
                    <button
                      type="button"
                      onClick={() => setBalanceAction('subtract')}
                      className={`flex-1 py-2 rounded-xl font-bold ${balanceAction === 'subtract' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                    >
                      - Subtract
                    </button>
                  </div>

                  <div>
                    <label className="block text-slate-700 uppercase mb-1 font-bold">Amount (৳)</label>
                    <input
                      type="number"
                      required
                      value={balanceAmount}
                      onChange={(e) => setBalanceAmount(e.target.value)}
                      placeholder="100"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 uppercase mb-1 font-bold">Reason / Note</label>
                    <input
                      type="text"
                      value={balanceReason}
                      onChange={(e) => setBalanceReason(e.target.value)}
                      placeholder="Bonus reward or manual correction"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>

                  <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-black rounded-xl">
                    Update User Balance
                  </button>
                </form>
              )}

              {/* TAB 3: Password */}
              {userModalTab === 'password' && (
                <form onSubmit={handleResetPassword} className="space-y-3 text-xs pt-2">
                  <div>
                    <label className="block text-slate-700 uppercase mb-1 font-bold">New Password</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl font-bold"
                    />
                  </div>

                  <button type="submit" className="w-full py-3 bg-slate-900 text-white font-black rounded-xl">
                    Reset Password Permanently
                  </button>
                </form>
              )}

              {/* TAB 4: Gift & Notify */}
              {userModalTab === 'notify' && (
                <form onSubmit={handleSendNotification} className="space-y-3 text-xs pt-2">
                  <div>
                    <label className="block text-slate-700 uppercase mb-1 font-bold">Notification Title</label>
                    <input
                      type="text"
                      value={notificationTitle}
                      onChange={(e) => setNotificationTitle(e.target.value)}
                      placeholder="Special Cash Bonus Gift!"
                      className="w-full px-3.5 py-2 bg-slate-50 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 uppercase mb-1 font-bold">Message Content</label>
                    <textarea
                      rows={3}
                      required
                      value={notificationMsg}
                      onChange={(e) => setNotificationMsg(e.target.value)}
                      placeholder="Congratulations! You received a gift reward directly added to your balance."
                      className="w-full p-3 bg-slate-50 border rounded-xl font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 uppercase mb-1 font-bold">Attach Gift Amount (৳) - Optional</label>
                    <input
                      type="number"
                      value={giftAmount}
                      onChange={(e) => setGiftAmount(e.target.value)}
                      placeholder="50 (leaves ৳0 if notification only)"
                      className="w-full px-3.5 py-2 bg-slate-50 border rounded-xl font-bold text-emerald-700"
                    />
                  </div>

                  <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-black rounded-xl flex items-center justify-center gap-2">
                    <Gift size={16} /> Send Gift & Broadcast Notification
                  </button>
                </form>
              )}

              {/* TAB 5: History (Withdrawals & Referrals) */}
              {userModalTab === 'history' && (
                <div className="space-y-4 text-xs pt-2">
                  {loadingDetails ? (
                    <p className="text-slate-400 text-center py-4">Loading user histories...</p>
                  ) : (
                    <>
                      <div>
                        <h4 className="font-extrabold text-slate-900 mb-2 flex items-center gap-1.5">
                          <History size={14} className="text-indigo-600" /> Withdrawal History ({userDetails?.withdrawals?.length || 0})
                        </h4>
                        {userDetails?.withdrawals?.length === 0 ? (
                          <p className="text-slate-400 text-[11px] bg-slate-50 p-3 rounded-xl">No cashout requests submitted yet.</p>
                        ) : (
                          <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                            {userDetails?.withdrawals?.map((w: any) => (
                              <div key={w.id} className="p-2.5 bg-slate-50 rounded-xl flex justify-between items-center text-[11px]">
                                <div>
                                  <p className="font-extrabold text-slate-900">{w.method?.toUpperCase()} • {w.accountNumber}</p>
                                  <p className="text-[10px] text-slate-400">{new Date(w.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-black text-indigo-900">৳{w.amount}</p>
                                  <span className="text-[9px] font-black uppercase text-amber-600">{w.status}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="font-extrabold text-slate-900 mb-2 flex items-center gap-1.5">
                          <LinkIcon size={14} className="text-indigo-600" /> Invited Referrals ({userDetails?.referrals?.length || 0})
                        </h4>
                        {userDetails?.referrals?.length === 0 ? (
                          <p className="text-slate-400 text-[11px] bg-slate-50 p-3 rounded-xl">No active referred users yet.</p>
                        ) : (
                          <div className="space-y-1 max-h-36 overflow-y-auto custom-scrollbar">
                            {userDetails?.referrals?.map((refUser: any) => (
                              <div key={refUser.id} className="p-2 bg-slate-50 rounded-xl flex justify-between items-center text-[11px]">
                                <p className="font-bold text-slate-800">@{refUser.username}</p>
                                <p className="text-[10px] text-slate-400">{refUser.phone || 'No phone'}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB 6: Device Info & Login Logs */}
              {userModalTab === 'device' && (
                <div className="space-y-3 text-xs pt-2">
                  <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl space-y-2 font-mono text-[11px]">
                    <p className="text-indigo-400 font-bold uppercase flex items-center gap-2">
                      <Smartphone size={16} /> Device Identity Logs
                    </p>
                    <p><strong>Last Known IP:</strong> {userDetails?.deviceInfo?.lastIp || '103.145.22.18'}</p>
                    <p><strong>Device OS / Browser:</strong> {userDetails?.deviceInfo?.userAgent || 'Android Mobile App'}</p>
                    <p><strong>Platform:</strong> {userDetails?.deviceInfo?.deviceType || 'Mobile Browser'}</p>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-slate-900 mb-2">Recent Login Timestamps</h4>
                    <div className="space-y-1">
                      {userDetails?.deviceInfo?.loginHistory?.map((log: any, idx: number) => (
                        <div key={idx} className="p-2 bg-slate-50 border rounded-xl flex justify-between text-[11px]">
                          <span>{new Date(log.date).toLocaleString()}</span>
                          <span className="font-mono text-slate-500">{log.ip} ({log.device})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {confirmDeleteUserId !== null && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
              <div className="flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-2">
                  <Trash2 size={24} />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Delete User Account</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Are you sure you want to permanently delete this user account? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setConfirmDeleteUserId(null)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold text-xs rounded-2xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="flex-1 py-3 bg-rose-600 text-white font-bold text-xs rounded-2xl shadow-lg shadow-rose-200 hover:bg-rose-700 transition-colors"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
