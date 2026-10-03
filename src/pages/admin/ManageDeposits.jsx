import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Eye, X } from 'lucide-react';

const ManageDeposits = () => {
  const [deposits, setDeposits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewReceipt, setViewReceipt] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('deposit_history');
    let parsed = [];
    if (saved) {
      parsed = JSON.parse(saved);
    }
    
    if (parsed.length === 0) {
      parsed = [
        { id: 'DEP-1001', user: 'Ali Raza', amount: 5000, method: 'JazzCash', date: '03 Oct 2026, 10:30 AM', status: 'Pending', receipt: 'Proof_123.jpg' },
        { id: 'DEP-1002', user: 'Zainab Bibi', amount: 15000, method: 'EasyPaisa', date: '03 Oct 2026, 09:15 AM', status: 'Approved', receipt: 'Proof_124.jpg' },
        { id: 'DEP-1003', user: 'Usman Ghani', amount: 2500, method: 'SadaPay', date: '02 Oct 2026, 04:20 PM', status: 'Rejected', receipt: 'Proof_125.jpg' },
        { id: 'DEP-1004', user: 'Hassan Ali', amount: 50000, method: 'JazzCash', date: '02 Oct 2026, 02:10 PM', status: 'Pending', receipt: 'Proof_126.jpg' },
      ];
    }
    setDeposits(parsed);
  }, []);

  const handleApprove = (id) => {
    const updated = deposits.map(d => d.id === id ? { ...d, status: 'Approved' } : d);
    setDeposits(updated);
    
    const saved = JSON.parse(localStorage.getItem('deposit_history') || '[]');
    const newStorage = saved.map(t => t.id === id ? { ...t, status: 'Approved' } : t);
    localStorage.setItem('deposit_history', JSON.stringify(newStorage));
  };

  const handleReject = (id) => {
    const updated = deposits.map(d => d.id === id ? { ...d, status: 'Rejected' } : d);
    setDeposits(updated);
    
    const saved = JSON.parse(localStorage.getItem('deposit_history') || '[]');
    const newStorage = saved.map(t => t.id === id ? { ...t, status: 'Rejected' } : t);
    localStorage.setItem('deposit_history', JSON.stringify(newStorage));
  };

  const filteredDeposits = deposits.filter(d => 
    d.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '1.8rem', color: 'var(--text-dark)', fontWeight: '900' }}>Manage Deposits</h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>Review and approve manual user deposits.</p>
        </div>
      </div>

      <div style={{ background: 'white', padding: '16px 24px', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', marginBottom: '24px', display: 'flex' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search by User Name or Deposit ID..." 
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
                <th style={{ padding: '16px 32px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Deposit ID & Date</th>
                <th style={{ padding: '16px 32px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>User</th>
                <th style={{ padding: '16px 32px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Method</th>
                <th style={{ padding: '16px 32px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Amount</th>
                <th style={{ padding: '16px 32px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '16px 32px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeposits.length > 0 ? filteredDeposits.map((dep, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '20px 32px' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-dark)' }}>{dep.id}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>{dep.date}</div>
                  </td>
                  <td style={{ padding: '20px 32px', fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-muted)' }}>{dep.user}</td>
                  <td style={{ padding: '20px 32px' }}>
                    <span style={{ padding: '6px 12px', background: '#f1f5f9', color: '#64748b', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800' }}>
                      {dep.method}
                    </span>
                  </td>
                  <td style={{ padding: '20px 32px', fontSize: '1rem', fontWeight: '900', color: 'var(--text-dark)' }}>Rs {dep.amount.toLocaleString()}</td>
                  <td style={{ padding: '20px 32px' }}>
                    <span style={{ 
                      padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800',
                      background: dep.status === 'Pending' ? '#fef3c7' : dep.status === 'Approved' ? '#dcfce7' : '#fee2e2',
                      color: dep.status === 'Pending' ? '#d97706' : dep.status === 'Approved' ? '#16a34a' : '#dc2626'
                    }}>
                      {dep.status}
                    </span>
                  </td>
                  <td style={{ padding: '20px 32px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                      <button onClick={() => setViewReceipt(dep)} style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: 'var(--text-dark)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700' }} title="View Receipt">
                        <Eye size={14} /> Receipt
                      </button>
                      {dep.status === 'Pending' && (
                        <>
                          <button onClick={() => handleApprove(dep.id)} style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: '1px solid #86efac', background: '#dcfce7', color: '#16a34a', cursor: 'pointer' }} title="Approve">
                            <CheckCircle size={16} />
                          </button>
                          <button onClick={() => handleReject(dep.id)} style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: '1px solid #fca5a5', background: '#fee2e2', color: '#dc2626', cursor: 'pointer' }} title="Reject">
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: '600' }}>No deposits found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Receipt Modal */}
      {viewReceipt && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '500px', padding: '32px', position: 'relative' }}>
            <button onClick={() => setViewReceipt(null)} style={{ position: 'absolute', top: '24px', right: '24px', background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={18} color="var(--text-dark)" />
            </button>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '1.4rem', color: 'var(--text-dark)', fontWeight: '900' }}>Payment Proof</h2>
            <p style={{ margin: '0 0 24px 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Transaction: {viewReceipt.id}</p>
            <div style={{ width: '100%', height: '300px', background: '#f8fafc', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #cbd5e1', marginBottom: '24px' }}>
              <span style={{ color: '#94a3b8', fontWeight: '700' }}>[ Screenshot Displayed Here ]</span>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { handleReject(viewReceipt.id); setViewReceipt(null); }} style={{ flex: 1, padding: '14px', background: '#fee2e2', border: 'none', borderRadius: '12px', color: '#dc2626', fontWeight: '800', cursor: 'pointer' }}>Reject</button>
              <button onClick={() => { handleApprove(viewReceipt.id); setViewReceipt(null); }} style={{ flex: 1, padding: '14px', background: '#10b981', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>Approve Payment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDeposits;
