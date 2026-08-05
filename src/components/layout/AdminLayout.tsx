import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import BrandLogo from '../common/BrandLogo';
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  CreditCard, 
  Megaphone,
  MoreHorizontal,
  Crown,
  Link as LinkIcon,
  Globe,
  Settings,
  BarChart3,
  Bell,
  Activity,
  LogOut,
  X,
  ShieldAlert,
  ChevronRight,
  ShieldCheck,
  Video,
  Ticket
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const confirmLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // Primary Bottom Nav Bar Items (Facebook Style)
  const primaryNavItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={22} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={22} /> },
    { name: 'Tasks', path: '/admin/tasks', icon: <CheckSquare size={22} /> },
    { name: 'Withdraw', path: '/admin/withdrawals', icon: <CreditCard size={22} /> },
    { name: 'Ads', path: '/admin/ads', icon: <Megaphone size={22} /> },
  ];

  // Secondary Items inside Three-Dot (More) Menu
  const moreMenuItems = [
    { name: 'Referral Settings', path: '/admin/referrals', icon: <LinkIcon size={18} className="text-indigo-400" /> },
    { name: 'Promo Codes & Campaigns', path: '/admin/promos', icon: <Ticket size={18} className="text-amber-400" /> },
    { name: 'Website Content', path: '/admin/content', icon: <Globe size={18} className="text-cyan-400" /> },
    { name: 'Advertisement Manager', path: '/admin/ads', icon: <Megaphone size={18} className="text-pink-400" /> },
    { name: 'Payment Settings', path: '/admin/payment-settings', icon: <ShieldCheck size={18} className="text-emerald-400" /> },
    { name: 'Reports', path: '/admin/reports', icon: <BarChart3 size={18} className="text-blue-400" /> },
    { name: 'Notifications', path: '/admin/notifications', icon: <Bell size={18} className="text-purple-400" /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={18} className="text-slate-400" /> },
    { name: 'Activity Logs', path: '/admin/logs', icon: <Activity size={18} className="text-emerald-400" /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] font-sans text-slate-800 pb-20 md:pb-24">
      {/* Top Header */}
      <header className="h-16 bg-slate-900 text-white px-4 md:px-8 flex items-center justify-between z-30 sticky top-0 shadow-lg border-b border-slate-800">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/admin')}>
          <BrandLogo height={34} variant="light" />
          <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-black text-[10px] rounded-md uppercase tracking-wider">
            ADMIN
          </span>
        </div>

        {/* Top Right Three-Dot Menu Button & Direct Logout */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMoreMenuOpen(true)}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all border border-slate-700 flex items-center gap-1.5 font-bold text-xs"
          >
            <MoreHorizontal size={20} />
            <span className="hidden sm:inline">Menu</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        {children}
      </main>

      {/* Facebook-Style Fixed Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 z-40 px-2 py-1.5 shadow-2xl">
        <div className="max-w-md mx-auto grid grid-cols-6 gap-1 items-center">
          {primaryNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all relative ${
                    isActive 
                      ? 'text-indigo-400 font-black' 
                      : 'text-slate-400 hover:text-slate-200 font-semibold'
                  }`
                }
              >
                {item.icon}
                <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[56px] text-center">
                  {item.name}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="activeTabBadge" 
                    className="absolute -bottom-1 w-8 h-1 bg-indigo-500 rounded-full" 
                  />
                )}
              </NavLink>
            );
          })}

          {/* Three-Dot (More) Button */}
          <button
            type="button"
            onClick={() => setIsMoreMenuOpen(true)}
            className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all ${
              isMoreMenuOpen ? 'text-indigo-400 font-black' : 'text-slate-400 hover:text-slate-200 font-semibold'
            }`}
          >
            <MoreHorizontal size={22} />
            <span className="text-[10px] mt-0.5 tracking-tight">More</span>
          </button>
        </div>
      </nav>

      {/* Three-Dot (More) Menu Slide-Up Drawer */}
      <AnimatePresence>
        {isMoreMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50"
              onClick={() => setIsMoreMenuOpen(false)}
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed bottom-0 inset-x-0 bg-slate-900 border-t border-slate-800 text-white z-50 rounded-t-3xl max-w-lg mx-auto overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
            >
              {/* Menu Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-600/30 rounded-xl text-indigo-400">
                    <MoreHorizontal size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">Admin Management Menu</h3>
                    <p className="text-[10px] text-slate-400">Control center & site configurations</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMoreMenuOpen(false)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Menu Items List */}
              <div className="p-4 space-y-1 overflow-y-auto flex-1 divide-y divide-slate-800/60">
                <div className="space-y-1 pb-2">
                  {moreMenuItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        navigate(item.path);
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-800/80 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-800 rounded-xl group-hover:scale-110 transition-transform">
                          {item.icon}
                        </div>
                        <span className="text-xs font-bold text-slate-200 group-hover:text-white">{item.name}</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-500 group-hover:text-white transition-colors" />
                    </button>
                  ))}
                </div>

                {/* Logout Option */}
                <div className="pt-3">
                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      setShowLogoutConfirm(true);
                    }}
                    className="w-full flex items-center justify-between p-3.5 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-600 hover:border-rose-600 text-rose-400 hover:text-white rounded-2xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-rose-500/20 group-hover:bg-rose-500 rounded-xl text-rose-400 group-hover:text-white transition-colors">
                        <LogOut size={18} />
                      </div>
                      <span className="text-xs font-black uppercase tracking-wider">Logout Admin Session</span>
                    </div>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50"
              onClick={() => setShowLogoutConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-3xl p-6 shadow-2xl z-50 text-slate-900 space-y-5 border border-slate-100"
            >
              <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <ShieldAlert size={30} />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Confirm Admin Logout</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to end your active administrator session? You will be redirected to the login page.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmLogout}
                  className="py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-lg shadow-rose-600/30 transition-all"
                >
                  Confirm Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
