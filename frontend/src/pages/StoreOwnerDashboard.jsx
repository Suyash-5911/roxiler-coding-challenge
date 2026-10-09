import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { SortableTable } from '../components/SortableTable';
import { StarRating } from '../components/StarRating';
import { Store, Star, Users, MapPin, Mail, RefreshCw } from 'lucide-react';

export const StoreOwnerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sorting for ratings table
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');

  const fetchDashboardData = async () => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('sortBy', sortBy);
      queryParams.append('sortOrder', sortOrder);

      const data = await api.getOwnerDashboard(`?${queryParams.toString()}`);
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching owner dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [sortBy, sortOrder]);

  const handleSort = (key, order) => {
    setSortBy(key);
    setSortOrder(order);
  };

  const columns = [
    {
      key: 'userName',
      label: 'User Name',
      sortable: true,
      render: (val) => <span style={{ fontWeight: 600, color: '#f3f4f6' }}>{val}</span>,
    },
    { key: 'userEmail', label: 'User Email', sortable: true },
    { key: 'userAddress', label: 'Address', sortable: true },
    {
      key: 'rating',
      label: 'Submitted Rating',
      sortable: true,
      render: (rating) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <StarRating value={rating} readOnly size={16} />
          <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>{rating} / 5</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Rating Date',
      sortable: true,
      render: (dateStr) => new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
  ];

  if (loading) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '4rem 1rem', textAlign: 'center', color: '#9ca3af' }}>
        Loading Store Owner Dashboard...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem 4rem 1rem' }}>
      {/* Page Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f3f4f6' }}>Store Owner Dashboard</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Store rating metrics &amp; user reviews feedback
          </p>
        </div>

        <button onClick={fetchDashboardData} className="btn-secondary">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {!dashboardData?.hasStore ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <Store size={48} style={{ color: '#9ca3af', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.25rem', color: '#f3f4f6', marginBottom: '0.5rem' }}>No Store Assigned Yet</h2>
          <p style={{ color: '#9ca3af', maxWidth: '480px', margin: '0 auto' }}>
            Your Store Owner account has not been assigned to a store yet. Please contact the System Administrator.
          </p>
        </div>
      ) : (
        <>
          {/* Store Overview Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            {/* Store Info */}
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#818cf8',
                }}>
                  <Store size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Store</div>
                  <h3 style={{ fontSize: '1.2rem', color: '#f3f4f6', fontWeight: 700 }}>{dashboardData.storeName}</h3>
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={14} /> {dashboardData.storeAddress}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={14} /> {dashboardData.storeEmail}
              </div>
            </div>

            {/* Average Rating Metric */}
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fbbf24',
              }}>
                <Star size={30} fill="#fbbf24" />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 500 }}>Store Average Rating</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                  <span style={{ fontSize: '2.25rem', fontWeight: 800, color: '#f3f4f6', lineHeight: 1 }}>
                    {dashboardData.averageRating}
                  </span>
                  {typeof dashboardData.averageRating === 'number' && (
                    <StarRating value={dashboardData.averageRating} readOnly size={18} />
                  )}
                </div>
              </div>
            </div>

            {/* Total Ratings Count */}
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399',
              }}>
                <Users size={28} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 500 }}>Total User Reviews</div>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#f3f4f6', lineHeight: 1.1 }}>
                  {dashboardData.totalRatings}
                </div>
              </div>
            </div>
          </div>

          {/* User Ratings Table */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f3f4f6' }}>Users Ratings Breakdown</h2>
              <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                Complete list of users who submitted ratings for your store.
              </p>
            </div>

            <SortableTable
              columns={columns}
              data={dashboardData.ratingsList}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              emptyMessage="No ratings have been submitted for your store yet."
            />
          </div>
        </>
      )}
    </div>
  );
};
