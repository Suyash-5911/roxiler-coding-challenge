import React, { useState } from 'react';
import { Modal } from './Modal';
import { api } from '../services/api';
import { UserPlus, AlertCircle } from 'lucide-react';

export const AddUserModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    role: 'NORMAL_USER',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client side validations according to spec
    if (formData.name.trim().length < 20 || formData.name.trim().length > 60) {
      setError('Name must be between 20 and 60 characters long.');
      return;
    }

    if (formData.address.trim().length > 400 || formData.address.trim().length === 0) {
      setError('Address must not be empty and cannot exceed 400 characters.');
      return;
    }

    if (formData.password.length < 8 || formData.password.length > 16) {
      setError('Password must be between 8 and 16 characters long.');
      return;
    }

    if (!/[A-Z]/.test(formData.password)) {
      setError('Password must contain at least one uppercase letter.');
      return;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) {
      setError('Password must contain at least one special character.');
      return;
    }

    setLoading(true);
    try {
      await api.addUser(formData);
      setFormData({
        name: '',
        email: '',
        address: '',
        password: '',
        role: 'NORMAL_USER',
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New User">
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#f87171',
            fontSize: '0.85rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Full Name ({formData.name.trim().length}/60 chars)</label>
          <input
            type="text"
            name="name"
            className="form-input"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Johnathan Edward Smith Senior"
            required
          />
          <span className="form-hint">Must be 20 to 60 characters long.</span>
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
          <label className="form-label">Address ({formData.address.trim().length}/400 chars)</label>
          <textarea
            name="address"
            className="form-textarea"
            rows={2}
            value={formData.address}
            onChange={handleChange}
            placeholder="123 Main Street, Suite 400, Metropia 90001"
            required
          />
          <span className="form-hint">Maximum 400 characters.</span>
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            name="password"
            className="form-input"
            value={formData.password}
            onChange={handleChange}
            placeholder="e.g. SecretP@ss1"
            required
          />
          <span className="form-hint">8-16 characters, &ge;1 uppercase letter, &ge;1 special char</span>
        </div>

        <div className="form-group">
          <label className="form-label">User Role</label>
          <select
            name="role"
            className="form-select"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="NORMAL_USER">Normal User</option>
            <option value="STORE_OWNER">Store Owner</option>
            <option value="SYSTEM_ADMIN">System Administrator</option>
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            <UserPlus size={16} />
            <span>{loading ? 'Adding User...' : 'Add User'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
