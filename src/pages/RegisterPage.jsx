import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Phone, Lock, Eye, Shield, Key, LayoutDashboard } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="content-area" style={{ paddingBottom: '40px' }}>
      
      {/* Header */}
      <header className="flex-between mb-4 glass-pill" style={{ padding: '8px 12px' }}>
        <div className="brand flex-center" style={{ gap: '10px', marginLeft: '4px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <img src="/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800' }}>Islamic Profit Limited</h3>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to="/" className="btn btn-light" style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '12px', background: 'white', fontWeight: '700' }}>Home</Link>
          <Link to="/login" className="btn" style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '12px', background: 'var(--gradient-gold)', color: 'white', fontWeight: '700', boxShadow: '0 4px 10px rgba(234, 88, 12, 0.3)' }}>Login</Link>
        </div>
      </header>



      <style>{`
        .auth-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
      `}</style>

      {/* Main Content Card */}
      <div className="glass-card mb-4" style={{ padding: '30px 24px' }}>
        <div className="auth-container">
          
          {/* Top Section (Title & Desc) */}
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <h1 style={{ fontSize: '2.5rem', lineHeight: '1.1', marginBottom: '16px', color: '#111827' }}>
              Create<br />Account.<br />
              <span style={{ color: '#d97706' }}>Start Securely.</span>
            </h1>
            <p className="mb-4" style={{ fontSize: '0.9rem', maxWidth: '300px', margin: '0 auto' }}>Join Islamic Profit Limited and access exclusive member features. Safe, fast, and reliable.</p>
          </div>

          {/* Middle Section (Form) */}
          <div style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Register Account</h2>
            <p style={{ fontSize: '0.85rem', marginBottom: '24px', color: 'var(--text-muted)' }}>Enter your details to create a new member profile.</p>
            
            <div className="input-group">
              <User className="input-icon" size={20} />
              <input type="text" placeholder="Username" />
            </div>
            
            <div className="input-group">
              <Phone className="input-icon" size={20} />
              <input type="tel" placeholder="Mobile Number" />
            </div>
            
            <div className="input-group">
              <Lock className="input-icon" size={20} />
              <input type="password" placeholder="Password" />
              <Eye className="input-action" size={20} />
            </div>
            
            <button onClick={handleRegister} className="btn btn-primary" style={{ width: '100%', marginTop: '10px', padding: '16px', borderRadius: '16px' }}>Register Account</button>
            
            <div className="text-center mt-4">
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Already have an account? </span>
              <Link to="/login" style={{ fontSize: '0.85rem', fontWeight: '600', color: '#d97706', textDecoration: 'none' }}>Login Account</Link>
            </div>
            
            <div className="text-center mt-4" style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <Shield size={14} /> 256-bit encrypted secure registration
            </div>
          </div>

          {/* Bottom Section (Icon & Pills) */}
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '100px', height: '100px', background: 'var(--gradient-gold)', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 10px 30px rgba(217,119,6,0.3)' }}>
                <Shield size={50} />
              </div>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.7)', padding: '8px 12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                <User size={14} color="#d97706" /> Quick Setup
              </div>
              <div style={{ background: 'rgba(255,255,255,0.7)', padding: '8px 12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                <Key size={14} color="#f59e0b" /> Secure Profile
              </div>
              <div style={{ background: 'rgba(255,255,255,0.7)', padding: '8px 12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                <LayoutDashboard size={14} color="#ea580c" /> Member Access
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="flex-between" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0 10px' }}>
        <div>© 2026 Islamic Profit Limited.</div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
          <Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>Login</Link>
        </div>
      </div>

    </div>
  );
};

export default RegisterPage;
