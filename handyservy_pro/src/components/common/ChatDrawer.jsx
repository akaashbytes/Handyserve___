import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Avatar } from './UI';

export default function ChatDrawer({ isOpen, onClose, booking }) {
  const { user, fetchChatMessages, sendChatMessage } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Determine recipient details
  const isCustomer = user?.role === 'customer';
  const recipientName = isCustomer ? booking?.providerName : booking?.customerName;
  const recipientInitials = recipientName ? recipientName.substring(0, 2).toUpperCase() : '👤';

  useEffect(() => {
    if (isOpen && booking?.id) {
      loadMessages();
    }
  }, [isOpen, booking?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle incoming real-time socket messages
  useEffect(() => {
    const handleSocketMessage = (event) => {
      const msg = event.detail;
      // Append if it belongs to this booking chat log
      if (msg && Number(msg.bookingId) === Number(booking?.id)) {
        setMessages((prev) => {
          // Check for duplicate to avoid adding twice (if HTTP POST resolves after ws)
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    };

    window.addEventListener('ws:chat:message', handleSocketMessage);
    return () => {
      window.removeEventListener('ws:chat:message', handleSocketMessage);
    };
  }, [booking?.id]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await fetchChatMessages(booking.id);
      setMessages(data || []);
    } catch (e) {
      console.error('Failed to load chat messages:', e);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();
    setInputText('');

    try {
      const sentMsg = await sendChatMessage(booking.id, textToSend);
      setMessages((prev) => {
        if (prev.some((m) => m.id === sentMsg.id)) return prev;
        return [...prev, sentMsg];
      });
    } catch (e) {
      console.error('Failed to send chat message:', e);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.25s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          height: '100%',
          background: 'var(--bg-card)',
          borderLeft: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          animation: 'slideInRight 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Avatar initials={recipientInitials} size={38} />
            <div>
              <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', margin: 0 }}>
                {recipientName || 'Support Chat'}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Booking: {booking?.service} (#{booking?.id})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              fontSize: '16px',
              transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--border)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
          >
            ×
          </button>
        </div>

        {/* Message Panel */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg-base)' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', margin: 'auto' }}>Loading chat...</p>
          ) : messages.length > 0 ? (
            messages.map((msg) => {
              const isOwn = msg.senderEmail === user?.email;
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isOwn ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    alignSelf: isOwn ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: isOwn ? 'var(--brand)' : 'var(--bg-card)',
                      color: isOwn ? '#fff' : 'var(--text-primary)',
                      border: isOwn ? 'none' : '1px solid var(--border)',
                      fontSize: '13.5px',
                      lineHeight: '1.45',
                      boxShadow: 'var(--shadow-xs)',
                    }}
                  >
                    {msg.text}
                  </div>
                  <span
                    style={{
                      fontSize: '10.5px',
                      color: 'var(--text-muted)',
                      marginTop: '4px',
                      padding: '0 4px',
                    }}
                  >
                    {msg.senderName} · {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              );
            })
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: 'auto', gap: '8px', opacity: 0.6 }}>
              <span style={{ fontSize: '32px' }}>💬</span>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>Start messaging to discuss the details.</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          style={{
            padding: '20px 24px',
            borderTop: '1px solid var(--border)',
            background: 'var(--bg-surface)',
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '24px',
              border: '1.5px solid var(--border)',
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              fontSize: '13.5px',
              outline: 'none',
              transition: 'var(--transition)',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--brand)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; }}
          />
          <Button type="submit" style={{ borderRadius: '24px', padding: '12px 20px' }}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
