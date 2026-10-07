import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Users, Copy, Share2, UserPlus, TrendingUp, Award, 
  Wallet, ArrowRight, AlertCircle, CheckCircle, Lock, Unlock, 
  Gift, Sparkles, Check, Clock, ShieldCheck, RefreshCw 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const TeamPage = () => {
  const navigate = useNavigate();
  const rawUser = localStorage.getItem('user');
  const user = rawUser ? JSON.parse(rawUser) : { id: 'guest_user', refCode: 'guest_user' };

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [directReferrals, setDirectReferrals] = useState([]);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [qualifiedLevel1Count, setQualifiedLevel1Count] = useState(0);
  const [referralBonusEarned, setReferralBonusEarned] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);
  const [availableCommission, setAvailableCommission] = useState(0);
  const [commissionTransferUnlocked, setCommissionTransferUnlocked] = useState(false);
  const [isBonusClaimed, setIsBonusClaimed] = useState(false);
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'qualified', 'pending'

  const [settings, setSettings] = useState({
    level1: 16,
    level2: 4,
    level3: 1,
    inviteText: 'Share your referral link with friends. Earn commission when your team purchases eligible packages.',
    bonusPerReferral: 500,
    maxBonus: 5000,
    referralTarget: 10
  });

  const [notification, setNotification] = useState({ show: false, message: '', type: 'error', title: '' });

  const showNotification = (message, type = 'error', title = '') => {
    setNotification({ 
      show: true, 
      message, 
      type, 
      title: title || (type === 'success' ? 'Success!' : 'Notice') 
    });
  };

  const fetchTeamData = (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    const userId = user?.id || '';

    fetch(`${API_BASE_URL}/api/team/${userId ? encodeURIComponent(userId) : ''}`, {
      headers: { 
        'Authorization': `Bearer ${token}` 
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          // Process Direct Referrals
          let directs = [];
          if (Array.isArray(data.directReferrals) && data.directReferrals.length > 0) {
            directs = data.directReferrals;
          } else if (Array.isArray(data.team)) {
            // Fallback mapper if worker returns older payload
            const commMap = new Map();
            (data.commissions || []).forEach(c => {
              if (c.level === 1) commMap.set(c.referred_user_id, c);
            });

            directs = data.team.map(m => {
              const comm = commMap.get(m.id);
              const hasPlan = m.plan && String(m.plan).toLowerCase() !== 'none' && String(m.plan).trim() !== '';
              const isQualified = !!(comm || hasPlan);
              const pkgName = comm?.package_name || (hasPlan ? m.plan : 'No Package');
              const pkgAmount = Number(comm?.package_amount || 0);
              const commEarned = Number(comm?.commission_amount || (pkgAmount > 0 ? pkgAmount * 0.16 : 0));

              return {
                id: m.id,
                name: m.name,
                joined: m.joined || 'Recent',
                level: 'Level 1',
                plan: pkgName,
                packageAmount: pkgAmount,
                commissionEarned: commEarned,
                isQualified,
                status: isQualified ? 'Qualified' : 'Pending',
                bonusAmount: 0
              };
            });

            const qList = directs.filter(d => d.isQualified);
            const pList = directs.filter(d => !d.isQualified);
            qList.forEach((item, idx) => {
              item.bonusAmount = idx < 10 ? 500 : 0;
            });
            directs = [...qList, ...pList];
          }

          setDirectReferrals(directs);

          const qCount = data.qualifiedLevel1Count !== undefined 
            ? Number(data.qualifiedLevel1Count) 
            : directs.filter(d => d.isQualified).length;

          setQualifiedLevel1Count(qCount);
          setTotalReferrals(data.totalReferrals !== undefined ? Number(data.totalReferrals) : directs.length);

          const bonusEarned = data.referralBonusEarned !== undefined 
            ? Number(data.referralBonusEarned) 
            : Math.min(qCount, 10) * 500;
          setReferralBonusEarned(bonusEarned);

          setTotalCommission(Number(data.totalCommission) || 0);
          setAvailableCommission(Number(data.availableCommission) || 0);
          setCommissionTransferUnlocked(qCount >= 10);
          setIsBonusClaimed(!!data.isBonusClaimed);
        }
      })
      .catch(err => {
        console.error('Failed to fetch team data', err);
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    const saved = localStorage.getItem('referral_settings');
    if (saved) {
      try {
        setSettings(prev => ({ ...prev, ...JSON.parse(saved) }));
      } catch (e) {
        // ignore
      }
    }
    fetchTeamData();
  }, []);

  const referralLink = `${window.location.origin}/register?ref=${user.id || user.refCode || 'guest_user'}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink)
      .then(() => {
        showNotification('Referral link copied to clipboard!', 'success');
      })
      .catch(() => {
        showNotification('Failed to copy link.');
      });
  };

  const handleShareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join Islamic Profit Limited (IPL Growth)',
        text: 'Join my team on Islamic Profit Limited and grow your digital investments securely!',
        url: referralLink,
      }).catch((err) => {
        if (err.name !== 'AbortError') {
          handleCopyLink();
        }
      });
    } else {
      handleCopyLink();
    }
  };

  // Commission Transfer to Wallet
  const handleTransferCommission = () => {
    if (!commissionTransferUnlocked) {
      showNotification(
        'Complete 10 qualified Level 1 referrals to unlock commission transfer.',
        'error',
        'Commission Transfer Locked'
      );
      return;
    }

    if (availableCommission <= 0) {
      showNotification("You don't have any available commission to transfer.", 'error', 'No Balance');
      return;
    }

    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    fetch(`${API_BASE_URL}/api/transfer-commission`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId: user.id, amount: availableCommission })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          showNotification(data.error, 'error');
        } else {
          showNotification(
            `Rs${availableCommission.toLocaleString()} commission transferred to your main wallet successfully!`,
            'success',
            'Transfer Complete'
          );
          setAvailableCommission(0);

          // Update local user object
          const updatedUser = { 
            ...user, 
            balance: (Number(user.balance) || 0) + availableCommission 
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          fetchTeamData(true);
        }
      })
      .catch(err => {
        console.error('Transfer failed', err);
        showNotification('Commission transfer failed. Please try again.', 'error');
      });
  };

  // Claim Rs5,000 Milestone Bonus
  const handleClaimMilestoneBonus = () => {
    if (qualifiedLevel1Count < 10) {
      showNotification('Complete 10 qualified Level 1 referrals to claim the Rs5,000 bonus.', 'error');
      return;
    }

    if (isBonusClaimed) {
      showNotification('You have already claimed this Rs5,000 milestone bonus!', 'notice');
      return;
    }

    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    fetch(`${API_BASE_URL}/api/transfer-bonus`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId: user.id })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          showNotification(data.error, 'error');
        } else {
          showNotification(
            'Rs5,000 Referral Milestone Bonus transferred to your main wallet successfully!',
            'success',
            'Bonus Claimed!'
          );
          setIsBonusClaimed(true);

          const updatedUser = { 
            ...user, 
            balance: (Number(user.balance) || 0) + 5000 
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          fetchTeamData(true);
        }
      })
      .catch(err => {
        console.error('Bonus claim failed', err);
        showNotification('Bonus claim failed. Please try again.', 'error');
      });
  };

  // Calculate milestone progress
  const target = 10;
  const progressPercent = Math.min(Math.round((qualifiedLevel1Count / target) * 100), 100);
  const remainingToUnlock = Math.max(target - qualifiedLevel1Count, 0);

  // Filtered direct referrals list
  const filteredReferrals = directReferrals.filter(member => {
    if (filterTab === 'qualified') return member.isQualified;
    if (filterTab === 'pending') return !member.isQualified;
    return true;
  });

  return (
    <div className="page-transition" style={{ padding: '12px', paddingBottom: '110px', maxWidth: 'var(--max-width)', margin: '0 auto' }}>
      
      {/* 1. TOP HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button 
            onClick={() => navigate(-1)} 
            style={{ 
              width: '44px', 
              height: '44px', 
              borderRadius: '14px', 
              background: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              border: '1px solid #f1f5f9', 
              cursor: 'pointer', 
              flexShrink: 0, 
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'transform 0.1s'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
             <ArrowLeft size={20} color="var(--text-dark)" />
          </button>
          <div>
             <h1 style={{ margin: 0, fontSize: '1.35rem', color: 'var(--text-dark)', fontWeight: '900', letterSpacing: '-0.3px' }}>My Team</h1>
             <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Manage your referrals & commissions</p>
          </div>
        </div>

        <button 
          onClick={() => fetchTeamData(true)} 
          disabled={refreshing}
          style={{ 
            background: 'white', 
            border: '1px solid #f1f5f9', 
            borderRadius: '12px', 
            padding: '8px 12px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            fontSize: '0.75rem', 
            fontWeight: '700', 
            color: 'var(--text-dark)', 
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}
        >
          <RefreshCw size={14} className={refreshing ? 'spin-anim' : ''} color="#d97706" />
          <span>Sync</span>
        </button>
      </div>

      {/* 2. INVITE FRIENDS CARD */}
      <div 
        className="glass-card mb-4" 
        style={{ 
          padding: '20px', 
          background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', 
          borderRadius: '24px', 
          color: 'white', 
          boxShadow: '0 12px 30px rgba(245, 158, 11, 0.35)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', right: '-15px', top: '-15px', width: '110px', height: '110px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserPlus size={20} color="white" />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900', letterSpacing: '-0.2px' }}>Invite Friends & Earn</h2>
        </div>

        <p style={{ margin: '0 0 16px 0', fontSize: '0.82rem', fontWeight: '500', color: 'rgba(255,255,255,0.92)', lineHeight: '1.45' }}>
          {settings.inviteText}
        </p>
        
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.22)', padding: '5px', borderRadius: '16px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', gap: '6px' }}>
          <div style={{ flex: 1, padding: '8px 12px', fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '700', color: 'white' }}>
            {referralLink}
          </div>
          
          <button 
            onClick={handleCopyLink} 
            style={{ 
              background: 'white', 
              color: '#d97706', 
              border: 'none', 
              padding: '9px 14px', 
              borderRadius: '12px', 
              fontWeight: '800', 
              fontSize: '0.78rem', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.1s' 
            }} 
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'} 
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Copy size={14} /> Copy
          </button>

          <button 
            onClick={handleShareLink} 
            style={{ 
              background: 'rgba(255,255,255,0.25)', 
              color: 'white', 
              border: '1px solid rgba(255,255,255,0.5)', 
              padding: '9px 12px', 
              borderRadius: '12px', 
              fontWeight: '800', 
              fontSize: '0.78rem', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              transition: 'transform 0.1s' 
            }} 
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'} 
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Share2 size={14} />
          </button>
        </div>
      </div>

      {/* 3. REFERRAL STATS (3 Attractive Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
        
        {/* Card 1: Level 1 Referrals */}
        <div className="glass-card" style={{ padding: '14px 10px', background: 'white', border: '1px solid rgba(217,119,6,0.15)', borderRadius: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
            <Users size={19} />
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>
            Level 1 Direct
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-dark)', lineHeight: '1.2' }}>
            {qualifiedLevel1Count} <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '700' }}>/ 10</span>
          </div>
          <div style={{ marginTop: '6px', fontSize: '0.62rem', fontWeight: '800', color: '#d97706', background: '#fef3c7', padding: '2px 8px', borderRadius: '8px' }}>
            Qualified
          </div>
        </div>

        {/* Card 2: Total Commission */}
        <div className="glass-card" style={{ padding: '14px 10px', background: 'white', border: '1px solid rgba(234,88,12,0.15)', borderRadius: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
            <TrendingUp size={19} />
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>
            Total Comm.
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: '900', color: 'var(--text-dark)', lineHeight: '1.2' }}>
            Rs{totalCommission.toLocaleString()}
          </div>
          <div style={{ marginTop: '6px', fontSize: '0.62rem', fontWeight: '800', color: '#ea580c', background: '#ffedd5', padding: '2px 8px', borderRadius: '8px' }}>
            All 3 Levels
          </div>
        </div>

        {/* Card 3: Referral Bonus (Completely Separate) */}
        <div className="glass-card" style={{ padding: '14px 10px', background: 'white', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
            <Gift size={19} />
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>
            Ref. Bonus
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#16a34a', lineHeight: '1.2' }}>
            Rs{referralBonusEarned.toLocaleString()}
          </div>
          <div style={{ marginTop: '6px', fontSize: '0.62rem', fontWeight: '800', color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '8px' }}>
            Separate
          </div>
        </div>

      </div>

      {/* 4 & 5. NEW LEVEL 1 REFERRAL BONUS SYSTEM & PROGRESS UI */}
      <div 
        className="glass-card mb-4" 
        style={{ 
          padding: '20px', 
          background: 'white', 
          borderRadius: '24px', 
          border: '1px solid rgba(217,119,6,0.2)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.04)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Sparkles size={18} color="#d97706" />
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '900', color: 'var(--text-dark)' }}>
                Level 1 Referral Reward
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>
              Earn Rs500 for every qualified direct referral
            </p>
          </div>

          <div style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '800', flexShrink: 0 }}>
            Target: 10
          </div>
        </div>

        {/* Progress Numbers */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
          <div>
            <span style={{ fontSize: '1.45rem', fontWeight: '900', color: 'var(--text-dark)' }}>
              {qualifiedLevel1Count}
            </span>
            <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#94a3b8' }}> / 10 </span>
            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#d97706', marginLeft: '4px' }}>
              Qualified Referrals
            </span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Bonus Earned</div>
            <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#16a34a' }}>
              Rs{referralBonusEarned.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '12px', background: '#f1f5f9', borderRadius: '30px', overflow: 'hidden', position: 'relative', marginBottom: '16px' }}>
          <div 
            style={{ 
              width: `${progressPercent}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, #f59e0b 0%, #10b981 100%)', 
              borderRadius: '30px',
              transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
            }} 
          />
        </div>

        {/* 10 Small Milestone Circles */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '4px', textAlign: 'center' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
              const isAchieved = num <= qualifiedLevel1Count;
              return (
                <div key={num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div 
                    style={{ 
                      width: '26px', 
                      height: '26px', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '0.65rem', 
                      fontWeight: '800', 
                      background: isAchieved ? 'linear-gradient(135deg, #10b981, #059669)' : '#f8fafc', 
                      color: isAchieved ? 'white' : '#94a3b8', 
                      border: isAchieved ? 'none' : '1px solid #e2e8f0',
                      boxShadow: isAchieved ? '0 2px 6px rgba(16,185,129,0.3)' : 'none',
                      transition: 'all 0.3s'
                    }}
                  >
                    {isAchieved ? <Check size={14} strokeWidth={3} /> : num}
                  </div>
                  <span style={{ fontSize: '0.55rem', fontWeight: '700', color: isAchieved ? '#16a34a' : '#94a3b8' }}>
                    {isAchieved ? 'Rs500' : '○'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Motivational Banner / Instructions */}
        {qualifiedLevel1Count < 10 ? (
          <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '16px', padding: '12px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <AlertCircle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#b45309' }}>
                Remaining: {remainingToUnlock} {remainingToUnlock === 1 ? 'referral' : 'referrals'}
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.72rem', color: '#78350f', lineHeight: '1.4', fontWeight: '500' }}>
                Complete {remainingToUnlock} more qualified Level 1 {remainingToUnlock === 1 ? 'referral' : 'referrals'} to unlock your commission transfer. 
                <span style={{ display: 'block', marginTop: '2px', color: '#92400e', fontWeight: '600' }}>
                  *Direct referrals qualify after purchasing an eligible package.
                </span>
              </p>
            </div>
          </div>
        ) : (
          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '16px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Award size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '900', color: '#065f46' }}>
                🎉 Congratulations! Level 1 Target Completed
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: '#047857', fontWeight: '600' }}>
                10 / 10 Qualified Referrals • Rs5,000 Referral Bonus Earned • Commission Transfer Unlocked!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 6 & 7. COMMISSION TRANSFER LOCK & UNLOCK CARD */}
      <div 
        className="glass-card mb-4" 
        style={{ 
          padding: '20px', 
          background: commissionTransferUnlocked ? '#f0fdf4' : '#fffbeb', 
          border: commissionTransferUnlocked ? '1px solid #86efac' : '1px solid #fde68a', 
          borderRadius: '24px', 
          boxShadow: '0 8px 24px rgba(0,0,0,0.03)' 
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div 
              style={{ 
                width: '46px', 
                height: '46px', 
                borderRadius: '14px', 
                background: commissionTransferUnlocked ? 'linear-gradient(135deg, #10b981, #059669)' : 'var(--gradient-gold)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'white', 
                boxShadow: '0 4px 12px rgba(245,158,11,0.25)' 
              }}
            >
              <Wallet size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: commissionTransferUnlocked ? '#166534' : '#b45309', fontWeight: '800', textTransform: 'uppercase' }}>
                Available Commission
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-dark)', lineHeight: '1.2' }}>
                Rs{availableCommission.toLocaleString()}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Transfer Status</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: commissionTransferUnlocked ? '#dcfce7' : '#fee2e2', color: commissionTransferUnlocked ? '#16a34a' : '#ef4444', padding: '4px 10px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: '800', marginTop: '3px' }}>
              {commissionTransferUnlocked ? <Unlock size={12} /> : <Lock size={12} />}
              {commissionTransferUnlocked ? 'Unlocked' : 'Locked'}
            </div>
          </div>
        </div>

        {/* Transfer Button */}
        <button 
          onClick={handleTransferCommission}
          style={{ 
            width: '100%', 
            padding: '14px', 
            background: commissionTransferUnlocked ? 'var(--text-dark)' : '#cbd5e1', 
            color: commissionTransferUnlocked ? 'white' : '#64748b', 
            border: 'none', 
            borderRadius: '16px', 
            fontWeight: '800', 
            fontSize: '0.92rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px', 
            cursor: commissionTransferUnlocked ? 'pointer' : 'not-allowed', 
            transition: 'all 0.2s',
            boxShadow: commissionTransferUnlocked ? '0 4px 14px rgba(0,0,0,0.15)' : 'none'
          }}
          onMouseDown={(e) => {
            if (commissionTransferUnlocked) e.currentTarget.style.transform = 'scale(0.98)';
          }}
          onMouseUp={(e) => {
            if (commissionTransferUnlocked) e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {commissionTransferUnlocked ? (
            <>Transfer Commission to Wallet <ArrowRight size={18} /></>
          ) : (
            <><Lock size={17} /> Locked</>
          )}
        </button>

        {/* Helper Note under button */}
        <div style={{ textAlign: 'center', fontSize: '0.73rem', color: commissionTransferUnlocked ? '#166534' : '#b45309', fontWeight: '700', marginTop: '10px' }}>
          {commissionTransferUnlocked ? (
            'Unlocked: No minimum balance required to transfer'
          ) : (
            `Commission Transfer Unlocks After 10 Qualified Level 1 Referrals (Progress: ${qualifiedLevel1Count} / 10)`
          )}
        </div>

        {/* Separate Rs5,000 Bonus Claim Button if Unlocked */}
        {commissionTransferUnlocked && (
          <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px dashed #86efac', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#166534' }}>
                Rs5,000 Referral Bonus Earned
              </div>
              <div style={{ fontSize: '0.68rem', color: '#15803d', fontWeight: '600' }}>
                {isBonusClaimed ? 'Transferred to main wallet' : 'Available to claim directly into wallet'}
              </div>
            </div>

            <button 
              onClick={handleClaimMilestoneBonus}
              disabled={isBonusClaimed}
              style={{ 
                background: isBonusClaimed ? '#dcfce7' : 'linear-gradient(135deg, #10b981, #059669)', 
                color: isBonusClaimed ? '#16a34a' : 'white', 
                border: 'none', 
                padding: '8px 14px', 
                borderRadius: '12px', 
                fontSize: '0.78rem', 
                fontWeight: '800', 
                cursor: isBonusClaimed ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Gift size={14} />
              {isBonusClaimed ? 'Bonus Transferred' : 'Claim Rs5,000 Bonus'}
            </button>
          </div>
        )}
      </div>

      {/* 8. COMMISSION LEVELS HIERARCHY */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <h3 style={{ fontSize: '0.98rem', margin: 0, color: 'var(--text-dark)', fontWeight: '900' }}>
          Commission Levels
        </h3>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>Percentage Based</span>
      </div>

      <div className="glass-card mb-4" style={{ padding: '16px', background: 'white', borderRadius: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center', border: '1px solid rgba(217,119,6,0.1)' }}>
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Level 1</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#10b981' }}>{settings.level1}%</div>
          <div style={{ fontSize: '0.65rem', color: '#047857', fontWeight: '700' }}>Direct</div>
        </div>
        <div style={{ borderLeft: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Level 2</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#3b82f6' }}>{settings.level2}%</div>
          <div style={{ fontSize: '0.65rem', color: '#1d4ed8', fontWeight: '700' }}>Indirect</div>
        </div>
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Level 3</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#8b5cf6' }}>{settings.level3}%</div>
          <div style={{ fontSize: '0.65rem', color: '#6d28d9', fontWeight: '700' }}>Team</div>
        </div>
      </div>

      {/* 9. RECENT REFERRALS / TEAM LIST */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1rem', margin: 0, color: 'var(--text-dark)', fontWeight: '900' }}>
            Direct Referrals (Level 1)
          </h3>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            {directReferrals.length} total • {qualifiedLevel1Count} qualified
          </span>
        </div>

        {/* Tabs: All / Qualified / Pending */}
        <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '12px', gap: '3px' }}>
          <button 
            onClick={() => setFilterTab('all')} 
            style={{ 
              border: 'none', 
              background: filterTab === 'all' ? 'white' : 'transparent', 
              color: filterTab === 'all' ? 'var(--text-dark)' : '#64748b', 
              padding: '4px 10px', 
              borderRadius: '9px', 
              fontSize: '0.7rem', 
              fontWeight: '800', 
              cursor: 'pointer',
              boxShadow: filterTab === 'all' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none' 
            }}
          >
            All ({directReferrals.length})
          </button>
          <button 
            onClick={() => setFilterTab('qualified')} 
            style={{ 
              border: 'none', 
              background: filterTab === 'qualified' ? 'white' : 'transparent', 
              color: filterTab === 'qualified' ? '#16a34a' : '#64748b', 
              padding: '4px 10px', 
              borderRadius: '9px', 
              fontSize: '0.7rem', 
              fontWeight: '800', 
              cursor: 'pointer',
              boxShadow: filterTab === 'qualified' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none' 
            }}
          >
            Qualified ({qualifiedLevel1Count})
          </button>
          <button 
            onClick={() => setFilterTab('pending')} 
            style={{ 
              border: 'none', 
              background: filterTab === 'pending' ? 'white' : 'transparent', 
              color: filterTab === 'pending' ? '#d97706' : '#64748b', 
              padding: '4px 10px', 
              borderRadius: '9px', 
              fontSize: '0.7rem', 
              fontWeight: '800', 
              cursor: 'pointer',
              boxShadow: filterTab === 'pending' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none' 
            }}
          >
            Pending ({directReferrals.length - qualifiedLevel1Count})
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredReferrals.length > 0 ? (
          filteredReferrals.map((member, index) => {
            const isQualified = member.isQualified;
            return (
              <div 
                key={member.id || index} 
                className="glass-card" 
                style={{ 
                  padding: '16px', 
                  background: 'white', 
                  borderRadius: '20px', 
                  border: isQualified ? '1px solid rgba(16,185,129,0.2)' : '1px solid #f1f5f9',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
                }}
              >
                {/* Top Row: User Avatar, Name, Status Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div 
                      style={{ 
                        width: '42px', 
                        height: '42px', 
                        borderRadius: '14px', 
                        background: isQualified ? '#dcfce7' : '#f8fafc', 
                        border: isQualified ? '1px solid #bbf7d0' : '1px solid #e2e8f0', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        flexShrink: 0 
                      }}
                    >
                      <Users size={19} color={isQualified ? '#16a34a' : '#64748b'} />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 2px 0', fontSize: '0.92rem', fontWeight: '800', color: 'var(--text-dark)' }}>
                        {member.name}
                      </h4>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                        Joined: {member.joined} • <span style={{ color: '#4f46e5', fontWeight: '800' }}>Level 1</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div 
                    style={{ 
                      background: isQualified ? '#dcfce7' : '#fffbeb', 
                      color: isQualified ? '#15803d' : '#b45309', 
                      padding: '4px 10px', 
                      borderRadius: '10px', 
                      fontSize: '0.7rem', 
                      fontWeight: '800', 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '5px',
                      border: isQualified ? '1px solid #bbf7d0' : '1px solid #fef3c7'
                    }}
                  >
                    {isQualified ? <CheckCircle size={12} /> : <Clock size={12} />}
                    {isQualified ? 'Qualified' : 'Pending'}
                  </div>
                </div>

                {/* Details Grid: Package, Package Amount, Commission, Bonus Status */}
                <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '10px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem', marginBottom: '8px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Package: </span>
                    <span style={{ fontWeight: '800', color: isQualified ? 'var(--text-dark)' : '#ef4444' }}>
                      {member.plan}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Package Amount: </span>
                    <span style={{ fontWeight: '800', color: 'var(--text-dark)' }}>
                      {member.packageAmount > 0 ? `Rs${member.packageAmount.toLocaleString()}` : '—'}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Commission Earned: </span>
                    <span style={{ fontWeight: '800', color: member.commissionEarned > 0 ? '#16a34a' : 'var(--text-dark)' }}>
                      {member.commissionEarned > 0 ? `Rs${member.commissionEarned.toLocaleString()}` : 'Rs0'}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Referral Bonus: </span>
                    <span style={{ fontWeight: '800', color: member.bonusAmount > 0 ? '#16a34a' : '#94a3b8' }}>
                      {member.bonusAmount > 0 ? `Rs${member.bonusAmount}` : (isQualified ? 'Rs0 (Milestone Max)' : 'Rs0')}
                    </span>
                  </div>
                </div>

                {/* Bottom Reward note */}
                {isQualified ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', color: '#15803d', fontWeight: '700' }}>
                    <Gift size={13} color="#16a34a" />
                    <span>
                      {member.bonusAmount > 0 
                        ? 'Contributed Rs500 to your Level 1 Referral Reward milestone' 
                        : 'Counted toward Level 1 Target (Maximum 10 referrals reached)'}
                    </span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', color: '#b45309', fontWeight: '600' }}>
                    <AlertCircle size={13} color="#d97706" />
                    <span>User has not purchased an eligible package yet (does not count toward 10 referral target).</span>
                  </div>
                )}

              </div>
            );
          })
        ) : (
          <div style={{ textAlign: 'center', padding: '36px 20px', background: 'white', borderRadius: '24px', border: '1px dashed #e2e8f0' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#d97706' }}>
              <Users size={32} />
            </div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', color: 'var(--text-dark)', fontWeight: '900' }}>
              {filterTab === 'all' ? 'No Team Members Yet' : `No ${filterTab} referrals found`}
            </h4>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5', maxWidth: '320px', marginLeft: 'auto', marginRight: 'auto' }}>
              Share your referral link with friends. When they register and purchase an eligible package, you receive Rs500 Level 1 reward plus 16% commission!
            </p>
            <button 
              onClick={handleShareLink}
              style={{ 
                background: 'linear-gradient(135deg, #f59e0b, #ea580c)', 
                color: 'white', 
                border: 'none', 
                padding: '10px 20px', 
                borderRadius: '12px', 
                fontSize: '0.82rem', 
                fontWeight: '800', 
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(245,158,11,0.3)'
              }}
            >
              <Share2 size={15} /> Invite Friends Now
            </button>
          </div>
        )}
      </div>

      {/* Custom Notification Modal */}
      {notification.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '28px 24px', width: '100%', maxWidth: '340px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: notification.type === 'success' ? '#dcfce7' : (notification.type === 'notice' ? '#e0e7ff' : '#fee2e2'), color: notification.type === 'success' ? '#16a34a' : (notification.type === 'notice' ? '#4f46e5' : '#ef4444'), display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px auto' }}>
              {notification.type === 'success' ? <CheckCircle size={30} /> : (notification.type === 'notice' ? <Sparkles size={30} /> : <AlertCircle size={30} />)}
            </div>
            
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: 'var(--text-dark)', fontWeight: '900' }}>
              {notification.title}
            </h3>
            
            <p style={{ margin: '0 0 22px 0', fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: '600', lineHeight: '1.5' }}>
              {notification.message}
            </p>
            
            <button 
              onClick={() => setNotification({ ...notification, show: false })}
              style={{ width: '100%', padding: '13px', background: notification.type === 'success' ? '#16a34a' : 'var(--text-dark)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer', transition: 'transform 0.1s' }}
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
            .spin-anim {
              animation: spin 1s linear infinite;
            }
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

    </div>
  );
};

export default TeamPage;
