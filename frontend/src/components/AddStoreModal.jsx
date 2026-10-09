import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { api } from '../services/api';
import { Store, AlertCircle } from 'lucide-react';

export const AddStoreModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: '',
  });

  const [storeOwners, setStoreOwners] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch list of store owners for selection dropdown
  useEffect(() => {
    if (isOpen) {
      const fetchOwners = async () => {
        try {
          const users = await api.getAdminUsers('?role=STORE_OWNER');
          setStoreOwners(users);
        } catch (err) {
          console.error('Failed to load store owners:', err);
        }
      };
      fetchOwners();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.name.trim().length < 20 || formData.name.trim().length > 60) {
      setError('Store name must be between 20 and 60 characters long.');
      return;
    }

    if (formData.address.trim().length > 400 || formData.address.trim().length === 0) {
      setError('Address must not be empty and cannot exceed 400 characters.');
      return;
    }

    setLoading(true);
    try {
      await api.addStore(formData);
      setFormData({
        name: '',
        email: '',
        address: '',
        ownerId: '',
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add store.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Store">
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
          <label className="form-label">Store Name ({formData.name.trim().length}/60 chars)</label>
          <input
            type="text"
            name="name"
            className="form-input"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Apex Electronics Superstore Branch"
            required
          />
          <span className="form-hint">Must be 20 to 60 characters long.</span>
        </div>

        <div className="form-group">
          <label className="form-label">Store Email</label>
          <input
            type="email"
            name="email"
            className="form-input"
            value={formData.email}
            onChange={handleChange}
            placeholder="store@example.com"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Store Address ({formData.address.trim().length}/400 chars)</label>
          <textarea
            name="address"
            className="form-textarea"
            rows={2}
            value={formData.address}
            onChange={handleChange}
            placeholder="450 Tech Innovation Highway, Suite 10, Silicon Valley"
            required
          />
          <span className="form-hint">Maximum 400 characters.</span>
        </div>

        <div className="form-group">
          <label className="form-label">Assign Store Owner (Optional)</label>
          <select
            name="ownerId"
            className="form-select"
            value={formData.ownerId}
            onChange={handleChange}
          >
            <option value="">-- No Owner Assigned --</option>
            {storeOwners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name} ({owner.email})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            <Store size={16} />
            <span>{loading ? 'Adding Store...' : 'Add Store'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
