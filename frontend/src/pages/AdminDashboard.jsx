import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { SortableTable } from '../components/SortableTable';
import { StarRating } from '../components/StarRating';
import { AddUserModal } from '../components/AddUserModal';
import { AddStoreModal } from '../components/AddStoreModal';
import { UserDetailsModal } from '../components/UserDetailsModal';
import {
  Users,
  Store as StoreIcon,
  Star,
  UserPlus,
  Plus,
  Search,
  Filter,
  Eye,
  RefreshCw
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'stores'

  // Data states
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting for Users
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userSortBy, setUserSortBy] = useState('name');
  const [userSortOrder, setUserSortOrder] = useState('ASC');

  // Filters & Sorting for Stores
  const [storeSearch, setStoreSearch] = useState('');
  const [storeSortBy, setStoreSortBy] = useState('name');
  const [storeSortOrder, setStoreSortOrder] = useState('ASC');

  // Modals state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Fetch Dashboard Stats
  const fetchStats = async () => {
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (userSearch) queryParams.append('search', userSearch);
      if (userRoleFilter) queryParams.append('role', userRoleFilter);
      queryParams.append('sortBy', userSortBy);
      queryParams.append('sortOrder', userSortOrder);

      const data = await api.getAdminUsers(`?${queryParams.toString()}`);
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  // Fetch Stores
  const fetchStores = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (storeSearch) queryParams.append('search', storeSearch);
      queryParams.append('sortBy', storeSortBy);
      queryParams.append('sortOrder', storeSortOrder);

      const data = await api.getAdminStores(`?${queryParams.toString()}`);
      setStores(data);
    } catch (err) {
      console.error('Error fetching stores:', err);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchUsers(), fetchStores()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [userSearch, userRoleFilter, userSortBy, userSortOrder]);

  useEffect(() => {
    fetchStores();
  }, [storeSearch, storeSortBy, storeSortOrder]);

  const handleUserSort = (key, order) => {
    setUserSortBy(key);
    setUserSortOrder(order);
  };

  const handleStoreSort = (key, order) => {
    setStoreSortBy(key);
    setStoreSortOrder(order);
  };

  const openUserDetails = (userId) => {
    setSelectedUserId(userId);
    setIsDetailsOpen(true);
  };

  // Column definitions for Users table
  const userColumns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#f3f4f6' }}>{val}</div>
          {row.storeName && (
            <div style={{ fontSize: '0.75rem', color: '#34d399' }}>Store: {row.storeName}</div>
          )}
        </div>
      ),
    },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (role) => (
        <span className={`badge badge-${role === 'SYSTEM_ADMIN' ? 'admin' : role === 'STORE_OWNER' ? 'owner' : 'user'}`}>
          {role.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'rating',
      label: 'Rating (If Store Owner)',
      sortable: true,
      render: (rating, row) => {
        if (row.role !== 'STORE_OWNER') {
          return <span style={{ color: '#6b7280' }}>N/A</span>;
        }
        const numRating = parseFloat(rating);
        return isNaN(numRating) ? (
          <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>No ratings</span>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <StarRating value={numRating} readOnly size={16} />
            <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>{rating}</span>
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: 'Action',
      sortable: false,
      render: (_, row) => (
        <button
          onClick={() => openUserDetails(row.id)}
          className="btn-secondary"
          style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
          title="View Details"
        >
          <Eye size={14} /> View
        </button>
      ),
    },
  ];

  // Column definitions for Stores table
  const storeColumns = [
    {
      key: 'name',
      label: 'Store Name',
      sortable: true,
      render: (val) => <span style={{ fontWeight: 600, color: '#f3f4f6' }}>{val}</span>,
    },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { key: 'owner', label: 'Owner', sortable: true },
    {
      key: 'overallRating',
      label: 'Overall Rating',
      sortable: true,
      render: (rating, row) => {
        const num = typeof rating === 'number' ? rating : parseFloat(rating);
        return isNaN(num) ? (
          <span style={{ color: '#9ca3af' }}>No ratings yet</span>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <StarRating value={num} readOnly size={16} />
            <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>{num} / 5</span>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>({row.ratingCount})</span>
          </div>
        );
      },
    },
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem 4rem 1rem' }}>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f3f4f6' }}>System Administrator Dashboard</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Overview, store ratings analytics, user &amp; store management
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setIsAddUserOpen(true)} className="btn-primary">
            <UserPlus size={18} />
            <span>Add New User</span>
          </button>
          <button onClick={() => setIsAddStoreOpen(true)} className="btn-accent">
            <Plus size={18} />
            <span>Add New Store</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#818cf8',
          }}>
            <Users size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 500 }}>Total Users</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f3f4f6', lineHeight: 1.1 }}>
              {stats.totalUsers}
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(6, 182, 212, 0.15)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#38bdf8',
          }}>
            <StoreIcon size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 500 }}>Total Stores</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f3f4f6', lineHeight: 1.1 }}>
              {stats.totalStores}
            </div>
          </div>
        </div>

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
            <Star size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 500 }}>Submitted Ratings</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f3f4f6', lineHeight: 1.1 }}>
              {stats.totalRatings}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card with Navigation Tabs */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '1rem',
        }}>
          {/* Tab buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('users')}
              className={activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}
              style={{ borderRadius: '10px' }}
            >
              <Users size={16} /> Users Management ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('stores')}
              className={activeTab === 'stores' ? 'btn-primary' : 'btn-secondary'}
              style={{ borderRadius: '10px' }}
            >
              <StoreIcon size={16} /> Stores Directory ({stores.length})
            </button>
          </div>

          <button
            onClick={loadAll}
            className="btn-secondary"
            title="Refresh Data"
            style={{ padding: '0.5rem 0.8rem', fontSize: '0.8rem' }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Tab 1: Users Listing */}
        {activeTab === 'users' && (
          <div>
            {/* Search and Filters */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Filter users by Name, Email, or Address..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '200px' }}>
                <Filter size={16} style={{ color: '#9ca3af' }} />
                <select
                  className="form-select"
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                >
                  <option value="">All User Roles</option>
                  <option value="NORMAL_USER">Normal Users</option>
                  <option value="STORE_OWNER">Store Owners</option>
                  <option value="SYSTEM_ADMIN">System Admins</option>
                </select>
              </div>
            </div>

            <SortableTable
              columns={userColumns}
              data={users}
              sortBy={userSortBy}
              sortOrder={userSortOrder}
              onSort={handleUserSort}
              emptyMessage="No users matching the search/filter criteria."
            />
          </div>
        )}

        {/* Tab 2: Stores Listing */}
        {activeTab === 'stores' && (
          <div>
            {/* Search */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Filter stores by Name, Email, or Address..."
                  value={storeSearch}
                  onChange={(e) => setStoreSearch(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <SortableTable
              columns={storeColumns}
              data={stores}
              sortBy={storeSortBy}
              sortOrder={storeSortOrder}
              onSort={handleStoreSort}
              emptyMessage="No stores matching the search criteria."
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onSuccess={loadAll}
      />

      <AddStoreModal
        isOpen={isAddStoreOpen}
        onClose={() => setIsAddStoreOpen(false)}
        onSuccess={loadAll}
      />

      <UserDetailsModal
        userId={selectedUserId}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedUserId(null);
        }}
      />
    </div>
  );
};
