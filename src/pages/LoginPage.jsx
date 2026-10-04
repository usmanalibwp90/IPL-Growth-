import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Eye, Shield, Key, LayoutDashboard, Fingerprint, Info } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        const errorData = await response.json();
        alert('Login failed: ' + errorData.error);
      }
    } catch (err) {
      alert('Network error connecting to backend.');
    }
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
          <Link to="/register" className="btn" style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '12px', background: 'var(--gradient-gold)', color: 'white', fontWeight: '700', boxShadow: '0 4px 10px rgba(234, 88, 12, 0.3)' }}>Register</Link>
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
              Welcome Back.<br />Continue<br />
              <span style={{ color: '#d97706' }}>Securely.</span>
            </h1>
            <p className="mb-4" style={{ fontSize: '0.9rem', maxWidth: '300px', margin: '0 auto' }}>Login to your Islamic Profit Limited account to manage your portfolio and view updates.</p>
          </div>

          {/* Middle Section (Form) */}
          <div style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Login Account</h2>
            <p style={{ fontSize: '0.85rem', marginBottom: '24px', color: 'var(--text-muted)' }}>Enter your credentials to access your account.</p>
            
            <div className="input-group">
              <User className="input-icon" size={20} />
              <input type="text" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            
            <div className="input-group mb-2">
              <Lock className="input-icon" size={20} />
              <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
              <div onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Eye className="input-action" size={20} color={showPassword ? '#d97706' : '#9ca3af'} />
              </div>
            </div>
            
            <div className="flex-between mb-4" style={{ fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                <Shield size={14} color="#10b981" /> Secure member login
              </div>
              <a href="#" onClick={(e) => { e.preventDefault(); alert('Please contact Admin via WhatsApp to reset your password.'); }} style={{ color: '#d97706', fontWeight: '600', textDecoration: 'none' }}>Forgot Password?</a>
            </div>
            
            <button onClick={handleLogin} className="btn btn-primary" style={{ width: '100%', padding: '16px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(217,119,6,0.3)' }}>Login Account</button>
            
            <div className="text-center mt-4">
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Don't have an account? </span>
              <Link to="/register" style={{ fontSize: '0.85rem', fontWeight: '600', color: '#d97706', textDecoration: 'none' }}>Create New Account</Link>
            </div>
            
            <div className="text-center mt-4" style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <Lock size={14} /> End-to-end encrypted connection
            </div>
          </div>

          {/* Bottom Section (Icon & Pills) */}
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '100px', height: '100px', background: 'var(--gradient-gold)', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 10px 30px rgba(217,119,6,0.3)' }}>
                <Fingerprint size={50} strokeWidth={1.5} />
              </div>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.7)', padding: '8px 12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                <Lock size={14} color="#d97706" /> Wallet Access
              </div>
              <div style={{ background: 'rgba(255,255,255,0.7)', padding: '8px 12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                <LayoutDashboard size={14} color="#f59e0b" /> Live Overview
              </div>
              <div style={{ background: 'rgba(255,255,255,0.7)', padding: '8px 12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                <User size={14} color="#ea580c" /> Secure Access
              </div>
            </div>
          </div>

        </div>
        
        {/* Soft Notification */}
        <div style={{ marginTop: '30px', background: 'rgba(255,255,255,0.5)', padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: '#4b5563' }}>
          <div style={{ background: '#e0e7ff', color: '#4338ca', padding: '6px', borderRadius: '50%' }}><Info size={16} /></div>
          <div>Please ensure you are on the correct domain <b>yourdomain.com</b> before entering your credentials.</div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-between" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0 10px' }}>
        <div>© 2026 Islamic Profit Limited.</div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
          <Link to="/register" style={{ color: 'inherit', textDecoration: 'none' }}>Register</Link>
        </div>
      </div>

    </div>
  );
};

export default LoginPage;
