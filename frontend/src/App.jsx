import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { UpdatePasswordModal } from './components/UpdatePasswordModal';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserDashboard } from './pages/UserDashboard';
import { StoreOwnerDashboard } from './pages/StoreOwnerDashboard';

const MainApp = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [view, setView] = useState('login'); // 'login' | 'register'
  const [isUpdatePasswordOpen, setIsUpdatePasswordOpen] = useState(false);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#9ca3af',
        fontFamily: 'sans-serif'
      }}>
        Initializing StoreRating System...
      </div>
    );
  }

  // Unauthenticated view
  if (!isAuthenticated) {
    return view === 'register' ? (
      <RegisterPage onNavigateToLogin={() => setView('login')} />
    ) : (
      <LoginPage onNavigateToRegister={() => setView('register')} />
    );
  }

  // Role-based view rendering
  const renderDashboardByRole = () => {
    switch (user.role) {
      case 'SYSTEM_ADMIN':
        return <AdminDashboard />;
      case 'STORE_OWNER':
        return <StoreOwnerDashboard />;
      case 'NORMAL_USER':
      default:
        return <UserDashboard />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar onOpenUpdatePassword={() => setIsUpdatePasswordOpen(true)} />
      <main style={{ flex: 1 }}>
        {renderDashboardByRole()}
      </main>

      <UpdatePasswordModal
        isOpen={isUpdatePasswordOpen}
        onClose={() => setIsUpdatePasswordOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
