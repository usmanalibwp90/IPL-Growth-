import React, { useState, useEffect } from 'react';
import { Save, Shield, Bell, Smartphone, Globe, Users, MessageSquare, CheckCircle, LayoutTemplate } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const AdminSettings = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  
  const [adminCredentials, setAdminCredentials] = useState({
    email: 'info@iplgrowth.online',
    password: 'Usman@li786'
  });
  
  // General Config State
  const [generalConfig, setGeneralConfig] = useState({
    siteName: 'IPL Growth',
    supportEmail: 'support@iplgrowth.com',
    whatsappNumber: '+92 300 1234567',
    telegramLink: 't.me/iplgrowth',
    currencySymbol: 'Rs',
    themeColor: '#f59e0b',
    signupBonus: '50'
  });
  
  const [homeConfig, setHomeConfig] = useState({
    heroTagline: 'Welcome to IPL Growth',
    heroTitle1: 'Islamic Profit',
    heroTitle2: 'Limited.',
    heroSubtitle: 'Experience the premium way to grow your digital assets securely and instantly.',
    supportTagline: 'SUPPORT • ASSISTANCE • TRUST',
    supportTitle: 'Need Help?',
    whatsappNumber: '+923001234567',
    whatsappIcon: '',
    whatsappChannel: 'https://whatsapp.com/channel/xxx',
    whatsappChannelIcon: '',
    telegramChannel: 't.me/iplgrowth',
    telegramIcon: ''
  });

  const [adminMessage, setAdminMessage] = useState({
    title: 'Important Update',
    text: '',
    isActive: false
  });

  const [notification, setNotification] = useState({ show: false, message: '' });

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.maintenance_mode) setMaintenanceMode(data.maintenance_mode === 'true');
        if (data.general_config) setGeneralConfig(JSON.parse(data.general_config));
        if (data.home_config) setHomeConfig(JSON.parse(data.home_config));
        if (data.admin_credentials) setAdminCredentials(JSON.parse(data.admin_credentials));
        if (data.admin_notification_message) setAdminMessage(JSON.parse(data.admin_notification_message));
      })
      .catch(err => console.error('Failed to load settings', err));
  }, []);

  const handleMaintenanceToggle = () => {
    const newVal = !maintenanceMode;
    setMaintenanceMode(newVal);
  };

  const handleConfigChange = (e) => {
    setGeneralConfig({
      ...generalConfig,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = (e, key) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHomeConfig({ ...homeConfig, [key]: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveGeneralConfig = () => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    fetch(`${API_BASE_URL}/api/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        maintenance_mode: maintenanceMode.toString(),
        general_config: JSON.stringify(generalConfig),
        home_config: JSON.stringify(homeConfig),
        admin_credentials: JSON.stringify(adminCredentials),
        admin_notification_message: JSON.stringify(adminMessage)
      })
    })
    .then(res => res.json())
    .then(() => {
      setNotification({ show: true, message: 'Settings saved successfully' });
      setTimeout(() => setNotification({ show: false, message: '' }), 3000);
    })
    .catch(err => console.error('Failed to save settings', err));
    
    setNotification({ show: true, message: 'Settings updated successfully!' });
    setTimeout(() => {
      setNotification({ show: false, message: '' });
    }, 3000);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '1.8rem', color: 'var(--text-dark)', fontWeight: '900' }}>Platform Settings</h1>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>Configure global settings for {generalConfig.siteName}.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        

        {/* Admin Credentials Settings */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #f1f5f9', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <Users size={24} color="var(--primary-gold)" />
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-dark)', fontWeight: '800' }}>Admin Credentials</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Admin Email</label>
              <input value={adminCredentials.email} onChange={(e) => setAdminCredentials({...adminCredentials, email: e.target.value})} type="email" style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', fontWeight: '600', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Admin Password</label>
              <input value={adminCredentials.password} onChange={(e) => setAdminCredentials({...adminCredentials, password: e.target.value})} type="text" style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', fontWeight: '600', outline: 'none' }} />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #f1f5f9', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <Shield size={24} color="var(--primary-gold)" />
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-dark)', fontWeight: '800' }}>Security & Maintenance</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #f1f5f9', borderRadius: '12px', background: '#f8fafc' }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: 'var(--text-dark)', fontWeight: '800' }}>Maintenance Mode</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Disable access to the platform for all users except admins.</p>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                <input type="checkbox" checked={maintenanceMode} onChange={handleMaintenanceToggle} style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: maintenanceMode ? '#f59e0b' : '#cbd5e1', borderRadius: '34px', transition: '.4s' }}>
                  <span style={{ position: 'absolute', content: '""', height: '18px', width: '18px', left: maintenanceMode ? '23px' : '3px', bottom: '3px', backgroundColor: 'white', borderRadius: '50%', transition: '.4s' }}></span>
                </span>
              </label>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #f1f5f9', borderRadius: '12px', background: '#f8fafc' }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: 'var(--text-dark)', fontWeight: '800' }}>Force Email Verification</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Users must verify email before depositing/withdrawing.</p>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#10b981', borderRadius: '34px', transition: '.4s' }}>
                  <span style={{ position: 'absolute', content: '""', height: '18px', width: '18px', left: '23px', bottom: '3px', backgroundColor: 'white', borderRadius: '50%', transition: '.4s' }}></span>
                </span>
              </label>
            </div>

            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #f1f5f9', borderRadius: '12px', background: '#f8fafc' }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: 'var(--text-dark)', fontWeight: '800' }}>Clear Test/Demo Data</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Removes all dummy deposits, withdrawals, and referral data from local storage.</p>
              </div>
              <button onClick={() => {
                if (window.confirm('Are you sure you want to clear all test/demo data?')) {
                  localStorage.removeItem('withdraw_history');
                  localStorage.removeItem('deposit_history');
                  localStorage.removeItem('commission_users');
                  localStorage.removeItem('ipl_transactions');
                  alert('Demo data cleared! Please refresh the page to see real-time data.');
                }
              }} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#fee2e2', color: '#dc2626', fontWeight: '800', cursor: 'pointer' }}>
                Clear Demo Data
              </button>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #f1f5f9', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <Bell size={24} color="var(--primary-gold)" />
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-dark)', fontWeight: '800' }}>Global Notification to Customers</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #f1f5f9', borderRadius: '12px', background: '#f8fafc' }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: 'var(--text-dark)', fontWeight: '800' }}>Enable Notification</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Show this notification on the user dashboard when they click the bell.</p>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                <input type="checkbox" checked={adminMessage.isActive} onChange={() => setAdminMessage({...adminMessage, isActive: !adminMessage.isActive})} style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: adminMessage.isActive ? '#10b981' : '#cbd5e1', borderRadius: '34px', transition: '.4s' }}>
                  <span style={{ position: 'absolute', content: '""', height: '18px', width: '18px', left: adminMessage.isActive ? '23px' : '3px', bottom: '3px', backgroundColor: 'white', borderRadius: '50%', transition: '.4s' }}></span>
                </span>
              </label>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Notification Title</label>
              <input value={adminMessage.title} onChange={(e) => setAdminMessage({...adminMessage, title: e.target.value})} type="text" placeholder="e.g. Server Update" style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', fontWeight: '600', outline: 'none' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Notification Message</label>
              <textarea value={adminMessage.text} onChange={(e) => setAdminMessage({...adminMessage, text: e.target.value})} rows="4" placeholder="Type the message that will be shown to customers..." style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', fontWeight: '600', outline: 'none', resize: 'vertical' }}></textarea>
            </div>
          </div>
        </div>

        {/* Homepage Content Editor */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #f1f5f9', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <LayoutTemplate size={24} color="var(--primary-gold)" />
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-dark)', fontWeight: '800' }}>Homepage Content Editor</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Hero Tagline</label>
              <input name="heroTagline" value={homeConfig.heroTagline} onChange={(e) => setHomeConfig({...homeConfig, heroTagline: e.target.value})} type="text" style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', fontWeight: '600', outline: 'none' }} />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Hero Title (Part 1)</label>
                <input name="heroTitle1" value={homeConfig.heroTitle1} onChange={(e) => setHomeConfig({...homeConfig, heroTitle1: e.target.value})} type="text" style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', fontWeight: '600', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Hero Title (Part 2 - Highlighted)</label>
                <input name="heroTitle2" value={homeConfig.heroTitle2} onChange={(e) => setHomeConfig({...homeConfig, heroTitle2: e.target.value})} type="text" style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', fontWeight: '600', outline: 'none' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Hero Subtitle</label>
              <textarea name="heroSubtitle" value={homeConfig.heroSubtitle} onChange={(e) => setHomeConfig({...homeConfig, heroSubtitle: e.target.value})} rows="3" style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', fontWeight: '600', outline: 'none', resize: 'vertical' }}></textarea>
            </div>
          </div>
          
          <div style={{ height: '1px', background: '#e2e8f0', margin: '32px 0' }}></div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <MessageSquare size={24} color="var(--primary-gold)" />
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-dark)', fontWeight: '800' }}>Support Section Editor</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Support Tagline</label>
                <input name="supportTagline" value={homeConfig.supportTagline} onChange={(e) => setHomeConfig({...homeConfig, supportTagline: e.target.value})} type="text" style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', fontWeight: '600', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Support Title</label>
                <input name="supportTitle" value={homeConfig.supportTitle} onChange={(e) => setHomeConfig({...homeConfig, supportTitle: e.target.value})} type="text" style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', fontWeight: '600', outline: 'none' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Support Description</label>
              <textarea name="supportDescription" value={homeConfig.supportDescription} onChange={(e) => setHomeConfig({...homeConfig, supportDescription: e.target.value})} rows="3" style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', fontWeight: '600', outline: 'none', resize: 'vertical' }}></textarea>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--text-dark)' }}>Support Option 1</h4>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '4px' }}>WhatsApp Number</label>
                <input name="whatsappNumber" value={homeConfig.whatsappNumber} onChange={(e) => setHomeConfig({...homeConfig, whatsappNumber: e.target.value})} type="text" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem', outline: 'none', marginBottom: '12px' }} />
                
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '4px' }}>Upload Icon (Optional)</label>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'whatsappIcon')} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.8rem' }} />
                {homeConfig.whatsappIcon && <div style={{marginTop: '8px'}}><img src={homeConfig.whatsappIcon} alt="Preview" style={{width: '32px', height: '32px', objectFit: 'contain'}} /></div>}
              </div>

              <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--text-dark)' }}>Support Option 2</h4>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '4px' }}>WhatsApp Channel Link</label>
                <input name="whatsappChannel" value={homeConfig.whatsappChannel} onChange={(e) => setHomeConfig({...homeConfig, whatsappChannel: e.target.value})} type="text" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem', outline: 'none', marginBottom: '12px' }} />
                
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '4px' }}>Upload Icon (Optional)</label>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'whatsappChannelIcon')} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.8rem' }} />
                {homeConfig.whatsappChannelIcon && <div style={{marginTop: '8px'}}><img src={homeConfig.whatsappChannelIcon} alt="Preview" style={{width: '32px', height: '32px', objectFit: 'contain'}} /></div>}
              </div>
            </div>
          </div>
          
          <button onClick={saveGeneralConfig} style={{ marginTop: '32px', padding: '12px 24px', background: 'var(--text-dark)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
            <Save size={16} /> Save Content
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {notification.show && (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', background: 'white', borderLeft: `4px solid #16a34a`, padding: '16px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', zIndex: 9999, animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <div style={{ color: '#16a34a', display: 'flex' }}>
            <CheckCircle size={24} />
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-dark)' }}>
            {notification.message}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default AdminSettings;
