import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../lib/api';
import { clearAdCache } from '../../lib/adCache';
import AdminLayout from '../layout/AdminLayout';
import { useToast } from '../ui/Toast';
import AdRenderer from '../common/AdRenderer';
import { 
  Megaphone, Plus, Trash2, Edit2, Save, X, Eye, 
  CheckCircle2, XCircle, Code2, Link as LinkIcon, Sparkles, Layers, ArrowUp
} from 'lucide-react';

const AD_TYPES = [
  'Task Advertisement',
  'Welcome Ads',
  'Withdraw Earnings',
  'Promo Ads',
  'Recent Req Ads',
  'Popup Ad'
];

const POSITIONS = [
  { value: 'task_modal', label: 'Pre-Task Sponsor Modal (Mandatory 10s)' },
  { value: 'header_banner', label: 'Header Top Banner' },
  { value: 'sidebar', label: 'Sidebar Widget' },
  { value: 'footer_banner', label: 'Footer Banner' },
  { value: 'popup', label: 'Global Modal Popup' },
  { value: 'video_sponsor', label: 'Video Task Sponsor' },
];

export default function AdminAds() {
  const { addToast } = useToast();
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewAd, setPreviewAd] = useState<any>(null);
  const [editingAd, setEditingAd] = useState<any>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Quick Paste dedicated inputs state
  const [quickPasteType, setQuickPasteType] = useState('Task Advertisement');
  const [quickPasteCode, setQuickPasteCode] = useState('');
  const [quickPastePosition, setQuickPastePosition] = useState('task_modal');
  const [savingQuick, setSavingQuick] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'Task Advertisement',
    content: '',
    imageUrl: '',
    title: '',
    description: '',
    destinationUrl: '',
    buttonText: 'Claim Bonus Now',
    sponsoredText: 'Sponsored',
    location: 'task_modal',
    priority: 1,
    adRatio: 'horizontal',
    status: 'active',
  });

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/api/admin/ads');
      setAds(data || []);
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (ad: any = null) => {
    if (ad) {
      setEditingAd(ad);
      setFormData({
        name: ad.name || '',
        type: ad.type || 'Task Advertisement',
        content: ad.content || '',
        imageUrl: ad.imageUrl || '',
        title: ad.title || '',
        description: ad.description || '',
        destinationUrl: ad.destinationUrl || '',
        buttonText: ad.buttonText || 'Claim Bonus Now',
        sponsoredText: ad.sponsoredText || 'Sponsored',
        location: ad.location || 'task_modal',
        priority: ad.priority || 1,
        adRatio: ad.adRatio || 'horizontal',
        status: ad.status || 'active',
      });
    } else {
      setEditingAd(null);
      setFormData({
        name: '',
        type: 'Task Advertisement',
        content: '',
        imageUrl: '',
        title: '',
        description: '',
        destinationUrl: '',
        buttonText: 'Claim Bonus Now',
        sponsoredText: 'Sponsored',
        location: 'task_modal',
        priority: 1,
        adRatio: 'horizontal',
        status: 'active',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAd) {
        await fetchApi(`/api/admin/ads/${editingAd.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        addToast('Advertisement updated successfully', 'success');
      } else {
        await fetchApi('/api/admin/ads', {
          method: 'POST',
          body: JSON.stringify({
            ...formData,
            name: formData.name || `${formData.type} Unit`
          }),
        });
        addToast('Advertisement created successfully', 'success');
      }
      clearAdCache();
      setIsModalOpen(false);
      loadAds();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleQuickPasteSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPasteCode.trim()) {
      addToast('Please paste the advertisement snippet or direct link', 'error');
      return;
    }

    setSavingQuick(true);
    try {
      await fetchApi('/api/admin/ads', {
        method: 'POST',
        body: JSON.stringify({
          name: `Adsterra ${quickPasteType}`,
          type: quickPasteType,
          content: quickPasteCode,
          location: quickPastePosition,
          priority: 1,
          adRatio: 'horizontal',
          status: 'active',
        }),
      });
      addToast(`New ${quickPasteType} ad saved & enabled!`, 'success');
      setQuickPasteCode('');
      clearAdCache();
      loadAds();
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setSavingQuick(false);
    }
  };

  const handleToggleStatus = async (ad: any) => {
    const newStatus = ad.status === 'active' ? 'disabled' : 'active';
    try {
      await fetchApi(`/api/admin/ads/${ad.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...ad, status: newStatus }),
      });
      addToast(`Ad set to ${newStatus}`, 'success');
      clearAdCache();
      loadAds();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (confirmDeleteId === null) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    try {
      await fetchApi(`/api/admin/ads/${id}`, { method: 'DELETE' });
      addToast('Advertisement removed', 'success');
      clearAdCache();
      loadAds();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Adsterra & Ads Management Hub</h1>
            <p className="text-xs text-slate-500">Configure Task Advertisements, Social Bar, Popunder, Banners, Native, Interstitial, Smartlinks & Custom Code</p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2.5 bg-indigo-600 text-white text-xs font-extrabold rounded-2xl shadow-md hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Create Custom Ad Unit
          </button>
        </header>

        {/* ---------------------------------------------------- */}
        {/* QUICK PASTE ADSTERRA SECTION                         */}
        {/* Dedicated input boxes for all Adsterra types         */}
        {/* ---------------------------------------------------- */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-sm">Quick Adsterra & Network Code Inserter</h2>
              <p className="text-[11px] text-slate-400">Select network ad type, paste code or link without editing source code, and activate instantly.</p>
            </div>
          </div>

          <form onSubmit={handleQuickPasteSave} className="space-y-4 text-xs font-semibold">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 uppercase mb-1">Select Advertisement Format / Type</label>
                <select
                  value={quickPasteType}
                  onChange={(e) => setQuickPasteType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl font-bold text-slate-800"
                >
                  {AD_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 uppercase mb-1">Target Position</label>
                <select
                  value={quickPastePosition}
                  onChange={(e) => setQuickPastePosition(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl font-bold text-slate-800"
                >
                  {POSITIONS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 uppercase mb-1 flex items-center justify-between">
                <span>Paste Code or Direct Link ({quickPasteType})</span>
                <span className="text-[10px] text-emerald-600 font-extrabold">Instant Activation</span>
              </label>
              <textarea
                rows={4}
                required
                value={quickPasteCode}
                onChange={(e) => setQuickPasteCode(e.target.value)}
                placeholder={
                  quickPasteType.includes('Direct Link') || quickPasteType.includes('Smartlink')
                    ? 'https://www.highrevenuegate.com/directlink123456'
                    : 'Paste JavaScript code snippet or HTML ad code tag from Adsterra panel...'
                }
                className="w-full p-3 bg-slate-900 text-emerald-400 font-mono text-xs border rounded-xl focus:outline-none custom-scrollbar"
              />
            </div>

            <button
              type="submit"
              disabled={savingQuick}
              className="w-full py-3 bg-emerald-600 text-white font-extrabold text-xs rounded-2xl shadow-md hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
            >
              <Save size={16} /> {savingQuick ? 'Saving Ad Network Code...' : `Save & Activate ${quickPasteType}`}
            </button>
          </form>
        </div>

        {/* ---------------------------------------------------- */}
        {/* ACTIVE ADVERTISEMENTS GRID                           */}
        {/* ---------------------------------------------------- */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border">Loading advertisement configurations...</div>
        ) : ads.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
            <Megaphone size={40} className="mx-auto text-slate-300" />
            <p className="font-extrabold text-slate-700 text-sm">No Active Advertisements</p>
            <p className="text-xs text-slate-400">Use the Quick Adsterra Inserter above to add your first direct link or banner code.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ads.map((ad) => (
              <div key={ad.id} className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
                        <Code2 size={20} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-slate-900 text-sm truncate">{ad.name}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase truncate">{ad.type} • Priority #{ad.priority || 1}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(ad)}
                      className={`px-3 py-1 text-[10px] font-black rounded-full uppercase shrink-0 transition-all ${
                        ad.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {ad.status === 'active' ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>

                  {/* Code snippet text with break-all to prevent horizontal layout overflow */}
                  <div className="p-3 bg-slate-900 text-emerald-400 rounded-2xl font-mono text-[10px] max-h-24 overflow-y-auto break-all custom-scrollbar">
                    {ad.content}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                  <span className="text-[10px] text-slate-500 uppercase font-black truncate max-w-[160px]">
                    Position: {ad.location || 'task_modal'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPreviewAd(ad)}
                      className="px-2.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-[11px] font-extrabold flex items-center gap-1"
                      title="Preview Advertisement"
                    >
                      <Eye size={14} /> Preview
                    </button>
                    <button
                      onClick={() => handleOpenModal(ad)}
                      className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-xl"
                      title="Edit Ad"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(ad.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl"
                      title="Delete Ad"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* ADD / EDIT MODAL                                     */}
        {/* ---------------------------------------------------- */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-xl w-full border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between pb-3 border-b">
                <h3 className="font-extrabold text-slate-900 text-base">
                  {editingAd ? 'Edit Advertisement Unit' : 'Create Advertisement Unit'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-700 uppercase mb-1">Ad Unit Title / Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Adsterra Social Bar Header"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 uppercase mb-1">Format Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl"
                    >
                      {AD_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 uppercase mb-1">Display Position</label>
                    <select
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl"
                    >
                      {POSITIONS.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 uppercase mb-1">Ad Priority Order</label>
                    <input
                      type="number"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 uppercase mb-1">Ad Ratio / Shape</label>
                    <select
                      value={formData.adRatio}
                      onChange={(e) => setFormData({ ...formData, adRatio: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl"
                    >
                      <option value="horizontal">Rectangular / Horizontal Banner (Default)</option>
                      <option value="square">Square</option>
                      <option value="vertical">Vertical / Tower</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 uppercase mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl"
                    >
                      <option value="active">Active (Enabled)</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t">
                  <h4 className="text-[11px] font-black uppercase text-indigo-600 tracking-wider">Ad Content & Creative Setup</h4>
                  
                  <div>
                    <label className="block text-slate-700 uppercase mb-1">Paste HTML Script Code / Adsterra / Direct Link</label>
                    <textarea
                      rows={4}
                      value={formData.content || ''}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Paste script tag, Adsterra code snippet, or direct link..."
                      className="w-full p-3 bg-slate-900 text-emerald-400 font-mono text-xs border rounded-xl focus:outline-none custom-scrollbar"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 uppercase mb-1">Or Banner Image URL</label>
                    <input
                      type="url"
                      value={formData.imageUrl || ''}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 uppercase mb-1">Title (Optional)</label>
                      <input
                        type="text"
                        value={formData.title || ''}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Special Offer"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 uppercase mb-1">Destination URL (Optional)</label>
                      <input
                        type="url"
                        value={formData.destinationUrl || ''}
                        onChange={(e) => setFormData({ ...formData, destinationUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 uppercase mb-1">Description (Optional)</label>
                      <input
                        type="text"
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Short ad caption"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 uppercase mb-1">Badge / Button Text</label>
                      <input
                        type="text"
                        value={formData.buttonText || ''}
                        onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                        placeholder="Claim Bonus Now"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 text-white font-extrabold text-sm rounded-2xl shadow-md hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={16} /> Save Advertisement Unit
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* LIVE AD PREVIEW MODAL                                */}
        {/* ---------------------------------------------------- */}
        {previewAd && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b">
                <div className="flex items-center gap-2">
                  <Eye size={18} className="text-indigo-600" />
                  <h3 className="font-extrabold text-slate-900 text-base">Ad Preview: {previewAd.name}</h3>
                </div>
                <button onClick={() => setPreviewAd(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 bg-slate-50 border rounded-2xl min-h-[140px] flex items-center justify-center overflow-hidden">
                <AdRenderer
                  content={previewAd.content}
                  type={previewAd.type}
                  imageUrl={previewAd.imageUrl}
                  destinationUrl={previewAd.destinationUrl}
                  title={previewAd.title}
                  description={previewAd.description}
                  buttonText={previewAd.buttonText}
                  adRatio={previewAd.adRatio}
                />
              </div>

              <div className="text-[11px] text-slate-400 font-medium">
                Type: <span className="font-bold text-slate-800">{previewAd.type}</span> • Position: <span className="font-bold text-slate-800">{previewAd.location}</span>
              </div>

              <button
                onClick={() => setPreviewAd(null)}
                className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        )}
        {/* ---------------------------------------------------- */}
        {/* DELETE CONFIRMATION MODAL                            */}
        {/* ---------------------------------------------------- */}
        {confirmDeleteId !== null && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
              <div className="flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-2">
                  <Trash2 size={24} />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Delete Advertisement</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Are you sure you want to permanently delete this advertisement? This action cannot be undone and will remove it from the database immediately.
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
                  onClick={handleDelete}
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
