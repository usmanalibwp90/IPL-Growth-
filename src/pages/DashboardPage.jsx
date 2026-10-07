import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, Bell, UserCircle, TrendingUp, Download, Upload, ClipboardList, 
  Copy, MessageCircle, MessageSquare, FileText, Users, Smartphone, ShieldCheck, 
  Key, LogOut, Wallet, BarChart3, Users2, Activity, Ban, AlertTriangle, CheckCircle, Headset
} from 'lucide-react';
import { API_BASE_URL } from '../config';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [adminMessage, setAdminMessage] = useState(null);
  const [approvalMessage, setApprovalMessage] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activePlan, setActivePlan] = useState('None');
  const [calculatedBalance, setCalculatedBalance] = useState(0);
  const [stats, setStats] = useState({
    totalDeposit: 0,
    totalWithdraw: 0,
    pendingDeposit: 0,
    pendingWithdraw: 0
  });
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem('user')) || {
      name: 'Guest User',
      refCode: 'guest_user'
    };
  });

  const [isBlocked, setIsBlocked] = useState(() => {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) return false;
    const u = JSON.parse(rawUser);
    if (u.status === 'Blocked') return true;
    const blockedList = JSON.parse(localStorage.getItem('blocked_user_ids') || '[]');
    if (u.id && blockedList.includes(u.id)) return true;
    const adminCache = JSON.parse(localStorage.getItem('admin_users_cache') || '[]');
    const found = adminCache.find(x => x.id === u.id || (x.email && x.email === u.email));
    if (found && found.status === 'Blocked') return true;
    return false;
  });

  const [homeConfig, setHomeConfig] = useState({
    whatsappNumber: '+923001234567',
    whatsappChannel: 'https://whatsapp.com/channel/xxx',
    telegramChannel: 't.me/iplgrowth'
  });

  useEffect(() => {
    const savedConfig = localStorage.getItem('home_config');
    if (savedConfig) {
      setHomeConfig(JSON.parse(savedConfig));
    }
    
    // Fallback for older global message
    const globalMsg = localStorage.getItem('payment_approved_message');
    if (globalMsg) {
      setApprovalMessage(globalMsg);
      localStorage.removeItem('payment_approved_message');
    }
    
    const savedMsg = localStorage.getItem('admin_notification_message');
    if (savedMsg) {
      const msg = JSON.parse(savedMsg);
      if (msg.isActive) setAdminMessage(msg);
    }
  }, []);

  useEffect(() => {
    if (approvalMessage) {
      const timer = setTimeout(() => {
        setApprovalMessage(null);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [approvalMessage]);

  useEffect(() => {
    const checkBlockedStatus = async () => {
      const rawUser = localStorage.getItem('user');
      if (!rawUser) return;
      const u = JSON.parse(rawUser);
      setUser(u);

      if (u.status === 'Blocked') {
        setIsBlocked(true);
        return;
      }

      // 2. Check API status
      try {
        const query = u.id ? `id=${encodeURIComponent(u.id)}` : `email=${encodeURIComponent(u.email || '')}`;
        const res = await fetch(`${API_BASE_URL}/api/user/status?${query}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'Blocked') {
            setIsBlocked(true);
            u.status = 'Blocked';
            localStorage.setItem('user', JSON.stringify(u));
            return;
          } else {
            setIsBlocked(false);
            if (data.plan) u.plan = data.plan;
            if (data.balance !== undefined) u.balance = data.balance;
            localStorage.setItem('user', JSON.stringify(u));
          }
        }
      } catch (err) {
        // network error
      }
      
      // Determine active plan
      const userId = u.id || u.email;
      if (u.plan && u.plan !== 'None') {
         setActivePlan(u.plan);
      } else {
         setActivePlan('None');
      }

      // Check user-specific notification
      if (userId) {
         const notifications = JSON.parse(localStorage.getItem('payment_notifications') || '{}');
         if (notifications[userId]) {
             setApprovalMessage(notifications[userId]);
             delete notifications[userId];
             localStorage.setItem('payment_notifications', JSON.stringify(notifications));
         }
      }

      // Calculate real-time balance and stats
      // Fetch deposits, withdrawals, profits from backend for stats
      let dynamicBalance = Number(u.balance || 0);
      let totalDeposit = 0;
      let pendingDeposit = 0;
      let totalWithdraw = 0;
      let pendingWithdraw = 0;

      try {
        const [depRes, withRes, transRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/deposits/user/${userId}`),
          fetch(`${API_BASE_URL}/api/withdrawals/user/${userId}`),
          fetch(`${API_BASE_URL}/api/transactions/user/${userId}`)
        ]);

        if (depRes.ok) {
          const deposits = await depRes.json();
          deposits.forEach((d) => {
            const amt = parseFloat(String(d.amount).replace(/[^0-9.-]+/g, '')) || 0;
            if (d.status === 'Approved') totalDeposit += amt;
            else if (d.status === 'Pending') pendingDeposit += amt;
          });
        }

        if (withRes.ok) {
          const withdrawals = await withRes.json();
          withdrawals.forEach((w) => {
            const amt = parseFloat(String(w.amount).replace(/[^0-9.-]+/g, '')) || 0;
            if (w.status === 'Approved') totalWithdraw += amt;
            else if (w.status === 'Pending') pendingWithdraw += amt;
            
            if (w.status !== 'Rejected') {
              dynamicBalance -= amt;
            }
          });
        }

        if (transRes.ok) {
          const profits = await transRes.json();
          profits.forEach((p) => {
            if (p.type === 'profit') {
              dynamicBalance += parseFloat(String(p.amount).replace(/[^0-9.-]+/g, '')) || 0;
            }
          });
        }
      } catch (e) {
        console.error("Failed to fetch dynamic stats", e);
      }

      
      setCalculatedBalance(dynamicBalance);
      setStats({
        totalDeposit, pendingDeposit, totalWithdraw, pendingWithdraw
      });

    };

    checkBlockedStatus();
    window.addEventListener('storage', checkBlockedStatus);
    const interval = setInterval(checkBlockedStatus, 2000);

    return () => {
      window.removeEventListener('storage', checkBlockedStatus);
      clearInterval(interval);
    };
  }, []);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/register?ref=${user.username || user.id || 'guest_user'}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // If user is blocked: show notification and ONLY logout option
  if (isBlocked) {
    return (
      <div className="content-area flex-center" style={{ minHeight: '80vh', padding: '20px' }}>
        <div style={{
          background: 'white',
          borderRadius: '28px',
          padding: '32px 24px',
          boxShadow: '0 20px 60px rgba(220, 38, 38, 0.15)',
          border: '2px solid #fecaca',
          width: '100%',
          maxWidth: '380px',
          textAlign: 'center'
        }}>
          
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: '#fee2e2',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            boxShadow: '0 8px 24px rgba(220, 38, 38, 0.25)'
          }}>
            <Ban size={46} />
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '14px'
          }}>
            <AlertTriangle size={14} color="#dc2626" /> Notification: Account Blocked
          </div>

          <h2 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#111827', margin: '0 0 10px 0' }}>
            Aap Ko Website Ne Block Kar Diya Hai
          </h2>

          <p style={{ fontSize: '0.88rem', color: '#4b5563', lineHeight: '1.6', margin: '0 0 20px 0' }}>
            Aap ka account admin panel se suspend / block kar diya gaya hai. Aap ka dashboard open nahi ho sakta jab tak admin panel se status dobara Active na kar diya jaye.
          </p>

          <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '16px', textAlign: 'left', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Member Profile</div>
            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1e293b', marginTop: '2px' }}>{user.name || 'Member'}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{user.email || 'N/A'}</div>
            {user.id && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>ID: {user.id}</div>}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fee2e2', color: '#dc2626', fontWeight: '800', fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px', marginTop: '8px' }}>
              <Ban size={12} /> Status: Blocked
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="btn"
            style={{
              width: '100%',
              padding: '16px',
              background: '#dc2626',
              color: 'white',
              borderRadius: '16px',
              fontWeight: '800',
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(220, 38, 38, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-area">
      
      {/* Top Header */}
      <header className="flex-between mb-4 glass-pill" style={{ padding: '8px 12px' }}>
        <button onClick={() => setIsSidebarOpen(true)} style={{ border: 'none', background: 'white', color: 'var(--text-dark)', width: '36px', height: '36px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-soft)' }}>
          <Menu size={20} />
        </button>
        <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-dark)' }}>IPL Dashboard</div>
        <button onClick={() => setIsNotificationOpen(true)} style={{ border: 'none', background: 'var(--gradient-gold)', color: 'white', width: '36px', height: '36px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(234, 88, 12, 0.3)', position: 'relative' }}>
          <Bell size={20} />
          {adminMessage && <span style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', background: '#fff', borderRadius: '50%', border: '2px solid #ea580c' }}></span>}
        </button>
      </header>

      {/* Hero Card */}
      <div className="mb-4" style={{ background: 'var(--gradient-gold)', borderRadius: '24px', padding: '24px', color: 'white', boxShadow: '0 10px 30px rgba(234, 88, 12, 0.3)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.15 }}>
          <TrendingUp size={150} />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
          <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
            <UserCircle size={32} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: '800' }}>{user.name || user.username || 'User'}</h2>
            <div style={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: '500' }}>Refer by: {user.upliner || 'No Upliner'}</div>
          </div>
        </div>
        
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '4px', fontWeight: '600' }}>Account Balance</div>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: 1 }}>Rs{calculatedBalance.toLocaleString()}</div>
          </div>
          {activePlan && activePlan !== 'None' ? (
            <div style={{ 
              background: 'linear-gradient(135deg, #fef3c7 0%, #f59e0b 100%)', 
              color: '#78350f', 
              padding: '6px 14px', 
              borderRadius: '20px', 
              fontSize: '0.85rem', 
              fontWeight: '900',
              boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid rgba(255,255,255,0.4)',
              marginBottom: '6px'
            }}>
              <CheckCircle size={14} />
              {activePlan}
            </div>
          ) : (
            <div style={{ 
              background: 'rgba(0,0,0,0.2)', 
              color: 'white', 
              padding: '6px 14px', 
              borderRadius: '20px', 
              fontSize: '0.8rem', 
              fontWeight: '700',
              marginBottom: '6px',
              backdropFilter: 'blur(4px)'
            }}>
              No Active Plan
            </div>
          )}
        </div>
      </div>

      {/* Actions Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        <Link to="/plans" style={{ textDecoration: 'none' }}>
          <div className="glass-card flex-center" style={{ flexDirection: 'column', padding: '16px 10px', gap: '8px', border: '1px solid rgba(217,119,6,0.2)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Download size={20} />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-dark)' }}>Deposit</span>
          </div>
        </Link>
        <Link to="/withdraw" style={{ textDecoration: 'none' }}>
          <div className="glass-card flex-center" style={{ flexDirection: 'column', padding: '16px 10px', gap: '8px', border: '1px solid rgba(217,119,6,0.2)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={20} />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-dark)' }}>Withdraw</span>
          </div>
        </Link>
        {(!activePlan || activePlan === 'None') ? (
          <Link to="/plans" style={{ textDecoration: 'none' }}>
            <div className="glass-card flex-center" style={{ flexDirection: 'column', padding: '16px 10px', gap: '8px', border: '1px solid rgba(217,119,6,0.2)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={20} />
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-dark)' }}>See Plans</span>
            </div>
          </Link>
        ) : (
          <Link to="/my-task" style={{ textDecoration: 'none' }}>
            <div className="glass-card flex-center" style={{ flexDirection: 'column', padding: '16px 10px', gap: '8px', border: '1px solid rgba(217,119,6,0.2)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ClipboardList size={20} />
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-dark)' }}>My Task</span>
            </div>
          </Link>
        )}
      </div>

      {/* Referral Link */}
      <div className="glass-card mb-4 flex-between" style={{ padding: '16px', background: 'white' }}>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '600' }}>Referral Link</div>
          <div style={{ fontSize: '0.85rem', color: '#d97706', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '700' }}>
            {window.location.origin}/register?ref={user.username || user.id || 'guest_user'}
          </div>
        </div>
        <button onClick={handleCopyLink} style={{ border: 'none', background: copied ? '#10b981' : 'var(--gradient-gold)', padding: '10px', borderRadius: '10px', color: 'white', cursor: 'pointer', marginLeft: '12px', boxShadow: copied ? '0 4px 10px rgba(16, 185, 129, 0.2)' : '0 4px 10px rgba(234, 88, 12, 0.2)', transition: 'all 0.3s' }}>
          {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
        </button>
      </div>

      {/* Help & Support */}
      <div className="mb-4">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', marginLeft: '4px', color: 'var(--text-dark)' }}>Help & Support</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          
          <a href={`https://wa.me/${homeConfig.whatsappNumber}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="glass-card flex-center" style={{ flexDirection: 'column', padding: '16px 8px', gap: '8px', textAlign: 'center', background: 'white' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {homeConfig.whatsappIcon ? <img src={homeConfig.whatsappIcon} alt="Icon" style={{width: '20px', height: '20px', objectFit: 'contain'}} /> : <MessageCircle size={20} />}
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: '700', lineHeight: 1.2 }}>WhatsApp<br/>Number</span>
            </div>
          </a>

          <a href={`${homeConfig.whatsappChannel}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="glass-card flex-center" style={{ flexDirection: 'column', padding: '16px 8px', gap: '8px', textAlign: 'center', background: 'white' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {homeConfig.whatsappChannelIcon ? <img src={homeConfig.whatsappChannelIcon} alt="Icon" style={{width: '20px', height: '20px', objectFit: 'contain'}} /> : <Users size={20} />}
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: '700', lineHeight: 1.2 }}>WhatsApp<br/>Channel</span>
            </div>
          </a>

          <Link to="/support-tickets" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="glass-card flex-center" style={{ flexDirection: 'column', padding: '16px 8px', gap: '8px', textAlign: 'center', background: 'white' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Headset size={20} />
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: '700', lineHeight: 1.2 }}>Support<br/>Ticket</span>
            </div>
          </Link>

        </div>
      </div>

      {/* Features Grid */}
      <div className="glass-card mb-4" style={{ padding: '10px', background: 'white' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
          {[
            { name: 'Deposit History', icon: <FileText size={24} />, color: '#d97706', route: '/deposit-history' },
            { name: 'Withdraw History', icon: <FileText size={24} />, color: '#ea580c', route: '/withdraw-history' },
            { name: 'Transaction', icon: <Activity size={24} />, color: '#d97706', route: '/transaction' },
            (!user.plan || user.plan === 'None') 
              ? { name: 'See Plans', icon: <Activity size={24} />, color: '#ea580c', route: '/plans' }
              : { name: 'My Task', icon: <ClipboardList size={24} />, color: '#ea580c', route: '/my-task' },
            { name: 'My Team', icon: <Users size={24} />, color: '#d97706', route: '/team' },
            { name: 'App Download', icon: <Smartphone size={24} />, color: '#ea580c', route: '/app-download' },
            { name: 'Verified', icon: <ShieldCheck size={24} />, color: '#10b981', route: '/verified' }
          ].map((item, i, arr) => {
            const isLastInOddRow = (i === arr.length - 1) && (arr.length % 3 === 1);
            return (
              <Link to={item.route} key={i} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center', gridColumn: isLastInOddRow ? '2' : 'auto' }}>
                <div style={{ color: item.color }}>{item.icon}</div>
                <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {[
          { label: 'Cash Balance', value: `Rs${calculatedBalance.toLocaleString()}`, icon: <Wallet size={20} color="#d97706" />, bg: '#fef3c7' },
          { label: 'Total Deposit', value: `Rs${stats.totalDeposit.toLocaleString()}`, icon: <Download size={20} color="#ea580c" />, bg: '#ffedd5' },
          { label: 'Total Withdraw', value: `Rs${stats.totalWithdraw.toLocaleString()}`, icon: <Upload size={20} color="#d97706" />, bg: '#fef3c7' },
          { label: 'Pending Deposit', value: `Rs${stats.pendingDeposit.toLocaleString()}`, icon: <Activity size={20} color="#ea580c" />, bg: '#ffedd5' },
          { label: 'Pending Withdraw', value: `Rs${stats.pendingWithdraw.toLocaleString()}`, icon: <Activity size={20} color="#d97706" />, bg: '#fef3c7' },
          { label: 'Total Team', value: '0', icon: <Users2 size={20} color="#ea580c" />, bg: '#ffedd5' },
          { label: 'Team Investment', value: 'Rs0', icon: <BarChart3 size={20} color="#d97706" />, bg: '#fef3c7' },
          { label: 'Team Commission', value: 'Rs0', icon: <TrendingUp size={20} color="#ea580c" />, bg: '#ffedd5' }
        ].map((item, i) => (
          <div key={i} className="glass-card" style={{ padding: '16px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div style={{ background: item.bg, padding: '8px', borderRadius: '10px' }}>
                {item.icon}
              </div>
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1f2937', marginBottom: '4px' }}>{item.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex' }} onClick={() => setIsSidebarOpen(false)}>
          <div style={{ width: '280px', background: 'white', height: '100%', padding: '20px', display: 'flex', flexDirection: 'column', animation: 'slideIn 0.3s ease' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--gradient-gold)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserCircle size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: 'var(--text-dark)' }}>{user.name || 'Member'}</h3>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user.email || 'N/A'}</div>
                </div>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#6b7280', cursor: 'pointer' }}>×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
              <Link to="/profile" onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: 'none', color: '#1f2937', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', background: '#f8fafc' }}>
                <UserCircle size={18} color="#d97706" /> Profile Settings
              </Link>
              <Link to="/change-password" onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: 'none', color: '#1f2937', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', background: '#f8fafc' }}>
                <Key size={18} color="#d97706" /> Change Password
              </Link>
              <Link to="/deposit-history" onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: 'none', color: '#1f2937', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', background: '#f8fafc' }}>
                <FileText size={18} color="#d97706" /> Deposit History
              </Link>
              <Link to="/withdraw-history" onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: 'none', color: '#1f2937', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', background: '#f8fafc' }}>
                <FileText size={18} color="#d97706" /> Withdraw History
              </Link>
              <Link to="/payment-methods" onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: 'none', color: '#1f2937', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', background: '#f8fafc' }}>
                <Wallet size={18} color="#d97706" /> Payment Methods
              </Link>
              
              <div style={{ height: '1px', background: '#e2e8f0', margin: '10px 0' }}></div>
              
              <button onClick={handleLogout} style={{ border: 'none', color: '#dc2626', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', background: '#fef2f2', cursor: 'pointer', textAlign: 'left' }}>
                <LogOut size={18} color="#dc2626" /> Logout
              </button>
            </div>
            
            <div style={{ marginTop: 'auto', paddingTop: '20px', textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem', fontWeight: '600' }}>
              IPL Growth App
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {isNotificationOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setIsNotificationOpen(false)}>
          <div style={{ width: '100%', maxWidth: '340px', background: 'white', borderRadius: '24px', padding: '24px', position: 'relative', animation: 'fadeInUp 0.3s ease' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-dark)' }}>Notifications</h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Important updates & alerts</div>
              </div>
            </div>

            {adminMessage ? (
              <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: '#1f2937', fontWeight: '800' }}>{adminMessage.title}</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#4b5563', lineHeight: '1.5' }}>{adminMessage.text}</p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#94a3b8' }}>
                  <Bell size={30} />
                </div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: 'var(--text-dark)', fontWeight: '800' }}>No New Notifications</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>You're all caught up! Check back later for updates.</p>
              </div>
            )}

            <button onClick={() => setIsNotificationOpen(false)} style={{ width: '100%', marginTop: '24px', padding: '14px', background: 'var(--gradient-gold)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(217, 119, 6, 0.3)' }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Approval Message Modal */}
      {approvalMessage && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '30px 24px', maxWidth: '340px', width: '100%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ width: '64px', height: '64px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle size={32} color="#16a34a" />
            </div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-dark)' }}>Congratulations!</h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.5', fontWeight: '600' }}>{approvalMessage}</p>
            <button onClick={() => setApprovalMessage(null)} style={{ width: '100%', padding: '14px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: '800', cursor: 'pointer' }}>
              Awesome!
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardPage;
