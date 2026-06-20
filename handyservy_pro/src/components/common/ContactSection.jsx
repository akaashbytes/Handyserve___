import React, { useState } from 'react';
import { Card, Toast } from './UI';
import { getIcon } from './Icons';
import { useAuth } from '../context/AuthContext';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const { submitContactRequest } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.message.trim()) {
      setToast({ message: 'Please fill in all fields', type: 'error' });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setToast({ message: 'Please enter a valid email', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
        phone: ''
      };
      await submitContactRequest(payload);
      setFormData({ firstName: '', lastName: '', email: '', message: '' });
      setToast({ message: 'Message sent successfully! We\'ll get back to you soon.', type: 'success' });
      setTimeout(() => setToast(null), 5000);
    } catch (error) {
      console.error('Contact form submission failed:', error);
      setToast({ message: 'Failed to submit contact query. Please try again later.', type: 'error' });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section 
      id="contact" 
      className="lt-section"
      style={{
        padding: '120px 40px',
        background: 'var(--lt-bg-base)',
        fontFamily: 'var(--font-body)',
        borderTop: '1px solid var(--lt-border)',
      }}
    >
      <div className="lt-canvas-grid" style={{ opacity: 0.6 }} />

      <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p className="tech-mono" style={{
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--lt-secondary)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}>
            Contact Us
          </p>
          <h2 style={{
            fontSize: '36px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            marginBottom: '16px',
            lineHeight: 1.2,
            fontFamily: 'var(--font-display)',
          }}>
            Get In Touch
          </h2>
          <p style={{ 
            fontSize: '14px', 
            color: 'var(--lt-secondary)', 
            lineHeight: 1.6
          }}>
            Have questions or need assistance? Reach out to our 24/7 support team at{' '}
            <a href="mailto:ramaiahakaash51@gmail.com" style={{ color: 'var(--lt-accent)', textDecoration: 'underline', fontWeight: 600 }}>
              ramaiahakaash51@gmail.com
            </a>
          </p>
        </div>

        {/* Form Card */}
        <Card 
          padding="40px" 
          style={{ 
            background: 'var(--lt-bg-card)', 
            border: '1px solid var(--lt-border)', 
            borderRadius: '8px',
            boxShadow: 'none'
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* First Name & Last Name Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="lt-label">
                  First Name
                </label>
                <input 
                  type="text" 
                  name="firstName"
                  placeholder="John" 
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="lt-input"
                  onFocus={e => {
                    e.target.style.borderColor = 'var(--lt-accent)';
                    e.target.style.background = 'var(--lt-bg-card)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'var(--lt-border)';
                    e.target.style.background = 'var(--lt-bg-card)';
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="lt-label">
                  Last Name
                </label>
                <input 
                  type="text" 
                  name="lastName"
                  placeholder="Doe" 
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="lt-input"
                  onFocus={e => {
                    e.target.style.borderColor = 'var(--lt-accent)';
                    e.target.style.background = 'var(--lt-bg-card)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'var(--lt-border)';
                    e.target.style.background = 'var(--lt-bg-card)';
                  }}
                />
              </div>

            </div>

            {/* Email Address */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label className="lt-label">
                Email Address
              </label>
              <input 
                type="email" 
                name="email"
                placeholder="john@example.com" 
                value={formData.email}
                onChange={handleChange}
                required
                className="lt-input"
                onFocus={e => {
                  e.target.style.borderColor = 'var(--lt-accent)';
                  e.target.style.background = 'var(--lt-bg-card)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'var(--lt-border)';
                  e.target.style.background = 'var(--lt-bg-card)';
                }}
              />
            </div>

            {/* Message Textarea */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label className="lt-label">
                Message
              </label>
              <textarea 
                name="message"
                placeholder="How can we help you?"
                value={formData.message}
                onChange={handleChange}
                required
                className="lt-input"
                style={{
                  width: '100%',
                  minHeight: '120px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'var(--lt-accent)';
                  e.target.style.background = 'var(--lt-bg-card)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'var(--lt-border)';
                  e.target.style.background = 'var(--lt-bg-card)';
                }}
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="lt-btn lt-btn-primary lt-btn-code"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: 'none',
                marginTop: '10px'
              }}
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>

          </form>
        </Card>

        {/* Info Pills Below Form */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
          marginTop: '36px',
          flexWrap: 'wrap'
        }}>
          {[
            { icon: '📞', text: '+91 800-HANDY-SV' },
            { icon: '🕒', text: 'Mon - Sun: 8:00 AM - 10:00 PM' },
            { icon: '📍', text: 'Metro City' }
          ].map((pill, i) => (
            <div key={i} className="tech-mono" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--lt-border)',
              borderRadius: '4px',
              fontSize: '11px',
              color: 'var(--lt-secondary)',
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>{getIcon(pill.icon, { size: 14 })}</span>
              <span>{pill.text}</span>
            </div>
          ))}
        </div>

      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </section>
  );
}
