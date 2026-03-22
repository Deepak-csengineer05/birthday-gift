import React, { useState, useEffect, useCallback } from 'react';
import './Scene2Countdown.css';

/* ══════════════════════════════════════════════
   Journey milestones
   ══════════════════════════════════════════════ */
const JOURNEY = [
  { pre: 'Yeah when it was', date: '7th January,', count: '100', post: 'days before the day' },
  { pre: 'on', date: '1st February,', count: '75', post: 'days before the day' },
  { pre: 'by', date: '26th February,', count: '50', post: 'days before the day' },
  { pre: 'when I say', date: '23rd March,', count: '25', post: 'days before the day' },
  { pre: 'I remember when it was', date: '7th April', count: '10', post: 'days before the day' },
  { pre: 'when it was', date: '12th April,', count: '5', post: "days ahead... I couldn't wait" },
];

/* ══════════════════════════════════════════════
   Word-by-word reveal — diagonal top-left → bottom-right
   ══════════════════════════════════════════════ */
function WordReveal({ lines, baseDelay = 0 }) {
  // lines = [{ text, cls }]  — reveals all words across all lines diagonally
  let wordIdx = 0;
  return (
    <div className="wr-block">
      {lines.map((line, li) => {
        const words = line.text.split(' ');
        return (
          <p key={li} className={`wr-line ${line.cls || ''}`}>
            {words.map((word, wi) => {
              const delay = baseDelay + wordIdx++ * 0.15; // diagonal stagger
              return (
                <span
                  key={wi}
                  className="wr-word"
                  style={{ animationDelay: `${delay}s` }}
                >
                  {word}&nbsp;
                </span>
              );
            })}
          </p>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════
   Rolling year 2006 → 2026
   ══════════════════════════════════════════════ */
function RollingYear({ trigger }) {
  const [year, setYear] = useState(2006);
  useEffect(() => {
    if (!trigger) return;
    let cur = 2006;
    const tick = () => {
      cur++;
      setYear(cur);
      if (cur >= 2026) return;
      const p     = (cur - 2006) / 20;
      const delay = 40 + p * p * 380;           // 40ms → 420ms easing
      setTimeout(tick, delay);
    };
    setTimeout(tick, 100);
  }, [trigger]);
  return <span className="year-roll">{year}</span>;
}

/* ══════════════════════════════════════════════
   Main component
   ══════════════════════════════════════════════ */
export default function Scene2Countdown({ onProceed }) {
  const [phase,    setPhase]    = useState('journey');
  const [jIdx,     setJIdx]     = useState(0);
  const [itemVis,  setItemVis]  = useState(true);
  const [dateVis,  setDateVis]  = useState(false);
  const [yearTrig, setYearTrig] = useState(false);
  const [msgVis,   setMsgVis]   = useState([false, false, false]);
  const [exiting,  setExiting]  = useState(false);

  const proceed = useCallback(() => {
    setExiting(true);
    setTimeout(() => onProceed?.(), 1400);
  }, [onProceed]);

  /* Journey auto-advance */
  useEffect(() => {
    if (phase !== 'journey') return;
    const t = setTimeout(() => {
      if (jIdx < JOURNEY.length - 1) {
        setItemVis(false);
        setTimeout(() => { setJIdx(i => i + 1); setItemVis(true); }, 600);
      } else {
        setItemVis(false);
        setTimeout(() => setPhase('finally'), 700);
      }
    }, 3000);
    return () => clearTimeout(t);
  }, [phase, jIdx]);

  /* "Finally" → date */
  useEffect(() => {
    if (phase !== 'finally') return;
    const t = setTimeout(() => setPhase('date'), 3500);
    return () => clearTimeout(t);
  }, [phase]);

  /* Date reveal + rolling year */
  useEffect(() => {
    if (phase !== 'date') return;
    const t1 = setTimeout(() => setDateVis(true),  300);
    const t2 = setTimeout(() => setYearTrig(true), 1100);
    const t3 = setTimeout(() => setPhase('messages'), 5500);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [phase]);

  /* Staggered messages */
  useEffect(() => {
    if (phase !== 'messages') return;
    const ts = [
      setTimeout(() => setMsgVis([true,  false, false]), 300),
      setTimeout(() => setMsgVis([true,  true,  false]), 2800),
      setTimeout(() => setMsgVis([true,  true,  true]),  5200),
      setTimeout(proceed, 8500),
    ];
    return () => ts.forEach(clearTimeout);
  }, [phase, proceed]);

  const item = JOURNEY[jIdx];

  return (
    <div className={`sc2-wrapper ${exiting ? 'sc2-exit' : ''}`}>
      <div className="sc2-overlay" />
      <div className="sc2-inner">

        {/* ── JOURNEY ── */}
        {phase === 'journey' && (
          <div className={`sc2-journey-card ${itemVis ? 'vis' : 'hid'}`}>
            <WordReveal
              lines={[
                { text: item.pre + ' ' + item.date, cls: 'wr-pre' },
              ]}
              baseDelay={0.05}
            />
            <div className="sc2-count-row">
              <span className="sc2-count">{item.count}</span>
            </div>
            <WordReveal
              lines={[{ text: item.post, cls: 'wr-post' }]}
              baseDelay={0.2}
            />
          </div>
        )}

        {/* ── FINALLY ── */}
        {phase === 'finally' && (
          <div className="sc2-finally">
            <WordReveal
              lines={[
                { text: 'But finally...', cls: 'wr-finally-pre' },
                { text: 'the day came', cls: 'wr-finally-main' },
              ]}
              baseDelay={0}
            />
          </div>
        )}

        {/* ── DATE REVEAL ── */}
        {phase === 'date' && (
          <div className={`sc2-date-reveal ${dateVis ? 'vis' : ''}`}>
            <div className="sc2-reveal-date">
              <span className="sc2-day">17 </span>
              <span className="sc2-month">April</span>
              <span className="sc2-dot"> · </span>
              <RollingYear trigger={yearTrig} />
            </div>
          </div>
        )}

        {/* ── MESSAGES ── */}
        {phase === 'messages' && (
          <div className="sc2-messages">
            {msgVis[0] && (
              <div className="sc2-msg-wrap">
                <WordReveal lines={[{ text: 'say a good bye to your teenage', cls: 'wr-msg' }]} baseDelay={0} />
              </div>
            )}
            {msgVis[1] && (
              <div className="sc2-msg-wrap">
                <WordReveal lines={[{ text: "Now you are at your 20's ", cls: 'wr-msg wr-msg--hl' }]} baseDelay={0} />
              </div>
            )}
            {msgVis[2] && (
              <div className="sc2-msg-wrap">
                <WordReveal lines={[{ text: 'a special day to celebrate ', cls: 'wr-msg' }]} baseDelay={0} />
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
