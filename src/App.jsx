import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Outlet } from 'react-router-dom';
import { Home, Wallet, PieChart, Users, User, Ban } from 'lucide-react';
import './index.css';
import { API_BASE_URL } from './config';

// Pages
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PlansPage from './pages/PlansPage';
import DepositPage from './pages/DepositPage';
import WithdrawPage from './pages/WithdrawPage';
import DepositHistoryPage from './pages/DepositHistoryPage';
import WithdrawHistoryPage from './pages/WithdrawHistoryPage';
import TransactionPage from './pages/TransactionPage';
import MyTaskPage from './pages/MyTaskPage';
import TeamPage from './pages/TeamPage';
import AppDownloadPage from './pages/AppDownloadPage';
import VerifiedPage from './pages/VerifiedPage';
import ProfilePage from './pages/ProfilePage';
import PaymentMethodsPage from './pages/PaymentMethodsPage';
import ManualPaymentPage from './pages/ManualPaymentPage';

import ChangePasswordPage from './pages/ChangePasswordPage';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageDeposits from './pages/admin/ManageDeposits';
import ManageWithdrawals from './pages/admin/ManageWithdrawals';
import ManagePlans from './pages/admin/ManagePlans';
import AdminSettings from './pages/admin/AdminSettings';
import ManageGateways from './pages/admin/ManageGateways';
import ManageWithdrawMethods from './pages/admin/ManageWithdrawMethods';
import ManageReferral from './pages/admin/ManageReferral';
import AdminLogin from './pages/admin/AdminLogin';

// Placeholder for other routes
const Placeholder = ({ title }) => (
  <div className="flex-center" style={{ height: '100vh', flexDirection: 'column' }}>
    <h2>{title}</h2>
    <Link to="/dashboard" className="btn btn-primary mt-4">Back to Dashboard</Link>
  </div>
);

const BottomNav = () => {
  const location = useLocation();
  const hiddenRoutes = ['/', '/login', '/register'];
  
  if (hiddenRoutes.includes(location.pathname) || location.pathname.startsWith('/admin')) return null;

  return (
    <div className="bottom-nav">
      <Link to="/dashboard" className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
        <Home />
        <span>Home</span>
      </Link>
      <Link to="/withdraw" className={`nav-item ${location.pathname === '/withdraw' ? 'active' : ''}`}>
        <Wallet />
        <span>Wallet</span>
      </Link>
      <Link to="/plans" className={`nav-item ${location.pathname === '/plans' ? 'active' : ''}`}>
        <PieChart />
        <span>Plans</span>
      </Link>
      <Link to="/team" className={`nav-item ${location.pathname === '/team' ? 'active' : ''}`}>
        <Users />
        <span>Team</span>
      </Link>
      <Link to="/profile" className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}>
        <User />
        <span>Profile</span>
      </Link>
    </div>
  );
};

const MobileAppLayout = () => {
  const location = useLocation();
  const [isBlocked, setIsBlocked] = React.useState(false);
  const [checkingStatus, setCheckingStatus] = React.useState(false);
  const [blockedUser, setBlockedUser] = React.useState(null);

  const checkUserStatus = React.useCallback(async () => {
    try {
      const rawUser = localStorage.getItem('user');
      if (!rawUser) {
        setIsBlocked(false);
        return;
      }
      const user = JSON.parse(rawUser);
      setBlockedUser(user);

      // Check localStorage first
      if (user.status === 'Blocked') {
        setIsBlocked(true);
        return;
      }
      const blockedList = JSON.parse(localStorage.getItem('blocked_user_ids') || '[]');
      if (user.id && blockedList.includes(user.id)) {
        setIsBlocked(true);
        return;
      }
      const adminCache = JSON.parse(localStorage.getItem('admin_users_cache') || '[]');
      const found = adminCache.find(x => x.id === user.id || (x.email && x.email === user.email));
      if (found && found.status === 'Blocked') {
        setIsBlocked(true);
        return;
      }

      // Check with backend
      const res = await fetch(`${API_BASE_URL}/api/user/status?id=${encodeURIComponent(user.id || '')}&email=${encodeURIComponent(user.email || '')}`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'Blocked') {
          setIsBlocked(true);
          user.status = 'Blocked';
          localStorage.setItem('user', JSON.stringify(user));
        } else {
          setIsBlocked(false);
        }
      }
    } catch (e) {
      // ignore network errors
    }
  }, []);

  React.useEffect(() => {
    checkUserStatus();
    const interval = setInterval(checkUserStatus, 1500);
    window.addEventListener('storage', checkUserStatus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkUserStatus);
    };
  }, [checkUserStatus, location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsBlocked(false);
    window.location.href = '/login';
  };

  const publicRoutes = ['/', '/login', '/register'];
  const isPublicPage = publicRoutes.includes(location.pathname);

  // If user is blocked and trying to view an account route
  if (isBlocked && !isPublicPage) {
    return (
      <div className="app-container" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff5f5 0%, #ffffff 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
        <div style={{ width: '84px', height: '84px', borderRadius: '24px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: '0 10px 25px rgba(220, 38, 38, 0.2)' }}>
          <Ban size={44} />
        </div>
        
        <span style={{ background: '#fecaca', color: '#991b1b', fontSize: '0.72rem', fontWeight: '800', padding: '4px 14px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>
          Notification: Account Blocked
        </span>

        <h1 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#111827', margin: '0 0 10px 0' }}>
          Aap Ko Website Ne Block Kar Diya Hai
        </h1>

        <p style={{ fontSize: '0.9rem', color: '#4b5563', lineHeight: '1.6', maxWidth: '330px', margin: '0 auto 22px auto' }}>
          Aap ka account admin panel se suspend / block kar diya gaya hai. Aap ka account tab tak open nahi ho sakta jab tak admin panel se status dobara <b>Active</b> na kiya jaye.
        </p>

        <div style={{ background: 'white', border: '1px solid #fee2e2', borderRadius: '18px', padding: '16px 20px', width: '100%', maxWidth: '320px', marginBottom: '24px', textAlign: 'left', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>User Profile Details</div>
          <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#111827', marginTop: '4px' }}>{blockedUser?.name || 'Member'}</div>
          <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '2px' }}>{blockedUser?.email}</div>
          {blockedUser?.mobile && <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: '700', marginTop: '2px' }}>{blockedUser?.mobile}</div>}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fef2f2', color: '#dc2626', fontWeight: '800', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '8px', marginTop: '10px' }}>
            <Ban size={12} /> Status: Blocked by Admin
          </div>
        </div>

        <div style={{ width: '100%', maxWidth: '320px' }}>
          <button 
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '16px',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontWeight: '800',
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(220, 38, 38, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Ban size={18} /> Logout Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Outlet />
      <BottomNav />
    </div>
  );
};

function App() {
  const [showSplash, setShowSplash] = React.useState(true);
  const [isMaintenance, setIsMaintenance] = React.useState(false);

  React.useEffect(() => {
    // Check maintenance mode on load
    const maintenance = localStorage.getItem('maintenance_mode') === 'true';
    setIsMaintenance(maintenance);

    // Listen for storage changes in case admin toggles it in another tab
    const handleStorageChange = () => {
      setIsMaintenance(localStorage.getItem('maintenance_mode') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event to listen to changes within the same window
    const interval = setInterval(() => {
      setIsMaintenance(localStorage.getItem('maintenance_mode') === 'true');
    }, 1000);

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1300);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (showSplash) {
    return (
      <div style={{ height: '100vh', width: '100vw', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
         <div style={{ position: 'relative', width: '140px', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', top: '-12px', left: '-12px', right: '-12px', bottom: '-12px', border: '4px solid transparent', borderTopColor: 'var(--primary-gold)', borderRightColor: 'var(--primary-gold)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <img src="/logo.jpg" alt="Logo" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '50%', boxShadow: '0 4px 15px rgba(245,158,11,0.3)' }} />
         </div>
      </div>
    );
  }

  // Maintenance Screen Component
  const MaintenanceScreen = () => (
    <div style={{ height: '100vh', width: '100%', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
      <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 9.73 1.4 1.4 0 0 0-1.69 1.16l-.82 5.14a1.4 1.4 0 0 1-1.37 1.18H7.33a1.4 1.4 0 0 1-1.37-1.18l-.82-5.14a1.4 1.4 0 0 0-1.69-1.16 6 6 0 0 1-7.94-9.73l3.77 3.77a1 1 0 0 0 1.4 0l1.6-1.6a1 1 0 0 0 0-1.4A4.01 4.01 0 0 1 8.5 2.05a1.4 1.4 0 0 0 1.09-.94 1.4 1.4 0 0 1 2.62 0 1.4 1.4 0 0 0 1.1.94 4.01 4.01 0 0 1 1.39 4.25z"/></svg>
      </div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-dark)', marginBottom: '12px' }}>Under Maintenance</h1>
      <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: '600', maxWidth: '300px', lineHeight: '1.6' }}>
        IPL Growth is currently undergoing scheduled maintenance. We'll be back online shortly. Thank you for your patience!
      </p>
    </div>
  );

  return (
    <Router>
      <Routes>
        {/* Mobile App Layout for regular users (Blocked if in Maintenance) */}
        <Route element={isMaintenance ? <MaintenanceScreen /> : <MobileAppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/deposit" element={<DepositPage />} />
          <Route path="/withdraw" element={<WithdrawPage />} />
          <Route path="/deposit-history" element={<DepositHistoryPage />} />
          <Route path="/withdraw-history" element={<WithdrawHistoryPage />} />
          <Route path="/transaction" element={<TransactionPage />} />
          <Route path="/my-task" element={<MyTaskPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/app-download" element={<AppDownloadPage />} />
          <Route path="/verified" element={<VerifiedPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/payment-methods" element={<PaymentMethodsPage />} />
          <Route path="/manual-payment" element={<ManualPaymentPage />} />
          
          <Route path="/wallet" element={<Placeholder title="Wallet" />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
        </Route>
        
        {/* Admin Routes (Full Width) */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="deposits" element={<ManageDeposits />} />
          <Route path="withdrawals" element={<ManageWithdrawals />} />
          <Route path="plans" element={<ManagePlans />} />
          <Route path="gateways" element={<ManageGateways />} />
          <Route path="withdraw-methods" element={<ManageWithdrawMethods />} />
          <Route path="referrals" element={<ManageReferral />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
