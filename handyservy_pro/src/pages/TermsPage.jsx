import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from '../components/common/UI';
import { HSLogo } from '../components/common/Icons';

export default function TermsPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-body)',
      padding: '40px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px' }}>
          <HSLogo size={32} />
          HandyServe
        </Link>
        <Link to="/">
          <Button variant="outline" size="sm">Back to Home</Button>
        </Link>
      </div>

      <Card padding="40px" style={{ width: '100%', maxWidth: '800px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>Terms of Service</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>Last Updated: June 4, 2026</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', lineHeight: 1.7, fontSize: '14.5px', color: 'var(--text-secondary)' }}>
          <p>
            By accessing or using the HandyServe Pro platform, you agree to comply with and be bound by the following Terms of Service. Please read them carefully before using our platform.
          </p>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>1. Scope of Services</h2>
            <p>
              HandyServe Pro operates a marketplace connecting customers requiring home maintenance services with independent service providers. HandyServe Pro does not employ the service providers and is not responsible for the quality, safety, or legality of the work performed.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>2. Account Registration & Safety</h2>
            <p>
              To use our marketplace, you must create a secure account. You agree to:
            </p>
            <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Provide accurate, current, and complete details, including profile photos.</li>
              <li>Maintain the security and confidentiality of your credentials.</li>
              <li>Accept responsibility for all activities that occur under your account.</li>
              <li>Provide valid legal identification (Aadhar, PAN, or DL) if registering as a professional service provider.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>3. Bookings, Payments, and Cancellations</h2>
            <p>
              Bookings progress through defined phases: <strong>Booked → Accepted → On the Way → Destination → Reached → Completed</strong>.
            </p>
            <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>All payments are processed securely through integrated UPI, card, or wallet options.</li>
              <li>Prices are calculated based on fixed and hourly preferences. Replaced references represent Indian Rupee (₹) pricing standards.</li>
              <li>Cancellations are subject to our standard cancellation window and refund terms.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>4. Platform Conduct & Disallowance</h2>
            <p>
              We reserve the right to suspend or terminate accounts that breach reliability thresholds (e.g. low scores, excessive cancellations, non-payment, or harassment). Dispute tickets are reviewed directly by the platform administration team.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>5. Contact Us</h2>
            <p>
              For legal inquiries or feedback, please contact us at <a href="mailto:legal@handyserve.pro" style={{ color: 'var(--brand)' }}>legal@handyserve.pro</a>.
            </p>
          </section>
        </div>
      </Card>
    </div>
  );
}
