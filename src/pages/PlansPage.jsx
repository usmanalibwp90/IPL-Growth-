import React, { useState } from 'react';
import { Package, Wallet, CheckCircle, Clock, PlayCircle, BarChart, Sparkles, Menu, Bell, X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const plansData = [
  { id: 1, price: 'Rs460', daily: 'Rs83', total: 'Rs4,590', duration: '55 Day', ads: '1' },
  { id: 2, price: 'Rs860', daily: 'Rs156', total: 'Rs8,595', duration: '55 Day', ads: '1' },
  { id: 3, price: 'Rs1,860', daily: 'Rs338', total: 'Rs18,585', duration: '55 Day', ads: '1' },
  { id: 4, price: 'Rs3,660', daily: 'Rs610', total: 'Rs33,570', duration: '55 Day', ads: '1' },
  { id: 5, price: 'Rs8,860', daily: 'Rs1,610', total: 'Rs88,560', duration: '55 Day', ads: '1' },
  { id: 6, price: 'Rs16,560', daily: 'Rs3,011', total: 'Rs165,600', duration: '55 Day', ads: '1' },
  { id: 7, price: 'Rs35,560', daily: 'Rs6,465', total: 'Rs355,590', duration: '55 Day', ads: '1' },
  { id: 8, price: 'Rs65,660', daily: 'Rs11,919', total: 'Rs655,560', duration: '55 Day', ads: '1' },
  { id: 9, price: 'Rs112,560', daily: 'Rs20,465', total: 'Rs1,125,585', duration: '55 Day', ads: '1' },
  { id: 10, price: 'Rs145,560', daily: 'Rs26,465', total: 'Rs1,455,570', duration: '55 Day', ads: '1' },
  { id: 11, price: 'Rs185,560', daily: 'Rs33,738', total: 'Rs1,855,575', duration: '55 Day', ads: '1' },
  { id: 12, price: 'Rs225,560', daily: 'Rs41,011', total: 'Rs2,255,580', duration: '55 Day', ads: '1' }
];

const PlansPage = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedGateway, setSelectedGateway] = useState('easypaisa');

  const openModal = (plan) => {
    setSelectedPlan(plan);
    setSelectedGateway('easypaisa');
  };

  const closeModal = () => {
    setSelectedPlan(null);
  };

  const handleContinue = () => {
    if (selectedPlan && selectedGateway) {
      navigate('/manual-payment', { state: { plan: selectedPlan, gateway: selectedGateway } });
      closeModal();
    }
  };

  return (
    <div className="page-transition" style={{ padding: '10px', paddingBottom: '100px', maxWidth: 'var(--max-width)', margin: '0 auto', position: 'relative' }}>
      
      {/* Top Banner Header */}
      <div className="glass-card mb-4" style={{ padding: '24px', background: 'white', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        
        <div style={{ flex: '1 1 200px' }}>
          <div style={{ display: 'inline-block', padding: '6px 12px', background: '#fef3c7', borderRadius: '20px', color: '#d97706', fontSize: '0.55rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
            Investment Opportunities
          </div>
          
          <h1 style={{ fontSize: '1.8rem', fontWeight: '900', lineHeight: '1.1', margin: '0 0 12px 0', color: 'var(--text-dark)' }}>
            Choose Your <br/>
            <span style={{ background: 'linear-gradient(to right, #d97706, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Investment Plan.
            </span>
          </h1>
          
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0, fontWeight: '500' }}>
            All plans below are loaded directly from active plans created in Admin. Review the plan price, daily earning, total earning and duration, then continue through an active payment gateway.
          </p>
        </div>

        <div style={{ width: '90px', height: '90px', borderRadius: '20px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 10px 25px rgba(245, 158, 11, 0.4)' }}>
          <Package size={24} color="white" style={{ marginBottom: '4px' }} />
          <div style={{ fontSize: '1.6rem', fontWeight: '900', color: 'white', lineHeight: '1' }}>{plansData.length}</div>
          <div style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.9)', fontWeight: '800', letterSpacing: '0.5px', marginTop: '2px', textAlign: 'center' }}>AVAILABLE<br/>PLANS</div>
        </div>
        
      </div>

      <style>{`
        .plans-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
      `}</style>

      {/* Plans Section */}
      <div className="glass-card" style={{ padding: '24px', background: 'white' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dark)' }}>
          <Sparkles size={20} color="#d97706" /> Available Plans
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>Upgrade your account to earn more daily.</p>
        
        <div className="plans-grid">
          {plansData.map(plan => (
            <div key={plan.id} className="glass-card" style={{ padding: '10px', background: '#f8fafc', border: '1px solid rgba(217,119,6,0.1)' }}>
              
              <div className="flex-between mb-4" style={{ alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--gradient-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(217,119,6,0.3)', flexShrink: 0 }}>
                    <Package size={24} color="white" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-dark)' }}>Plan {plan.id}</h3>
                    <div style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: '700' }}>Investment Tier {plan.id}</div>
                  </div>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-dark)' }}>
                  {plan.price}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                <div style={{ background: 'white', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                  <CheckCircle size={18} color="#10b981" />
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600' }}>Daily Earning</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-dark)' }}>{plan.daily}</div>
                  </div>
                </div>
                <div style={{ background: 'white', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                  <BarChart size={18} color="#3b82f6" />
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600' }}>Total Earning</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-dark)' }}>{plan.total}</div>
                  </div>
                </div>
                <div style={{ background: 'white', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                  <Clock size={18} color="#f43f5e" />
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600' }}>Duration</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-dark)' }}>{plan.duration}</div>
                  </div>
                </div>
                <div style={{ background: 'white', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                  <PlayCircle size={18} color="#8b5cf6" />
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600' }}>Ads / Claim</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-dark)' }}>{plan.ads}</div>
                  </div>
                </div>
              </div>

              <div className="flex-between" style={{ alignItems: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                  Unlimited Purchases
                </div>
                <button 
                  className="btn btn-primary" 
                  style={{ padding: '10px 20px', fontSize: '0.9rem', borderRadius: '12px' }}
                  onClick={() => openModal(plan)}
                >
                  Buy Plan
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Payment Gateway Modal */}
      {selectedPlan && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(5px)' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '400px', background: 'white', borderRadius: '24px', padding: '24px', position: 'relative', animation: 'fadeInUp 0.3s ease' }}>
            
            <button onClick={closeModal} style={{ position: 'absolute', top: '20px', right: '20px', width: '36px', height: '36px', borderRadius: '12px', background: '#f43f5e', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(244, 63, 94, 0.3)' }}>
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--gradient-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 10px rgba(217,119,6,0.3)' }}>
                <Wallet size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-dark)', fontWeight: '800' }}>Investment Method</h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Select an active gateway for this plan.</div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Start Plan</span>
              <span style={{ fontSize: '1rem', fontWeight: '800', color: '#0ea5e9' }}>{selectedPlan.price}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              
              {(() => {
                const saved = localStorage.getItem('payment_gateways');
                const defaultGateways = [
                  { id: 1, name: 'EasyPaisa', type: 'easypaisa', isActive: true },
                  { id: 2, name: 'JazzCash', type: 'jazzcash', isActive: true }
                ];
                const allGateways = saved ? JSON.parse(saved) : defaultGateways;
                const activeGateways = allGateways.filter(g => g.isActive);

                if (activeGateways.length === 0) {
                  return <div style={{ gridColumn: '1 / -1', textAlign: 'center', fontSize: '0.8rem', color: '#ef4444', fontWeight: 'bold' }}>No active payment methods available.</div>;
                }

                return activeGateways.map(gateway => (
                  <div 
                    key={gateway.id}
                    onClick={() => setSelectedGateway(gateway.type)}
                    style={{ 
                      background: selectedGateway === gateway.type ? (gateway.type === 'easypaisa' ? '#f0fdf4' : gateway.type === 'jazzcash' ? '#fff1f2' : '#eff6ff') : '#f8fafc', 
                      border: `2px solid ${selectedGateway === gateway.type ? (gateway.type === 'easypaisa' ? '#22c55e' : gateway.type === 'jazzcash' ? '#f43f5e' : '#3b82f6') : 'transparent'}`,
                      borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s' 
                    }}
                  >
                    <div style={{ width: '40px', height: '40px', background: gateway.iconImage ? 'transparent' : (gateway.type === 'easypaisa' ? '#22c55e' : gateway.type === 'jazzcash' ? '#f43f5e' : '#3b82f6'), borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '1.2rem', overflow: 'hidden' }}>
                      {gateway.iconImage ? (
                        <img src={gateway.iconImage} alt={gateway.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : (
                        gateway.type === 'easypaisa' ? 'e' : gateway.type === 'jazzcash' ? 'J' : 'B'
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-dark)', textTransform: 'uppercase' }}>{gateway.name}</div>
                  </div>
                ));
              })()}

            </div>

            <button onClick={handleContinue} className="btn" style={{ width: '100%', background: 'linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899)', color: 'white', padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', border: 'none' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={16} />
              </div>
              Continue Deposit
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default PlansPage;
