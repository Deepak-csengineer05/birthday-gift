import React, { useState, useEffect, useMemo } from 'react';
import './Section10.css';
import { trackEvent, trackSection10Answer } from '../../analytics';

/* ─── Moon SVG ───────────────────────────────────── */
function MoonFace({ mood }) {
  const isCurious  = mood === 'curious';
  const isTeasing  = mood === 'teasing';
  const isExcited  = mood === 'excited';
  const isPleading = mood === 'pleading';
  const isHappy    = mood === 'happy';

  // Default is 'happy' if no special mood or just 'happy' is passed.
  // We reuse Scene 1's detailed svg perfectly.

  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="s10-moon-svg" aria-hidden="true">
      <circle cx="100" cy="100" r="88" fill="rgba(179,157,219,0.08)" />
      <circle cx="100" cy="100" r="80" fill="#e8e0f5" />
      <circle cx="70"  cy="75"  r="13" fill="#c5b8e0" opacity="0.7"/>
      <circle cx="130" cy="68"  r="9"  fill="#c5b8e0" opacity="0.6"/>
      <circle cx="55"  cy="120" r="8"  fill="#c5b8e0" opacity="0.5"/>
      <circle cx="140" cy="115" r="11" fill="#c5b8e0" opacity="0.55"/>
      <circle cx="105" cy="145" r="7"  fill="#c5b8e0" opacity="0.5"/>
      <circle cx="85"  cy="55"  r="5"  fill="#c5b8e0" opacity="0.4"/>

      <ellipse cx="80" cy="97"
        rx={isPleading ? 10 : isExcited ? 11 : 9}
        ry={isPleading ? 12 : isExcited ? 13 : isCurious ? 11 : 10}
        fill="#1a1a2e"/>
      <ellipse cx="120" cy={isCurious ? 94 : 97}
        rx={isExcited ? 11 : 9}
        ry={isPleading ? 12 : isExcited ? 13 : isCurious ? 8 : 10}
        fill="#1a1a2e"/>
      <circle cx="83" cy="94" r="3" fill="white"/>
      <circle cx="123" cy={isCurious ? 91 : 94} r="3" fill="white"/>

      <ellipse cx="65"  cy="115" rx="13" ry="8" fill="#f4a7b9" opacity="0.6"/>
      <ellipse cx="135" cy="115" rx="13" ry="8" fill="#f4a7b9" opacity="0.6"/>

      {isPleading ? (
        <path d="M 88 122 Q 100 118 112 122" stroke="#7b52c8" strokeWidth="3" fill="none" strokeLinecap="round"/>
      ) : isTeasing ? (
        <path d="M 88 120 Q 100 132 112 120" stroke="#7b52c8" strokeWidth="3" fill="none" strokeLinecap="round"/>
      ) : (
        <path d="M 86 120 Q 100 133 114 120" stroke="#7b52c8" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      )}
    </svg>
  );
}

/* ─── Dialogue Data ─────────────────────────────── */
const DIALOGUE = [
  {
    id: 0,
    type: 'options',
    text: "Are you surprised by the gift?",
    options: ["Yes", "No"],
    moonMood: "curious"
  },
  {
    id: 1, // Shown only if 'No' is clicked
    type: 'info',
    text: "Sorry for this, next time I assure the gift will be the best to make you smile.",
    btnText: "Next",
    moonMood: "pleading"
  },
  {
    id: 2,
    type: 'options',
    text: "Do you know who done this for you?",
    options: ["someone from your friend list", "A person who cares about you", "A well wisher"],
    moonMood: "teasing"
  },
  {
    id: 3,
    type: 'info',
    text: "Hey pooji, for all the options, I would say only one name that is  Deepak. See how lucky you are to have a friend like him. Yeah, before moving on to the final section, I have some queries to ask about Deepak to you...",
    btnText: "Continue",
    moonMood: "happy"
  },
  {
    id: 4,
    type: 'input',
    text: "Who is Deepak to you?",
    moonMood: "curious"
  },
  {
    id: 5,
    type: 'input',
    text: "Are you really happy on this gift, are you expected this from him?",
    moonMood: "happy"
  },
  {
    id: 6,
    type: 'input',
    text: "If you wish to say one thing to Deepak what it would be?",
    moonMood: "happy"
  },
  {
    id: 7,
    type: 'input',
    text: "Are you thinking like why this boy Deepak doing like this to you, what you had done for him?",
    moonMood: "curious"
  },
  {
    id: 8,
    type: 'info',
    text: "I can simply say why he is doing this to you but he gave me the answer before you thought about it and that will be in next section for you.",
    btnText: "Next",
    moonMood: "teasing"
  },
  {
    id: 9,
    type: 'input',
    text: "Will you be his best friend in any situation, and not left him for anyone at any situation? Tell the truth.",
    moonMood: "pleading"
  }
];

export default function Section10({ onNext }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [fadeState, setFadeState] = useState("in"); // "in" or "out"

  // Memoize stars so they don't jump on every keystroke
  const stars = useMemo(() => {
    return Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 3}px`,
      height: `${Math.random() * 3}px`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${2 + Math.random() * 3}s`
    }));
  }, []);

  const step = DIALOGUE[stepIdx];

  const goToNextStep = (targetIdx = null) => {
    const isTargetNum = typeof targetIdx === 'number';

    if (stepIdx >= DIALOGUE.length - 1 && !isTargetNum) {
      setFadeState("out");
      setTimeout(() => {
        onNext();
      }, 1000);
      return;
    }

    setFadeState("out");
    setTimeout(() => {
      setInputValue("");
      setStepIdx(i => isTargetNum ? targetIdx : i + 1);
      setFadeState("in");
    }, 400); // 400ms fade transition between questions
  };

  const handleOptionClick = (opt) => {
    trackEvent('Section10', 'option_click', {
      questionId: step.id,
      questionText: step.text,
      selectedOption: opt,
    });
    if (stepIdx === 0 && opt === "Yes") {
      goToNextStep(2); // Skip the 'No' response
    } else {
      goToNextStep();
    }
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    trackSection10Answer(step.id, step.text, inputValue.trim());
    trackEvent('Section10', 'text_input', {
      questionId: step.id,
      questionText: step.text,
      answer: inputValue.trim(),
    });
    goToNextStep();
  };

  return (
    <div className="s10-root">
      {/* Background Audio */}
      <audio src="/bg-music-3.mp3" autoPlay loop style={{ display: 'none' }} />

      {/* Deep Space Nebula Background (from Section 7) */}
      <div className="s7-nebula s7-nebula-1" />
      <div className="s7-nebula s7-nebula-2" />
      <div className="s7-nebula s7-nebula-3" />
      <div className="s7-nebula s7-nebula-4" />

      {/* Twinkling Starfield (from Section 7) */}
      <div className="s7-starfield-container">
        {stars.map((star) => (
          <div 
            key={star.id} 
            className="s7-star"
            style={{
              top: star.top,
              left: star.left,
              width: star.width,
              height: star.height,
              animationDelay: star.animationDelay,
              animationDuration: star.animationDuration
            }}
          />
        ))}
      </div>

      <div className={`s10-container ${fadeState === 'out' ? 's10-faded' : ''}`}>
        
        {/* The Moon floating in center */}
        <div className="s10-moon-wrapper">
          <MoonFace mood={step?.moonMood || 'happy'} />
          <div className="s10-moon-glow" />
        </div>

        {/* Dialogue Box */}
        <div className="s10-dialogue-box">
          <p className="s10-text">{step?.text}</p>
        </div>

        {/* Interaction Area */}
        <div className="s10-interaction-area">
          {step?.type === 'options' && (
            <div className="s10-options-grid">
              {step.options.map((opt, i) => {
                // If it's a Yes/No question, give specific classes for styling
                let btnClass = "s10-btn-option";
                if (opt === "Yes") btnClass += " s10-btn-yes";
                if (opt === "No") btnClass += " s10-btn-no";

                return (
                  <button key={i} className={`s10-btn ${btnClass}`} onClick={() => handleOptionClick(opt)}>
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {step?.type === 'info' && (
            <button className="s10-btn s10-btn-primary" onClick={goToNextStep}>
              {step.btnText}
            </button>
          )}

          {step?.type === 'input' && (
            <form className="s10-input-form" onSubmit={handleInputSubmit}>
              <textarea 
                className="s10-textarea"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your answer here..."
                autoFocus
              />
              <button 
                type="submit" 
                className="s10-btn s10-btn-primary" 
                disabled={!inputValue.trim()}
              >
                Send him
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
