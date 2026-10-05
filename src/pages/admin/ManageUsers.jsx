import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Ban, CheckCircle, MoreVertical, X } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    fetch(`${API_BASE_URL}/api/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        console.log("Users API response:", data);
        if (Array.isArray(data)) {
          setUsers(data);
        } else if (data.users && Array.isArray(data.users)) {
          setUsers(data.users);
        } else {
          console.error("Users API response is not an array:", data);
          setUsers([]);
        }
      })
      .catch(err => console.error("Users fetch error:", err));
  }, []);

  // Edit form state
  const [editBalance, setEditBalance] = useState('');
  const [editPlan, setEditPlan] = useState('');

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditBalance(user.balance);
    setEditPlan(user.plan);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ balance: Number(editBalance), plan: editPlan, status: editingUser.status })
      });
      
      if (res.ok) {
        setUsers(users.map(u => 
          u.id === editingUser.id 
          ? { ...u, balance: Number(editBalance), plan: editPlan } 
          : u
        ));
        setEditingUser(null);
        alert('User updated successfully!');
      } else {
        alert('Failed to update user');
      }
    } catch (err) {
      alert('Error saving user data');
    }
  };

  const toggleUserStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Blocked' : 'Active';
    const user = users.find(u => u.id === id);
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ balance: user.balance, plan: user.plan, status: newStatus })
      });
      
      if (res.ok) {
        setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
      } else {
        alert('Failed to change user status');
      }
    } catch (err) {
      alert('Error updating user status');
    }
  };

  const filteredUsers = (Array.isArray(users) ? users : []).filter(user => {
    const nameStr = user?.name || '';
    const emailStr = user?.email || '';
    const idStr = user?.id || '';
    const statusStr = user?.status || '';

    const matchesSearch = nameStr.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emailStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          idStr.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || statusStr.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '1.8rem', color: 'var(--text-dark)', fontWeight: '900' }}>Manage Users</h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>View, edit and manage registered members.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ padding: '12px 24px', background: 'var(--gradient-gold)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)', transition: 'all 0.2s' }}>
            + Add New User
          </button>
        </div>
      </div>

      {/* Toolbar / Search */}
      <div style={{ background: 'white', padding: '16px 24px', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', marginBottom: '24px', display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search by Name, Email or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem', fontWeight: '600', outline: 'none' }}
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem', fontWeight: '700', outline: 'none', color: 'var(--text-dark)', cursor: 'pointer' }}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {/* Users Table */}
      <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: 'var(--text-muted)' }}>
                <th style={{ padding: '16px 32px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>User Details</th>
                <th style={{ padding: '16px 32px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Balance</th>
                <th style={{ padding: '16px 32px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Plan</th>
                <th style={{ padding: '16px 32px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Joined Date</th>
                <th style={{ padding: '16px 32px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                <th style={{ padding: '16px 32px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? filteredUsers.map((user, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '20px 32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-gold)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        {(user?.name || '?').charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-dark)' }}>{user?.name || 'Unknown'}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>{user?.email || 'N/A'} <span style={{ opacity: 0.5 }}>• {user?.id || 'N/A'}</span></div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 32px', fontSize: '1rem', fontWeight: '900', color: 'var(--text-dark)' }}>Rs {Number(user?.balance || 0).toLocaleString()}</td>
                  <td style={{ padding: '20px 32px' }}>
                    <span style={{ padding: '6px 12px', background: user.plan !== 'None' ? '#fef3c7' : '#f1f5f9', color: user.plan !== 'None' ? '#d97706' : '#64748b', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800' }}>
                      {user.plan}
                    </span>
                  </td>
                  <td style={{ padding: '20px 32px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>{user.joined}</td>
                  <td style={{ padding: '20px 32px' }}>
                    <span style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800',
                      background: user.status === 'Active' ? '#dcfce7' : '#fee2e2',
                      color: user.status === 'Active' ? '#16a34a' : '#dc2626'
                    }}>
                      {user.status === 'Active' ? <CheckCircle size={14} /> : <Ban size={14} />}
                      {user.status}
                    </span>
                  </td>
                  <td style={{ padding: '20px 32px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                      <button onClick={() => handleEditClick(user)} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#3b82f6', cursor: 'pointer' }} title="Edit User">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => toggleUserStatus(user.id, user.status)} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: user.status === 'Active' ? '#dc2626' : '#16a34a', cursor: 'pointer' }} title={user.status === 'Active' ? 'Block User' : 'Unblock User'}>
                        {user.status === 'Active' ? <Ban size={16} /> : <CheckCircle size={16} />}
                      </button>
                      <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: '600' }}>No users found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '450px', padding: '32px', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
            
            <button onClick={() => setEditingUser(null)} style={{ position: 'absolute', top: '24px', right: '24px', background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={18} color="var(--text-dark)" />
            </button>

            <h2 style={{ margin: '0 0 8px 0', fontSize: '1.4rem', color: 'var(--text-dark)', fontWeight: '900' }}>Edit User</h2>
            <p style={{ margin: '0 0 24px 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Updating details for {editingUser.name}</p>

            <form onSubmit={handleSaveEdit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>User Balance (PKR)</label>
                <input 
                  type="number" 
                  value={editBalance}
                  onChange={(e) => setEditBalance(e.target.value)}
                  style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', fontWeight: '700', outline: 'none' }}
                  required
                />
              </div>
              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Active Plan</label>
                <select 
                  value={editPlan}
                  onChange={(e) => setEditPlan(e.target.value)}
                  style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', fontWeight: '700', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="None">None</option>
                  <option value="Plan 1">Plan 1</option>
                  <option value="Plan 2">Plan 2</option>
                  <option value="Plan 3">Plan 3</option>
                  <option value="Plan 4">Plan 4</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setEditingUser(null)} style={{ flex: 1, padding: '14px', background: '#f1f5f9', border: 'none', borderRadius: '12px', color: 'var(--text-dark)', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ flex: 1, padding: '14px', background: 'var(--primary-gold)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageUsers;
