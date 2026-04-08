import React, { useState, useRef } from 'react';
import './PasswordGate.css';
import { trackEvent } from '../../analytics';

// Hashes for the passwords "Lunar@17" and "Admin@17" respectively
const CORRECT_PASSWORD_HASH = '2bbfe06d7d65fdd4c9258eed82136018fd5be82ebbc59632ed61e479a0b943d0';
const ADMIN_PASSWORD_HASH = 'a7c9656ba1ec34a949ff089ba858882ca1a6ca446369062b1bb92f34aa0bc9f8';

// Minimal fast SHA-256 hash function to execute completely in-browser without huge dependencies
async function hashPassword(message) {
  const msgUint8 = new TextEncoder().encode(message);                           // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);           // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
  return hashHex;
}

export default function PasswordGate({ onUnlock, onAdminLogin }) {
  const [value, setValue] = useState('');
  const [shaking, setShaking] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Hash whatever the user typed before comparing
    const hashedAttempt = await hashPassword(value);

    if (hashedAttempt === ADMIN_PASSWORD_HASH && onAdminLogin) {
      onAdminLogin();
      return;
    }
    if (hashedAttempt === CORRECT_PASSWORD_HASH) {
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
