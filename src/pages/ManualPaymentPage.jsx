import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Info, Clock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const ManualPaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { plan, gateway } = location.state || { plan: { price: 'Rs325' }, gateway: 'easypaisa' };
  
  const [trxId, setTrxId] = useState('');
  const [file, setFile] = useState(null);
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes in seconds
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (timeLeft <= 0) {
      setToastMessage('Payment session expired. Please try again.');
      setTimeout(() => navigate('/plans'), 2500);
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, navigate]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return { m, s };
  };

  const { m, s } = formatTime(timeLeft);

  // Example Admin Gateway Details
  const saved = localStorage.getItem('payment_gateways');
  const defaultGateways = [
    { type: 'easypaisa', accountNumber: '03083859194', accountName: 'HAMEEDA BIBI', logo: 'e', color: '#22c55e', bg: '#dcfce7' },
    { type: 'jazzcash', accountNumber: '03011234567', accountName: 'ALI RAZA', logo: 'J', color: '#f43f5e', bg: '#ffe4e6' },
    { type: 'bank', accountNumber: '0123456789', accountName: 'Bank', logo: 'B', color: '#3b82f6', bg: '#eff6ff' }
  ];
  
  let allGateways = defaultGateways;
  if (saved) {
    const parsed = JSON.parse(saved);
    allGateways = parsed.map(g => ({
      type: g.type,
      accountNumber: g.accountNumber,
      accountName: g.accountName,
      logo: g.type === 'easypaisa' ? 'e' : g.type === 'jazzcash' ? 'J' : 'B',
      iconImage: g.iconImage || null,
      color: g.type === 'easypaisa' ? '#22c55e' : g.type === 'jazzcash' ? '#f43f5e' : '#3b82f6',
      bg: g.type === 'easypaisa' ? '#dcfce7' : g.type === 'jazzcash' ? '#ffe4e6' : '#eff6ff'
    }));
  }

  const details = allGateways.find(g => g.type === gateway) || allGateways[0];
  const amountStr = plan.price.replace('Rs', '') + '.00 PKR';

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setToastMessage('Copied to clipboard!');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newDeposit = {
      id: `DEP-${Math.floor(1000 + Math.random() * 9000)}`,
      user: 'Current User', 
      amount: parseInt(amountStr.replace(/[^0-9]/g, '')),
      method: gateway,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: 'Pending',
      receipt: file ? file.name : 'No file',
      trxId: trxId
    };
    
    const existingDeposits = JSON.parse(localStorage.getItem('deposit_history') || '[]');
    localStorage.setItem('deposit_history', JSON.stringify([newDeposit, ...existingDeposits]));

    setToastMessage('Payment proof submitted successfully! Waiting for admin approval.');
    setTimeout(() => {
      setToastMessage(null);
      navigate('/dashboard');
    }, 2500);
  };

  return (
    <div className="page-transition" style={{ padding: '10px', paddingBottom: '100px', maxWidth: 'var(--max-width)', margin: '0 auto', background: '#f0fdf4', minHeight: '100vh', position: 'relative' }}>
      
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--gradient-gold)',
          color: 'white',
          padding: '16px 20px',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(245, 158, 11, 0.4)',
          zIndex: 9999,
          fontWeight: '700',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          width: '90%',
          maxWidth: '400px',
          border: '1px solid rgba(255,255,255,0.3)',
        }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <span style={{ lineHeight: '1.4', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '24px' }}>
        <div onClick={() => navigate(-1)} style={{ width: '45px', height: '45px', borderRadius: '14px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
           <ArrowLeft size={20} color="var(--text-dark)" />
        </div>
        <div>
           <h1 style={{ margin: 0, fontSize: '1.2rem', color: '#166534', fontWeight: '900' }}>Islamic Profit Limited</h1>
           <p style={{ margin: '2px 0 0 0', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>Manual Payment</p>
        </div>
      </div>

      {/* Manual Payment Intro */}
      <div className="glass-card mb-3" style={{ background: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#064e3b', margin: '0 0 8px 0' }}>Manual Payment Wallet</h2>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', lineHeight: 1.5, margin: 0 }}>
          Send the exact gateway amount using the Admin payment details below, then submit the required transaction reference and payment proof.
        </p>
      </div>

      {/* Selected Gateway Info */}
      <div className="glass-card mb-3" style={{ background: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: details.iconImage ? 'transparent' : details.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: details.color, fontSize: '1.5rem', fontWeight: '900', border: details.iconImage ? 'none' : `2px solid ${details.color}`, flexShrink: 0, overflow: 'hidden' }}>
              {details.iconImage ? (
                <img src={details.iconImage} alt={details.type} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                details.logo
              )}
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>Selected Gateway</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#064e3b', textTransform: 'uppercase' }}>{gateway}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700' }}>PKR Payment Gateway</div>
            </div>
          </div>

          {/* Small Circular Timer */}
          <div style={{ 
            width: '75px', 
            height: '75px', 
            borderRadius: '50%', 
            background: '#fffbeb',
            border: '3px solid var(--primary-gold)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(245, 158, 11, 0.1)',
            flexShrink: 0
          }}>
            <div style={{
              position: 'absolute',
              top: '3px', bottom: '3px', left: '3px', right: '3px',
              borderRadius: '50%',
              border: '1px dashed rgba(245, 158, 11, 0.5)',
              pointerEvents: 'none'
            }}></div>
            
            <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Clock size={12} color="#ea580c" style={{ marginBottom: '2px' }} />
              <div style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--text-dark)', lineHeight: '1', fontFamily: 'monospace' }}>
                {m}:{s}
              </div>
            </div>
          </div>

        </div>
        <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Gateway Amount</span>
          <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#b45309' }}>{amountStr}</span>
        </div>
      </div>

      {/* Payment Information */}
      <div className="glass-card mb-3" style={{ background: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#064e3b', margin: '0 0 4px 0' }}>Payment Information</h2>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '16px' }}>These values are loaded from the selected manual gateway configured by Admin.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'relative' }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Account Number</div>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-dark)' }}>{details.accountNumber}</div>
            <button onClick={() => copyToClipboard(details.accountNumber)} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: '#fef3c7', border: 'none', width: '28px', height: '28px', borderRadius: '6px', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Copy size={14} />
            </button>
          </div>

          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'relative' }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Account Name</div>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-dark)' }}>{details.accountName}</div>
            <button onClick={() => copyToClipboard(details.accountName)} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: '#fef3c7', border: 'none', width: '28px', height: '28px', borderRadius: '6px', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Copy size={14} />
            </button>
          </div>

          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Gateway</div>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-dark)', textTransform: 'uppercase' }}>{gateway}</div>
          </div>

          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Pay Amount</div>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-dark)' }}>{amountStr}</div>
          </div>
        </div>
      </div>

      {/* Submit Payment */}
      <div className="glass-card mb-4" style={{ background: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#064e3b', margin: '0 0 4px 0' }}>Submit Payment</h2>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '16px' }}>Complete all fields created in the Admin manual gateway form.</p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Transaction ID / Reference Number</label>
            <input 
              type="text" 
              placeholder="Enter transaction ID / reference" 
              required
              value={trxId}
              onChange={(e) => setTrxId(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.85rem', outline: 'none' }} 
            />
          </div>

          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Screenshot</label>
            <div style={{ border: '1px solid #e2e8f0', background: '#fdf8f6', borderRadius: '12px', padding: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label htmlFor="proof-upload" style={{ background: '#e2e8f0', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', color: 'var(--text-dark)' }}>
                Choose file
              </label>
              <span style={{ fontSize: '0.75rem', color: file ? 'var(--text-dark)' : 'var(--text-muted)', fontWeight: '600', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {file ? file.name : 'No file chosen'}
              </span>
              <input 
                id="proof-upload" 
                type="file" 
                accept="image/png, image/jpeg, image/webp" 
                onChange={(e) => setFile(e.target.files[0])}
                style={{ display: 'none' }}
                required
              />
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Info size={12} /> Supported mimes: jpg, jpeg, png, webp
            </div>
          </div>

          <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '12px', marginBottom: '16px', fontSize: '0.7rem', color: '#92400e', fontWeight: '700', lineHeight: 1.4 }}>
            Upload the payment screenshot/proof requested by the Admin gateway form. The existing backend validation still controls allowed file types and size.
          </div>

          <button type="submit" style={{ width: '100%', background: 'linear-gradient(to bottom, #fde047, #f59e0b)', color: '#78350f', border: 'none', padding: '16px', borderRadius: '12px', fontSize: '0.95rem', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)' }}>
            Submit Payment
          </button>
        </form>
      </div>

    </div>
  );
};

export default ManualPaymentPage;
