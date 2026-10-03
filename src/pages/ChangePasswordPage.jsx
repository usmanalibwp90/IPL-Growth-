import React, { useState } from 'react';
import { ArrowLeft, Key, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleShow = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, handle password change logic here
    alert("Password successfully updated!");
    navigate('/profile');
  };

  return (
    <div className="page-transition" style={{ padding: '10px', paddingBottom: '100px', maxWidth: 'var(--max-width)', margin: '0 auto' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '24px' }}>
        <div onClick={() => navigate(-1)} style={{ width: '45px', height: '45px', borderRadius: '14px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
           <ArrowLeft size={20} color="var(--text-dark)" />
        </div>
        <div>
           <h1 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-dark)', fontWeight: '800' }}>Change Password</h1>
           <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Update your account security</p>
        </div>
      </div>

      <div className="glass-card mb-4" style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 5px 15px rgba(0,0,0,0.03)' }}>
        <div className="flex-center mb-4" style={{ flexDirection: 'column', textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <Key size={30} />
          </div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 8px 0', color: 'var(--text-dark)' }}>Create New Password</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Your new password must be different from previous used passwords.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Current Password */}
          <div className="input-group">
            <Lock className="input-icon" size={18} />
            <input 
              type={showPassword.current ? "text" : "password"} 
              name="currentPassword"
              placeholder="Current Password" 
              value={formData.currentPassword}
              onChange={handleChange}
              required
            />
            <div className="input-action" onClick={() => toggleShow('current')}>
              {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
          </div>

          {/* New Password */}
          <div className="input-group">
            <Lock className="input-icon" size={18} />
            <input 
              type={showPassword.new ? "text" : "password"} 
              name="newPassword"
              placeholder="New Password" 
              value={formData.newPassword}
              onChange={handleChange}
              required
            />
            <div className="input-action" onClick={() => toggleShow('new')}>
              {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
          </div>

          {/* Confirm Password */}
          <div className="input-group mb-4">
            <Lock className="input-icon" size={18} />
            <input 
              type={showPassword.confirm ? "text" : "password"} 
              name="confirmPassword"
              placeholder="Confirm New Password" 
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <div className="input-action" onClick={() => toggleShow('confirm')}>
              {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Update Password
          </button>
        </form>
      </div>

    </div>
  );
};

export default ChangePasswordPage;
