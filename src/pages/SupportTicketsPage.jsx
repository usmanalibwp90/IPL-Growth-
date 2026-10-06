import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, X, Search, Clock, CheckCircle, MessagesSquare, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const SupportTicketsPage = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    category: 'Deposit / Payment Issue',
    priority: 'Normal',
    message: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id || user.email;

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tickets/user/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchTickets();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.message) {
      setError('Please fill all required fields');
      return;
    }
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          userName: user.name || 'User',
          userEmail: user.email || '',
          ...formData
        })
      });
      
      if (res.ok) {
        setIsCreating(false);
        setFormData({ subject: '', category: 'Deposit / Payment Issue', priority: 'Normal', message: '' });
        fetchTickets();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create ticket');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Open': return { bg: '#dbeafe', text: '#2563eb' };
      case 'In Progress': return { bg: '#fef3c7', text: '#d97706' };
      case 'Waiting for User': return { bg: '#ffedd5', text: '#ea580c' };
      case 'Resolved': return { bg: '#dcfce7', text: '#16a34a' };
      case 'Closed': return { bg: '#f1f5f9', text: '#475569' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  return (
    <div className="page-transition" style={{ padding: '10px', paddingBottom: '100px', maxWidth: 'var(--max-width)', margin: '0 auto', position: 'relative' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '24px' }}>
        <div onClick={() => navigate('/dashboard')} style={{ width: '45px', height: '45px', borderRadius: '14px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
           <ArrowLeft size={20} color="var(--text-dark)" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-dark)', fontWeight: '800' }}>Help & Support</h1>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>My Tickets</p>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', background: 'white' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '1.3rem', color: 'var(--primary-gold)', fontWeight: '900' }}>Need assistance?</h2>
        <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5', fontWeight: '500' }}>
          Create a support ticket and our team will respond to you as soon as possible.
        </p>
        <button onClick={() => setIsCreating(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '14px', background: 'var(--primary-gold)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)' }}>
          <Plus size={20} /> Create New Ticket
        </button>
      </div>

      <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: 'var(--text-dark)', fontWeight: '800' }}>Previous Tickets</h3>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px 20px', textAlign: 'center', background: 'white' }}>
          <MessagesSquare size={40} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
          <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: 'var(--text-dark)', fontWeight: '800' }}>No Tickets Found</h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>You haven't created any support tickets yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tickets.map(ticket => {
            const statusStyle = getStatusColor(ticket.status);
            return (
              <Link to={`/support-tickets/${ticket.id.replace('#', '')}`} key={ticket.id} style={{ textDecoration: 'none' }}>
                <div className="glass-card" style={{ padding: '16px', background: 'white', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>{ticket.id}</span>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-dark)', fontWeight: '800' }}>{ticket.subject}</h4>
                    </div>
                    <span style={{ background: statusStyle.bg, color: statusStyle.text, padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800' }}>
                      {ticket.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>{ticket.category}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {new Date(ticket.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Create Ticket Modal */}
      {isCreating && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', background: 'white', borderRadius: '24px', padding: '24px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setIsCreating(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={18} />
            </button>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '1.4rem', color: 'var(--text-dark)', fontWeight: '900' }}>New Ticket</h2>
            
            {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '12px', marginBottom: '16px', fontSize: '0.85rem', fontWeight: '700' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Subject</label>
                <input type="text" required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} placeholder="Brief summary of your issue" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', appearance: 'none' }}>
                  <option>Deposit / Payment Issue</option>
                  <option>Withdrawal Issue</option>
                  <option>Package / Investment Issue</option>
                  <option>Account Issue</option>
                  <option>Login Issue</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Priority</label>
                <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', appearance: 'none' }}>
                  <option>Normal</option>
                  <option>Urgent</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>Message / Describe Your Issue</label>
                <textarea required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} placeholder="Please provide details..." rows="4" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', resize: 'vertical' }}></textarea>
              </div>

              <button type="submit" style={{ width: '100%', padding: '16px', background: 'var(--primary-gold)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '1rem', cursor: 'pointer', marginTop: '8px' }}>
                Submit Ticket
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTicketsPage;
