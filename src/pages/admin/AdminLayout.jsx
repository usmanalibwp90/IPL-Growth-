import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, ArrowDownToLine, ArrowUpFromLine, Settings, Menu, X, LogOut, Wallet } from 'lucide-react';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = localStorage.getItem('adminToken') === 'true';

  if (!isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Manage Users', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Deposits', path: '/admin/deposits', icon: <ArrowDownToLine size={20} /> },
    { name: 'Withdrawals', path: '/admin/withdrawals', icon: <ArrowUpFromLine size={20} /> },
    { name: 'Investment Plans', path: '/admin/plans', icon: <CreditCard size={20} /> },
    { name: 'Team Commissions', path: '/admin/referrals', icon: <Users size={20} /> },
    { name: 'Payment Gateways', path: '/admin/gateways', icon: <Wallet size={20} /> },
    { name: 'Withdraw Methods', path: '/admin/withdraw-methods', icon: <CreditCard size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin-login');
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh', background: '#f8fafc', overflow: 'hidden', fontFamily: 'inherit' }}>
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
        ></div>
      )}

      {/* Sidebar */}
      <aside style={{ 
        position: 'fixed', top: 0, bottom: 0, left: 0, width: '260px', 
        background: 'white', borderRight: '1px solid #e2e8f0', zIndex: 50,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease',
        display: 'flex', flexDirection: 'column'
      }} className="admin-sidebar">
        
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #e2e8f0' }}>
          <img src="/logo.jpg" alt="Logo" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-dark)' }}>Admin Panel</h2>
            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>IPL Growth</p>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
          {menuItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.name} 
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', 
                  borderRadius: '12px', textDecoration: 'none',
                  background: isActive ? 'var(--gradient-gold)' : 'transparent',
                  color: isActive ? 'white' : 'var(--text-dark)',
                  fontWeight: isActive ? '800' : '600',
                  transition: 'all 0.2s'
                }}
              >
                {item.icon}
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0' }}>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px', borderRadius: '12px', border: 'none', background: '#fee2e2', color: '#dc2626', fontWeight: '800', cursor: 'pointer' }}>
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', marginLeft: window.innerWidth > 768 ? (sidebarOpen ? '260px' : '0') : '0', transition: 'margin 0.3s' }}>
        
        {/* Header */}
        <header style={{ height: '70px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '10px', background: '#f8fafc' }}>
            {sidebarOpen ? <X size={24} color="var(--text-dark)" /> : <Menu size={24} color="var(--text-dark)" />}
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right', display: 'none', '@media(minWidth: 600px)': { display: 'block' } }}>
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: '800' }}>Super Admin</h4>
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>admin@iplgrowth.com</p>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--gradient-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
              SA
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px', background: '#f8fafc' }}>
          <Outlet />
        </main>
      </div>

      {/* Basic CSS for desktop sidebar handling */}
      <style>{`
        @media (min-width: 768px) {
          .admin-sidebar {
            transform: translateX(0) !important;
          }
          main {
            margin-left: 260px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
