import React, { useState, useEffect } from 'react';
import { Wallet, Edit, Plus, Save, Trash2, Power } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const initialGateways = [
  { id: 1, name: 'EasyPaisa', type: 'easypaisa', accountName: 'Ali Raza', accountNumber: '03451234567', minLimit: 500, maxLimit: 50000, isActive: true },
  { id: 2, name: 'JazzCash', type: 'jazzcash', accountName: 'Kamran Khan', accountNumber: '03001234567', minLimit: 500, maxLimit: 50000, isActive: true },
  { id: 3, name: 'Meezan Bank', type: 'bank', accountName: 'IPL Growth', accountNumber: '01234567891234', minLimit: 1000, maxLimit: 100000, isActive: false }
];

const ManageGateways = () => {
  const [gateways, setGateways] = useState([]);
  const [editingGateway, setEditingGateway] = useState(null);

  const fetchList = () => {
    fetch(`${API_BASE_URL}/api/gateways/deposit`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const parsed = data.map(g => ({
             ...JSON.parse(g.details || '{}'),
             id: g.id
          }));
          setGateways(parsed);
        } else {
          setGateways(initialGateways);
        }
      })
      .catch(err => {
         console.error(err);
         const saved = localStorage.getItem('payment_gateways');
         if (saved) setGateways(JSON.parse(saved));
         else setGateways(initialGateways);
      });
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleToggleStatus = async (id) => {
    const gateway = gateways.find(g => g.id === id);
    if (!gateway) return;
    const updated = { ...gateway, isActive: !gateway.isActive };
    const token = localStorage.getItem('admin_token') || localStorage.getItem('auth_token') || localStorage.getItem('token');
    
    if (gateway.id && gateway.id > 10) { // Assume > 10 means it came from DB (initial are 1-5)
      await fetch(`${API_BASE_URL}/api/gateways/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type: 'deposit', name: updated.name, details: JSON.stringify(updated) })
      });
      fetchList();
    } else {
      setGateways(gateways.map(g => g.id === id ? updated : g));
      localStorage.setItem('payment_gateways', JSON.stringify(gateways.map(g => g.id === id ? updated : g)));
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this payment method?')) {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('auth_token') || localStorage.getItem('token');
      if (id > 10) {
         await fetch(`${API_BASE_URL}/api/gateways/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
         });
         fetchList();
      } else {
         const updated = gateways.filter(g => g.id !== id);
         setGateways(updated);
         localStorage.setItem('payment_gateways', JSON.stringify(updated));
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingGateway({ ...editingGateway, iconImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token') || localStorage.getItem('auth_token') || localStorage.getItem('token');
    
    if (editingGateway.id && editingGateway.id > 10) {
      // Update existing
      await fetch(`${API_BASE_URL}/api/gateways/${editingGateway.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type: 'deposit', name: editingGateway.name, details: JSON.stringify(editingGateway) })
      });
    } else {
      // Add new
      await fetch(`${API_BASE_URL}/api/gateways`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type: 'deposit', name: editingGateway.name, details: JSON.stringify(editingGateway) })
      });
    }
    fetchList();
    setEditingGateway(null);
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '1.8rem', color: 'var(--text-dark)', fontWeight: '900' }}>Payment Gateways</h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>Manage EasyPaisa, JazzCash & Bank accounts where users will send money.</p>
        </div>
        <button onClick={() => setEditingGateway({ type: 'easypaisa', name: '', accountName: '', accountNumber: '', minLimit: 500, maxLimit: 50000, isActive: true, iconImage: null })} style={{ padding: '12px 24px', background: 'var(--gradient-gold)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}>
          <Plus size={18} /> Add New Gateway
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {gateways.map((gateway) => (
          <div key={gateway.id} style={{ background: 'white', borderRadius: '24px', padding: '24px', border: `2px solid ${gateway.isActive ? '#10b981' : '#f1f5f9'}`, boxShadow: '0 10px 40px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: gateway.iconImage ? 'transparent' : (gateway.type === 'easypaisa' ? '#22c55e' : gateway.type === 'jazzcash' ? '#f43f5e' : '#3b82f6'), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.2rem', overflow: 'hidden' }}>
                  {gateway.iconImage ? (
                    <img src={gateway.iconImage} alt={gateway.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    gateway.type === 'easypaisa' ? 'e' : gateway.type === 'jazzcash' ? 'J' : 'B'
                  )}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 2px 0', fontSize: '1.2rem', color: 'var(--text-dark)', fontWeight: '900' }}>{gateway.name}</h3>
                  <span style={{ padding: '2px 8px', background: gateway.isActive ? '#dcfce7' : '#fee2e2', color: gateway.isActive ? '#16a34a' : '#dc2626', borderRadius: '12px', fontSize: '0.65rem', fontWeight: '800' }}>
                    {gateway.isActive ? 'ACTIVE (Users can see)' : 'DISABLED'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', marginBottom: '20px' }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Account Title</div>
                <div style={{ fontSize: '1.1rem', color: 'var(--text-dark)', fontWeight: '800' }}>{gateway.accountName}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Account Number</div>
                <div style={{ fontSize: '1.1rem', color: 'var(--primary-gold)', fontWeight: '900', letterSpacing: '1px' }}>{gateway.accountNumber}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setEditingGateway(gateway)} style={{ flex: 1, padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', color: 'var(--text-dark)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Edit size={16} /> Edit
              </button>
              <button onClick={() => handleToggleStatus(gateway.id)} style={{ padding: '12px', background: gateway.isActive ? '#fee2e2' : '#dcfce7', border: 'none', borderRadius: '12px', color: gateway.isActive ? '#dc2626' : '#16a34a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={gateway.isActive ? "Disable" : "Enable"}>
                <Power size={18} />
              </button>
              <button onClick={() => handleDelete(gateway.id)} style={{ padding: '12px', background: '#fee2e2', border: 'none', borderRadius: '12px', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Add Gateway Modal */}
      {editingGateway && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '500px', padding: '32px', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
            
            <button onClick={() => setEditingGateway(null)} style={{ position: 'absolute', top: '24px', right: '24px', background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              ✕
            </button>

            <h2 style={{ margin: '0 0 8px 0', fontSize: '1.4rem', color: 'var(--text-dark)', fontWeight: '900' }}>
              {editingGateway.id ? 'Edit Gateway' : 'Add New Gateway'}
            </h2>
            <p style={{ margin: '0 0 24px 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>
              Update the account details where users will send their payments.
            </p>

            <form onSubmit={handleSaveEdit} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Gateway Name</label>
                  <input type="text" value={editingGateway.name} onChange={(e) => setEditingGateway({...editingGateway, name: e.target.value})} placeholder="e.g. EasyPaisa" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', fontWeight: '700', outline: 'none' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Icon Type / Image</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select value={editingGateway.type} onChange={(e) => setEditingGateway({...editingGateway, type: e.target.value})} style={{ flex: 1, padding: '12px 8px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.85rem', fontWeight: '700', outline: 'none' }}>
                      <option value="easypaisa">EasyPaisa</option>
                      <option value="jazzcash">JazzCash</option>
                      <option value="bank">Bank</option>
                    </select>
                    <label style={{ flex: 1, padding: '12px 8px', borderRadius: '12px', border: '1px dashed #cbd5e1', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-dark)', transition: 'all 0.2s' }}>
                      {editingGateway.iconImage ? 'Change Image' : '+ Upload Image'}
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                    </label>
                  </div>
                  {editingGateway.iconImage && (
                    <button type="button" onClick={() => setEditingGateway({...editingGateway, iconImage: null})} style={{ marginTop: '6px', fontSize: '0.75rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', padding: 0 }}>
                      Remove Custom Image
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Account Title (Name)</label>
                <input type="text" value={editingGateway.accountName} onChange={(e) => setEditingGateway({...editingGateway, accountName: e.target.value})} placeholder="e.g. Ali Raza" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', fontWeight: '700', outline: 'none' }} required />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Account Number</label>
                <input type="text" value={editingGateway.accountNumber} onChange={(e) => setEditingGateway({...editingGateway, accountNumber: e.target.value})} placeholder="03XXXXXXXXX" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', fontWeight: '700', outline: 'none' }} required />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <input type="checkbox" id="isActive" checked={editingGateway.isActive} onChange={(e) => setEditingGateway({...editingGateway, isActive: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                <label htmlFor="isActive" style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-dark)', cursor: 'pointer' }}>Active (Visible to users)</label>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setEditingGateway(null)} style={{ flex: 1, padding: '14px', background: '#f1f5f9', border: 'none', borderRadius: '12px', color: 'var(--text-dark)', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ flex: 1, padding: '14px', background: 'var(--gradient-gold)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Save size={18} /> {editingGateway.id ? 'Update Gateway' : 'Add Gateway'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageGateways;
