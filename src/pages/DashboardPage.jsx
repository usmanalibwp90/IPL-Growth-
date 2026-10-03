import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Menu, Bell, UserCircle, TrendingUp, Download, Upload, ClipboardList, 
  Copy, MessageCircle, MessageSquare, FileText, Users, Smartphone, ShieldCheck, 
  Key, LogOut, Wallet, BarChart3, Users2, Activity
} from 'lucide-react';

const DashboardPage = () => {
  const user = JSON.parse(localStorage.getItem('user')) || {
    username: 'GuestUser',
    refCode: 'guest_user'
  };

  const [homeConfig, setHomeConfig] = React.useState({
    whatsappNumber: '+923001234567',
    whatsappChannel: 'https://whatsapp.com/channel/xxx',
    telegramChannel: 't.me/iplgrowth'
  });

  useEffect(() => {
    const savedConfig = localStorage.getItem('home_config');
    if (savedConfig) {
      setHomeConfig(JSON.parse(savedConfig));
    }
  }, []);

  return (
    <div className="content-area">
      
      {/* Top Header */}
      <header className="flex-between mb-4 glass-pill" style={{ padding: '8px 12px' }}>
        <button style={{ border: 'none', background: 'white', color: 'var(--text-dark)', width: '36px', height: '36px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-soft)' }}>
          <Menu size={20} />
        </button>
        <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-dark)' }}>IPL Dashboard</div>
        <button style={{ border: 'none', background: 'var(--gradient-gold)', color: 'white', width: '36px', height: '36px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(234, 88, 12, 0.3)', position: 'relative' }}>
          <Bell size={20} />
          <span style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', background: '#fff', borderRadius: '50%', border: '2px solid #ea580c' }}></span>
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
            <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: '800' }}>{user.username}</h2>
            <div style={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: '500' }}>Refer by: No Upliner</div>
          </div>
        </div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '4px', fontWeight: '600' }}>Account Balance</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: 1 }}>Rs0.00</div>
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
        <Link to="/my-task" style={{ textDecoration: 'none' }}>
          <div className="glass-card flex-center" style={{ flexDirection: 'column', padding: '16px 10px', gap: '8px', border: '1px solid rgba(217,119,6,0.2)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClipboardList size={20} />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-dark)' }}>My Task</span>
          </div>
        </Link>
      </div>

      {/* Referral Link */}
      <div className="glass-card mb-4 flex-between" style={{ padding: '16px', background: 'white' }}>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '600' }}>Referral Link</div>
          <div style={{ fontSize: '0.85rem', color: '#d97706', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '700' }}>
            https://yourdomain.com?reference=kingfaizan
          </div>
        </div>
        <button style={{ border: 'none', background: 'var(--gradient-gold)', padding: '10px', borderRadius: '10px', color: 'white', cursor: 'pointer', marginLeft: '12px', boxShadow: '0 4px 10px rgba(234, 88, 12, 0.2)' }}>
          <Copy size={18} />
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

          <a href={`https://${homeConfig.telegramChannel}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="glass-card flex-center" style={{ flexDirection: 'column', padding: '16px 8px', gap: '8px', textAlign: 'center', background: 'white' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {homeConfig.telegramIcon ? <img src={homeConfig.telegramIcon} alt="Icon" style={{width: '20px', height: '20px', objectFit: 'contain'}} /> : <MessageSquare size={20} />}
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: '700', lineHeight: 1.2 }}>Telegram<br/>Channel</span>
            </div>
          </a>

        </div>
      </div>

      {/* Features Grid */}
      <div className="glass-card mb-4" style={{ padding: '10px', background: 'white' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
          {[
            { name: 'Deposit History', icon: <FileText size={24} />, color: '#d97706', route: '/deposit-history' },
            { name: 'Withdraw History', icon: <FileText size={24} />, color: '#ea580c', route: '/withdraw-history' },
            { name: 'Transaction', icon: <Activity size={24} />, color: '#d97706', route: '/transaction' },
            { name: 'My Task', icon: <ClipboardList size={24} />, color: '#ea580c', route: '/my-task' },
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
          { label: 'Cash Balance', value: 'Rs0.00', icon: <Wallet size={20} color="#d97706" />, bg: '#fef3c7' },
          { label: 'Total Deposit', value: 'Rs0.00', icon: <Download size={20} color="#ea580c" />, bg: '#ffedd5' },
          { label: 'Total Withdraw', value: 'Rs0.00', icon: <Upload size={20} color="#d97706" />, bg: '#fef3c7' },
          { label: 'Pending Deposit', value: 'Rs0.00', icon: <Activity size={20} color="#ea580c" />, bg: '#ffedd5' },
          { label: 'Pending Withdraw', value: 'Rs0.00', icon: <Activity size={20} color="#d97706" />, bg: '#fef3c7' },
          { label: 'Total Team', value: '0', icon: <Users2 size={20} color="#ea580c" />, bg: '#ffedd5' },
          { label: 'Team Investment', value: 'Rs0.00', icon: <BarChart3 size={20} color="#d97706" />, bg: '#fef3c7' },
          { label: 'Team Commission', value: 'Rs0.00', icon: <TrendingUp size={20} color="#ea580c" />, bg: '#ffedd5' }
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

    </div>
  );
};

export default DashboardPage;
