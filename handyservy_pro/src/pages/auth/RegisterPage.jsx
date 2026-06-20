import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../components/context/AuthContext';
import { Card, Button, Input, SectionHeader } from '../../components/common/UI';
import { useTheme } from '../../components/context/ThemeContext';
import { getIcon, HSLogo } from '../../components/common/Icons';
import { SERVICE_CATEGORIES } from '../../data/mockData';
import CityLocationPicker from '../../components/common/CityLocationPicker';
import { isActiveServiceCity } from '../../lib/cities';

export default function RegisterPage() {
  const { register } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Role, 2: Form
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    state: 'Tamil Nadu', city: '', serviceCity: '', location: '', address: '', pincode: '',
    latitude: null, longitude: null, displayAddress: '', serviceCityActive: true,
    age: '', gender: '', serviceType: '', experience: '', timing: '', radius: '', pricing: '',
    idType: '', idNumber: '', upi: '', bankName: '', accountHolder: '',
    aadhaarNumber: '', aadhaarDoc: '',
    drivingLicenseNumber: '', drivingLicenseDoc: '',
    bankAccountNumber: '', bankIfscCode: '', bankPassbookDoc: ''
  });

  const [locationDraft, setLocationDraft] = useState({
    serviceCity: '', state: 'Tamil Nadu', location: '', latitude: null, longitude: null,
    displayAddress: '', serviceCityActive: true,
  });





  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 200;
        const MAX_HEIGHT = 200;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setFormData(prev => ({ ...prev, profilePhoto: dataUrl }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleDocumentChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must not exceed 5MB.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({ ...prev, [fieldName]: event.target.result }));
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const validate = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.password) return 'Please fill all required fields.';
    
    // Validate Phone number format matching backend: exactly 10 digits starting with 6, 7, 8, or 9
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      return 'Phone Number must be exactly 10 digits and start with 6, 7, 8, or 9.';
    }

    if (role === 'provider' && !formData.profilePhoto) return 'Please upload a profile photo.';
    if (!locationDraft.serviceCity) return 'Select Chennai, Madurai, or Coimbatore.';
    if (typeof locationDraft.latitude !== 'number' || typeof locationDraft.longitude !== 'number') {
      return 'Search and confirm your area on the map.';
    }
    if (role === 'provider' && !isActiveServiceCity(locationDraft.serviceCity)) {
      return 'Providers can only register in Chennai, Madurai, or Coimbatore for now.';
    }
    if (role === 'provider') {
      if (!formData.aadhaarNumber || !/^\d{12}$/.test(formData.aadhaarNumber)) {
        return 'Aadhaar Number must be exactly 12 digits.';
      }
      if (!formData.aadhaarDoc) {
        return 'Please upload your Aadhaar Card document (Image or PDF).';
      }
      if (!formData.drivingLicenseNumber || formData.drivingLicenseNumber.trim().length < 5) {
        return 'Please enter a valid Driving License Number.';
      }
      if (!formData.drivingLicenseDoc) {
        return 'Please upload your Driving License document (Image or PDF).';
      }
      if (!formData.bankName || formData.bankName.trim().length < 3) {
        return 'Please enter your Bank Name.';
      }
      if (!formData.accountHolder || formData.accountHolder.trim().length < 3) {
        return 'Please enter the Account Holder Name.';
      }
      if (!formData.bankAccountNumber || formData.bankAccountNumber.trim().length < 9) {
        return 'Please enter a valid Bank Account Number (minimum 9 digits).';
      }
      if (!formData.bankPassbookDoc) {
        return 'Please upload your Bank Passbook / Cancelled Cheque document (Image or PDF).';
      }
      if (!formData.upi || !formData.upi.includes('@')) {
        return 'Please enter a valid UPI ID (e.g. name@bank).';
      }
    }
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match.';
    
    // Validate Password format matching backend: minimum 8 characters, uppercase, lowercase, digit, special char
    if (formData.password.length < 8) return 'Password must be at least 8 characters.';
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d@$!%*?&^#()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.';
    }
    
    return null;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    try {
      const userData = {
        ...formData,
        role,
        serviceCity: locationDraft.serviceCity,
        city: locationDraft.serviceCity,
        state: locationDraft.state || 'Tamil Nadu',
        location: locationDraft.location,
        latitude: locationDraft.latitude,
        longitude: locationDraft.longitude,
        displayAddress: locationDraft.displayAddress,
        serviceCityActive: locationDraft.serviceCityActive !== false,
        detectedCityLabel: locationDraft.detectedCityLabel || locationDraft.serviceCity,
        address: formData.address || locationDraft.displayAddress,
      };
      await register(userData);
      navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'var(--transition)'
    }}>
      {/* Header */}
      <div style={{
        padding: '24px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)'
      }}>
        <Link to="/" style={{ 
          fontFamily: 'var(--font-display)', 
          fontWeight: 800, 
          fontSize: '20px', 
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <HSLogo size={32} variant="color" />
          HandyServe
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
           <button onClick={toggleTheme} style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-elevated)', border: '1.5px solid var(--border)', cursor: 'pointer', fontSize: '18px' }}>
              {getIcon(isDark ? '☀️' : '🌙', { size: 18, style: { color: 'var(--text-primary)' } })}
           </button>
           <Link to="/login" style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Already have an account? <span style={{ color: 'var(--brand)' }}>Login</span></Link>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: success ? '550px' : (step === 1 ? '700px' : '900px') }}>
          
          {success ? (
            <div style={{ animation: 'fadeInUp 0.4s ease' }}>
              <Card padding="40px" style={{ textAlign: 'center', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'var(--success-light)',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '36px',
                  margin: '0 auto 24px auto',
                  border: '2px solid var(--border)'
                }}>
                  {getIcon('✉️', { size: 36, style: { color: 'var(--success)' } })}
                </div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>Verify Your Email</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>
                  We've sent a verification link to <strong style={{ color: 'var(--text-primary)' }}>{formData.email}</strong>.
                  Please check your inbox and click the link to activate your account.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Button size="lg" onClick={() => navigate('/login')} style={{ width: '100%' }}>
                    Go to Login
                  </Button>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Didn't receive the email? Check your spam folder.
                  </p>
                </div>
              </Card>
            </div>
          ) : (
            <>
              {step === 1 && (
                <div style={{ animation: 'fadeInUp 0.4s ease' }}>
                  <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>Choose Your Role</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>How are you planning to use HandyServe?</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <Card 
                      hover 
                      padding="40px" 
                      onClick={() => handleRoleSelect('customer')}
                      style={{ textAlign: 'center', cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.3s ease' }}
                    >
                      <div style={{ fontSize: '48px', marginBottom: '20px' }}>{getIcon('🏠', { size: 48 })}</div>
                      <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>Customer</h3>
                      <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>I want to book services for my home and find trusted professionals.</p>
                      <div style={{ marginTop: '24px', color: 'var(--brand)', fontWeight: 600 }}>Create Customer Account →</div>
                    </Card>

                    <Card 
                      hover 
                      padding="40px" 
                      onClick={() => handleRoleSelect('provider')}
                      style={{ textAlign: 'center', cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.3s ease' }}
                    >
                      <div style={{ fontSize: '48px', marginBottom: '20px' }}>{getIcon('🔧', { size: 48 })}</div>
                      <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>Service Provider</h3>
                      <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>I want to provide my services, manage jobs, and earn money.</p>
                      <div style={{ marginTop: '24px', color: 'var(--brand)', fontWeight: 600 }}>Join as Professional →</div>
                    </Card>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div style={{ animation: 'fadeInUp 0.4s ease' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                    <Button variant="outline" size="sm" onClick={() => setStep(1)}>← Back</Button>
                    <div>
                      <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>{role === 'customer' ? 'Customer' : 'Provider'} Registration</h1>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Please provide your details to get started.</p>
                    </div>
                  </div>

                  {error && (
                    <div style={{ padding: '12px 16px', background: 'var(--danger-light)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '24px', color: 'var(--danger)', fontSize: '14px', fontWeight: 500 }}>
                      {getIcon('⚠️', { size: 16, style: { marginRight: 8, verticalAlign: 'middle', color: 'var(--danger)' } })}{error}
                    </div>
                  )}

                  <form onSubmit={handleRegister}>
                    <div style={{ display: 'grid', gridTemplateColumns: role === 'provider' ? '1fr 1fr' : '1fr', gap: '32px' }}>
                      
                      {/* Common Personal Details */}
                      <Card padding="28px">
                        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Personal Details</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <Input label="Full Name *" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" />
                          <Input label="Email Address *" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" />
                          <Input label="Phone Number *" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" />
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                             <Input label="Password *" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" />
                             <Input label="Confirm Password *" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" />
                          </div>
                          {role === 'provider' && (
                            <>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                 <Input label="Age *" name="age" type="number" value={formData.age} onChange={handleChange} placeholder="25" />
                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                   <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Gender *</label>
                                   <select name="gender" onChange={handleChange} style={{ padding: '10px 14px', background: 'var(--bg-input)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}>
                                      <option value="">Select</option>
                                      <option value="male">Male</option>
                                      <option value="female">Female</option>
                                      <option value="other">Other</option>
                                   </select>
                                 </div>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Profile Photo *</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px' }}>
                                  {formData.profilePhoto ? (
                                    <img src={formData.profilePhoto} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--brand)' }} />
                                  ) : (
                                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--bg-elevated)', border: '1.5px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>👤</div>
                                  )}
                                  <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} id="provider-photo-upload" />
                                  <label htmlFor="provider-photo-upload" style={{ padding: '8px 16px', background: 'var(--bg-elevated)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer', transition: 'var(--transition)' }}>
                                    Upload Photo
                                  </label>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </Card>

                      {/* Location & Role Specific */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <Card padding="28px">
                          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Service location</h3>
                          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '18px', lineHeight: 1.5 }}>
                            {role === 'provider'
                              ? 'Select your city and pin your real service area. Customers in the same city will see you.'
                              : 'Select your city, then search any area within it on the map.'}
                          </p>
                          <CityLocationPicker
                            value={locationDraft}
                            onChange={setLocationDraft}
                            mapHeight={240}
                            allowFreeSearch={role === 'customer'}
                          />
                          <div style={{ marginTop: '16px' }}>
                            <Input label="Door / flat no. (optional)" name="address" value={formData.address} onChange={handleChange} placeholder="House no, floor, building" />
                          </div>
                          <div style={{ marginTop: 12 }}>
                            <Input label="Pincode (optional)" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="600040" />
                          </div>
                        </Card>

                        {role === 'provider' && (
                          <Card padding="28px">
                            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Professional Details</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                               <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                 <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Service Category *</label>
                                 <select name="serviceType" onChange={handleChange} style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}>
                                    <option value="">Select Service</option>
                                    <option value="Plumber">Plumber</option>
                                    <option value="Electrician">Electrician</option>
                                    <option value="Cleaning">Cleaning</option>
                                    <option value="AC Repair">AC Repair</option>
                                    <option value="Carpenter">Carpenter</option>
                                    <option value="Salon">Salon</option>
                                    <option value="Bike Service">Bike Service</option>
                                    <option value="Car Wash">Car Wash</option>
                                 </select>
                               </div>
                               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                  <Input label="Experience (yrs) *" name="experience" type="number" placeholder="5" onChange={handleChange} />
                                  <Input label="Service Radius (km) *" name="radius" type="number" placeholder="10" onChange={handleChange} />
                               </div>
                               <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                                  <Input label="Available Timing *" name="timing" placeholder="9 AM - 6 PM" onChange={handleChange} />
                                  <Input label="Pricing Preference" name="pricing" placeholder="Fixed/Hourly" onChange={handleChange} />
                               </div>
                            </div>
                          </Card>
                        )}

                      </div>
                    </div>

                    {role === 'provider' && (
                        <Card padding="28px" style={{ marginTop: '24px' }}>
                           <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Verification Documents & Payment</h3>
                           
                           {/* Aadhaar Section */}
                           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                               <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>1. Aadhaar Card Verification</h4>
                               <Input label="Aadhaar Number *" name="aadhaarNumber" value={formData.aadhaarNumber} placeholder="12-digit Aadhaar number" onChange={handleChange} />
                             </div>
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'flex-end' }}>
                               <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Aadhaar Card Document * (Image / PDF)</label>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                 <input type="file" accept="image/*,application/pdf" onChange={(e) => handleDocumentChange(e, 'aadhaarDoc')} style={{ display: 'none' }} id="aadhaar-upload" />
                                 <label htmlFor="aadhaar-upload" style={{ padding: '8px 16px', background: 'var(--bg-elevated)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                   📁 Upload File
                                 </label>
                                 {formData.aadhaarDoc ? (
                                   <span style={{ fontSize: '13px', color: 'var(--success)', fontWeight: 500 }}>✓ Uploaded ({formData.aadhaarDoc.startsWith('data:application/pdf') ? 'PDF' : 'Image'})</span>
                                 ) : (
                                   <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No file chosen</span>
                                 )}
                               </div>
                             </div>
                           </div>

                           {/* Driving License Section */}
                           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                               <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>2. Driving License Verification</h4>
                               <Input label="Driving License Number *" name="drivingLicenseNumber" value={formData.drivingLicenseNumber} placeholder="Enter license number" onChange={handleChange} />
                             </div>
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'flex-end' }}>
                               <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Driving License Document * (Image / PDF)</label>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                 <input type="file" accept="image/*,application/pdf" onChange={(e) => handleDocumentChange(e, 'drivingLicenseDoc')} style={{ display: 'none' }} id="dl-upload" />
                                 <label htmlFor="dl-upload" style={{ padding: '8px 16px', background: 'var(--bg-elevated)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                   📁 Upload File
                                 </label>
                                 {formData.drivingLicenseDoc ? (
                                   <span style={{ fontSize: '13px', color: 'var(--success)', fontWeight: 500 }}>✓ Uploaded ({formData.drivingLicenseDoc.startsWith('data:application/pdf') ? 'PDF' : 'Image'})</span>
                                 ) : (
                                   <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No file chosen</span>
                                 )}
                               </div>
                             </div>
                           </div>

                           {/* Bank Details Section */}
                           <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>3. Bank Account & Settlement Details</h4>
                           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                              <Input label="Bank Name *" name="bankName" value={formData.bankName} placeholder="e.g. HDFC Bank" onChange={handleChange} />
                              <Input label="Account Holder Name *" name="accountHolder" value={formData.accountHolder} placeholder="Name as on passbook" onChange={handleChange} />
                           </div>
                           <div style={{ marginBottom: '16px' }}>
                              <Input label="Bank Account Number *" name="bankAccountNumber" value={formData.bankAccountNumber} placeholder="Enter account number" onChange={handleChange} />
                           </div>
                           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                              <Input label="UPI ID *" name="upi" value={formData.upi} placeholder="user@upi" onChange={handleChange} />
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Bank Passbook / Cancelled Cheque * (Image / PDF)</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <input type="file" accept="image/*,application/pdf" onChange={(e) => handleDocumentChange(e, 'bankPassbookDoc')} style={{ display: 'none' }} id="passbook-upload" />
                                  <label htmlFor="passbook-upload" style={{ padding: '8px 16px', background: 'var(--bg-elevated)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                    📁 Upload File
                                  </label>
                                  {formData.bankPassbookDoc ? (
                                    <span style={{ fontSize: '13px', color: 'var(--success)', fontWeight: 500 }}>✓ Uploaded ({formData.bankPassbookDoc.startsWith('data:application/pdf') ? 'PDF' : 'Image'})</span>
                                  ) : (
                                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No file chosen</span>
                                  )}
                                </div>
                              </div>
                           </div>
                        </Card>
                     )}

                    <div style={{ marginTop: '32px', display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                      <Button variant="ghost" type="button" onClick={() => setStep(1)}>Cancel</Button>
                      <Button size="lg" loading={loading} type="submit" style={{ minWidth: '200px' }}>Create Account →</Button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}

        </div>
      </div>

      {/* Legal Footer Links */}
      <div style={{
        textAlign: 'center',
        padding: '24px 20px',
        fontSize: '13px',
        color: 'var(--text-secondary)',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        marginTop: 'auto'
      }}>
        © {new Date().getFullYear()} HandyServe Pro. All rights reserved. ·{' '}
        <Link to="/privacy" style={{ color: 'var(--brand)', textDecoration: 'none', fontWeight: 500 }}>Privacy Policy</Link> ·{' '}
        <Link to="/terms" style={{ color: 'var(--brand)', textDecoration: 'none', fontWeight: 500 }}>Terms of Service</Link>
      </div>
    </div>
  );
}
