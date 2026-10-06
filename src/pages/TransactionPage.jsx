import React from 'react';
import { ArrowLeft, Clock, CheckCircle, ArrowDownRight, ArrowUpRight, Package, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const TransactionPage = () => {
  const navigate = useNavigate();

  const [historyData, setHistoryData] = React.useState([]);

  React.useEffect(() => {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) return;
    const u = JSON.parse(rawUser);
    const userId = u.id || u.email;

    Promise.all([
      fetch(`${API_BASE_URL}/api/deposits/user/${userId}`),
      fetch(`${API_BASE_URL}/api/withdrawals/user/${userId}`),
      fetch(`${API_BASE_URL}/api/transactions/user/${userId}`)
    ])
    .then(async ([depRes, widRes, trxRes]) => {
      let deps = [];
      let wids = [];
      let trxs = [];
      
      if (depRes.ok) deps = await depRes.json();
      if (widRes.ok) wids = await widRes.json();
      if (trxRes.ok) trxs = await trxRes.json();

      deps = deps.map(d => ({ ...d, type: 'Deposit', gateway: d.method || d.gateway, timestamp: new Date(d.date).getTime() || 0 }));
      wids = wids.map(w => ({ ...w, type: 'Withdraw', gateway: w.method || w.gateway, timestamp: new Date(w.date).getTime() || 0 }));
      
      const tasks = trxs.map(t => {
        const dt = new Date(t.date || new Date());
        return { 
          id: t.id,
          type: t.type === 'profit' ? 'Daily Earning' : 'Plan Purchase',
          gateway: t.type === 'profit' ? 'My Task' : 'System',
          amount: `Rs${t.amount}`,
          date: dt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          time: dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          status: 'Success', // transactions are always success currently
          timestamp: new Date(t.date).getTime() || 0
        }
      });

      const combined = [...deps, ...wids, ...tasks].sort((a, b) => b.timestamp - a.timestamp);
      setHistoryData(combined);
    })
    .catch(err => console.error("Failed to fetch transactions", err));
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Success': return { bg: '#dcfce7', text: '#16a34a', icon: <CheckCircle size={16} /> };
      case 'Pending': return { bg: '#fef3c7', text: '#d97706', icon: <Clock size={16} /> };
      default: return { bg: '#f1f5f9', text: '#64748b', icon: <Clock size={16} /> };
    }
  };

  const getTypeStyle = (type) => {
    switch(type) {
      case 'Deposit': return { bg: '#fef3c7', color: '#d97706', icon: <ArrowDownRight size={20} />, prefix: '+' };
      case 'Withdraw': return { bg: '#ffedd5', color: '#ea580c', icon: <ArrowUpRight size={20} />, prefix: '-' };
      case 'Plan Purchase': return { bg: '#e0e7ff', color: '#4f46e5', icon: <Package size={20} />, prefix: '-' };
      case 'Daily Earning': return { bg: '#dcfce7', color: '#10b981', icon: <ArrowDownRight size={20} />, prefix: '+' };
      default: return { bg: '#f1f5f9', color: '#64748b', icon: <Clock size={20} />, prefix: '' };
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
             <h1 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-dark)', fontWeight: '800' }}>Transactions</h1>
             <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Your complete account history</p>
          </div>
        </div>
        <button 
          onClick={() => {
            if (window.confirm('Clearing history from backend is not yet supported. UI will be cleared.')) {
              setHistoryData([]);
            }
          }}
          style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
        >
          Clear
        </button>
      </div>

      {/* Transactions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {historyData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 20px', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
            <Clock size={40} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>No transactions found.</div>
          </div>
        ) : historyData.map((item, index) => {
          const statusStyle = getStatusColor(item.status);
          const typeStyle = getTypeStyle(item.type);
          const isPositive = typeStyle.prefix === '+';
          
          return (
            <div key={index} className="glass-card" style={{ padding: '16px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: typeStyle.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {React.cloneElement(typeStyle.icon, { color: typeStyle.color })}
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '4px' }}>
                    {item.type}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                    <Calendar size={12} /> {item.date} • {item.gateway || item.method || 'System'}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '2px' }}>
                    TRX: {item.id || item.transactionId || 'N/A'}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1rem', fontWeight: '900', color: isPositive ? '#16a34a' : 'var(--text-dark)', marginBottom: '6px' }}>
                  {typeStyle.prefix}{String(item.amount).startsWith('Rs') ? item.amount : `Rs${item.amount}`}
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

export default TransactionPage;
