import React from 'react';
import { ArrowLeft, Users, Copy, UserPlus, TrendingUp, Award, Wallet, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const TeamPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {
    refCode: 'guest_user'
  };

  const [teamMembers, setTeamMembers] = React.useState([]);
  const [totalReferrals, setTotalReferrals] = React.useState(0);
  const [totalCommission, setTotalCommission] = React.useState(0);

  const [settings, setSettings] = React.useState({
    level1: 16,
    level2: 4,
    level3: 1,
    inviteText: 'Share your link with friends. When they invest, you earn up to {level1}% commission instantly!',
    minTransferAmount: 500,
    transferCooldownDays: 7
  });
  const [availableCommission, setAvailableCommission] = React.useState(0);
  const [notification, setNotification] = React.useState({ show: false, message: '', type: 'error' });

  const showNotification = (message, type = 'error') => {
    setNotification({ show: true, message, type });
  };

  const handleTransfer = () => {
    if (availableCommission <= 0) {
      showNotification("You don't have any commission available to transfer.");
      return;
    }
    
    if (availableCommission < settings.minTransferAmount) {
      showNotification(`Minimum transfer amount is Rs${settings.minTransferAmount}. You need Rs${settings.minTransferAmount - availableCommission} more to transfer.`);
      return;
    }

    const lastTransfer = localStorage.getItem('last_commission_transfer');
    if (lastTransfer && settings.transferCooldownDays > 0) {
      const daysSince = (new Date() - new Date(lastTransfer)) / (1000 * 60 * 60 * 24);
      if (daysSince < settings.transferCooldownDays) {
         const daysLeft = Math.ceil(settings.transferCooldownDays - daysSince);
         showNotification(`You can only transfer commission every ${settings.transferCooldownDays} days. Please wait ${daysLeft} more day(s).`);
         return;
      }
    }

    // Mocking the transfer logic
    showNotification(`Rs${availableCommission} transferred to your main wallet successfully!`, 'success');
    localStorage.setItem('last_commission_transfer', new Date().toISOString());
    localStorage.setItem('available_commission', '0');
    setAvailableCommission(0);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/register?ref=${user.id || 'guest_user'}`;
    navigator.clipboard.writeText(link).then(() => {
      showNotification('Referral link copied to clipboard!', 'success');
    }).catch(() => {
      showNotification('Failed to copy link.');
    });
  };

  React.useEffect(() => {
    const saved = localStorage.getItem('referral_settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
    
    // Fetch real team data from backend using user.id
    fetch(`${API_BASE_URL}/api/team/${user.id || user.name}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.team) {
          const members = data.team.map(m => ({
            id: m.id,
            username: m.name,
            joined: m.joined,
            plan: m.plan && String(m.plan).toLowerCase() !== 'none' ? m.plan : 'No Package',
            level: 'Level 1',
            commission: 'Rs' + (data.commissions.find(c => c.description.includes(m.name))?.amount || 0)
          }));
          setTeamMembers(members);
          setTotalReferrals(members.length);
          
          const calcCommission = members.reduce((sum, m) => sum + (Number(m.commission?.replace('Rs', '')) || 0), 0);
          setTotalCommission(calcCommission);
        }
      })
      .catch(err => console.error('Failed to fetch team', err));
    
    const savedAvail = Number(localStorage.getItem('available_commission')) || 0;
    setAvailableCommission(savedAvail);
  }, []);

  return (
    <div className="page-transition" style={{ padding: '10px', paddingBottom: '100px', maxWidth: 'var(--max-width)', margin: '0 auto' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '24px' }}>
        <div onClick={() => navigate(-1)} style={{ width: '45px', height: '45px', borderRadius: '14px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
           <ArrowLeft size={20} color="var(--text-dark)" />
        </div>
        <div>
           <h1 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-dark)', fontWeight: '800' }}>My Team</h1>
           <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Manage your referrals & commissions</p>
        </div>
      </div>

      {/* Referral Link Card */}
      <div className="glass-card mb-4" style={{ padding: '10px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderRadius: '20px', color: 'white', boxShadow: '0 10px 25px rgba(245, 158, 11, 0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <UserPlus size={20} color="white" />
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: '800' }}>Invite Friends & Earn</h2>
        </div>
        <p style={{ margin: '0 0 16px 0', fontSize: '0.8rem', fontWeight: '600', color: 'white' }}>
          {settings.inviteText.replace('{level1}', settings.level1)}
        </p>
        
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.2)', padding: '4px', borderRadius: '12px', backdropFilter: 'blur(5px)' }}>
          <div style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '700' }}>
            {window.location.origin}/register?ref={user.id || 'guest_user'}
          </div>
          <button onClick={handleCopyLink} style={{ background: 'white', color: '#d97706', border: 'none', padding: '10px 16px', borderRadius: '10px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }} onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'} onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}>
            <Copy size={16} /> Copy
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div className="glass-card" style={{ padding: '16px', background: 'white', border: '1px solid rgba(217,119,6,0.2)' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <Users size={18} />
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Total Referrals</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-dark)' }}>{totalReferrals}</div>
        </div>
        <div className="glass-card" style={{ padding: '16px', background: 'white', border: '1px solid rgba(217,119,6,0.2)' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <TrendingUp size={18} />
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Total Commission</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-dark)' }}>Rs{totalCommission.toLocaleString()}</div>
        </div>
      </div>

      {/* Available Commission Transfer Card */}
      <div className="glass-card mb-4" style={{ padding: '20px', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--gradient-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 10px rgba(245,158,11,0.3)' }}>
              <Wallet size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#b45309', fontWeight: '800', textTransform: 'uppercase' }}>Available Commission</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-dark)' }}>Rs{availableCommission.toLocaleString()}</div>
            </div>
          </div>
        </div>
        <button 
          onClick={handleTransfer}
          style={{ width: '100%', padding: '14px', background: 'var(--text-dark)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: 'background 0.2s' }}
        >
          Transfer to Main Wallet <ArrowRight size={18} />
        </button>
        <div style={{ textAlign: 'center', fontSize: '0.7rem', color: '#b45309', fontWeight: '700' }}>
          Min Transfer: Rs{settings.minTransferAmount || 0} • Frequency: {settings.transferCooldownDays} Days
        </div>
      </div>

      {/* Commission Levels Info */}
      <h3 style={{ fontSize: '1rem', margin: '0 0 12px 0', color: 'var(--text-dark)', fontWeight: '800' }}>Commission Levels</h3>
      <div className="glass-card mb-4" style={{ padding: '16px', background: 'white', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Level 1</div>
          <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#10b981' }}>{settings.level1}%</div>
        </div>
        <div style={{ borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Level 2</div>
          <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#3b82f6' }}>{settings.level2}%</div>
        </div>
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Level 3</div>
          <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#8b5cf6' }}>{settings.level3}%</div>
        </div>
      </div>

      {/* Team Members List */}
      <h3 style={{ fontSize: '1rem', margin: '0 0 12px 0', color: 'var(--text-dark)', fontWeight: '800' }}>Recent Joins</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {teamMembers.length > 0 ? (
          teamMembers.map((member) => (
            <div key={member.id || member.username} className="glass-card" style={{ padding: '16px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Users size={18} color="#64748b" />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 2px 0', fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-dark)' }}>{member.username}</h4>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                    Joined: {member.joined} • Package: <span style={{ color: member.plan === 'No Package' ? '#ef4444' : '#10b981' }}>{member.plan}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '900', color: 'var(--text-dark)' }}>
                  +{member.commission}
                </div>
                <div style={{ background: member.level === 'Level 1' ? '#dcfce7' : '#e0e7ff', color: member.level === 'Level 1' ? '#16a34a' : '#4f46e5', padding: '4px 8px', borderRadius: '6px', fontSize: '0.6rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Award size={10} /> {member.level}
                </div>
              </div>

            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '30px 20px', background: 'white', borderRadius: '20px', border: '1px dashed #e2e8f0' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#cbd5e1' }}>
              <Users size={30} />
            </div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: 'var(--text-dark)', fontWeight: '800' }}>No Team Members Yet</h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>Share your referral link with friends and start earning commission instantly when they invest!</p>
          </div>
        )}
      </div>

      {/* Custom Notification Modal */}
      {notification.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '30px 24px', width: '100%', maxWidth: '340px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: notification.type === 'success' ? '#dcfce7' : '#fee2e2', color: notification.type === 'success' ? '#16a34a' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
              {notification.type === 'success' ? <CheckCircle size={30} /> : <AlertCircle size={30} />}
            </div>
            
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', color: 'var(--text-dark)', fontWeight: '900' }}>
              {notification.type === 'success' ? 'Success!' : 'Oops!'}
            </h3>
            
            <p style={{ margin: '0 0 24px 0', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600', lineHeight: '1.5' }}>
              {notification.message}
            </p>
            
            <button 
              onClick={() => setNotification({ ...notification, show: false })}
              style={{ width: '100%', padding: '14px', background: notification.type === 'success' ? '#16a34a' : 'var(--text-dark)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', transition: 'transform 0.1s' }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Got it
            </button>
          </div>
          <style>{`
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(20px) scale(0.95); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>
        </div>
      )}

    </div>
  );
};

export default TeamPage;
