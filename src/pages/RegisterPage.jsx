import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, Shield, Key, LayoutDashboard, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../config';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const isGmailValid = (addr) => {
    return /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(addr.trim());
  };

  const handleMobileChange = (e) => {
    let val = e.target.value.replace(/\D/g, ''); // only digits
    if (val.startsWith('92')) {
      val = val.slice(2);
    }
    if (val.startsWith('0')) {
      val = val.slice(1);
    }
    if (val.length > 10) {
      val = val.slice(0, 10);
    }
    setMobileNumber(val);
    if (errorMsg) setErrorMsg('');
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '#9ca3af' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[a-zA-Z]/.test(pwd)) score += 0.5;
    if (/\d/.test(pwd)) score += 0.5;
    if (/[^a-zA-Z0-9]/.test(pwd) || (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd))) score += 1;

    if (pwd.length < 8) {
      return { score: 1, label: 'Too short (min. 8 characters)', color: '#ef4444' };
    }
    if (!/[a-zA-Z]/.test(pwd) || !/\d/.test(pwd)) {
      return { score: 1, label: 'Weak: Add letters & numbers', color: '#f59e0b' };
    }
    if (score >= 3) {
      return { score: 3, label: 'Strong password ✓', color: '#10b981' };
    }
    return { score: 2, label: 'Good password', color: '#3b82f6' };
  };

  const strength = getPasswordStrength(password);

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (!isGmailValid(trimmedEmail)) {
      setErrorMsg('Only valid @gmail.com addresses are allowed (must end with @gmail.com).');
      return;
    }

    if (mobileNumber.length !== 10) {
      setErrorMsg('Mobile number must be exactly 10 digits after +92 (e.g. 3001234567).');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter a password.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long (kam az kam 8 characters).');
      return;
    }

    if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      setErrorMsg('Password strong banayein: isme letters aur numbers dono shamil karein.');
      return;
    }

    const fullMobile = `+92${mobileNumber}`;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: username.trim(), 
          mobile: fullMobile, 
          email: trimmedEmail.toLowerCase(), 
          password 
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setErrorMsg(data.error || 'Registration failed.');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setErrorMsg('Network error connecting to database.');
    } finally {
      setLoading(false);
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
            <p style={{ fontSize: '0.85rem', marginBottom: '20px', color: 'var(--text-muted)' }}>Enter your details to create a new member profile.</p>

            {errorMsg && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                padding: '12px 14px',
                borderRadius: '14px',
                fontSize: '0.85rem',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}
            
            <div className="input-group">
              <User className="input-icon" size={20} />
              <input 
                type="text" 
                placeholder="Full Name" 
                value={username} 
                onChange={e => {
                  setUsername(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }} 
              />
            </div>

            <div className="input-group" style={{ position: 'relative' }}>
              <Mail className="input-icon" size={20} />
              <input 
                type="email" 
                placeholder="example@gmail.com" 
                value={email} 
                onChange={e => {
                  setEmail(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }} 
                style={{
                  paddingRight: email ? '135px' : '20px'
                }}
              />
              {email && (
                <span style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: isGmailValid(email) ? '#10b981' : '#ef4444'
                }}>
                  {isGmailValid(email) ? '✓ Valid Gmail' : 'Must be @gmail.com'}
                </span>
              )}
            </div>
            
            <div className="input-group" style={{ position: 'relative' }}>
              <Phone className="input-icon" size={20} />
              <div style={{
                position: 'absolute',
                left: '46px',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: '700',
                color: '#111827',
                fontSize: '0.95rem',
                borderRight: '1.5px solid #e5e7eb',
                paddingRight: '8px',
                height: '24px',
                userSelect: 'none'
              }}>
                <span>🇵🇰</span> +92
              </div>
              <input 
                type="tel" 
                placeholder="3001234567" 
                value={mobileNumber} 
                onChange={handleMobileChange} 
                maxLength={10}
                style={{ paddingLeft: '115px', letterSpacing: '0.5px' }}
              />
              <span style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: mobileNumber.length === 10 ? '#10b981' : '#9ca3af'
              }}>
                {mobileNumber.length}/10
              </span>
            </div>
            
            <div className="input-group" style={{ marginBottom: password ? '8px' : '1rem' }}>
              <Lock className="input-icon" size={20} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password (min. 8 characters)" 
                value={password} 
                onChange={e => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }} 
              />
              <div onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                {showPassword ? (
                  <EyeOff className="input-action" size={20} color="#d97706" />
                ) : (
                  <Eye className="input-action" size={20} color="#9ca3af" />
                )}
              </div>
            </div>

            {password && (
              <div style={{ marginBottom: '1.2rem', marginTop: '-4px', padding: '0 4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '0.75rem' }}>
                  <span style={{ color: '#6b7280' }}>Password Strength:</span>
                  <span style={{ fontWeight: '700', color: strength.color }}>{strength.label}</span>
                </div>
                <div style={{ display: 'flex', gap: '4px', height: '4px' }}>
                  <div style={{ flex: 1, borderRadius: '2px', background: strength.score >= 1 ? strength.color : '#e5e7eb', transition: 'all 0.3s' }}></div>
                  <div style={{ flex: 1, borderRadius: '2px', background: strength.score >= 2 ? strength.color : '#e5e7eb', transition: 'all 0.3s' }}></div>
                  <div style={{ flex: 1, borderRadius: '2px', background: strength.score >= 3 ? strength.color : '#e5e7eb', transition: 'all 0.3s' }}></div>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '6px' }}>
                  Tip: Kam az kam 8 characters, jin mein letters aur numbers dono hon.
                </div>
              </div>
            )}
            
            <button 
              onClick={handleRegister} 
              disabled={loading}
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '10px', padding: '16px', borderRadius: '16px', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Registering...' : 'Register Account'}
            </button>
            
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
