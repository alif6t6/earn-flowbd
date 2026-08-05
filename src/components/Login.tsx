import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../lib/api';
import BrandLogo from './common/BrandLogo';

export default function Login() {
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('Bangladesh');
  const [referralCode, setReferralCode] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeCampaign, setActiveCampaign] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setReferralCode(ref.toUpperCase());
      setIsRegistering(true);
    }
    
    fetchApi('/api/settings').then(res => {
      if (res.activeCampaign) {
        setActiveCampaign(res.activeCampaign);
      }
    }).catch(() => {});

    const token = localStorage.getItem('token');
    if (token) {
      setLoading(true);
      fetchApi('/api/user/profile')
        .then((data) => {
          if (data.isAdmin) {
            // Admin must always manually log in with password - no auto login
            localStorage.removeItem('token');
            setLoading(false);
          } else {
            navigate('/user', { replace: true });
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          setLoading(false);
        });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isRegistering) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        setLoading(false);
        return;
      }
      
      if (country === 'Bangladesh') {
        const bdPhoneRegex = /^01[03456789]\d{8}$/;
        if (!bdPhoneRegex.test(phoneNumber)) {
          setError('Please enter a valid 11-digit Bangladeshi mobile number (017...)');
          setLoading(false);
          return;
        }
      } else if (country === 'India') {
        const inPhoneRegex = /^[6-9]\d{9}$/;
        if (!inPhoneRegex.test(phoneNumber)) {
          setError('Please enter a valid 10-digit Indian mobile number');
          setLoading(false);
          return;
        }
      }
    }

    try {
      const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
      const bodyData = isRegistering ? { username, password, phoneNumber, referralCode, country } : { username, password };
      const data = await fetchApi(endpoint, {
        method: 'POST',
        body: JSON.stringify(bodyData)
      });
      
      localStorage.setItem('token', data.token);
      if (data.user) {
        localStorage.setItem('earnflow_current_user', JSON.stringify(data.user));
      }
      
      if (data.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] font-sans text-slate-800 p-4">
      <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-100 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <BrandLogo height={52} className="mb-2" />
          <p className="text-sm text-slate-500 mt-1">{isRegistering ? 'Create a new account' : 'Sign in to your account'}</p>
        </div>
        
        {error && <div className="mb-6 text-sm text-rose-600 bg-rose-50 border border-rose-100 p-4 rounded-xl">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Username</label>
            <input 
              type="text" 
              required
              className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          {isRegistering && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="Bangladesh">Bangladesh</option>
                  <option value="India">India</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  required
                  placeholder="017..."
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Referral Code (Optional)</label>
                <input 
                  type="text" 
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all uppercase"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="Enter referral code if you have one"
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              required
              className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-all shadow-sm shadow-indigo-200 mt-2"
          >
            {loading ? 'Please wait...' : (isRegistering ? 'Register' : 'Login')}
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <button 
            type="button" 
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
          >
            {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
