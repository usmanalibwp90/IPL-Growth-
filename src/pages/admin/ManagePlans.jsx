import React, { useState } from 'react';
import { CreditCard, Edit, Trash2, Plus, X, Save } from 'lucide-react';

const initialPlans = [
  { id: 1, name: 'Plan 1', price: 460, dailyProfit: 83, total: 4590, validity: '55 Day', status: 'Active' },
  { id: 2, name: 'Plan 2', price: 860, dailyProfit: 156, total: 8595, validity: '55 Day', status: 'Active' },
  { id: 3, name: 'Plan 3', price: 1860, dailyProfit: 338, total: 18585, validity: '55 Day', status: 'Active' },
  { id: 4, name: 'Plan 4', price: 3660, dailyProfit: 610, total: 33570, validity: '55 Day', status: 'Active' },
  { id: 5, name: 'Plan 5', price: 8860, dailyProfit: 1610, total: 88560, validity: '55 Day', status: 'Active' },
  { id: 6, name: 'Plan 6', price: 16560, dailyProfit: 3011, total: 165600, validity: '55 Day', status: 'Active' },
  { id: 7, name: 'Plan 7', price: 35560, dailyProfit: 6465, total: 355590, validity: '55 Day', status: 'Active' },
  { id: 8, name: 'Plan 8', price: 65660, dailyProfit: 11919, total: 655560, validity: '55 Day', status: 'Active' },
  { id: 9, name: 'Plan 9', price: 112560, dailyProfit: 20465, total: 1125585, validity: '55 Day', status: 'Active' },
  { id: 10, name: 'Plan 10', price: 145560, dailyProfit: 26465, total: 1455570, validity: '55 Day', status: 'Active' },
  { id: 11, name: 'Plan 11', price: 185560, dailyProfit: 33738, total: 1855575, validity: '55 Day', status: 'Active' },
  { id: 12, name: 'Plan 12', price: 225560, dailyProfit: 41011, total: 2255580, validity: '55 Day', status: 'Active' },
];

const ManagePlans = () => {
  const [plans, setPlans] = useState(initialPlans);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', dailyProfit: '', total: '', validity: '55 Day', status: 'Active' });

  const handleOpenModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData(plan);
    } else {
      setEditingPlan(null);
      setFormData({ name: `Plan ${plans.length + 1}`, price: '', dailyProfit: '', total: '', validity: '55 Day', status: 'Active' });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingPlan) {
      setPlans(plans.map(p => p.id === editingPlan.id ? { ...formData, id: p.id } : p));
    } else {
      setPlans([...plans, { ...formData, id: plans.length > 0 ? Math.max(...plans.map(p => p.id)) + 1 : 1 }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      setPlans(plans.filter(p => p.id !== id));
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '1.8rem', color: 'var(--text-dark)', fontWeight: '900' }}>Investment Plans</h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>Manage the {plans.length} investment packages available to users.</p>
        </div>
        <button onClick={() => handleOpenModal()} style={{ padding: '12px 24px', background: 'var(--gradient-gold)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}>
          <Plus size={18} /> Add New Plan
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {plans.map((plan) => (
          <div key={plan.id} style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fffbeb', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CreditCard size={24} />
              </div>
              <span style={{ padding: '4px 12px', background: plan.status === 'Active' ? '#dcfce7' : '#fee2e2', color: plan.status === 'Active' ? '#16a34a' : '#dc2626', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800' }}>
                {plan.status}
              </span>
            </div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.4rem', color: 'var(--text-dark)', fontWeight: '900' }}>{plan.name}</h3>
            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--primary-gold)', marginBottom: '20px' }}>
              Rs {Number(plan.price).toLocaleString()}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Daily Profit:</span>
                <span style={{ fontWeight: '800', color: 'var(--text-dark)' }}>Rs {Number(plan.dailyProfit).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Total Earning:</span>
                <span style={{ fontWeight: '800', color: '#3b82f6' }}>Rs {Number(plan.total).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Duration:</span>
                <span style={{ fontWeight: '800', color: 'var(--text-dark)' }}>{plan.validity}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => handleOpenModal(plan)} style={{ flex: 1, padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', color: 'var(--text-dark)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Edit size={16} /> Edit
              </button>
              <button onClick={() => handleDelete(plan.id)} style={{ flex: 1, padding: '12px', background: '#fee2e2', border: 'none', borderRadius: '12px', color: '#dc2626', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Add Plan Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '500px', padding: '32px', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
            
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={18} color="var(--text-dark)" />
            </button>

            <h2 style={{ margin: '0 0 8px 0', fontSize: '1.4rem', color: 'var(--text-dark)', fontWeight: '900' }}>
              {editingPlan ? 'Edit Investment Plan' : 'Create New Plan'}
            </h2>
            <p style={{ margin: '0 0 24px 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>
              Configure the price and profit settings for this package.
            </p>

            <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Plan Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', fontWeight: '700', outline: 'none' }}
                  required
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Price (PKR)</label>
                <input 
                  type="number" 
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', fontWeight: '700', outline: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Daily Profit (PKR)</label>
                <input 
                  type="number" 
                  value={formData.dailyProfit}
                  onChange={(e) => setFormData({...formData, dailyProfit: e.target.value})}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', fontWeight: '700', outline: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Total Return (PKR)</label>
                <input 
                  type="number" 
                  value={formData.total}
                  onChange={(e) => setFormData({...formData, total: e.target.value})}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', fontWeight: '700', outline: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Duration</label>
                <input 
                  type="text" 
                  value={formData.validity}
                  onChange={(e) => setFormData({...formData, validity: e.target.value})}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', fontWeight: '700', outline: 'none' }}
                  required
                />
              </div>

              <div style={{ gridColumn: '1 / -1', marginBottom: '8px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Plan Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', fontWeight: '700', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="Active">Active (Visible)</option>
                  <option value="Hidden">Hidden</option>
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '14px', background: '#f1f5f9', border: 'none', borderRadius: '12px', color: 'var(--text-dark)', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ flex: 1, padding: '14px', background: 'var(--gradient-gold)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Save size={18} /> {editingPlan ? 'Update Plan' : 'Save Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManagePlans;
