import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PasswordGate from './components/PasswordGate/PasswordGate';
import BirthdayExperience from './pages/BirthdayExperience';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [fading, setFading] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    if (localStorage.getItem('lunar_unlocked') === 'true') {
      setUnlocked(true);
    }
  }, []);

  const handleUnlock = () => {
    setFading(true);
    // Slow fade: wait 1.5s before showing content
    setTimeout(() => {
      setUnlocked(true);
      setFading(false);
    }, 1500);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            unlocked ? (
              <BirthdayExperience />
            ) : (
              <div style={{ opacity: fading ? 0 : 1, transition: 'opacity 1.5s ease' }}>
                <PasswordGate onUnlock={handleUnlock} />
              </div>
            )
          }
        />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
