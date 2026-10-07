import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, CheckCircle, XCircle, Calendar, Wallet, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { resolveGatewayIcon } from '../utils/gatewayIcons';

const WithdrawHistoryPage = () => {
  const navigate = useNavigate();

  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = (isRefresh = false) => {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) {
      setLoading(false);
      return;
    }
    
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    const u = JSON.parse(rawUser);
    const userId = u.id || u.email;
    
    fetch(`${API_BASE_URL}/api/withdrawals/user/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setHistoryData(data);
        } else {
          setHistoryData([]);
        }
      })
      .catch(err => {
        console.error("Failed to fetch withdraw history", err);
        setHistoryData([]);
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const totalPayouts = historyData
    .filter(d => d.status === 'Approved' || d.status === 'Success')
    .reduce((acc, curr) => acc + parseFloat(String(curr.amount || '0').replace(/[^0-9.]/g, '')), 0);
  
  const pendingPayouts = historyData
    .filter(d => d.status === 'Pending')
    .reduce((acc, curr) => acc + parseFloat(String(curr.amount || '0').replace(/[^0-9.]/g, '')), 0);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Success':
      case 'Approved':
        return { bg: '#dcfce7', text: '#16a34a', icon: <CheckCircle size={15} /> };
      case 'Pending':
        return { bg: '#fef3c7', text: '#d97706', icon: <Clock size={15} /> };
      case 'Failed':
      case 'Rejected':
        return { bg: '#fee2e2', text: '#dc2626', icon: <XCircle size={15} /> };
      default:
        return { bg: '#f1f5f9', text: '#64748b', icon: <Clock size={15} /> };
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
             <h1 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-dark)', fontWeight: '800' }}>Withdraw History</h1>
             <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Track all your payout requests</p>
          </div>
        </div>
        <button 
          onClick={() => fetchHistory(true)}
          disabled={refreshing || loading}
          style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', padding: '8px 14px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        <div className="glass-card" style={{ padding: '16px', background: 'white', border: '1px solid rgba(217,119,6,0.15)', borderRadius: '16px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <Wallet size={18} />
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Total Payouts</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-dark)' }}>Rs{totalPayouts.toLocaleString()}</div>
        </div>
        <div className="glass-card" style={{ padding: '16px', background: 'white', border: '1px solid rgba(217,119,6,0.15)', borderRadius: '16px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <Clock size={18} />
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Pending</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-dark)' }}>Rs{pendingPayouts.toLocaleString()}</div>
        </div>
      </div>

      {/* Transactions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '1rem', margin: '0 0 8px 0', color: 'var(--text-dark)', fontWeight: '800' }}>Recent Withdrawals</h3>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <RefreshCw size={28} color="#d97706" style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Loading withdraw history...</div>
          </div>
        ) : historyData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 20px', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
            <Wallet size={42} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: '0.95rem', color: 'var(--text-dark)', fontWeight: '700', marginBottom: '4px' }}>No withdraw history found</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>Your withdrawal requests will appear here once submitted.</div>
          </div>
        ) : historyData.map((item, index) => {
          const statusStyle = getStatusColor(item.status);
          const iconSrc = resolveGatewayIcon(item.gateway || item.method);
          const amt = parseFloat(String(item.amount || '0').replace(/[^0-9.]/g, '')) || 0;
          
          return (
            <div key={item.id || index} className="glass-card" style={{ padding: '16px', background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', flexShrink: 0, overflow: 'hidden' }}>
                  <img 
                    src={iconSrc} 
                    alt={item.method || 'Gateway'} 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/bank.svg';
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '3px' }}>
                    {item.gateway || item.method || 'Withdrawal'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                    <Calendar size={12} /> {item.date} {item.time ? `• ${item.time}` : ''}
                  </div>
                  {item.accountDetails && (
                    <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: '600', marginTop: '2px' }}>
                      To: {item.accountDetails}
                    </div>
                  )}
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '600', marginTop: '2px' }}>
                    ID: {item.id || 'N/A'}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: '900', color: 'var(--text-dark)', marginBottom: '6px' }}>
                  Rs{amt.toLocaleString()}
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: statusStyle.bg, color: statusStyle.text, padding: '4px 8px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '800' }}>
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
