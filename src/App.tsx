import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import GlobalAds from './components/common/GlobalAds';

const Login = React.lazy(() => import('./components/Login'));
const UserPanel = React.lazy(() => import('./components/UserPanel'));
const AdminUsers = React.lazy(() => import('./components/admin/AdminUsers'));
const AdminTasks = React.lazy(() => import('./components/admin/AdminTasks'));
const AdminAds = React.lazy(() => import('./components/admin/AdminAds'));
const AdminReferrals = React.lazy(() => import('./components/admin/AdminReferrals'));
const AdminPromos = React.lazy(() => import('./components/admin/AdminPromos'));
const AdminWithdrawals = React.lazy(() => import('./components/admin/AdminWithdrawals'));
const AdminSettings = React.lazy(() => import('./components/admin/AdminSettings'));
const AdminVideos = React.lazy(() => import('./components/admin/AdminVideos'));
const AdminPanel = React.lazy(() => import('./components/AdminPanel'));
const AdminPaymentSettings = React.lazy(() => import('./components/admin/AdminPaymentSettings'));
const AdminReports = React.lazy(() => import('./components/admin/AdminReports'));
const AdminNotifications = React.lazy(() => import('./components/admin/AdminNotifications'));
const AdminActivityLogs = React.lazy(() => import('./components/admin/AdminActivityLogs'));

const UserProfile = React.lazy(() => import('./components/UserProfile'));
const UserWithdrawals = React.lazy(() => import('./components/UserWithdrawals'));
const UserTasks = React.lazy(() => import('./components/UserTasks'));
const UserReferrals = React.lazy(() => import('./components/UserReferrals'));
const UserNotifications = React.lazy(() => import('./components/UserNotifications'));
const UserSettings = React.lazy(() => import('./components/UserSettings'));
const UserSupport = React.lazy(() => import('./components/UserSupport'));
const UserAbout = React.lazy(() => import('./components/UserAbout'));
const UserTerms = React.lazy(() => import('./components/UserTerms'));
const UserPrivacy = React.lazy(() => import('./components/UserPrivacy'));
const UserTransactions = React.lazy(() => import('./components/UserTransactions'));
const UserPayments = React.lazy(() => import('./components/UserPayments'));
const UserWithdrawHistory = React.lazy(() => import('./components/UserWithdrawHistory'));

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/" replace />;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (adminOnly && !payload?.isAdmin) {
      return <Navigate to="/user" replace />;
    }
  } catch (e) {
    localStorage.removeItem('token');
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
  </div>
);

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <GlobalAds />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Login />} />
            
            <Route path="/user" element={<ProtectedRoute><UserPanel /></ProtectedRoute>} />
            <Route path="/user/tasks" element={<ProtectedRoute><UserTasks /></ProtectedRoute>} />
            <Route path="/user/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/user/withdrawals" element={<ProtectedRoute><UserWithdrawals /></ProtectedRoute>} />
            <Route path="/user/referrals" element={<ProtectedRoute><UserReferrals /></ProtectedRoute>} />
            <Route path="/user/notifications" element={<ProtectedRoute><UserNotifications /></ProtectedRoute>} />
            <Route path="/user/settings" element={<ProtectedRoute><UserSettings /></ProtectedRoute>} />
            <Route path="/user/help" element={<ProtectedRoute><UserSupport /></ProtectedRoute>} />
            <Route path="/user/support" element={<ProtectedRoute><UserSupport /></ProtectedRoute>} />
            <Route path="/user/about" element={<ProtectedRoute><UserAbout /></ProtectedRoute>} />
            <Route path="/user/terms" element={<ProtectedRoute><UserTerms /></ProtectedRoute>} />
            <Route path="/user/privacy" element={<ProtectedRoute><UserPrivacy /></ProtectedRoute>} />
            <Route path="/user/transactions" element={<ProtectedRoute><UserTransactions /></ProtectedRoute>} />
            <Route path="/user/payments" element={<ProtectedRoute><UserPayments /></ProtectedRoute>} />
            <Route path="/user/withdraw-history" element={<ProtectedRoute><UserWithdrawHistory /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/tasks" element={<ProtectedRoute adminOnly><AdminTasks /></ProtectedRoute>} />
            <Route path="/admin/videos" element={<ProtectedRoute adminOnly><AdminVideos /></ProtectedRoute>} />
            <Route path="/admin/ads" element={<ProtectedRoute adminOnly><AdminAds /></ProtectedRoute>} />
            <Route path="/admin/referrals" element={<ProtectedRoute adminOnly><AdminReferrals /></ProtectedRoute>} />
            <Route path="/admin/promos" element={<ProtectedRoute adminOnly><AdminPromos /></ProtectedRoute>} />
            <Route path="/admin/withdrawals" element={<ProtectedRoute adminOnly><AdminWithdrawals /></ProtectedRoute>} />
            <Route path="/admin/payment-settings" element={<ProtectedRoute adminOnly><AdminPaymentSettings /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute adminOnly><AdminReports /></ProtectedRoute>} />
            <Route path="/admin/notifications" element={<ProtectedRoute adminOnly><AdminNotifications /></ProtectedRoute>} />
            <Route path="/admin/logs" element={<ProtectedRoute adminOnly><AdminActivityLogs /></ProtectedRoute>} />
            <Route path="/admin/content" element={<ProtectedRoute adminOnly><AdminSettings /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute adminOnly><AdminSettings /></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ToastProvider>
  );
}
