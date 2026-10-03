import React from 'react';
import { ArrowLeft, Clock, CheckCircle, XCircle, Upload, Calendar, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WithdrawHistoryPage = () => {
  const navigate = useNavigate();

  // Dummy withdraw history data
  const historyData = [
    { id: 'WDR-99214', gateway: 'JazzCash', amount: 'Rs1,500', date: 'Oct 03, 2026', time: '10:05', status: 'Pending' },
    { id: 'WDR-12844', gateway: 'Easypaisa', amount: 'Rs4,000', date: 'Sep 30, 2026', time: '16:45', status: 'Success' },
    { id: 'WDR-55312', gateway: 'SadaPay', amount: 'Rs8,500', date: 'Sep 21, 2026', time: '09:20', status: 'Success' },
    { id: 'WDR-88129', gateway: 'Meezan Bank', amount: 'Rs15,000', date: 'Sep 15, 2026', time: '14:10', status: 'Failed' },
  ];

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '24px' }}>
        <div onClick={() => navigate(-1)} style={{ width: '45px', height: '45px', borderRadius: '14px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
           <ArrowLeft size={20} color="var(--text-dark)" />
        </div>
        <div>
           <h1 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-dark)', fontWeight: '800' }}>Withdraw History</h1>
           <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Track all your payout requests</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        <div className="glass-card" style={{ padding: '16px', background: 'white', border: '1px solid rgba(217,119,6,0.2)' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <Wallet size={18} />
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Total Payouts</div>
          <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-dark)' }}>Rs12,500</div>
        </div>
        <div className="glass-card" style={{ padding: '16px', background: 'white', border: '1px solid rgba(217,119,6,0.2)' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <Clock size={18} />
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Pending</div>
          <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-dark)' }}>Rs1,500</div>
        </div>
      </div>

      {/* Transactions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '1rem', margin: '0 0 8px 0', color: 'var(--text-dark)', fontWeight: '800' }}>Recent Withdrawals</h3>
        
        {historyData.map((item, index) => {
          const statusStyle = getStatusColor(item.status);
          
          return (
            <div key={index} className="glass-card" style={{ padding: '16px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #ffedd5, #fef3c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Upload size={20} color="#ea580c" />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '4px' }}>
                    {item.gateway}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                    <Calendar size={12} /> {item.date} • {item.time}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '2px' }}>
                    TRX: {item.id}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--text-dark)', marginBottom: '6px' }}>
                  -{item.amount}
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

export default WithdrawHistoryPage;
