import React from 'react';
import { ArrowLeft, Download, Smartphone, ShieldCheck, Bell, Zap, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AppDownloadPage = () => {
  const navigate = useNavigate();

  return (
    <div className="page-transition" style={{ padding: '10px', paddingBottom: '100px', maxWidth: 'var(--max-width)', margin: '0 auto' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <div onClick={() => navigate(-1)} style={{ width: '45px', height: '45px', borderRadius: '14px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
           <ArrowLeft size={20} color="var(--text-dark)" />
        </div>
        <div>
           <h1 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-dark)', fontWeight: '800' }}>App Download</h1>
           <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Get the official app for a better experience</p>
        </div>
      </div>

      {/* Main App Banner */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ width: '100px', height: '100px', borderRadius: '30px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 15px 35px rgba(245, 158, 11, 0.4)', marginBottom: '20px' }}>
          <Smartphone size={50} color="white" />
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-dark)', margin: '0 0 8px 0' }}>
          Islamic Profit
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', maxWidth: '250px', margin: '0 auto 20px auto', lineHeight: '1.5' }}>
          Download our Android application to manage your investments faster and more securely.
        </p>
        
        {/* Download Button */}
        <button 
          onClick={() => window.location.href = '/downloads/IPL-Growth.apk'}
          style={{ background: 'var(--gradient-gold)', color: 'white', border: 'none', padding: '16px 32px', borderRadius: '16px', fontSize: '1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(234, 88, 12, 0.3)', width: '100%', justifyContent: 'center' }}
        >
          <Download size={22} />
          Download APK Now
        </button>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', marginTop: '12px' }}>
          Version 1.0.0 • Size: 12 MB • Requires Android 6.0+
        </div>
      </div>

      {/* Features List */}
      <h3 style={{ fontSize: '1rem', margin: '0 0 16px 0', color: 'var(--text-dark)', fontWeight: '800' }}>Why use our App?</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="glass-card" style={{ padding: '16px', background: 'white', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '45px', height: '45px', borderRadius: '14px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Zap size={22} color="#16a34a" />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-dark)' }}>Lightning Fast</h4>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>Optimized for speed and smooth transitions.</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '16px', background: 'white', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '45px', height: '45px', borderRadius: '14px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Bell size={22} color="#d97706" />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-dark)' }}>Instant Notifications</h4>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>Get real-time updates on your earnings.</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '16px', background: 'white', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '45px', height: '45px', borderRadius: '14px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ShieldCheck size={22} color="#4f46e5" />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-dark)' }}>Bank-Grade Security</h4>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>Your data and investments are fully secured.</div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AppDownloadPage;
