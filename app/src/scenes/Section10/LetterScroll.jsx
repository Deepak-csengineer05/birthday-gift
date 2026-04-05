import React from 'react';
import './LetterScroll.css';

export default function LetterScroll({ show, onFold }) {
  if (!show) return null;

  return (
    <div className={`s10-letter-overlay ${show ? 'show' : ''}`}>
      <div className="s10-paper-container">
        <div className="s10-letter-content">
          <div className="s10-letter-greeting">Dearest Best Friend,</div>
          
          <p>
            I wanted to create something truly magical to celebrate exactly who you are to me. When I sat down to think about what gift could encompass the weight of all our shared memories, all the inside jokes, and all the quiet moments where your support meant the absolute world to me—I realized a normal gift wouldn't do. I wanted to build an experience.
          </p>

          <p>
            This entire journey, from the opening moon sequence, the interactive starry nights, to the diary, has been meticulously crafted from the ground up just for you. Every line of code, every color, and every shadow was placed with you in mind, trying to capture just a fraction of the brightness you bring into my life every single day.
          </p>

          <p>
            We have weathered so many storms together and laughed until the sun came up. I want you to know how deeply grateful I am to have you by my side. No matter what life throws at us, no matter where our individual paths lead, you will always have my unwavering loyalty, my deepest honest truths, and my absolute best friendship. 
          </p>

          <p>
            Take a moment, look back, and realize how far we've come. You are incredible, you are loved, and you are cherished beyond words. I hope this interactive birthday journey made you smile as brightly as you make me smile.
          </p>

          <div className="s10-letter-signoff">
            Yours always,<br />
            Deepak
          </div>

          <div className="s10-fold-btn-container">
            <button className="s10-fold-btn" onClick={onFold}>
              Fold & Return Letter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
