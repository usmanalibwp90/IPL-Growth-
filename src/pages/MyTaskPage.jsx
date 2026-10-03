import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Calendar, CheckCircle, Gift, Zap, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyTaskPage = () => {
  const navigate = useNavigate();

  // Mock Backend State Initialization
  const getBackendState = () => {
    const stored = localStorage.getItem('ipl_user_data');
    if (stored) return JSON.parse(stored);
    
    // Default mock user with active plan for demonstration
    // If we want to simulate a real scenario, we start the timer at 15 seconds so the user can test the claim functionality without waiting 24 hours.
    const now = Date.now();
    const initialState = {
      active_plan_id: 'Plan 1',
      daily_profit_amount: 83,
      last_profit_claim_at: now - (24 * 60 * 60 * 1000), 
      next_profit_available_at: now + 15000, // 15 seconds from first load for testing
    };
    localStorage.setItem('ipl_user_data', JSON.stringify(initialState));
    return initialState;
  };

  const [backendState, setBackendState] = useState(getBackendState);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Calculate time remaining based on absolute server timestamp
  useEffect(() => {
    if (!backendState || !backendState.active_plan_id) return;

    const calculateTime = () => {
      const now = Date.now();
      const diff = backendState.next_profit_available_at - now;
      
      if (diff <= 0) {
        setTimeLeft(0);
        setIsReady(true);
      } else {
        setTimeLeft(diff);
        setIsReady(false);
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [backendState]);

  const handleClaim = () => {
    if (!isReady) return;
    
    // Backend API simulation
    const now = Date.now();
    const next = now + (24 * 60 * 60 * 1000); // exactly 24 hours from now

    const newState = {
      ...backendState,
      last_profit_claim_at: now,
      next_profit_available_at: next
    };

    localStorage.setItem('ipl_user_data', JSON.stringify(newState));
    
    // Add to transaction history (mock)
    const txHistory = JSON.parse(localStorage.getItem('ipl_transactions') || '[]');
    txHistory.unshift({
      id: Date.now(),
      type: 'profit',
      amount: backendState.daily_profit_amount,
      date: now,
      status: 'completed'
    });
    localStorage.setItem('ipl_transactions', JSON.stringify(txHistory));
    
    setBackendState(newState);
    setSuccessMsg('Daily Profit Credited Successfully');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Format time
  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
  const minutes = Math.floor((timeLeft / 1000 / 60) % 60).toString().padStart(2, '0');
  const seconds = Math.floor((timeLeft / 1000) % 60).toString().padStart(2, '0');

  const formatDateTime = (timestamp) => {
    const d = new Date(timestamp);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (!backendState || !backendState.active_plan_id) {
    return (
      <div className="page-transition" style={{ padding: '10px', paddingBottom: '100px', maxWidth: 'var(--max-width)', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '24px' }}>
          <div onClick={() => navigate(-1)} style={{ width: '45px', height: '45px', borderRadius: '14px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
             <ArrowLeft size={20} color="var(--text-dark)" />
          </div>
          <div>
             <h1 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-dark)', fontWeight: '800' }}>My Task</h1>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '30px 20px', textAlign: 'center', background: 'white' }}>
          <Zap size={48} color="#d97706" style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
          <h2 style={{ margin: '0 0 8px 0', fontSize: '1.3rem', color: 'var(--text-dark)', fontWeight: '900' }}>No Active Plan</h2>
          <p style={{ margin: '0 0 24px 0', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            You need an active plan before daily profit becomes available.
          </p>
          <button onClick={() => navigate('/plans')} style={{ width: '100%', padding: '16px', background: 'var(--gradient-gold)', border: 'none', borderRadius: '16px', color: 'white', fontWeight: '900', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)' }}>
            View Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition" style={{ padding: '10px', paddingBottom: '100px', maxWidth: 'var(--max-width)', margin: '0 auto', minHeight: '100vh' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '24px' }}>
        <div onClick={() => navigate(-1)} style={{ width: '45px', height: '45px', borderRadius: '14px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
           <ArrowLeft size={20} color="var(--text-dark)" />
        </div>
        <div>
           <h1 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-dark)', fontWeight: '900' }}>My Task</h1>
           <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>Daily Profit Countdown</p>
        </div>
      </div>

      {/* Premium Countdown Timer */}
      <div className="glass-card mb-4" style={{ background: 'white', borderRadius: '24px', padding: '30px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden', border: '1px solid rgba(245,158,11,0.2)', boxShadow: isReady ? '0 10px 30px rgba(245, 158, 11, 0.15)' : '0 5px 15px rgba(0,0,0,0.03)' }}>
        
        {/* Soft Background Glow */}
        {isReady && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '150px', height: '150px', background: 'var(--primary-gold)', filter: 'blur(80px)', opacity: 0.3, pointerEvents: 'none' }}></div>}

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fffbeb', padding: '6px 16px', borderRadius: '20px', color: '#b45309', fontSize: '0.75rem', fontWeight: '800', marginBottom: '24px', letterSpacing: '1px', textTransform: 'uppercase', border: '1px solid #fde68a' }}>
            <Clock size={14} /> Next Profit In
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
            {/* Hours */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '75px', height: '85px', background: 'var(--gradient-gold)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2.5rem', fontWeight: '900', fontFamily: 'monospace', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)' }}>
                {hours}
              </div>
              <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Hours</span>
            </div>

            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary-gold)', margin: '10px 0 0 0', lineHeight: 1 }}>:</div>

            {/* Minutes */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '75px', height: '85px', background: 'var(--gradient-gold)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2.5rem', fontWeight: '900', fontFamily: 'monospace', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)' }}>
                {minutes}
              </div>
              <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Minutes</span>
            </div>

            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary-gold)', margin: '10px 0 0 0', lineHeight: 1 }}>:</div>

            {/* Seconds */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '75px', height: '85px', background: 'var(--gradient-gold)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2.5rem', fontWeight: '900', fontFamily: 'monospace', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)' }}>
                {seconds}
              </div>
              <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Seconds</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="glass-card mb-4" style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-gold)' }}>
              <Zap size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '2px' }}>Active Plan</div>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-dark)', fontWeight: '900' }}>{backendState.active_plan_id}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-gold)' }}>
              <Gift size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '2px' }}>Daily Profit</div>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-dark)', fontWeight: '900' }}>Rs {backendState.daily_profit_amount}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-gold)' }}>
              <Calendar size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '2px' }}>Next Credit</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dark)', fontWeight: '800' }}>{formatDateTime(backendState.next_profit_available_at)}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-gold)' }}>
              <CheckCircle size={16} color={isReady ? '#10b981' : '#b45309'} />
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '2px' }}>Status</div>
              <div style={{ fontSize: '0.95rem', color: isReady ? '#10b981' : '#b45309', fontWeight: '900' }}>{isReady ? 'Ready' : 'Waiting'}</div>
            </div>
          </div>

        </div>

        <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0' }}>
          {isReady ? (
            <button 
              onClick={handleClaim}
              style={{ width: '100%', padding: '16px', background: 'var(--gradient-gold)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '900', fontSize: '1.05rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', animation: 'pulse 2s infinite' }}>
              <Gift size={20} /> Claim Profit
            </button>
          ) : (
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', lineHeight: '1.5', textAlign: 'center' }}>
              Your daily profit will be available when the countdown is complete.
            </p>
          )}
        </div>

      </div>

      {/* Success Message */}
      {successMsg && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
          <CheckCircle size={24} color="#16a34a" />
          <div>
            <div style={{ fontSize: '0.9rem', color: '#166534', fontWeight: '900' }}>Success!</div>
            <div style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: '600' }}>{successMsg}</div>
          </div>
        </div>
      )}

      {/* Bottom Link */}
      <div style={{ textAlign: 'center' }}>
        <div onClick={() => navigate('/transaction')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', fontSize: '0.75rem', color: 'var(--text-dark)', fontWeight: '700', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
          <FileText size={14} /> Profit History
        </div>
      </div>

    </div>
  );
};

export default MyTaskPage;
