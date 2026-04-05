import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import PasswordGate from './components/PasswordGate/PasswordGate';
import BirthdayExperience from './pages/BirthdayExperience';
import AdminDashboard from './pages/AdminDashboard';
import { recordVisit, updateTimeSpent, ping } from './analytics';
import './index.css';

/* ── Admin Route with its own password gate ──────── */
function AdminRoute() {
  const [adminUnlocked, setAdminUnlocked] = useState(false);

  if (!adminUnlocked) {
    return (
      <PasswordGate
        onUnlock={() => {}} // No-op: regular password does nothing here
        onAdminLogin={() => setAdminUnlocked(true)}
      />
    );
  }

  return <AdminDashboard />;
}

/* ── Main Experience Route ───────────────────────── */
function MainRoute() {
  const [unlocked, setUnlocked] = useState(false);
  const [fading, setFading] = useState(false);
  const [isRevisit, setIsRevisit] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('lunar_unlocked') === 'true') {
      setIsRevisit(true);
      setUnlocked(true);
    }
  }, []);

  const handleUnlock = () => {
    setFading(true);
    setTimeout(() => {
      setIsRevisit(false);
      setUnlocked(true);
      setFading(false);
    }, 1500);
  };

  const handleAdminLogin = () => {
    navigate('/admin');
  };

  if (unlocked) {
    return <BirthdayExperience isRevisit={isRevisit} />;
  }

  return (
    <div style={{ opacity: fading ? 0 : 1, transition: 'opacity 1.5s ease' }}>
      <PasswordGate onUnlock={handleUnlock} onAdminLogin={handleAdminLogin} />
    </div>
  );
}

/* ── App Root ────────────────────────────────────── */
export default function App() {
  // Track visit on mount (Ignore if landing directly on /admin)
  useEffect(() => {
    if (!window.location.pathname.startsWith('/admin')) {
      recordVisit();
      ping(); // Immediate ping on load
    }
  }, []);

  // Periodically update time spent and ping online status
  useEffect(() => {
    // 5-second interval for real-time ping
    const pingInterval = setInterval(() => {
      if (!document.hidden && !window.location.pathname.startsWith('/admin')) {
        ping();
      }
    }, 5000);

    // 30-second interval for cumulative time tracking
    const timeInterval = setInterval(() => {
      if (!window.location.pathname.startsWith('/admin')) {
        updateTimeSpent();
      }
    }, 30000);

    // Also update on page visibility change / unload
    const handleVisibility = () => {
      if (window.location.pathname.startsWith('/admin')) return;
      if (!document.hidden) ping();
      if (document.hidden) updateTimeSpent();
    };
    const handleBeforeUnload = () => {
      if (!window.location.pathname.startsWith('/admin')) updateTimeSpent();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(pingInterval);
      clearInterval(timeInterval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (!window.location.pathname.startsWith('/admin')) updateTimeSpent(); // Final save on unmount
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainRoute />} />
        <Route path="/admin" element={<AdminRoute />} />
      </Routes>
    </BrowserRouter>
  );
}
