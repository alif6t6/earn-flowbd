import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../lib/api';
import AdminLayout from '../layout/AdminLayout';
import { useToast } from '../ui/Toast';
import { Video, Plus, Trash2, Edit2, Play, Pause, RefreshCw, Save, X } from 'lucide-react';

export default function AdminVideos() {
  const { addToast } = useToast();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    videoUrl: '',
    reward: '15.00',
    duration: 20,
    status: 'active',
  });

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/api/admin/videos');
      setVideos(data || []);
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (video: any = null) => {
    if (video) {
      setEditingVideo(video);
      setFormData({
        title: video.title || '',
        videoUrl: video.videoUrl || '',
        reward: video.reward || '15.00',
        duration: video.duration,
        status: video.status,
      });
    } else {
      setEditingVideo(null);
      setFormData({
        title: '',
        videoUrl: '',
        reward: '15.00',
        duration: 20,
        status: 'active',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVideo) {
        await fetchApi(`/api/admin/videos/${editingVideo.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        addToast('Video updated successfully', 'success');
      } else {
        await fetchApi('/api/admin/videos', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        addToast('Video added successfully', 'success');
      }
      setIsModalOpen(false);
      loadVideos();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (confirmDeleteId === null) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    try {
      await fetchApi(`/api/admin/videos/${id}`, { method: 'DELETE' });
      addToast('Video deleted successfully', 'success');
      loadVideos();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    try {
      await fetchApi(`/api/admin/videos/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      addToast(`Video ${newStatus === 'active' ? 'enabled' : 'disabled'}`, 'success');
      loadVideos();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Video Tasks Management</h1>
            <p className="text-xs text-slate-500">Manage video ad links, duration timers, and watch rewards</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2.5 bg-indigo-600 text-white text-xs font-extrabold rounded-2xl shadow-md hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Add New Video
          </button>
        </header>

        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border">Loading videos...</div>
        ) : videos.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <Video size={40} className="mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">No Video Tasks Found</p>
            <p className="text-xs text-slate-400 mt-1">Click "Add New Video" to create your first video ad task.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-3xl overflow-x-auto shadow-xs custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Title & URL</th>
                  <th className="px-6 py-4">Reward</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                {videos.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{v.title}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-xs">{v.videoUrl}</p>
                    </td>
                    <td className="px-6 py-4 text-emerald-600 font-bold">৳{v.reward}</td>
                    <td className="px-6 py-4 text-slate-600">{v.duration}s</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(v.id, v.status)}
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${
                          v.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {v.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(v)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                          title="Edit Video"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(v.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Delete Video"
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

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b">
                <h3 className="font-extrabold text-slate-900 text-base">
                  {editingVideo ? 'Edit Video Task' : 'Add New Video Task'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-700 uppercase mb-1">Video Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Watch Product Sponsor Video"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 uppercase mb-1">Video / YouTube URL</label>
                  <input
                    type="text"
                    required
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 uppercase mb-1">Reward (৳)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={formData.reward}
                      onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 uppercase mb-1">Duration (Seconds)</label>
                    <input
                      type="number"
                      required
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 uppercase mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:border-indigo-600"
                  >
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 text-white font-extrabold text-sm rounded-2xl shadow-md hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={16} /> Save Video Task
                </button>
              </form>
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
                <h3 className="font-extrabold text-slate-900 text-lg">Delete Video</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Are you sure you want to permanently delete this video? This action cannot be undone.
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
