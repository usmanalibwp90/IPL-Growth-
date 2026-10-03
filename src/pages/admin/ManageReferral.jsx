import React, { useState, useEffect } from 'react';
import { Save, Users, CheckCircle, Clock, AlertCircle, X } from 'lucide-react';

const defaultSettings = {
  level1: 16,
  level2: 4,
  level3: 1,
  inviteText: 'Share your link with friends. When they invest, you earn up to {level1}% commission instantly!',
  minTransferAmount: 500,
  transferCooldownDays: 7
};

const dummyUsers = [
  { id: 1, username: 'ali_raza99', totalReferrals: 12, totalEarned: 15000, unpaidCommission: 2500 },
  { id: 2, username: 'usman_khan', totalReferrals: 5, totalEarned: 4000, unpaidCommission: 0 },
  { id: 3, username: 'sara_khan', totalReferrals: 28, totalEarned: 45000, unpaidCommission: 12000 },
  { id: 4, username: 'zain_ahmed', totalReferrals: 2, totalEarned: 1000, unpaidCommission: 1000 },
];

const ManageReferral = () => {
  const [activeTab, setActiveTab] = useState('settings');
  const [settings, setSettings] = useState(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [usersList, setUsersList] = useState(dummyUsers);

  // Custom UI States
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ show: false, userId: null });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  useEffect(() => {
    const saved = localStorage.getItem('referral_settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
    const savedUsers = localStorage.getItem('commission_users');
    if (savedUsers) {
      setUsersList(JSON.parse(savedUsers));
    } else {
      localStorage.setItem('commission_users', JSON.stringify(dummyUsers));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    localStorage.setItem('referral_settings', JSON.stringify(settings));
    setTimeout(() => {
      setIsSaving(false);
      showNotification('Referral and commission settings saved successfully!', 'success');
    }, 500);
  };

  const initiatePay = (userId) => {
    setConfirmDialog({ show: true, userId });
  };

  const confirmPay = () => {
    const userId = confirmDialog.userId;
    const updatedList = usersList.map(u => {
      if (u.id === userId) {
        return { ...u, unpaidCommission: 0 };
      }
      return u;
    });
    setUsersList(updatedList);
    localStorage.setItem('commission_users', JSON.stringify(updatedList));
    setConfirmDialog({ show: false, userId: null });
    showNotification('Commission paid successfully!', 'success');
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--gradient-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <Users size={24} />
        </div>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '1.8rem', color: 'var(--text-dark)', fontWeight: '900' }}>Team & Commission</h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>Manage referral levels and pay user commissions.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button 
          onClick={() => setActiveTab('settings')}
          style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: activeTab === 'settings' ? 'var(--text-dark)' : '#f8fafc', color: activeTab === 'settings' ? 'white' : 'var(--text-dark)', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          Commission Settings
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: activeTab === 'users' ? 'var(--text-dark)' : '#f8fafc', color: activeTab === 'users' ? 'white' : 'var(--text-dark)', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          User Commissions
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
        
        {activeTab === 'settings' && (
          <form onSubmit={handleSave}>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--text-dark)', fontWeight: '800', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>Commission Levels (%)</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Level 1 (%)</label>
                <input type="number" name="level1" value={settings.level1} onChange={handleChange} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', fontWeight: '700', outline: 'none' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Level 2 (%)</label>
                <input type="number" name="level2" value={settings.level2} onChange={handleChange} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', fontWeight: '700', outline: 'none' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Level 3 (%)</label>
                <input type="number" name="level3" value={settings.level3} onChange={handleChange} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', fontWeight: '700', outline: 'none' }} required />
              </div>
            </div>

            <h2 style={{ fontSize: '1.2rem', color: 'var(--text-dark)', fontWeight: '800', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>Transfer Rules</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '32px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Minimum Transfer Amount (Rs)</label>
                <input type="number" name="minTransferAmount" value={settings.minTransferAmount || 0} onChange={handleChange} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', fontWeight: '700', outline: 'none' }} required />
                <p style={{ margin: '6px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Users must have at least this amount to transfer.</p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Transfer Cooldown (Days)</label>
                <input type="number" name="transferCooldownDays" value={settings.transferCooldownDays || 0} onChange={handleChange} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', fontWeight: '700', outline: 'none' }} required />
                <p style={{ margin: '6px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Wait time between transfers (e.g. 7 for weekly).</p>
              </div>
            </div>

            <h2 style={{ fontSize: '1.2rem', color: 'var(--text-dark)', fontWeight: '800', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>Promotional Text</h2>
            
            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Invite Friends Text</label>
              <textarea name="inviteText" value={settings.inviteText} onChange={handleChange} rows="3" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', fontWeight: '600', outline: 'none', resize: 'none', fontFamily: 'inherit' }} required></textarea>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Use <b>{`{level1}`}</b> in the text to automatically show the Level 1 percentage.</p>
            </div>

            <button type="submit" disabled={isSaving} style={{ width: '100%', padding: '16px', background: 'var(--gradient-gold)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '900', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Save size={20} />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        )}

        {activeTab === 'users' && (
          <div>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--text-dark)', fontWeight: '800', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>User Commissions</h2>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Username</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Referrals</th>
                    <th style={{ padding: '16px', textAlign: 'right', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Earned</th>
                    <th style={{ padding: '16px', textAlign: 'right', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Unpaid Amount</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((user) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '16px', fontWeight: '700', color: 'var(--text-dark)' }}>{user.username}</td>
                      <td style={{ padding: '16px', textAlign: 'center', fontWeight: '800', color: '#3b82f6' }}>{user.totalReferrals}</td>
                      <td style={{ padding: '16px', textAlign: 'right', fontWeight: '800', color: '#10b981' }}>Rs{user.totalEarned.toLocaleString()}</td>
                      <td style={{ padding: '16px', textAlign: 'right', fontWeight: '900', color: user.unpaidCommission > 0 ? '#ef4444' : '#10b981' }}>
                        Rs{user.unpaidCommission.toLocaleString()}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        {user.unpaidCommission > 0 ? (
                          <button 
                            onClick={() => initiatePay(user.id)}
                            style={{ padding: '8px 16px', background: 'var(--gradient-gold)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          >
                            <Clock size={14} /> Pay Now
                          </button>
                        ) : (
                          <span style={{ padding: '8px 16px', background: '#dcfce7', color: '#16a34a', borderRadius: '8px', fontWeight: '800', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <CheckCircle size={14} /> Paid
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Admin Toast Notification */}
      {notification.show && (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', background: 'white', borderLeft: `4px solid ${notification.type === 'success' ? '#16a34a' : '#ef4444'}`, padding: '16px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', zIndex: 9999, animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <div style={{ color: notification.type === 'success' ? '#16a34a' : '#ef4444', display: 'flex' }}>
            {notification.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-dark)' }}>
            {notification.message}
          </div>
        </div>
      )}

      {/* Custom Confirm Dialog */}
      {confirmDialog.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '30px 24px', width: '100%', maxWidth: '340px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
              <AlertCircle size={30} />
            </div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', color: 'var(--text-dark)', fontWeight: '900' }}>Pay Commission?</h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600', lineHeight: '1.5' }}>
              Are you sure you want to mark this commission as Paid? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setConfirmDialog({ show: false, userId: null })}
                style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: 'var(--text-dark)', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmPay}
                style={{ flex: 1, padding: '12px', background: 'var(--gradient-gold)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer' }}
              >
                Yes, Pay
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default ManageReferral;
