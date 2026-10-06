import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, CheckCircle, Clock } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../../config';

const AdminTicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [replies, setReplies] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const fetchTicket = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tickets/${encodeURIComponent('#' + id)}`);
      if (res.ok) {
        const data = await res.json();
        setTicket(data.ticket);
        setReplies(data.replies);
        
        // Auto-update to 'In Progress' if it was 'Open'
        if (data.ticket.status === 'Open') {
          handleStatusChangeSilently('In Progress', data.ticket.priority);
          setTicket(prev => ({ ...prev, status: 'In Progress' }));
        }
      } else {
        navigate('/admin/support-tickets');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChangeSilently = async (newStatus, newPriority) => {
    try {
      await fetch(`${API_BASE_URL}/api/tickets/${encodeURIComponent('#' + id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          priority: newPriority
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [replies]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const currentMsg = message;
    setMessage('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/tickets/${encodeURIComponent('#' + id)}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'admin',
          message: currentMsg
        })
      });
      if (res.ok) {
        // Option to add a notification to the user here
        const userNotifications = JSON.parse(localStorage.getItem('user_notifications') || '{}');
        const userNotifs = userNotifications[ticket.userId] || [];
        userNotifs.push({
          id: Date.now().toString(),
          title: `Support Replied to Ticket #${ticket.id}`,
          text: `A support agent has replied to your ticket regarding "${ticket.subject}".`,
          date: new Date().toISOString(),
          read: false
        });
        userNotifications[ticket.userId] = userNotifs;
        localStorage.setItem('user_notifications', JSON.stringify(userNotifications));

        // Also change status to 'Waiting for User' if it was Open or In Progress
        if (ticket.status !== 'Closed' && ticket.status !== 'Resolved') {
            await handleStatusChange('Waiting for User', ticket.priority);
        } else {
            fetchTicket();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (newStatus, newPriority) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tickets/${encodeURIComponent('#' + id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          priority: newPriority
        })
      });
      if (res.ok) {
        fetchTicket();
      }
    } catch (err) {
      console.error(err);
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

  if (loading) return <div style={{ padding: '24px' }}>Loading ticket details...</div>;
  if (!ticket) return null;

  return (
    <div style={{ padding: '24px', display: 'flex', gap: '24px', height: 'calc(100vh - 80px)' }}>
      
      {/* Left Column: Chat UI */}
      <div style={{ flex: 1, background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div onClick={() => navigate('/admin/support-tickets')} style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft size={16} color="#64748b" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#111827', fontWeight: '800' }}>Conversation</h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{ticket.id} • {ticket.subject}</p>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: '#f8fafc' }}>
          {replies.map(reply => {
            const isAdmin = reply.sender === 'admin';
            return (
              <div key={reply.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isAdmin ? 'flex-end' : 'flex-start' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginBottom: '4px', padding: '0 4px' }}>
                  {isAdmin ? 'Support Team (You)' : ticket.userName || 'User'} • {new Date(reply.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                <div style={{ 
                  background: isAdmin ? '#10b981' : 'white', 
                  color: isAdmin ? 'white' : '#111827', 
                  padding: '12px 16px', 
                  borderRadius: '16px', 
                  borderBottomRightRadius: isAdmin ? '4px' : '16px',
                  borderBottomLeftRadius: !isAdmin ? '4px' : '16px',
                  border: isAdmin ? 'none' : '1px solid #e2e8f0',
                  maxWidth: '85%',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
                }}>
                  {reply.message}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleReply} style={{ padding: '16px 20px', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input 
            type="text" 
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Type your reply to user..." 
            style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', fontSize: '0.95rem' }} 
          />
          <button type="submit" disabled={!message.trim() || ticket.status === 'Closed'} style={{ padding: '12px 24px', borderRadius: '12px', background: '#3b82f6', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', cursor: (message.trim() && ticket.status !== 'Closed') ? 'pointer' : 'not-allowed', opacity: (message.trim() && ticket.status !== 'Closed') ? 1 : 0.5 }}>
            <Send size={16} /> Send Reply
          </button>
        </form>
      </div>

      {/* Right Column: Ticket Controls */}
      <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#111827', fontWeight: '800' }}>Ticket Info</h3>
          
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>User</div>
            <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: '700' }}>{ticket.userName}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{ticket.userEmail}</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>ID: {ticket.userId}</div>
          </div>
          
          <div style={{ marginBottom: '12px', padding: '12px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>Category</div>
            <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: '600' }}>{ticket.category}</div>
          </div>
          
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>Created Date</div>
            <div style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: '600' }}>{new Date(ticket.created_at).toLocaleString()}</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#111827', fontWeight: '800' }}>Controls</h3>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Status</label>
            <select 
              value={ticket.status} 
              onChange={e => handleStatusChange(e.target.value, ticket.priority)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc', fontSize: '0.9rem', fontWeight: '600' }}
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Waiting for User">Waiting for User</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Priority</label>
            <select 
              value={ticket.priority} 
              onChange={e => handleStatusChange(ticket.status, e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc', fontSize: '0.9rem', fontWeight: '600' }}
            >
              <option value="Normal">Normal</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminTicketDetails;
