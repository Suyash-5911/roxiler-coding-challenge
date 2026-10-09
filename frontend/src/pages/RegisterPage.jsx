import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Store, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';

export const RegisterPage = ({ onNavigateToLogin }) => {
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Live validation state indicators
  const nameValid = formData.name.trim().length >= 20 && formData.name.trim().length <= 60;
  const addressValid = formData.address.trim().length > 0 && formData.address.trim().length <= 400;
  const passwordLengthValid = formData.password.length >= 8 && formData.password.length <= 16;
  const passwordUpperValid = /[A-Z]/.test(formData.password);
  const passwordSpecialValid = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password);
  const passwordAllValid = passwordLengthValid && passwordUpperValid && passwordSpecialValid;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!nameValid) {
      setError('Name must be between 20 and 60 characters long.');
      return;
    }

    if (!addressValid) {
      setError('Address must not exceed 400 characters.');
      return;
    }

    if (!passwordAllValid) {
      setError('Password must be 8-16 characters long, contain at least 1 uppercase letter and 1 special character.');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem' }}>
        <button
          onClick={onNavigateToLogin}
          className="btn-secondary"
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginBottom: '1.25rem' }}
        >
          <ArrowLeft size={14} /> Back to Sign In
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(6, 182, 212, 0.4)',
            marginBottom: '0.75rem'
          }}>
            <Store size={26} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f3f4f6' }}>Create Normal User Account</h1>
          <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.25rem' }}>
            Register on StoreRating platform to submit store ratings
          </p>
        </div>

        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#f87171',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Full Name</label>
              <span style={{ fontSize: '0.75rem', color: nameValid ? '#34d399' : '#9ca3af' }}>
                {formData.name.trim().length} / 60 chars (min 20)
              </span>
            </div>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Johnathan Edward Smith Senior"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="user@example.com"
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Address</label>
              <span style={{ fontSize: '0.75rem', color: addressValid ? '#34d399' : '#9ca3af' }}>
                {formData.address.trim().length} / 400 chars
              </span>
            </div>
            <textarea
              name="address"
              className="form-textarea"
              rows={2}
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main Street, Apartment 4B, Metropia 90001"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create strong password"
              required
            />
            {/* Password Validation Checklist */}
            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.75rem' }}>
              <div style={{ color: passwordLengthValid ? '#34d399' : '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                {passwordLengthValid ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />} 8 to 16 characters
              </div>
              <div style={{ color: passwordUpperValid ? '#34d399' : '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                {passwordUpperValid ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />} At least 1 uppercase letter (A-Z)
              </div>
              <div style={{ color: passwordSpecialValid ? '#34d399' : '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                {passwordSpecialValid ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />} At least 1 special character (!@#$%^&*)
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', marginTop: '1rem' }}
          >
            <UserPlus size={18} />
            <span>{loading ? 'Creating Account...' : 'Register Account'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
