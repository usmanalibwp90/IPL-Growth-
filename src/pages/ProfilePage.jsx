import React from 'react';
import { ArrowLeft, UserCircle, Mail, Phone, MapPin, ChevronRight, Key, ShieldCheck, CreditCard, LogOut, Settings } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const ProfilePage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {
    username: 'GuestUser',
    fullName: 'Guest User',
    email: 'guest@example.com',
    phone: '+92 000 0000000',
    country: 'Unknown'
  };

  return (
    <div className="page-transition" style={{ padding: '10px', paddingBottom: '100px', maxWidth: 'var(--max-width)', margin: '0 auto' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '24px' }}>
        <div onClick={() => navigate(-1)} style={{ width: '45px', height: '45px', borderRadius: '14px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
           <ArrowLeft size={20} color="var(--text-dark)" />
        </div>
        <div>
           <h1 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-dark)', fontWeight: '800' }}>My Profile</h1>
           <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Manage your account settings</p>
        </div>
      </div>

      {/* User Avatar Card */}
      <div className="glass-card mb-4" style={{ padding: '24px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', color: 'white', boxShadow: '0 10px 25px rgba(245, 158, 11, 0.4)' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', backdropFilter: 'blur(10px)', border: '2px solid rgba(255,255,255,0.5)' }}>
          <UserCircle size={50} color="white" />
        </div>
        <h2 style={{ margin: '0 0 4px 0', fontSize: '1.4rem', fontWeight: '900' }}>{user.fullName}</h2>
        <div style={{ fontSize: '0.8rem', fontWeight: '500', opacity: 0.9, marginBottom: '12px' }}>{user.email}</div>
        <div style={{ background: 'white', color: '#d97706', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ShieldCheck size={14} /> Fully Verified
        </div>
      </div>

      {/* Personal Info */}
      <h3 style={{ fontSize: '1rem', margin: '0 0 12px 0', color: 'var(--text-dark)', fontWeight: '800' }}>Personal Information</h3>
      <div className="glass-card mb-4" style={{ background: 'white', borderRadius: '20px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 5px 15px rgba(0,0,0,0.03)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mail size={18} color="#64748b" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Email</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: '800' }}>{user.email}</div>
          </div>
        </div>

        <div style={{ height: '1px', background: '#f1f5f9', width: '100%' }}></div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Phone size={18} color="#64748b" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Phone</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: '800' }}>{user.phone}</div>
          </div>
        </div>

        <div style={{ height: '1px', background: '#f1f5f9', width: '100%' }}></div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={18} color="#64748b" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Country</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: '800' }}>{user.country}</div>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <h3 style={{ fontSize: '1rem', margin: '0 0 12px 0', color: 'var(--text-dark)', fontWeight: '800' }}>Settings & Security</h3>
      <div className="glass-card mb-4" style={{ background: 'white', borderRadius: '20px', padding: '8px', boxShadow: '0 5px 15px rgba(0,0,0,0.03)' }}>
        
        <Link to="/change-password" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', textDecoration: 'none', color: 'inherit' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Key size={18} />
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-dark)' }}>Change Password</div>
          </div>
          <ChevronRight size={18} color="#94a3b8" />
        </Link>

        <Link to="/verified" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', textDecoration: 'none', color: 'inherit' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} />
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-dark)' }}>Verification Status</div>
          </div>
          <ChevronRight size={18} color="#94a3b8" />
        </Link>

        <Link to="/payment-methods" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', textDecoration: 'none', color: 'inherit' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={18} />
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-dark)' }}>Payment Methods</div>
          </div>
          <ChevronRight size={18} color="#94a3b8" />
        </Link>

      </div>

      {/* Logout */}
      <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', background: '#fee2e2', color: '#dc2626', textDecoration: 'none', padding: '16px', borderRadius: '16px', fontWeight: '800', fontSize: '1rem' }}>
        <LogOut size={20} />
        Log Out
      </Link>

    </div>
  );
};

export default ProfilePage;
