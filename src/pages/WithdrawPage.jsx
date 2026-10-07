import React, { useState, useEffect } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const WithdrawPage = () => {
  const navigate = useNavigate();
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [gateways, setGateways] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [calculatedBalance, setCalculatedBalance] = useState(0);
  
  useEffect(() => {
    // Fetch gateways
    fetch(`${API_BASE_URL}/api/gateways/withdraw`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const active = data.map(g => {
            const parsedDetails = JSON.parse(g.details || '{}');
            return {
              id: g.id,
              name: g.name,
              icon: parsedDetails.iconImage || (g.name.toLowerCase().includes('easypaisa') ? '/easypaisa.png' : g.name.toLowerCase().includes('jazzcash') ? '/jazzcash.png' : 'https://cdn-icons-png.flaticon.com/512/2830/2830284.png'),
              min: `Rs${parsedDetails.minLimit || 10}.00`,
              max: `Rs${Number(parsedDetails.maxLimit || 1000000).toLocaleString()}.00`,
              fee: `Rs0.00 + ${parsedDetails.charge || 0}%`,
              originalData: parsedDetails
            };
          });
          setGateways(active);
        } else {
          setGateways([
            { id: 1, name: 'Jazz cash', icon: '/jazzcash.png', min: 'Rs10.00', max: 'Rs1,000,000.00', fee: 'Rs0.00 + 0.00%' },
            { id: 2, name: 'Easypaisa', icon: '/easypaisa.png', min: 'Rs10.00', max: 'Rs1,000,000.00', fee: 'Rs0.00 + 0.00%' },
            { id: 3, name: 'SADAPAY', icon: '/sadapay.png', min: 'Rs10.00', max: 'Rs10,000.00', fee: 'Rs0.00 + 0.00%' },
            { id: 4, name: 'NAYAPAY', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/JazzCash_logo.svg/512px-JazzCash_logo.svg.png', min: 'Rs10.00', max: 'Rs10,000.00', fee: 'Rs0.00 + 0.00%' },
            { id: 5, name: 'All bank', icon: 'https://cdn-icons-png.flaticon.com/512/2830/2830284.png', min: 'Rs10.00', max: 'Rs1,000,000.00', fee: 'Rs0.00 + 0.00%' },
          ]);
        }
      })
      .catch(err => {
          console.error("Failed to load gateways", err);
          setGateways([
            { id: 1, name: 'Jazz cash', icon: '/jazzcash.png', min: 'Rs10.00', max: 'Rs1,000,000.00', fee: 'Rs0.00 + 0.00%' },
            { id: 2, name: 'Easypaisa', icon: '/easypaisa.png', min: 'Rs10.00', max: 'Rs1,000,000.00', fee: 'Rs0.00 + 0.00%' }
          ]);
      });

    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    const rawUser = localStorage.getItem('user');
    if (rawUser && token) {
      const u = JSON.parse(rawUser);
      const userId = u.id || u.email;
      
      // Fetch dynamic balance
      Promise.all([
        fetch(`${API_BASE_URL}/api/user/status?id=${userId}`),
        fetch(`${API_BASE_URL}/api/withdrawals/user/${userId}`),
        fetch(`${API_BASE_URL}/api/transactions/user/${userId}`)
      ])
      .then(async ([statRes, withRes, transRes]) => {
        let dynamicBalance = 0;
        if (statRes.ok) {
           const s = await statRes.json();
           dynamicBalance = Number(s.balance || 0);
        }
        if (withRes.ok) {
          const withdrawals = await withRes.json();
          withdrawals.forEach(w => {
            if (w.status !== 'Rejected') {
              dynamicBalance -= parseFloat(String(w.amount).replace(/[^0-9.-]+/g, '')) || 0;
            }
          });
        }
        if (transRes.ok) {
          const profits = await transRes.json();
          profits.forEach(p => {
            if (p.type === 'profit') {
              dynamicBalance += parseFloat(String(p.amount).replace(/[^0-9.-]+/g, '')) || 0;
            }
          });
        }
        setCalculatedBalance(dynamicBalance);
      })
      .catch(err => console.error("Failed to fetch balance stats", err));
    }
  }, []);

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();

    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    const newTransaction = {
      id: `WID-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: u.id || u.email,
      user: u.name,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + `, ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
      amount: withdrawAmount,
      method: selectedGateway.name,
      accountDetails: `${accountName} / ${accountNumber}`,
      status: 'Pending',
      type: 'withdraw'
    };

    fetch(`${API_BASE_URL}/api/withdrawals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(newTransaction)
    }).catch(err => console.error('Failed to submit withdrawal', err));

    setToastMessage(`Withdrawal request of Rs${withdrawAmount} submitted successfully and is now Pending.`);
    
    setTimeout(() => {
      setToastMessage(null);
      setSelectedGateway(null);
      setWithdrawAmount('');
      setAccountNumber('');
      setAccountName('');
      navigate('/withdraw-history');
    }, 2500);
  };

  return (
    <div className="page-transition" style={{ padding: '10px', paddingBottom: '100px', maxWidth: 'var(--max-width)', margin: '0 auto', position: 'relative' }}>
      
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
           <div style={{ width: '45px', height: '45px', borderRadius: '10px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
             <img src="/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
           </div>
           <div>
             <h1 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-dark)', fontWeight: '800' }}>Islamic Profit</h1>
             <p style={{ margin: '2px 0 0 0', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>Withdraw Methods</p>
           </div>
        </div>
      </div>

      {/* Info Card 1 */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '16px' }}>
        <h2 style={{ margin: '0 0 12px 0', fontSize: '1.6rem', color: 'var(--primary-gold)', fontWeight: '900' }}>Withdraw Method</h2>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-dark)', lineHeight: '1.6', fontWeight: '500' }}>
          Select an active payout gateway. Minimum and maximum limits are loaded automatically.
        </p>
      </div>

      {/* Balance Card */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ width: '70px', height: '70px', borderRadius: '20px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)' }}>
           <span style={{ fontWeight: '900', color: '#fff', fontSize: '1.4rem' }}>Rs</span>
        </div>
        <div>
           <p style={{ margin: '0 0 6px 0', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Available Withdraw Balance</p>
           <h3 style={{ margin: '0 0 6px 0', fontSize: '2rem', color: 'var(--text-dark)', fontWeight: '900' }}>Rs{calculatedBalance.toLocaleString()}</h3>
           <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>Current funds available for withdrawal.</p>
        </div>
      </div>

      {/* Gateways Section */}
      <h2 style={{ margin: '0 0 6px 0', fontSize: '1.4rem', color: 'var(--text-dark)', fontWeight: '900' }}>Available Gateways</h2>
      <p style={{ margin: '0 0 24px 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '700' }}>Select any gateway to proceed with your withdrawal.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
        {gateways.map(g => (
          <div key={g.id} className="glass-card" style={{ padding: '24px 16px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '3px solid var(--primary-gold)' }}>
            
            <div style={{ position: 'absolute', top: '-25px', left: '-25px', width: '50px', height: '50px', background: '#f8fafc', borderRight: '1px solid #e2e8f0', transform: 'rotate(45deg)' }}></div>
            
            <div style={{ width: '70px', height: '70px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', padding: '10px' }}>
               <img src={g.icon} alt={g.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>
            
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: 'var(--text-dark)', fontWeight: '900', textAlign: 'center' }}>{g.name}</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textAlign: 'center' }}>PKR Gateway</p>
            
            <button 
              onClick={() => setSelectedGateway(g)}
              style={{ width: '100%', padding: '14px', background: 'var(--primary-gold)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)', transition: 'all 0.2s' }}>
              Withdraw
            </button>
          </div>
        ))}
      </div>

      {/* Custom Withdrawal Modal */}
      {selectedGateway && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '420px', background: '#ffffff', borderRadius: '24px', padding: '24px', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            
            <button 
              onClick={() => setSelectedGateway(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-dark)', transition: 'all 0.2s' }}>
              <X size={18} />
            </button>

            <h2 style={{ margin: '0 0 4px 0', fontSize: '1.4rem', color: 'var(--text-dark)', fontWeight: '900' }}>Withdraw Amount</h2>
            <p style={{ margin: '0 0 24px 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Enter the details to withdraw funds.</p>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'var(--gradient-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '900', fontSize: '1.2rem', flexShrink: 0, boxShadow: '0 4px 10px rgba(217,119,6,0.2)' }}>
                 {selectedGateway.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: 'var(--text-dark)', fontWeight: '900' }}>{selectedGateway.name}</h3>
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>PKR Gateway</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', width: '100%', marginBottom: '12px' }}>
              <div style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px 4px', textAlign: 'center', background: '#f8fafc' }}>
                <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: '800', marginBottom: '4px' }}>MINIMUM</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dark)', fontWeight: '800' }}>{selectedGateway.min}</div>
              </div>
              <div style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px 4px', textAlign: 'center', background: '#f8fafc' }}>
                <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: '800', marginBottom: '4px' }}>MAXIMUM</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dark)', fontWeight: '800' }}>{selectedGateway.max}</div>
              </div>
            </div>
            
            <p style={{ margin: '0 0 16px 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textAlign: 'center' }}>Fee: {selectedGateway.fee}</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#fef3c7', borderRadius: '12px', marginBottom: '24px', border: '1px solid rgba(217,119,6,0.2)' }}>
              <span style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: '800' }}>Available Balance</span>
              <span style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: '900' }}>Rs{calculatedBalance.toLocaleString()}</span>
            </div>

            <form onSubmit={handleWithdrawSubmit}>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Withdraw Amount (Rs)</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="number" 
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    required
                    placeholder="Enter amount"
                    style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', fontWeight: '700', outline: 'none', color: 'var(--text-dark)', transition: 'all 0.2s' }} 
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Account Name</label>
                <input 
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  required
                  placeholder="E.g. Ali Raza"
                  style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', fontWeight: '600', outline: 'none', color: 'var(--text-dark)', transition: 'all 0.2s' }} 
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Account Number</label>
                <input 
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  required
                  placeholder="E.g. 03012345678"
                  style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', fontWeight: '600', outline: 'none', color: 'var(--text-dark)', transition: 'all 0.2s' }} 
                />
              </div>

              <button 
                type="submit"
                style={{ width: '100%', padding: '16px', background: 'var(--gradient-gold)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '900', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)', transition: 'all 0.2s' }}>
                Continue to Withdraw
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default WithdrawPage;
