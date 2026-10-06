import React from 'react';
import { ArrowLeft, Clock, CheckCircle, XCircle, Download, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const DepositHistoryPage = () => {
  const navigate = useNavigate();

  const [historyData, setHistoryData] = React.useState([]);

  React.useEffect(() => {
    // Local fallback for instant UX
    const saved = JSON.parse(localStorage.getItem('deposit_history') || '[]');
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const userId = user.id || user.email;
    
    if (userId && saved.length > 0) {
      setHistoryData(saved.filter(d => d.userId === userId || d.user === user.name));
    } else {
      setHistoryData(saved);
    }

    // Fetch from backend
    if (userId) {
      fetch(`${API_BASE_URL}/api/deposits/user/${userId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setHistoryData(data);
            
            // Cache locally
            const allLocal = JSON.parse(localStorage.getItem('deposit_history') || '[]');
            const others = allLocal.filter(d => d.userId !== userId && d.user !== user.name);
            localStorage.setItem('deposit_history', JSON.stringify([...data, ...others]));
          }
        })
        .catch(err => console.error('Failed to fetch user deposits', err));
    }
  }, []);

  const totalDeposits = historyData.filter(d => d.status === 'Success').reduce((acc, curr) => acc + parseFloat(String(curr.amount || '0').replace(/[^0-9.]/g, '')), 0);
  const pendingDeposits = historyData.filter(d => d.status === 'Pending').reduce((acc, curr) => acc + parseFloat(String(curr.amount || '0').replace(/[^0-9.]/g, '')), 0);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Success': return { bg: '#dcfce7', text: '#16a34a', icon: <CheckCircle size={16} /> };
      case 'Pending': return { bg: '#fef3c7', text: '#d97706', icon: <Clock size={16} /> };
      case 'Failed': return { bg: '#fee2e2', text: '#dc2626', icon: <XCircle size={16} /> };
      default: return { bg: '#f1f5f9', text: '#64748b', icon: <Clock size={16} /> };
    }
  };

  return (
    <div className="page-transition" style={{ padding: '10px', paddingBottom: '100px', maxWidth: 'var(--max-width)', margin: '0 auto' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '24px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div onClick={() => navigate(-1)} style={{ width: '45px', height: '45px', borderRadius: '14px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
             <ArrowLeft size={20} color="var(--text-dark)" />
          </div>
          <div>
             <h1 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-dark)', fontWeight: '800' }}>Deposit History</h1>
             <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Track all your wallet fundings</p>
          </div>
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem('deposit_history');
            window.location.reload();
          }}
          style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
        >
          Clear
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        <div className="glass-card" style={{ padding: '16px', background: 'white', border: '1px solid rgba(217,119,6,0.2)' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <Download size={18} />
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Total Deposits</div>
          <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-dark)' }}>Rs{totalDeposits.toLocaleString()}</div>
        </div>
        <div className="glass-card" style={{ padding: '16px', background: 'white', border: '1px solid rgba(217,119,6,0.2)' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <Clock size={18} />
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Pending</div>
          <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-dark)' }}>Rs{pendingDeposits.toLocaleString()}</div>
        </div>
      </div>

      {/* Transactions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '1rem', margin: '0 0 8px 0', color: 'var(--text-dark)', fontWeight: '800' }}>Recent Transactions</h3>
        
        {historyData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 20px', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
            <Clock size={40} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>No deposit history found.</div>
          </div>
        ) : historyData.map((item, index) => {
          const statusStyle = getStatusColor(item.status);
          
          return (
            <div key={index} className="glass-card" style={{ padding: '16px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #fef3c7, #ffedd5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Download size={20} color="#d97706" />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '4px' }}>
                    {item.gateway || item.method || 'Gateway'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                    <Calendar size={12} /> {item.date} • {item.time}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '2px' }}>
                    TRX: {item.id || item.transactionId || 'N/A'}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--text-dark)', marginBottom: '6px' }}>
                  +{item.amount}
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: statusStyle.bg, color: statusStyle.text, padding: '4px 8px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: '800' }}>
                  {statusStyle.icon} {item.status}
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

export default DepositHistoryPage;
