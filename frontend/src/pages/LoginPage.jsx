import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Store, LogIn, ShieldAlert, User, Store as StoreIcon, AlertCircle } from 'lucide-react';

export const LoginPage = ({ onNavigateToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
            marginBottom: '1rem'
          }}>
            <Store size={30} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f3f4f6' }}>Welcome Back</h1>
          <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.25rem' }}>
            Sign in to access your StoreRating dashboard
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
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', marginTop: '0.5rem' }}
          >
            <LogIn size={18} />
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Quick Demo Switcher */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center', marginBottom: '0.75rem', fontWeight: 600 }}>
            QUICK DEMO ACCOUNTS LOG IN:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@storeplatform.com', 'Admin@1234')}
              className="btn-secondary"
              style={{ padding: '0.45rem 0.5rem', fontSize: '0.75rem', justifyContent: 'center' }}
            >
              <ShieldAlert size={12} /> Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('johnathan.doe@example.com', 'User@12345')}
              className="btn-secondary"
              style={{ padding: '0.45rem 0.5rem', fontSize: '0.75rem', justifyContent: 'center' }}
            >
              <User size={12} /> User
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('owner.sterling@techhub.com', 'Owner@1234')}
              className="btn-secondary"
              style={{ padding: '0.45rem 0.5rem', fontSize: '0.75rem', justifyContent: 'center' }}
            >
              <StoreIcon size={12} /> Owner
            </button>
          </div>
        </div>

        {/* Register link */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#9ca3af' }}>
          Don't have a normal user account?{' '}
          <button
            onClick={onNavigateToRegister}
            style={{
              background: 'none',
              border: 'none',
              color: '#6366f1',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Sign up here
          </button>
        </div>
      </div>
    </div>
  );
};
