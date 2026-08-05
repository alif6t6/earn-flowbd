import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import BrandLogo from '../common/BrandLogo';
import { 
  LayoutDashboard, 
  CheckSquare, 
  CreditCard, 
  User,
  Link as LinkIcon, 
  Crown, 
  HelpCircle,
  Bell,
  LogOut,
  Settings,
  History,
  FileText,
  ShieldCheck,
  Info,
  MoreVertical,
  X,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UserLayoutProps {
  children: React.ReactNode;
  profile: any;
}

export default function UserLayout({ children, profile }: UserLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isThreeDotOpen, setIsThreeDotOpen] = useState(false);
  const [ripplePos, setRipplePos] = useState<{ x: number; y: number; key: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsThreeDotOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsThreeDotOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Bottom Facebook-style Nav items ONLY
  const bottomNavItems = [
    { name: 'Dashboard', path: '/user', icon: LayoutDashboard, exact: true },
    { name: 'Tasks', path: '/user/tasks', icon: CheckSquare, badge: profile?.completedTasks ? undefined : 'NEW' },
    { name: 'Withdraw', path: '/user/withdrawals', icon: CreditCard },
    { name: 'Profile', path: '/user/profile', icon: User },
  ];

  interface MenuItem {
    name: string;
    path: string;
    icon: any;
    desc?: string;
    badge?: string;
    highlight?: boolean;
  }

  // Secondary pages inside Three Dot Menu
  const secondaryMenuItems: MenuItem[] = [
    { name: 'Notifications', path: '/user/notifications', icon: Bell, badge: 'New' },
    { name: 'Referral', path: '/user/referrals', icon: LinkIcon, desc: 'Earn 15% bonus per friend' },
    { name: 'Transaction History', path: '/user/transactions', icon: History },
    { name: 'Withdraw History', path: '/user/withdraw-history', icon: History },
    { name: 'Settings', path: '/user/settings', icon: Settings },
    { name: 'Support & Help', path: '/user/support', icon: HelpCircle },
    { name: 'About Earn Flow', path: '/user/about', icon: Info },
    { name: 'Terms & Conditions', path: '/user/terms', icon: FileText },
    { name: 'Privacy Policy', path: '/user/privacy', icon: ShieldCheck },
  ];

  const handleRipple = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipplePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      key: Date.now()
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header className="h-16 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 px-4 md:px-8 flex items-center justify-between z-30 sticky top-0 shadow-xs">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/user')}>
          <BrandLogo height={38} variant="dark" />
        </div>

        {/* Right Top Header Actions */}
        <div className="flex items-center gap-2">
          {/* Balance Chip */}
          <div className="px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100/80 rounded-2xl flex items-center gap-2 shadow-2xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">Balance</p>
              <p className="text-sm font-black text-indigo-900 leading-tight">৳{profile?.balance || '0.00'}</p>
            </div>
          </div>

          {/* Three-Dot Menu Button */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsThreeDotOpen(!isThreeDotOpen)}
              className={`p-2.5 rounded-2xl transition-all duration-200 ${
                isThreeDotOpen 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' 
                  : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
              title="Menu Options"
            >
              {isThreeDotOpen ? <X size={20} /> : <MoreVertical size={20} />}
            </button>

            {/* Desktop Three Dot Dropdown */}
            <AnimatePresence>
              {isThreeDotOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 mt-3 w-72 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/80 py-3 z-50 overflow-hidden ring-1 ring-slate-950/5"
                >
                  <div className="px-5 py-3 border-b border-slate-100 bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-transparent">
                    <p className="font-extrabold text-slate-900 text-sm flex items-center justify-between">
                      <span>@{profile?.username || 'User'}</span>
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Total Earnings: ৳{profile?.totalEarnings || '0.00'}</p>
                  </div>

                  <div className="py-2 max-h-[65vh] overflow-y-auto divide-y divide-slate-100/60 custom-scrollbar">
                    <div className="px-2 space-y-0.5">
                      {secondaryMenuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                          <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsThreeDotOpen(false)}
                            className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                              item.highlight 
                                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20 my-1' 
                                : isActive 
                                  ? 'bg-indigo-50 text-indigo-700 font-extrabold' 
                                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon size={18} className={item.highlight ? 'text-white' : isActive ? 'text-indigo-600' : 'text-slate-400'} />
                              <div>
                                <p>{item.name}</p>
                                {item.desc && <p className={`text-[10px] font-normal ${item.highlight ? 'text-amber-100' : 'text-slate-400'}`}>{item.desc}</p>}
                              </div>
                            </div>
                            {item.badge && (
                              <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full ${item.highlight ? 'bg-white text-amber-700' : 'bg-rose-500 text-white'}`}>
                                {item.badge}
                              </span>
                            )}
                          </NavLink>
                        );
                      })}
                    </div>
                    
                    <div className="px-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                      >
                        <LogOut size={18} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Scrollable Content Container (Padded so bottom nav never overlaps) */}
      <main className="flex-1 pb-28 md:pb-24">
        <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* ------------------------------------------------------------------- */}
      {/* Facebook-Style Fixed Bottom Navigation Bar                          */}
      {/* Always visible while scrolling on Android, iPhone, and Tablets      */}
      {/* ------------------------------------------------------------------- */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-t border-slate-200/80 dark:border-slate-800 shadow-[0_-8px_30px_rgb(0,0,0,0.06)] px-2 py-1.5 md:py-2">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1 items-center relative">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact 
              ? location.pathname === item.path 
              : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleRipple}
                className="relative flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all duration-300 group select-none overflow-hidden"
              >
                {/* Active Pill Background Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabPill"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="absolute inset-0 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl border border-indigo-100 dark:border-indigo-800/50"
                  />
                )}

                {/* Ripple Effect Animation on Click */}
                {ripplePos && (
                  <span
                    key={ripplePos.key}
                    className="absolute w-12 h-12 bg-indigo-400/20 rounded-full animate-ping pointer-events-none"
                    style={{ left: ripplePos.x - 24, top: ripplePos.y - 24 }}
                  />
                )}

                {/* Icon Container with Active Animation */}
                <div className="relative z-10 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: isActive ? 1.15 : 1, y: isActive ? -1 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  >
                    <Icon
                      size={22}
                      className={`transition-colors duration-200 ${
                        isActive
                          ? 'text-indigo-600 dark:text-indigo-400 stroke-[2.5]'
                          : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 stroke-[1.8]'
                      }`}
                    />
                  </motion.div>

                  {/* Badge Support */}
                  {item.badge && (
                    <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 bg-rose-500 text-white text-[9px] font-black rounded-full border-2 border-white shadow-2xs">
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Text Label */}
                <span
                  className={`relative z-10 text-[11px] font-bold mt-1 tracking-tight transition-colors duration-200 ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                      : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700'
                  }`}
                >
                  {item.name}
                </span>

                {/* Active Indicator Dot under icon */}
                {isActive && (
                  <motion.span
                    layoutId="activeDot"
                    className="absolute bottom-0.5 w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full shadow-xs"
                  />
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
