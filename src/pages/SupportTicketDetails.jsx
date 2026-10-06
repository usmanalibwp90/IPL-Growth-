import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, CheckCircle, Clock } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const SupportTicketDetails = () => {
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
      } else {
        navigate('/support-tickets');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
      const res = await fetch(`${API_BASE_URL}/api/tickets/${encodeURIComponent('#' + id)}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'user',
          senderName: 'User',
          text: currentMsg,
          timestamp: new Date().toISOString()
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

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  if (!ticket) return null;

  const statusStyle = getStatusColor(ticket.status);

  return (
    <div className="page-transition" style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: 'var(--max-width)', margin: '0 auto', background: '#f8fafc' }}>
      
      {/* Header */}
      <div style={{ padding: '16px 20px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div onClick={() => navigate('/support-tickets')} style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
           <ArrowLeft size={20} color="var(--text-dark)" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-dark)', fontWeight: '800' }}>{ticket.id}</h1>
            <span style={{ background: statusStyle.bg, color: statusStyle.text, padding: '2px 8px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: '800' }}>
              {ticket.status}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ticket.subject}</p>
        </div>
      </div>

      {/* Messages Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Ticket Info Card */}
        <div style={{ background: 'white', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '8px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '4px' }}>Category: {ticket.category}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>Created: {new Date(ticket.created_at).toLocaleString()}</div>
        </div>

        {replies.map(reply => {
          const isUser = reply.sender === 'user';
          return (
            <div key={reply.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '4px', padding: '0 4px' }}>
                {isUser ? 'You' : 'Support Team'} • {new Date(reply.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
              <div style={{ 
                background: isUser ? 'var(--gradient-gold)' : 'white', 
                color: isUser ? 'white' : 'var(--text-dark)', 
                padding: '12px 16px', 
                borderRadius: '16px', 
                borderBottomRightRadius: isUser ? '4px' : '16px',
                borderBottomLeftRadius: !isUser ? '4px' : '16px',
                border: isUser ? 'none' : '1px solid #e2e8f0',
                maxWidth: '85%',
                fontSize: '0.9rem',
                lineHeight: '1.5',
                fontWeight: '500',
                boxShadow: isUser ? '0 4px 10px rgba(217,119,6,0.2)' : '0 2px 5px rgba(0,0,0,0.02)'
              }}>
                {reply.text || reply.message}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Input Area */}
      {(ticket.status !== 'Closed' && ticket.status !== 'Resolved') ? (
        <form onSubmit={handleReply} style={{ padding: '16px 20px 96px 20px', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input 
            type="text" 
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Type your message..." 
            style={{ flex: 1, padding: '14px 16px', borderRadius: '24px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', fontSize: '0.95rem' }} 
          />
          <button type="submit" disabled={!message.trim()} style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-gold)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: message.trim() ? 'pointer' : 'not-allowed', opacity: message.trim() ? 1 : 0.5 }}>
            <Send size={20} />
          </button>
        </form>
      ) : (
        <div style={{ padding: '20px', textAlign: 'center', background: 'white', borderTop: '1px solid #e2e8f0', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600' }}>
          This ticket is {ticket.status.toLowerCase()} and cannot receive new replies.
        </div>
      )}

    </div>
  );
};

export default SupportTicketDetails;
