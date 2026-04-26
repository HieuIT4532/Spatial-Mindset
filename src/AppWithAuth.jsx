// src/AppWithAuth.jsx
// Wrapper nhẹ — tích hợp Auth vào App hiện có mà không cần sửa App.jsx
import React, { useState } from 'react';
import App from './App';
import AuthModal from './components/AuthModal';
import { useAuth } from './hooks/useAuth';
import { useUserData } from './hooks/useUserData';

// Export AuthModal trigger qua window event để App.jsx có thể gọi
export default function AppWithAuth() {
  const { user, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  // Expose openAuth globally để các component khác gọi được
  React.useEffect(() => {
    window.__openAuthModal  = () => setAuthOpen(true);
    window.__closeAuthModal = () => setAuthOpen(false);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="text-4xl animate-pulse">🔺</div>
          <p className="text-cyan-400 text-xs font-black uppercase tracking-widest animate-pulse">
            Đang tải...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <App currentUser={user} onOpenAuth={() => setAuthOpen(true)} />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
