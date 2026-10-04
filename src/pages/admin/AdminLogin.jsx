import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    let validEmail = 'info@iplgrowth.online';
    let validPassword = 'Usman@li786';
    
    const savedCreds = localStorage.getItem('admin_credentials');
    if (savedCreds) {
      const parsedCreds = JSON.parse(savedCreds);
      validEmail = parsedCreds.email;
      validPassword = parsedCreds.password;
    }

    if (email === validEmail && password === validPassword) {
      localStorage.setItem('adminToken', 'true');
      navigate('/admin');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img src="/logo.jpg" alt="Logo" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', marginBottom: '16px' }} />
          <h2 style={{ margin: 0, color: 'var(--text-dark)', fontSize: '1.5rem', fontWeight: '800' }}>Admin Login</h2>
          <p style={{ margin: '8px 0 0', color: 'var(--text-muted)' }}>Enter your credentials to access the admin panel</p>
        </div>

        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px', textAlign: 'center', fontWeight: '600' }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)' }}>Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)' }}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
              required
            />
          </div>
          <button type="submit" style={{ background: 'var(--gradient-gold)', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', marginTop: '8px' }}>
            Login to Admin
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
