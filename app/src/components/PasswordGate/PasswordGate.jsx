import React, { useState, useRef } from 'react';
import './PasswordGate.css';
import { trackEvent } from '../../analytics';

const CORRECT_PASSWORD = 'Lunar@17';
const ADMIN_PASSWORD = 'Admin@17';

export default function PasswordGate({ onUnlock, onAdminLogin }) {
  const [value, setValue] = useState('');
  const [shaking, setShaking] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (value === ADMIN_PASSWORD && onAdminLogin) {
      onAdminLogin();
      return;
    }
    if (value === CORRECT_PASSWORD) {
      localStorage.setItem('lunar_unlocked', 'true');
      onUnlock();
    } else {
      // Send the actual typed incorrect password to Firebase Analytics
      trackEvent('PasswordGate', 'failed_attempt', { attempted: value, length: value.length });
      setShaking(true);
      setError("are you poojetha? this gift was made only for her — you don't have permission to open it ok.");
      setValue('');
      setTimeout(() => setShaking(false), 650);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="gate-page">
      <form
        className={`gate-card ${shaking ? 'shake' : ''}`}
        onSubmit={handleSubmit}
        noValidate
        aria-label="Unlock the gift"
      >
        <div className="gate-shadow" />

        {/* Icon button */}
        <button className="gate-icon-btn" type="submit" aria-label="Unlock">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
          </svg>
        </button>

        {/* Password input */}
        <input
          ref={inputRef}
          className="gate-input"
          type="password"
          placeholder="Enter the password..."
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(''); }}
          autoFocus
          autoComplete="off"
        />
      </form>

      {/* Error outside card so card doesn't shift */}
      {error && (
        <p className={`gate-error ${error ? 'gate-error--visible' : ''}`}>
          {error}
        </p>
      )}
    </div>
  );
}
