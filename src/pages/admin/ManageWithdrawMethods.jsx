import React, { useState, useEffect } from 'react';
import { Wallet, Edit, Plus, Save, Trash2, Power } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const ManageWithdrawMethods = () => {
  const [methods, setMethods] = useState([]);
  const [editingMethod, setEditingMethod] = useState(null);

  const fetchList = () => {
    fetch(`${API_BASE_URL}/api/gateways/withdraw`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const parsed = data.map(g => ({
             ...JSON.parse(g.details || '{}'),
             id: g.id,
             fromDB: true
          }));
          setMethods(parsed);
        } else {
          setMethods([]);
        }
      })
      .catch(err => {
         console.error(err);
         setMethods([]);
      });
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleToggleStatus = async (id) => {
    const method = methods.find(m => m.id === id);
    if (!method) return;
    const updated = { ...method, isActive: !method.isActive };
    const token = localStorage.getItem('admin_token') || localStorage.getItem('auth_token') || localStorage.getItem('token');
    
    if (method.fromDB) {
      await fetch(`${API_BASE_URL}/api/gateways/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type: 'withdraw', name: updated.name, details: JSON.stringify(updated) })
      });
      fetchList();
    } else {
      await fetch(`${API_BASE_URL}/api/gateways`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type: 'withdraw', name: updated.name, details: JSON.stringify(updated) })
      });
      fetchList();
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this withdraw method?')) {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('auth_token') || localStorage.getItem('token');
      const method = methods.find(m => m.id === id);
      if (method && method.fromDB) {
         await fetch(`${API_BASE_URL}/api/gateways/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
         });
         fetchList();
      } else {
         const updated = methods.filter(m => m.id !== id);
         setMethods(updated);
         localStorage.setItem('withdraw_methods', JSON.stringify(updated));
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingMethod({ ...editingMethod, iconImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token') || localStorage.getItem('auth_token') || localStorage.getItem('token');
    
    if (editingMethod.fromDB) {
      // Update existing
      await fetch(`${API_BASE_URL}/api/gateways/${editingMethod.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type: 'withdraw', name: editingMethod.name, details: JSON.stringify(editingMethod) })
      });
    } else {
      // Add new
      await fetch(`${API_BASE_URL}/api/gateways`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type: 'withdraw', name: editingMethod.name, details: JSON.stringify(editingMethod) })
      });
    }
    fetchList();
    setEditingMethod(null);
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '1.8rem', color: 'var(--text-dark)', fontWeight: '900' }}>Withdraw Methods</h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>Manage methods where users can withdraw their earnings.</p>
        </div>
        <button onClick={() => setEditingMethod({ type: 'easypaisa', name: '', processingTime: '24 Hours', minLimit: 500, maxLimit: 50000, charge: 0, isActive: true, iconImage: null })} style={{ padding: '12px 24px', background: 'var(--gradient-gold)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}>
          <Plus size={18} /> Add New Method
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {methods.map((method) => (
          <div key={method.id} style={{ background: 'white', borderRadius: '24px', padding: '24px', border: `2px solid ${method.isActive ? '#10b981' : '#f1f5f9'}`, boxShadow: '0 10px 40px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: method.iconImage ? 'transparent' : (method.type === 'easypaisa' ? '#22c55e' : method.type === 'jazzcash' ? '#f43f5e' : '#3b82f6'), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.2rem', overflow: 'hidden' }}>
                  {method.iconImage ? (
                    <img src={method.iconImage} alt={method.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    method.type === 'easypaisa' ? 'e' : method.type === 'jazzcash' ? 'J' : 'B'
                  )}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 2px 0', fontSize: '1.2rem', color: 'var(--text-dark)', fontWeight: '900' }}>{method.name}</h3>
                  <span style={{ padding: '2px 8px', background: method.isActive ? '#dcfce7' : '#fee2e2', color: method.isActive ? '#16a34a' : '#dc2626', borderRadius: '12px', fontSize: '0.65rem', fontWeight: '800' }}>
                    {method.isActive ? 'ACTIVE (Users can see)' : 'DISABLED'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Limit</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: '800' }}>Rs{method.minLimit} - Rs{method.maxLimit}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Charge</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--primary-gold)', fontWeight: '900' }}>{method.charge}%</div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Processing Time</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: '800' }}>{method.processingTime}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setEditingMethod(method)} style={{ flex: 1, padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', color: 'var(--text-dark)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Edit size={16} /> Edit
              </button>
              <button onClick={() => handleToggleStatus(method.id)} style={{ padding: '12px', background: method.isActive ? '#fee2e2' : '#dcfce7', border: 'none', borderRadius: '12px', color: method.isActive ? '#dc2626' : '#16a34a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={method.isActive ? "Disable" : "Enable"}>
                <Power size={18} />
              </button>
              <button onClick={() => handleDelete(method.id)} style={{ padding: '12px', background: '#fee2e2', border: 'none', borderRadius: '12px', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Add Modal */}
      {editingMethod && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '500px', padding: '32px', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <button onClick={() => setEditingMethod(null)} style={{ position: 'absolute', top: '24px', right: '24px', background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              ✕
            </button>

            <h2 style={{ margin: '0 0 8px 0', fontSize: '1.4rem', color: 'var(--text-dark)', fontWeight: '900' }}>
              {editingMethod.id ? 'Edit Withdraw Method' : 'Add Withdraw Method'}
            </h2>
            <p style={{ margin: '0 0 24px 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>
              Configure how users will receive their payouts.
            </p>

            <form onSubmit={handleSaveEdit} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Method Name</label>
                  <input type="text" value={editingMethod.name} onChange={(e) => setEditingMethod({...editingMethod, name: e.target.value})} placeholder="e.g. EasyPaisa" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', fontWeight: '700', outline: 'none' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Icon / Image</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select value={editingMethod.type} onChange={(e) => setEditingMethod({...editingMethod, type: e.target.value})} style={{ flex: 1, padding: '12px 8px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.85rem', fontWeight: '700', outline: 'none' }}>
                      <option value="easypaisa">EasyPaisa</option>
                      <option value="jazzcash">JazzCash</option>
                      <option value="bank">Bank</option>
                    </select>
                    <label style={{ flex: 1, padding: '12px 8px', borderRadius: '12px', border: '1px dashed #cbd5e1', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-dark)' }}>
                      {editingMethod.iconImage ? 'Change' : '+ Upload'}
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Min Limit (Rs)</label>
                  <input type="number" value={editingMethod.minLimit} onChange={(e) => setEditingMethod({...editingMethod, minLimit: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', fontWeight: '700', outline: 'none' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Max Limit (Rs)</label>
                  <input type="number" value={editingMethod.maxLimit} onChange={(e) => setEditingMethod({...editingMethod, maxLimit: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', fontWeight: '700', outline: 'none' }} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Charge (%)</label>
                  <input type="number" value={editingMethod.charge} onChange={(e) => setEditingMethod({...editingMethod, charge: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', fontWeight: '700', outline: 'none' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Processing Time</label>
                  <input type="text" value={editingMethod.processingTime} onChange={(e) => setEditingMethod({...editingMethod, processingTime: e.target.value})} placeholder="e.g. 24 Hours" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', fontWeight: '700', outline: 'none' }} required />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <input type="checkbox" id="isActiveMethod" checked={editingMethod.isActive} onChange={(e) => setEditingMethod({...editingMethod, isActive: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                <label htmlFor="isActiveMethod" style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-dark)', cursor: 'pointer' }}>Active (Visible to users)</label>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setEditingMethod(null)} style={{ flex: 1, padding: '14px', background: '#f1f5f9', border: 'none', borderRadius: '12px', color: 'var(--text-dark)', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ flex: 1, padding: '14px', background: 'var(--gradient-gold)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Save size={18} /> {editingMethod.id ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageWithdrawMethods;
