import React, { useState, useEffect } from 'react';
import { Headset, Eye, Clock, CheckCircle, Search, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config';

const AdminSupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tickets`);
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
    fetchTickets();
  }, []);

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

  const filteredTickets = tickets.filter(t => 
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.userName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const counts = {
    open: tickets.filter(t => t.status === 'Open').length,
    inProgress: tickets.filter(t => t.status === 'In Progress').length,
    waiting: tickets.filter(t => t.status === 'Waiting for User').length,
    resolved: tickets.filter(t => t.status === 'Resolved').length,
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '1.5rem', color: '#111827', fontWeight: '800' }}>Support Tickets</h2>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>Manage and respond to user queries</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Inbox size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827' }}>{counts.open}</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Open</div>
          </div>
        </div>
        
        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827' }}>{counts.inProgress}</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>In Progress</div>
          </div>
        </div>
        
        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Headset size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827' }}>{counts.waiting}</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Waiting for User</div>
          </div>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827' }}>{counts.resolved}</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Resolved</div>
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#111827', fontWeight: '800' }}>All Tickets</h3>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search tickets..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem', width: '250px' }} 
            />
          </div>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Ticket ID</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>User</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Subject</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Category</th>
                <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Priority</th>
                <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Last Updated</th>
                <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading tickets...</td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No tickets found</td>
                </tr>
              ) : (
                filteredTickets.map((t) => {
                  const statusStyle = getStatusColor(t.status);
                  return (
                    <tr key={t.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s', ':hover': { background: '#f8fafc' } }}>
                      <td style={{ padding: '16px 20px', fontSize: '0.9rem', color: '#0f172a', fontWeight: '700' }}>{t.id}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: '600' }}>{t.userName || 'Unknown'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{t.userEmail}</div>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '0.9rem', color: '#0f172a', fontWeight: '600', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.subject}</td>
                      <td style={{ padding: '16px 20px', fontSize: '0.85rem', color: '#475569' }}>{t.category}</td>
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <span style={{ 
                          fontSize: '0.75rem', fontWeight: '800', padding: '4px 8px', borderRadius: '6px', 
                          background: t.priority === 'Urgent' ? '#fee2e2' : '#f1f5f9',
                          color: t.priority === 'Urgent' ? '#dc2626' : '#475569' 
                        }}>
                          {t.priority}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', padding: '4px 10px', borderRadius: '12px', background: statusStyle.bg, color: statusStyle.text }}>
                          {t.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center', fontSize: '0.85rem', color: '#475569' }}>
                        {new Date(t.updated_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <Link to={`/admin/support-tickets/${t.id.replace('#', '')}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#3b82f6', fontSize: '0.8rem', fontWeight: '700', textDecoration: 'none', cursor: 'pointer' }}>
                          <Eye size={14} /> View
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminSupportTickets;
