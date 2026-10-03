import React from 'react';
import { Users, ArrowDownToLine, ArrowUpFromLine, DollarSign, TrendingUp, Activity, CheckCircle, Clock, XCircle } from 'lucide-react';

const AdminDashboard = () => {

  const stats = [
    { title: 'Total Users', value: '1,245', subtext: '+12% from last month', icon: <Users size={22} />, color: '#3b82f6', bg: '#eff6ff' },
    { title: 'Total Deposits', value: 'Rs 4,500,000', subtext: '+24% from last month', icon: <ArrowDownToLine size={22} />, color: '#10b981', bg: '#ecfdf5' },
    { title: 'Total Withdrawals', value: 'Rs 1,200,000', subtext: 'Normal payout rate', icon: <ArrowUpFromLine size={22} />, color: '#f59e0b', bg: '#fffbeb' },
    { title: 'Company Profit', value: 'Rs 850,000', subtext: '+18% growth', icon: <DollarSign size={22} />, color: '#8b5cf6', bg: '#f5f3ff' },
  ];

  const recentTransactions = [
    { id: '#TRX-9821', user: 'Ali Raza', type: 'Deposit', amount: 'Rs 5,000', status: 'Pending', date: 'Just now' },
    { id: '#TRX-9820', user: 'Usman Khan', type: 'Withdraw', amount: 'Rs 2,500', status: 'Approved', date: '2 hrs ago' },
    { id: '#TRX-9819', user: 'Zainab Bibi', type: 'Deposit', amount: 'Rs 10,000', status: 'Approved', date: '5 hrs ago' },
    { id: '#TRX-9818', user: 'Kamran Ali', type: 'Withdraw', amount: 'Rs 1,000', status: 'Rejected', date: '1 day ago' },
    { id: '#TRX-9817', user: 'Hassan Ali', type: 'Deposit', amount: 'Rs 50,000', status: 'Pending', date: '1 day ago' },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Clock size={14} />;
      case 'Approved': return <CheckCircle size={14} />;
      case 'Rejected': return <XCircle size={14} />;
      default: return null;
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Welcome Banner */}
      <div style={{ 
        background: 'var(--gradient-gold)', 
        borderRadius: '24px', 
        padding: '32px 40px', 
        color: 'white', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '32px',
        boxShadow: '0 10px 30px rgba(245, 158, 11, 0.2)'
      }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem', fontWeight: '900' }}>Welcome back, Admin! 👋</h1>
          <p style={{ margin: 0, fontSize: '1rem', opacity: 0.9, fontWeight: '500' }}>Here's what's happening with IPL Growth today.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '12px', color: 'white', fontWeight: '800', cursor: 'pointer', backdropFilter: 'blur(10px)', transition: 'all 0.2s' }}>
            Generate Report
          </button>
          <button style={{ padding: '12px 24px', background: 'white', border: 'none', borderRadius: '12px', color: 'var(--primary-gold)', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transition: 'all 0.2s' }}>
            Review Pending Deposits
          </button>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {stats.map(s => (
          <div key={s.title} style={{ 
            background: 'white', 
            padding: '28px', 
            borderRadius: '24px', 
            border: '1px solid #f1f5f9', 
            boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background decorative element */}
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '100px', height: '100px', background: s.bg, borderRadius: '50%', opacity: 0.5, zIndex: 0 }}></div>
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {s.icon}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: s.bg, color: s.color, padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800' }}>
                  <TrendingUp size={12} /> {s.subtext.split(' ')[0]}
                </div>
              </div>
              
              <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '700' }}>{s.title}</p>
              <h3 style={{ margin: 0, fontSize: '2rem', color: 'var(--text-dark)', fontWeight: '900', letterSpacing: '-0.5px' }}>{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        
        {/* Recent Transactions Table Area */}
        <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Activity size={24} color="var(--primary-gold)" />
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-dark)', fontWeight: '900' }}>Recent Transactions</h2>
            </div>
            <button style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-dark)', cursor: 'pointer', transition: 'all 0.2s' }}>
              View All
            </button>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '16px 32px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Transaction ID</th>
                  <th style={{ padding: '16px 32px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>User</th>
                  <th style={{ padding: '16px 32px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</th>
                  <th style={{ padding: '16px 32px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount</th>
                  <th style={{ padding: '16px 32px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
                  <th style={{ padding: '16px 32px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((trx, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '20px 32px', fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-dark)' }}>{trx.id}</td>
                    <td style={{ padding: '20px 32px', fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-muted)' }}>{trx.user}</td>
                    <td style={{ padding: '20px 32px', fontSize: '0.9rem', fontWeight: '800', color: trx.type === 'Deposit' ? '#10b981' : '#f59e0b' }}>{trx.type}</td>
                    <td style={{ padding: '20px 32px', fontSize: '0.95rem', fontWeight: '900', color: 'var(--text-dark)' }}>{trx.amount}</td>
                    <td style={{ padding: '20px 32px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>{trx.date}</td>
                    <td style={{ padding: '20px 32px' }}>
                      <span style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800',
                        background: trx.status === 'Pending' ? '#fef3c7' : trx.status === 'Approved' ? '#dcfce7' : '#fee2e2',
                        color: trx.status === 'Pending' ? '#d97706' : trx.status === 'Approved' ? '#16a34a' : '#dc2626'
                      }}>
                        {getStatusIcon(trx.status)}
                        {trx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
