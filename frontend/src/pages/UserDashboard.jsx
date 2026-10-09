import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { SortableTable } from '../components/SortableTable';
import { StarRating } from '../components/StarRating';
import { Modal } from '../components/Modal';
import { Store as StoreIcon, Search, Star, Edit3, PlusCircle, CheckCircle2, AlertCircle } from 'lucide-react';

export const UserDashboard = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');

  // Rating Modal state
  const [selectedStore, setSelectedStore] = useState(null);
  const [ratingInput, setRatingInput] = useState(5);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [ratingError, setRatingError] = useState('');
  const [ratingSuccess, setRatingSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchStores = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append('search', searchQuery);
      queryParams.append('sortBy', sortBy);
      queryParams.append('sortOrder', sortOrder);

      const data = await api.getUserStores(`?${queryParams.toString()}`);
      setStores(data);
    } catch (err) {
      console.error('Error fetching stores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [searchQuery, sortBy, sortOrder]);

  const handleSort = (key, order) => {
    setSortBy(key);
    setSortOrder(order);
  };

  const openRatingModal = (store) => {
    setSelectedStore(store);
    setRatingInput(store.userSubmittedRating || 5);
    setRatingError('');
    setRatingSuccess('');
    setIsRatingModalOpen(true);
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStore) return;

    setRatingError('');
    setRatingSuccess('');
    setSubmitting(true);

    try {
      const res = await api.submitRating({
        storeId: selectedStore.id,
        rating: ratingInput,
      });

      setRatingSuccess(res.message || 'Rating submitted successfully!');
      setTimeout(() => {
        setIsRatingModalOpen(false);
        fetchStores();
      }, 1000);
    } catch (err) {
      setRatingError(err.message || 'Failed to submit rating.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Store Name',
      sortable: true,
      render: (name) => <span style={{ fontWeight: 600, color: '#f3f4f6' }}>{name}</span>,
    },
    { key: 'address', label: 'Address', sortable: true },
    {
      key: 'overallRating',
      label: 'Overall Rating',
      sortable: true,
      render: (rating, row) => {
        const num = typeof rating === 'number' ? rating : parseFloat(rating);
        return isNaN(num) ? (
          <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>No ratings yet</span>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <StarRating value={num} readOnly size={16} />
            <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>{num} / 5</span>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>({row.ratingCount})</span>
          </div>
        );
      },
    },
    {
      key: 'userSubmittedRating',
      label: "Your Submitted Rating",
      sortable: true,
      render: (userRating) => {
        return userRating ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <StarRating value={userRating} readOnly size={16} />
            <span style={{ fontWeight: 'bold', color: '#38bdf8' }}>{userRating} / 5</span>
          </div>
        ) : (
          <span style={{ color: '#6b7280', fontSize: '0.85rem', italic: 'true' }}>Not rated yet</span>
        );
      },
    },
    {
      key: 'action',
      label: 'Rating Action',
      sortable: false,
      render: (_, row) => (
        <button
          onClick={() => openRatingModal(row)}
          className={row.isRated ? 'btn-secondary' : 'btn-primary'}
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
        >
          {row.isRated ? (
            <>
              <Edit3 size={14} />
              <span>Modify Rating</span>
            </>
          ) : (
            <>
              <PlusCircle size={14} />
              <span>Submit Rating</span>
            </>
          )}
        </button>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem 4rem 1rem' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f3f4f6' }}>Registered Stores Directory</h1>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Explore registered stores, view community ratings, and submit or update your store ratings (1 to 5 stars).
        </p>
      </div>

      {/* Main Glass Card */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        {/* Search bar */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search stores by Name or Address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>

        <SortableTable
          columns={columns}
          data={stores}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          emptyMessage="No stores found matching your search query."
        />
      </div>

      {/* Submit / Modify Rating Modal */}
      <Modal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        title={selectedStore?.isRated ? `Modify Rating for ${selectedStore?.name}` : `Rate ${selectedStore?.name}`}
      >
        <form onSubmit={handleRatingSubmit}>
          {ratingError && (
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
              <span>{ratingError}</span>
            </div>
          )}

          {ratingSuccess && (
            <div style={{
              padding: '0.75rem 1rem',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              color: '#34d399',
              fontSize: '0.85rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CheckCircle2 size={16} />
              <span>{ratingSuccess}</span>
            </div>
          )}

          <div style={{ textAlignment: 'center', padding: '1.5rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
              Select a rating from 1 to 5 stars:
            </p>
            <StarRating
              value={ratingInput}
              onChange={(newRating) => setRatingInput(newRating)}
              size={36}
            />
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f59e0b' }}>
              {ratingInput} out of 5 Stars
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsRatingModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              <Star size={16} />
              <span>{submitting ? 'Submitting...' : selectedStore?.isRated ? 'Update Rating' : 'Submit Rating'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
