import React, { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { api } from '../services/api';
import { StarRating } from './StarRating';
import { User, Mail, MapPin, Shield, Store, Star } from 'lucide-react';

export const UserDetailsModal = ({ userId, isOpen, onClose }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && userId) {
      const fetchDetails = async () => {
        setLoading(true);
        setError('');
        try {
          const res = await api.getUserDetails(userId);
          setUserInfo(res.user);
        } catch (err) {
          setError(err.message || 'Failed to load user details.');
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Profile Details">
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>Loading user details...</div>
      ) : error ? (
        <div style={{ color: '#f87171', padding: '1rem', textAlign: 'center' }}>{error}</div>
      ) : userInfo ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '1.25rem',
              color: '#ffffff',
            }}>
              {userInfo.name.charAt(0)}
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#f3f4f6', fontWeight: 700 }}>{userInfo.name}</h3>
              <span className={`badge badge-${userInfo.role === 'SYSTEM_ADMIN' ? 'admin' : userInfo.role === 'STORE_OWNER' ? 'owner' : 'user'}`} style={{ marginTop: '4px' }}>
                {userInfo.role.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <Mail size={18} style={{ color: '#6366f1', marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Email Address</div>
                <div style={{ fontSize: '0.95rem', color: '#f3f4f6' }}>{userInfo.email}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <MapPin size={18} style={{ color: '#06b6d4', marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Address</div>
                <div style={{ fontSize: '0.95rem', color: '#f3f4f6' }}>{userInfo.address}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <Shield size={18} style={{ color: '#ec4899', marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Role</div>
                <div style={{ fontSize: '0.95rem', color: '#f3f4f6' }}>{userInfo.role}</div>
              </div>
            </div>

            {/* Display rating if Store Owner */}
            {userInfo.role === 'STORE_OWNER' && (
              <div style={{
                marginTop: '0.5rem',
                padding: '1rem',
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontWeight: 600 }}>
                  <Store size={18} />
                  <span>Store Owner Details</span>
                </div>
                {userInfo.storeInfo ? (
                  <>
                    <div style={{ fontSize: '0.9rem', color: '#f3f4f6' }}>
                      <strong>Store Name:</strong> {userInfo.storeInfo.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Store Rating:</span>
                      <StarRating value={parseFloat(userInfo.rating) || 0} readOnly size={18} />
                      <span style={{ fontWeight: 'bold', color: '#f59e0b', fontSize: '0.95rem' }}>
                        {userInfo.rating} / 5.0
                      </span>
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                    No store assigned to this owner yet.
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};
