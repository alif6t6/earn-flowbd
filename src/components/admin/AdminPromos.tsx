import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../lib/api';
import AdminLayout from '../layout/AdminLayout';
import { useToast } from '../ui/Toast';
import { Ticket, Plus, Trash2, Edit2, Play, Pause, Save, X, Megaphone } from 'lucide-react';

export default function AdminPromos() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'promos' | 'campaign'>('promos');
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    rewardAmount: '',
    maxUses: '0',
    status: 'active',
    startDate: '',
    expiresAt: '',
    promotionTag: '',
    countryRestriction: 'both',
    newUsersOnly: false
  });

  const [campaignData, setCampaignData] = useState({
    enabled: false,
    name: '',
    bonusAmount: '0',
    maxUsers: '0',
    startDate: '',
    endDate: ''
  });
  const [savingCampaign, setSavingCampaign] = useState(false);

  const loadData = async () => {
    try {
      if (activeTab === 'promos') {
        const data = await fetchApi('/api/admin/promo-codes');
        setPromos(Array.isArray(data) ? data : []);
      } else {
        const data = await fetchApi('/api/admin/campaign');
        setCampaignData(data);
      }
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [activeTab]);

  const handleSubmitPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPromo) {
        await fetchApi(`/api/admin/promo-codes/${editingPromo.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        addToast('Promo code updated successfully', 'success');
      } else {
        await fetchApi('/api/admin/promo-codes', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        addToast('Promo code created successfully', 'success');
      }
      setShowAddModal(false);
      setEditingPromo(null);
      loadData();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleDeletePromo = async () => {
    if (confirmDeleteId === null) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    try {
      await fetchApi(`/api/admin/promo-codes/${id}`, { method: 'DELETE' });
      addToast('Promo code deleted', 'success');
      loadData();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const togglePromoStatus = async (promo: any) => {
    try {
      const newStatus = promo.status === 'active' ? 'disabled' : 'active';
      await fetchApi(`/api/admin/promo-codes/${promo.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...promo, status: newStatus })
      });
      loadData();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCampaign(true);
    try {
      await fetchApi('/api/admin/campaign', {
        method: 'PUT',
        body: JSON.stringify(campaignData)
      });
      addToast('Campaign settings updated', 'success');
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setSavingCampaign(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Promo Codes & Campaigns</h1>
            <p className="text-xs text-slate-500">Manage free promotional codes and usage limits</p>
          </div>
          {activeTab === 'promos' && (
            <button 
              onClick={() => {
                setEditingPromo(null);
                setFormData({ code: '', description: '', rewardAmount: '', maxUses: '0', status: 'active', startDate: '', expiresAt: '', promotionTag: '', countryRestriction: 'both', newUsersOnly: false });
                setShowAddModal(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
            >
              <Plus size={16} /> Create Promo Code
            </button>
          )}
        </div>

        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('promos')}
            className={`flex items-center gap-2 px-6 py-3 font-bold text-sm transition-colors relative ${activeTab === 'promos' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Ticket size={16} /> Promo Codes
            {activeTab === 'promos' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>}
          </button>
          <button
            onClick={() => setActiveTab('campaign')}
            className={`flex items-center gap-2 px-6 py-3 font-bold text-sm transition-colors relative ${activeTab === 'campaign' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Megaphone size={16} /> Promotion Campaign
            {activeTab === 'campaign' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>}
          </button>
        </div>

        {activeTab === 'promos' ? (
          <>
            {loading ? (
              <div className="p-8 text-center text-slate-400">Loading promo codes...</div>
            ) : promos.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
                <Ticket size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-700 mb-1">No Promo Codes</h3>
                <p className="text-sm text-slate-500">Create your first promo code to reward users.</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                        <th className="p-4">Promo Code</th>
                        <th className="p-4">Reward</th>
                        <th className="p-4">Uses</th>
                        <th className="p-4">Valid From</th>
                        <th className="p-4">Expires</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {promos.map(promo => (
                        <tr key={promo.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-slate-900">{promo.code}</div>
                            {promo.description && <div className="text-xs text-slate-500">{promo.description}</div>}
                          </td>
                          <td className="p-4 font-bold text-emerald-600">৳{promo.rewardAmount}</td>
                          <td className="p-4 text-sm text-slate-600">
                            {promo.promotionTag && <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-bold mr-2 mb-1">{promo.promotionTag}</span>}
                            {promo.newUsersOnly && <span className="inline-block px-2 py-1 bg-rose-50 text-rose-700 rounded text-xs font-bold mr-2 mb-1">New Users</span>}
                            {promo.countryRestriction !== 'both' && <span className="inline-block px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs font-bold capitalize mb-1">{promo.countryRestriction}</span>}
                          </td>
                          <td className="p-4 text-sm text-slate-600">
                            {promo.currentUses} / {promo.maxUses > 0 ? promo.maxUses : '∞'}
                          </td>
                          <td className="p-4 text-sm text-slate-600">
                            {promo.startDate ? new Date(promo.startDate).toLocaleDateString() : 'Always'}
                          </td>
                          <td className="p-4 text-sm text-slate-600">
                            {promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              promo.status === 'active' && promo.expiresAt && new Date(promo.expiresAt) < new Date() ? 'bg-rose-100 text-rose-700' : promo.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {promo.status === 'active' && promo.expiresAt && new Date(promo.expiresAt) < new Date() ? 'Expired' : promo.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => togglePromoStatus(promo)}
                                className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                                title={promo.status === 'active' ? 'Disable' : 'Enable'}
                              >
                                {promo.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
                              </button>
                              <button 
                                onClick={() => {
                                  setEditingPromo(promo);
                                  setFormData({
                                    code: promo.code,
                                    description: promo.description || '',
                                    rewardAmount: promo.rewardAmount,
                                    maxUses: String(promo.maxUses),
                                    status: promo.status,
                                    startDate: promo.startDate ? new Date(promo.startDate).toISOString().slice(0, 16) : '',
                                    expiresAt: promo.expiresAt ? new Date(promo.expiresAt).toISOString().slice(0, 16) : '',
                                    promotionTag: promo.promotionTag || '',
                                    countryRestriction: promo.countryRestriction || 'both',
                                    newUsersOnly: promo.newUsersOnly || false
                                  });
                                  setShowAddModal(true);
                                }}
                                className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={() => setConfirmDeleteId(promo.id)}
                                className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
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
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Megaphone className="text-indigo-500" /> Special Promotion Campaign</h2>
            <p className="text-sm text-slate-600 mb-6">When enabled, any new user who signs up using a referral code will automatically receive the configured bonus amount.</p>
            
            {loading ? (
              <div className="p-4 text-center text-slate-400">Loading...</div>
            ) : (
              <form onSubmit={handleSaveCampaign} className="space-y-5 max-w-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl gap-4">
                  <div>
                    <h3 className="font-bold text-slate-800">Enable Promotion</h3>
                    <p className="text-xs text-slate-500">Turn this campaign on or off.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={campaignData.enabled}
                      onChange={(e) => setCampaignData({...campaignData, enabled: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Promotion Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Summer Fest Bonus"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      value={campaignData.name}
                      onChange={(e) => setCampaignData({...campaignData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bonus Amount (৳)</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      value={campaignData.bonusAmount}
                      onChange={(e) => setCampaignData({...campaignData, bonusAmount: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Maximum Users (0 = ∞)</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      value={campaignData.maxUsers}
                      onChange={(e) => setCampaignData({...campaignData, maxUsers: e.target.value})}
                    />
                  </div>
                  <div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Start Date (Optional)</label>
                    <input 
                      type="datetime-local" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      value={campaignData.startDate}
                      onChange={(e) => setCampaignData({...campaignData, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">End Date (Optional)</label>
                    <input 
                      type="datetime-local" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      value={campaignData.endDate}
                      onChange={(e) => setCampaignData({...campaignData, endDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button 
                    type="submit"
                    disabled={savingCampaign}
                    className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    <Save size={18} /> {savingCampaign ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                <h3 className="font-bold text-slate-800">{editingPromo ? 'Edit Promo Code' : 'Create Promo Code'}</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <form id="promoForm" onSubmit={handleSubmitPromo} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Promo Code Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="SUMMER50"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 uppercase"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description (Optional)</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bonus Amount (৳)</label>
                      <input 
                        type="number" 
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        value={formData.rewardAmount}
                        onChange={(e) => setFormData({...formData, rewardAmount: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Max Users (0 = ∞)</label>
                      <input 
                        type="number" 
                        required
                        min="0"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        value={formData.maxUses}
                        onChange={(e) => setFormData({...formData, maxUses: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Promotion Tag</label>
                      <input 
                        type="text"
                        placeholder="e.g. SUMMER SALE"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        value={formData.promotionTag}
                        onChange={(e) => setFormData({...formData, promotionTag: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Country Restriction</label>
                      <select
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        value={formData.countryRestriction}
                        onChange={(e) => setFormData({...formData, countryRestriction: e.target.value})}
                      >
                        <option value="both">Both (All)</option>
                        <option value="bangladesh">Bangladesh Only</option>
                        <option value="india">India Only</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                      <input 
                        type="checkbox"
                        checked={formData.newUsersOnly}
                        onChange={(e) => setFormData({...formData, newUsersOnly: e.target.checked})}
                        className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 bg-white border-slate-300"
                      />
                      <span className="text-sm font-bold text-slate-700">New Users Only</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Start Date (Optional)</label>
                      <input 
                        type="datetime-local" 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Expiry Date (Optional)</label>
                      <input 
                        type="datetime-local" 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        value={formData.expiresAt}
                        onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="active">Active</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  </div>
                </form>
              </div>
              
              <div className="p-5 border-t border-slate-100 bg-slate-50/50 shrink-0 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  form="promoForm"
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Save size={18} /> {editingPromo ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {confirmDeleteId !== null && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
              <div className="flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-2">
                  <Trash2 size={24} />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Delete Promo Code</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Are you sure you want to permanently delete this promo code? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold text-xs rounded-2xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeletePromo}
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
