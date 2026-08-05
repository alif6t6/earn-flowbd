import React, { useState, useEffect } from 'react';
import UserLayout from './layout/UserLayout';
import { fetchApi } from '../lib/api';
import { useToast } from './ui/Toast';
import { Settings, Shield, Phone, Key, Save } from 'lucide-react';

export default function UserSettings() {
  const { addToast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchApi('/api/user/profile')
      .then((data) => {
        setProfile(data);
        setPhoneNumber(data.phoneNumber || '');
      })
      .catch(console.error);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetchApi('/api/user/settings', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber, newPassword }),
      });
      addToast('Settings updated successfully', 'success');
      setNewPassword('');
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <UserLayout profile={profile}>
      <div className="space-y-6 max-w-xl mx-auto">
        <header>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Account Settings</h1>
          <p className="text-xs text-slate-500">Manage your phone number and account password</p>
        </header>

        <form onSubmit={handleSave} className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Username</label>
            <input 
              type="text" 
              disabled 
              value={profile?.username || ''} 
              className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 font-bold text-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Phone size={14} className="text-indigo-600" /> Phone / Account Number
            </label>
            <input 
              type="text" 
              value={phoneNumber} 
              onChange={(e) => setPhoneNumber(e.target.value)} 
              placeholder="01*********"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-2xl text-slate-900 font-semibold text-sm outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Key size={14} className="text-indigo-600" /> New Password
            </label>
            <input 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              placeholder="Leave blank to keep current password"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-2xl text-slate-900 font-semibold text-sm outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-indigo-600/25 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <Save size={18} />
            {saving ? 'Saving Changes...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </UserLayout>
  );
}
