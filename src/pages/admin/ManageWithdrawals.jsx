import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Trash2 } from 'lucide-react';

const ManageWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('withdraw_history');
    let parsed = [];
    if (saved) {
      parsed = JSON.parse(saved).filter(t => t.type === 'withdraw').map(t => ({
        id: t.id,
        user: t.accountDetails ? t.accountDetails.split(' / ')[0] : 'Unknown User',
        amount: Number(t.amount) || 0,
        method: t.method,
        account: t.accountDetails ? t.accountDetails.split(' / ')[1] : t.accountDetails || 'N/A',
        date: t.date,
        status: t.status
      }));
    }
    
    setWithdrawals(parsed);
  }, []);

  const handleApprove = (id) => {
    const updated = withdrawals.map(w => w.id === id ? { ...w, status: 'Approved' } : w);
    setWithdrawals(updated);
    
    const saved = JSON.parse(localStorage.getItem('withdraw_history') || '[]');
    const newStorage = saved.map(t => t.id === id ? { ...t, status: 'Approved' } : t);
    localStorage.setItem('withdraw_history', JSON.stringify(newStorage));
  };

  const handleReject = (id) => {
    const updated = withdrawals.map(w => w.id === id ? { ...w, status: 'Rejected' } : w);
    setWithdrawals(updated);
    
    const saved = JSON.parse(localStorage.getItem('withdraw_history') || '[]');
    const newStorage = saved.map(t => t.id === id ? { ...t, status: 'Rejected' } : t);
    localStorage.setItem('withdraw_history', JSON.stringify(newStorage));
  };

  const handleDelete = (id) => {
    if(window.confirm('Are you sure you want to delete this withdrawal?')) {
      const updated = withdrawals.filter(w => w.id !== id);
      setWithdrawals(updated);
      
      const saved = JSON.parse(localStorage.getItem('withdraw_history') || '[]');
      const newStorage = saved.filter(t => t.id !== id);
      localStorage.setItem('withdraw_history', JSON.stringify(newStorage));
    }
  };

  const filteredWithdrawals = withdrawals.filter(w => 
    w.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '1.8rem', color: 'var(--text-dark)', fontWeight: '900' }}>Manage Withdrawals</h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>Review and approve user withdrawal requests.</p>
        </div>
        <button 
          onClick={() => {
            if(window.confirm('Kya aap waqai tamam withdrawal data delete karna chahte hain?')) {
              localStorage.removeItem('withdraw_history');
              setWithdrawals([]);
            }
          }}
          style={{ padding: '10px 20px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          Clear All Data
        </button>
      </div>

      <div style={{ background: 'white', padding: '16px 24px', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', marginBottom: '24px', display: 'flex' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search by User Name or Request ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem', fontWeight: '600', outline: 'none' }}
          />
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: 'var(--text-muted)' }}>
                <th style={{ padding: '16px 32px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Request ID & Date</th>
                <th style={{ padding: '16px 32px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>User</th>
                <th style={{ padding: '16px 32px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Method & Account</th>
                <th style={{ padding: '16px 32px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Amount</th>
                <th style={{ padding: '16px 32px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '16px 32px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWithdrawals.length > 0 ? filteredWithdrawals.map((req, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '20px 32px' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-dark)' }}>{req.id}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>{req.date}</div>
                  </td>
                  <td style={{ padding: '20px 32px', fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-muted)' }}>{req.user}</td>
                  <td style={{ padding: '20px 32px' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-dark)' }}>{req.method}</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--primary-gold)' }}>{req.account}</div>
                  </td>
                  <td style={{ padding: '20px 32px', fontSize: '1rem', fontWeight: '900', color: 'var(--text-dark)' }}>Rs {req.amount.toLocaleString()}</td>
                  <td style={{ padding: '20px 32px' }}>
                    <span style={{ 
                      padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800',
                      background: req.status === 'Pending' ? '#fef3c7' : req.status === 'Approved' ? '#dcfce7' : '#fee2e2',
                      color: req.status === 'Pending' ? '#d97706' : req.status === 'Approved' ? '#16a34a' : '#dc2626'
                    }}>
                      {req.status}
                    </span>
                  </td>
                  <td style={{ padding: '20px 32px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                      {req.status === 'Pending' && (
                        <>
                          <button onClick={() => handleApprove(req.id)} style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px', border: 'none', background: '#10b981', color: 'white', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', boxShadow: '0 4px 10px rgba(16,185,129,0.3)' }}>
                            <CheckCircle size={14} /> Send Money
                          </button>
                          <button onClick={() => handleReject(req.id)} style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: '1px solid #fca5a5', background: '#fee2e2', color: '#dc2626', cursor: 'pointer' }} title="Reject">
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      <button onClick={() => handleDelete(w.id)} style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: '1px solid #fca5a5', background: 'white', color: '#dc2626', cursor: 'pointer' }} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: '600' }}>No withdrawal requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageWithdrawals;
