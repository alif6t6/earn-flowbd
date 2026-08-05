import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../lib/api';
import AdminLayout from '../layout/AdminLayout';
import { useToast } from '../ui/Toast';
import { CheckSquare, Plus, Edit2, Trash2, Copy, Play, Pause, Save, X, Eye, ExternalLink } from 'lucide-react';

export default function AdminTasks() {
  const { addToast } = useToast();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    taskUrl: '',
    instructions: '',
    reward: '10.00',
    countdownTimer: 10,
    adTimer: 10,
    dailyLimit: 5,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300',
    icon: 'CheckSquare',
    verificationType: 'Instant',
    expiryDate: '',
    type: 'Sponsor Task',
    status: 'active',
    buttonText: '',
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/api/admin/tasks');
      setTasks(data || []);
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (task: any = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title || '',
        taskUrl: task.taskUrl || task.link || '',
        instructions: task.instructions || '',
        reward: task.reward || '10.00',
        countdownTimer: task.countdownTimer || 10,
        adTimer: task.adTimer || 10,
        dailyLimit: task.dailyLimit || 5,
        image: task.image || '',
        icon: task.icon || 'CheckSquare',
        verificationType: task.verificationType || 'Instant',
        expiryDate: task.expiryDate || '',
        type: task.type || 'Sponsor Task',
        status: task.status || 'active',
        buttonText: task.buttonText || '',
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        taskUrl: '',
        instructions: '',
        reward: '10.00',
        countdownTimer: 10,
        adTimer: 10,
        dailyLimit: 5,
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300',
        icon: 'CheckSquare',
        verificationType: 'Instant',
        expiryDate: '',
        type: 'Sponsor Task',
        status: 'active',
        buttonText: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = { ...formData };
      if (!submitData.image || submitData.image.trim() === '') {
        submitData.image = '$';
      }

      if (editingTask) {
        await fetchApi(`/api/admin/tasks/${editingTask.id}`, {
          method: 'PUT',
          body: JSON.stringify(submitData),
        });
        addToast('Task updated successfully', 'success');
      } else {
        await fetchApi('/api/admin/tasks', {
          method: 'POST',
          body: JSON.stringify(submitData),
        });
        addToast('Task created successfully', 'success');
      }
      setIsModalOpen(false);
      loadTasks();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (confirmDeleteId === null) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    try {
      await fetchApi(`/api/admin/tasks/${id}`, { method: 'DELETE' });
      addToast('Task deleted successfully', 'success');
      loadTasks();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      await fetchApi(`/api/admin/tasks/${id}/duplicate`, { method: 'POST' });
      addToast('Task duplicated successfully', 'success');
      loadTasks();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleToggleStatus = async (id: number, newStatus: string) => {
    try {
      await fetchApi(`/api/admin/tasks/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      addToast(`Task status updated to ${newStatus}`, 'success');
      loadTasks();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Task Management System</h1>
            <p className="text-xs text-slate-500">Create, configure, pause, or duplicate user micro jobs</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2.5 bg-indigo-600 text-white text-xs font-extrabold rounded-2xl shadow-md hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Create New Task
          </button>
        </header>

        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <CheckSquare size={40} className="mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">No Tasks Configured</p>
            <p className="text-xs text-slate-400 mt-1">Click "Create New Task" to start publishing micro jobs.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-3xl overflow-x-auto shadow-xs custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Task Info</th>
                  <th className="px-6 py-4">Reward & Limits</th>
                  <th className="px-6 py-4">Verification</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                {tasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={t.image && t.image !== '$' ? t.image : 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=150'} alt="" className="w-10 h-10 rounded-xl object-cover border" loading="lazy" />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900">{t.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-indigo-600 font-bold uppercase">{t.type}</span>
                            {(t.taskUrl || t.link) && (
                              <a 
                                href={t.taskUrl || t.link} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-[10px] text-emerald-600 font-bold hover:underline truncate max-w-[150px] inline-flex items-center gap-0.5"
                              >
                                Link <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-emerald-600">৳{t.reward}</p>
                      <p className="text-[10px] text-slate-400">{t.countdownTimer}s timer • Limit: {t.dailyLimit}/day</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold">{t.verificationType}</span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={t.status}
                        onChange={(e) => handleToggleStatus(t.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border-0 cursor-pointer ${
                          t.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                          t.status === 'paused' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="disabled">Disabled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleDuplicate(t.id)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                          title="Duplicate Task"
                        >
                          <Copy size={15} />
                        </button>
                        <button
                          onClick={() => handleOpenModal(t)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          title="Edit Task"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(t.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Delete Task"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b sticky top-0 bg-white z-10">
                <h3 className="font-extrabold text-slate-900 text-base">
                  {editingTask ? 'Edit Task Configuration' : 'Create New Task'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-700 uppercase mb-1">Task Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Subscribe to Sponsor YouTube Channel"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 uppercase mb-1">Target Task Link / URL</label>
                  <input
                    type="url"
                    required
                    value={formData.taskUrl}
                    onChange={(e) => setFormData({ ...formData, taskUrl: e.target.value })}
                    placeholder="https://example.com/target-task-link"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:border-indigo-600 font-mono text-xs text-indigo-600 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 uppercase mb-1">Custom Button Text (Optional)</label>
                  <input
                    type="text"
                    value={formData.buttonText || ''}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    placeholder="Watch Video, Visit Link, Install App"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:border-indigo-600 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 uppercase mb-1">Instructions</label>
                  <textarea
                    rows={2}
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder="Step-by-step instructions..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-700 uppercase mb-1">Reward (৳)</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={formData.reward}
                      onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 uppercase mb-1">Ad Wait (s)</label>
                    <input
                      type="number"
                      required
                      value={formData.adTimer || 10}
                      onChange={(e) => setFormData({ ...formData, adTimer: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 uppercase mb-1">Task Stay (s)</label>
                    <input
                      type="number"
                      required
                      value={formData.countdownTimer}
                      onChange={(e) => setFormData({ ...formData, countdownTimer: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 uppercase mb-1">Daily Limit</label>
                    <input
                      type="number"
                      required
                      value={formData.dailyLimit}
                      onChange={(e) => setFormData({ ...formData, dailyLimit: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 uppercase mb-1">Image URL</label>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 uppercase mb-1">Verification Type</label>
                    <select
                      value={formData.verificationType}
                      onChange={(e) => setFormData({ ...formData, verificationType: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl"
                    >
                      <option value="Instant">Instant Verification</option>
                      <option value="Code Verification">Code Verification</option>
                      <option value="Screenshot Proof">Screenshot Proof</option>
                      <option value="Link Check">Link Check</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 uppercase mb-1">Task Category/Type</label>
                    <input
                      type="text"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 uppercase mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl"
                    >
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 text-white font-extrabold text-sm rounded-2xl shadow-md hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={16} /> Save Task Configuration
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
                <h3 className="font-extrabold text-slate-900 text-lg">Delete Task</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Are you sure you want to permanently delete this task? This action cannot be undone.
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
