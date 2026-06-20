import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from '../components/common/UI';
import { HSLogo } from '../components/common/Icons';

export default function PrivacyPage() {
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
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>Privacy Policy</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>Last Updated: June 4, 2026</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', lineHeight: 1.7, fontSize: '14.5px', color: 'var(--text-secondary)' }}>
          <p>
            Welcome to HandyServe Pro. We value your privacy and are committed to protecting your personal data. This Privacy Policy outlines how we collect, use, and safeguard your information when you use our platform.
          </p>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>1. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us when registering or updating your profile:
            </p>
            <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><strong>Personal Details:</strong> Name, email address, phone number, physical address, and profile photo.</li>
              <li><strong>Verification & Payment Details (Providers):</strong> Government ID numbers (Aadhar/PAN/DL), UPI ID, and bank account information.</li>
              <li><strong>Location Data:</strong> Real-time GPS location coordinates to facilitate booking, job tracking, and mapping.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>2. How We Use Your Information</h2>
            <p>
              The information we collect is used to power our service matching marketplace:
            </p>
            <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>To create and manage your secure account.</li>
              <li>To enable customers to find, book, and track providers.</li>
              <li>To display provider profile photos and active locations on the tracking screen.</li>
              <li>To process payments securely through integrated payment gateways.</li>
              <li>To resolve disputes, process refunds, and ensure the safety of our users.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>3. Data Sharing & Security</h2>
            <p>
              We do not sell your personal data. We only share information with third parties (such as customers/providers on active bookings) as necessary to perform our services, or when required by law.
            </p>
            <p style={{ marginTop: '8px' }}>
              All uploaded profile photos are compressed and encrypted, and payment operations are fully compliant with security standards.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>4. Contact Us</h2>
            <p>
              If you have any questions or concerns regarding this policy, please reach out to our support team at <a href="mailto:support@handyserve.pro" style={{ color: 'var(--brand)' }}>support@handyserve.pro</a>.
            </p>
          </section>
        </div>
      </Card>
    </div>
  );
}
