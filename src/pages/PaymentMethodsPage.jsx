import React from 'react';
import { ArrowLeft, CreditCard, Plus, Trash2, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PaymentMethodsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="page-transition" style={{ padding: '10px', paddingBottom: '100px', maxWidth: 'var(--max-width)', margin: '0 auto' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '24px' }}>
        <div onClick={() => navigate(-1)} style={{ width: '45px', height: '45px', borderRadius: '14px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
           <ArrowLeft size={20} color="var(--text-dark)" />
        </div>
        <div>
           <h1 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-dark)', fontWeight: '800' }}>Payment Methods</h1>
           <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Manage your deposit & withdrawal accounts</p>
        </div>
      </div>

      {/* Saved Accounts */}
      <h3 style={{ fontSize: '1rem', margin: '0 0 12px 4px', color: 'var(--text-dark)', fontWeight: '800' }}>Saved Accounts</h3>
      
      <div className="glass-card mb-3" style={{ background: 'white', borderRadius: '20px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 5px 15px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CreditCard size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-dark)' }}>Allied Bank Limited</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>**** **** **** 1234</div>
          </div>
        </div>
        <button style={{ border: 'none', background: '#fee2e2', color: '#ef4444', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Trash2 size={16} />
        </button>
      </div>

      <div className="glass-card mb-4" style={{ background: 'white', borderRadius: '20px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 5px 15px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Smartphone size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-dark)' }}>JazzCash</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>+92 300 1234567</div>
          </div>
        </div>
        <button style={{ border: 'none', background: '#fee2e2', color: '#ef4444', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Trash2 size={16} />
        </button>
      </div>

      {/* Add New Method Button */}
      <button className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <Plus size={20} /> Add New Method
      </button>

    </div>
  );
};

export default PaymentMethodsPage;
