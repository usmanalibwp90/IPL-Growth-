import React from 'react';
import { ArrowLeft, Clock, CheckCircle, ArrowDownRight, ArrowUpRight, Package, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TransactionPage = () => {
  const navigate = useNavigate();

  // Dummy transaction data combining different types
  const historyData = [
    { id: 'TRX-90123', type: 'Deposit', gateway: 'Easypaisa', amount: 'Rs5,000', date: 'Oct 03, 2026', time: '14:30', status: 'Success' },
    { id: 'TRX-88214', type: 'Plan Purchase', gateway: 'Account Balance', amount: 'Rs1,625', date: 'Oct 03, 2026', time: '15:10', status: 'Success' },
    { id: 'TRX-44122', type: 'Withdraw', gateway: 'JazzCash', amount: 'Rs1,500', date: 'Oct 02, 2026', time: '09:15', status: 'Pending' },
    { id: 'TRX-10294', type: 'Daily Earning', gateway: 'Plan 3', amount: 'Rs406', date: 'Oct 01, 2026', time: '00:01', status: 'Success' },
  ];

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '24px' }}>
        <div onClick={() => navigate(-1)} style={{ width: '45px', height: '45px', borderRadius: '14px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
           <ArrowLeft size={20} color="var(--text-dark)" />
        </div>
        <div>
           <h1 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-dark)', fontWeight: '800' }}>Transactions</h1>
           <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Your complete account history</p>
        </div>
      </div>

      {/* Transactions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {historyData.map((item, index) => {
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
                    <Calendar size={12} /> {item.date} • {item.gateway}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '2px' }}>
                    TRX: {item.id}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1rem', fontWeight: '900', color: isPositive ? '#16a34a' : 'var(--text-dark)', marginBottom: '6px' }}>
                  {typeStyle.prefix}{item.amount}
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
