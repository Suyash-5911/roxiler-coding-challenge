import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Store, KeyRound, LogOut, User as UserIcon, ShieldAlert, Store as StoreIcon } from 'lucide-react';

export const Navbar = ({ onOpenUpdatePassword }) => {
  const { user, logout } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'SYSTEM_ADMIN':
        return <span className="badge badge-admin"><ShieldAlert size={12} style={{ marginRight: 4 }} /> Admin</span>;
      case 'STORE_OWNER':
        return <span className="badge badge-owner"><StoreIcon size={12} style={{ marginRight: 4 }} /> Store Owner</span>;
      default:
        return <span className="badge badge-user"><UserIcon size={12} style={{ marginRight: 4 }} /> User</span>;
    }
  };

  return (
    <header className="glass-nav" style={{ position: 'sticky', top: 0, zIndex: 50, padding: '0.85rem 2rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
          }}>
            <Store size={24} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f3f4f6', lineHeight: 1.2 }}>
              StoreRating <span style={{ color: '#06b6d4' }}>Hub</span>
            </h1>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Store Rating Platform</p>
          </div>
        </div>

        {/* User profile & actions */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.4rem 0.85rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f3f4f6' }}>{user.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{user.email}</div>
              </div>
              {getRoleBadge(user.role)}
            </div>

            <button
              onClick={onOpenUpdatePassword}
              className="btn-secondary"
              title="Update Password"
              style={{ padding: '0.55rem 0.9rem', fontSize: '0.85rem' }}
            >
              <KeyRound size={16} />
              <span>Password</span>
            </button>

            <button
              onClick={logout}
              className="btn-secondary"
              title="Log Out"
              style={{
                padding: '0.55rem 0.9rem',
                fontSize: '0.85rem',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                color: '#f87171'
              }}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
