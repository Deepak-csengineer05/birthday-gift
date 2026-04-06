import React, { useState, useEffect, useMemo } from 'react';
import './AdminDashboard.css';
import { clearAnalytics, FB_PATH } from '../analytics';
import { rtdb } from '../firebase';
import { ref, onValue } from 'firebase/database';

/* ── Section 9 Question Map ────────────────────── */
const SECTION9_QUESTIONS = [
  { id: 0, text: "Are you surprised by the gift?", type: 'options' },
  { id: 1, text: "Sorry for this, next time I assure the gift will be the best to make you smile.", type: 'info' },
  { id: 2, text: "Do you know who done this for you?", type: 'options' },
  { id: 3, text: "Hey pooji, for all the options, I would say only one name - Deepak...", type: 'info' },
  { id: 4, text: "Who is Deepak to you?", type: 'input' },
  { id: 5, text: "Are you really happy on this gift, are you expected this from him?", type: 'input' },
  { id: 6, text: "If you wish to say one thing to Deepak what it would be?", type: 'input' },
  { id: 7, text: "Are you thinking like why this boy Deepak doing like this to you, what you done for him?", type: 'input' },
  { id: 8, text: "I can simple say why he is doing to you but...", type: 'info' },
  { id: 9, text: "Will you be his best friend in any situation, and not left him for anyone at any situation? Tell the truth.", type: 'input' },
];

/* ── Time Formatter ────────────────────────────── */
function formatDuration(totalSeconds) {
  if (!totalSeconds || totalSeconds < 0) return '0s';
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

function formatTimestamp(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    hour12: true,
  });
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
}

/* ── Stars Background ──────────────────────────── */
function Starfield() {
  const stars = useMemo(() =>
    Array.from({ length: 120 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 2.5 + 0.5}px`,
      dur: `${2 + Math.random() * 4}s`,
      delay: `${Math.random() * 5}s`,
    })), []);

  return (
    <div className="admin-starfield">
      {stars.map(s => (
        <div key={s.id} className="admin-star" style={{
          top: s.top, left: s.left,
          width: s.size, height: s.size,
          '--dur': s.dur,
          animationDelay: s.delay,
        }} />
      ))}
    </div>
  );
}

/* ── Sidebar Tabs Config ───────────────────────── */
const MENU_GROUPS = [
  {
    title: 'Dashboard',
    items: [
      { id: 'overview', icon: '📊', label: 'Overview' },
    ]
  },
  {
    title: 'Scenes',
    items: [
      { id: 'scene1', icon: '🌕', label: 'Scene 1: Moon Twin' },
      { id: 'scene3', icon: '🎆', label: 'Scene 3: Fireworks' },
      { id: 'scene4', icon: '💌', label: 'Scene 4: Envelope' },
    ]
  },
  {
    title: 'Memories',
    items: [
      { id: 'sec2', icon: '🌿', label: 'Mem 02: Photos' },
      { id: 'sec4', icon: '🎁', label: 'Mem 04: Gifts' },
      { id: 'sec5', icon: '🎂', label: 'Mem 05: Cake' },
      { id: 'sec6', icon: '✨', label: 'Mem 06: Puzzle' },
      { id: 'sec7', icon: '🖼️', label: 'Mem 07: Scratch' },
      { id: 'sec8', icon: '📖', label: 'Mem 08: Diary' },
      { id: 'sec9', icon: '🌙', label: 'Mem 09: Q&A' },
      { id: 'sec10', icon: '📜', label: 'Mem 10: Letter' },
    ]
  }
];

/* ── Main Dashboard ────────────────────────────── */
export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTargetOnline, setIsTargetOnline] = useState(false);
  const [showOnlineToast, setShowOnlineToast] = useState(false);

  // Real-time Firebase listener — updates instantly from any device
  useEffect(() => {
    const analyticsRef = ref(rtdb, FB_PATH);

    const unsubscribe = onValue(analyticsRef, (snapshot) => {
      if (!snapshot.exists()) {
        setData({ visitCount: 0, visits: [], totalTimeSpent: 0, events: [], section9Answers: {}, lastActivity: null });
        return;
      }

      const raw = snapshot.val();

      // Firebase stores lists as objects with push keys — normalize to arrays
      const events = raw.events
        ? Object.values(raw.events).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        : [];
      const visits = raw.visits ? Object.values(raw.visits) : [];
      const section9Answers = raw.section9Answers || {};

      const normalized = {
        ...raw,
        events,
        visits,
        section9Answers,
      };

      setData(normalized);

      // Check online status from Firebase lastActivity
      if (raw.lastActivity) {
        const timeSinceLastPing = Date.now() - raw.lastActivity;
        const onlineNow = timeSinceLastPing <= 15000;

        setIsTargetOnline((prevOnline) => {
          if (!prevOnline && onlineNow) {
            setShowOnlineToast(true);
            setTimeout(() => setShowOnlineToast(false), 5000);
          }
          return onlineNow;
        });
      } else {
        setIsTargetOnline(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleClear = async () => {
    if (confirmClear) {
      await clearAnalytics(); // clears both localStorage + Firebase
      setData({ visitCount: 0, visits: [], totalTimeSpent: 0, events: [], section9Answers: {}, lastActivity: null });
      setConfirmClear(false);
      setActiveTab('overview');
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 4000);
    }
  };

  if (!data) return null;

  /* ── Derived Data ─────────────────────────────── */
  const scene1Events = data.events.filter(e => e.category === 'Scene1');
  const scene3Events = data.events.filter(e => e.category === 'Scene3');
  const scene4Events = data.events.filter(e => e.category === 'Scene4');
  const sec2Events = data.events.filter(e => e.category === 'Section2');
  const sec4Events = data.events.filter(e => e.category === 'Section4');
  const sec5Events = data.events.filter(e => e.category === 'Section5');
  const sec6Events = data.events.filter(e => e.category === 'Section6');
  const sec7Events = data.events.filter(e => e.category === 'Section7');
  const sec8Events = data.events.filter(e => e.category === 'Section8');
  const sec9Events = data.events.filter(e => e.category === 'Section9');
  const sec10Events = data.events.filter(e => e.category === 'Section10');
  const passwordEvents = data.events.filter(e => e.category === 'PasswordGate');

  const giftBoxOpenEvents = sec4Events.filter(e => e.action === 'gift_box_open');
  const feedbackEvent = sec4Events.find(e => e.action === 'feedback_response');
  const candleEvents = sec5Events.filter(e => e.action === 'candle_blown');
  const wordEvents = sec6Events.filter(e => e.action === 'word_found');
  const hintEvents = sec6Events.filter(e => e.action === 'hint_used');
  const scratchEvents = sec7Events.filter(e => e.action === 'scratch_reveal');
  const favQuoteEvent = sec8Events.find(e => e.action === 'favourite_quote');
  const letterTimeEvent = sec10Events.find(e => e.action === 'letter_read_time');
  const skippedFireworks = scene3Events.some(e => e.action === 'skip_fireworks');

  const sec9Options = sec9Events.filter(e => e.action === 'option_click');

  const totalEvents = data.events.length;
  const lastVisit = data.visits.length > 0 ? data.visits[data.visits.length - 1] : null;

  /* ── Content Renderers ────────────────────────── */
  const renderOverview = () => (
    <div className="tab-pane fade-in">
      <div className="admin-header">
        <h1 className="admin-title">Lunar Mission Control 🌙</h1>
        <p className="admin-subtitle">
          Analytics Dashboard
          {isTargetOnline ? (
            <span className="live-indicator online">🟢 Person is ONLINE</span>
          ) : (
            <span className="live-indicator offline">⚪ Person is Offline</span>
          )}
        </p>
      </div>

      <div className="admin-stats-row">
        <div className="stat-card">
          <div className="stat-icon">👀</div>
          <div className="stat-value">{data.visitCount}</div>
          <div className="stat-label">Total Visits</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏱</div>
          <div className="stat-value">{formatDuration(data.totalTimeSpent)}</div>
          <div className="stat-label">Time Spent</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{totalEvents}</div>
          <div className="stat-label">Interactions</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-value" style={{ fontSize: '1.2rem', padding: '0.4rem 0' }}>
            {lastVisit ? formatTimestamp(lastVisit) : 'Never'}
          </div>
          <div className="stat-label">Last Visit</div>
        </div>
      </div>

      <div className="admin-grid-panels">
        <div className="admin-panel flex-grow">
          <div className="panel-header">
            <div className="panel-icon">📋</div>
            <div className="panel-title">Visit History</div>
            <div className="panel-badge">{data.visits.length} Visits</div>
          </div>
          {data.visits.length > 0 ? (
            <div className="visit-log">
              {[...data.visits].reverse().map((v, i) => (
                <div key={i} className="visit-chip">
                  #{data.visits.length - i} · {formatTimestamp(v)}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No visits recorded yet.</div>
          )}
        </div>

        <div className="admin-panel">
          <div className="panel-header">
            <div className="panel-icon">🔐</div>
            <div className="panel-title">Password Attempts</div>
            <div className="panel-badge pink">{passwordEvents.length} Failed</div>
          </div>
          <div className="event-list limit-height">
            {passwordEvents.length > 0 ? passwordEvents.map((evt, i) => (
              <div key={i} className="event-item">
                <div className="event-dot pink" />
                <div className="event-text">Failed attempt ({evt.data.attempted} chars)</div>
                <div className="event-time">{formatTime(evt.timestamp)}</div>
              </div>
            )) : (
              <div className="empty-state">No failed attempts detected.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderScene1 = () => (
    <div className="tab-pane fade-in">
      <div className="admin-panel full-height">
        <div className="panel-header">
          <div className="panel-icon">🌕</div>
          <div className="panel-title">Scene 1 — Moon Dialogue</div>
          <div className="panel-badge">{scene1Events.length} Choices</div>
        </div>
        {scene1Events.length > 0 ? (
          <div className="event-list large">
            {scene1Events.map((evt, i) => (
              <div key={i} className="event-item active-glow">
                <div className={`event-dot ${evt.data.optionIndex === 0 ? 'green' : 'pink'}`} />
                <div className="event-text">
                  Step <strong>{evt.data.stepId}</strong> → selected <strong>"{evt.data.optionText}"</strong>
                </div>
                <div className="event-time">{formatTime(evt.timestamp)}</div>
              </div>
            ))}
          </div>
        ) : <div className="empty-state">Not reached yet.</div>}
      </div>
    </div>
  );

  const renderScene3 = () => (
    <div className="tab-pane fade-in">
      <div className="admin-panel full-height">
        <div className="panel-header">
          <div className="panel-icon">🎆</div>
          <div className="panel-title">Scene 3 — Fireworks</div>
        </div>
        <div className="event-list large">
          {scene3Events.length > 0 ? (
            <div className="event-item active-glow">
              <div className={`event-dot ${skippedFireworks ? 'pink' : 'green'}`} />
              <div className="event-text">
                {skippedFireworks ? '⏭ Skipped the fireworks show' : '✨ Watched the full fireworks display'}
              </div>
            </div>
          ) : (
            <div className="empty-state">Not reached yet.</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderScene4 = () => (
    <div className="tab-pane fade-in">
      <div className="admin-panel full-height">
        <div className="panel-header">
          <div className="panel-icon">💌</div>
          <div className="panel-title">Scene 4 — Envelope</div>
        </div>
        <div className="event-list large">
          {scene4Events.length > 0 ? scene4Events.map((evt, i) => (
            <div key={i} className="event-item active-glow">
              <div className="event-dot gold" />
              <div className="event-text">Clicked the moon seal 🌙</div>
              <div className="event-time">{formatTime(evt.timestamp)}</div>
            </div>
          )) : <div className="empty-state">Not reached yet.</div>}
        </div>
      </div>
    </div>
  );

  const renderSec2 = () => {
    const SEC2_PHOTOS_MAP = {
      1: 'pic1.jpeg', 6: 'pic2.jpeg', 2: 'pic3.jpeg', 7: 'pic4.jpeg',
      3: 'pic5.jpeg', 4: 'pic6.jpeg', 8: 'pic7.jpeg', 5: 'pic8.jpeg'
    };

    return (
      <div className="tab-pane fade-in">
        <div className="admin-panel full-height">
          <div className="panel-header">
            <div className="panel-icon">🌿</div>
            <div className="panel-title">Memory 02 — Photo Gallery</div>
            <div className="panel-badge">{sec2Events.length} Photos Viewed</div>
          </div>
          {sec2Events.length > 0 ? (
            <div className="event-list large auto-grid">
              {sec2Events.map((evt, i) => {
                const photoSrc = SEC2_PHOTOS_MAP[evt.data.photoId];
                return (
                  <div key={i} className="event-item card-style active-glow dashboard-polaroid">
                    {photoSrc && (
                      <div className="polaroid-image-box">
                        <img src={`/${photoSrc}`} alt={`Pic ${evt.data.photoId}`} className="polaroid-pic" onError={(e) => { e.target.style.display = 'none'; }} />
                      </div>
                    )}
                    <div className="polaroid-details">
                      <div className="event-dot cyan" style={{ position: 'relative', top: 0, right: 0 }} />
                      <div className="event-text text-center">
                        <div><strong>#{evt.data.photoId}</strong> viewed</div>
                        <div className="sub-text italic">"{evt.data.caption}"</div>
                      </div>
                      <div className="event-time mt-auto">{formatTime(evt.timestamp)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <div className="empty-state">Not reached yet.</div>}
        </div>
      </div>
    );
  };

  const renderSec4 = () => {
    // Determine unique box opens to fix duplicate tracking bug
    const uniqueBoxesOpened = new Set(giftBoxOpenEvents.map(e => e.data.boxIndex)).size;

    return (
      <div className="tab-pane fade-in">
        <div className="admin-panel full-height">
          <div className="panel-header">
            <div className="panel-icon">🎁</div>
            <div className="panel-title">Memory 04 — Gift Boxes</div>
            <div className="panel-badge">{uniqueBoxesOpened}/5 Opened</div>
          </div>
          
          {giftBoxOpenEvents.length > 0 ? (
            <>
              <div className="gift-boxes-wrapper">
                <div className="gift-boxes-row">
                  {[0, 1, 2, 3, 4].map(i => {
                    const openEvt = giftBoxOpenEvents.find(e => e.data.boxIndex === i);
                    const order = openEvt ? giftBoxOpenEvents.indexOf(openEvt) + 1 : null;
                    return (
                      <div key={i} className={`gift-box-card ${openEvt ? 'opened' : ''}`}>
                        <span className="gift-box-icon">{openEvt ? '🎁' : '📦'}</span>
                        {order && <span className="gift-box-order animate-pop">{order}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {feedbackEvent && (
                <div className="feedback-container fade-in">
                  <div className="feedback-title">"Did you like the gift?"</div>
                  <div className={`feedback-badge ${feedbackEvent.data.response} glowing`}>
                    {feedbackEvent.data.response === 'yes' ? '✅ Yes' : '❌ No'} 
                    <span className="feedback-details">— response recorded</span>
                  </div>
                </div>
              )}
            </>
          ) : <div className="empty-state">Not reached yet.</div>}
        </div>
      </div>
    );
  };

  const renderSec5 = () => (
    <div className="tab-pane fade-in">
      <div className="admin-panel full-height">
        <div className="panel-header">
          <div className="panel-icon">🎂</div>
          <div className="panel-title">Memory 05 — Cake Candles</div>
          <div className="panel-badge">{candleEvents.length}/5 Blown</div>
        </div>
        {candleEvents.length > 0 ? (
          <div className="candle-row large-padding">
            {[0, 1, 2, 3, 4].map(i => {
              const evt = candleEvents.find(e => e.data.candleIndex === i);
              return (
                <div key={i} className="candle-item">
                  <div className={`candle-icon ${evt ? 'blown-anim' : 'unblown'}`}>
                    {evt ? '🕯️' : '🕳️'}
                  </div>
                  {evt && <div className="candle-order glowing-text">#{evt.data.blownOrder}</div>}
                </div>
              );
            })}
          </div>
        ) : <div className="empty-state">Not reached yet.</div>}
      </div>
    </div>
  );

  const renderSec6 = () => (
    <div className="tab-pane fade-in">
      <div className="admin-panel full-height">
        <div className="panel-header">
          <div className="panel-icon">✨</div>
          <div className="panel-title">Memory 06 — Star Puzzle</div>
          <div className="panel-badge">{wordEvents.length}/7 Words · {hintEvents.length} Hints</div>
        </div>
        {wordEvents.length > 0 || hintEvents.length > 0 ? (
          <div className="event-list large auto-grid">
            {wordEvents.map((evt, i) => (
              <div key={i} className="event-item card-style active-glow">
                <div className="event-dot green" />
                <div className="event-text">
                  Found <strong className="highlight">"{evt.data.word}"</strong>
                  <div className="sub-text">Word #{evt.data.foundOrder}</div>
                </div>
                <div className="event-time">{formatTime(evt.timestamp)}</div>
              </div>
            ))}
            {hintEvents.length > 0 && (
              <div className="event-item card-style hint-card active-glow">
                <div className="event-dot gold" />
                <div className="event-text">
                  Used <strong>{hintEvents.length}</strong> Hint{hintEvents.length > 1 ? 's' : ''}
                </div>
              </div>
            )}
          </div>
        ) : <div className="empty-state">Not reached yet.</div>}
      </div>
    </div>
  );

  const renderSec7 = () => (
    <div className="tab-pane fade-in">
      <div className="admin-panel full-height">
        <div className="panel-header">
          <div className="panel-icon">🖼️</div>
          <div className="panel-title">Memory 07 — Scratch Gallery</div>
          <div className="panel-badge">{scratchEvents.length}/7 Revealed</div>
        </div>
        {scratchEvents.length > 0 ? (
          <div className="scratch-row large-padding">
            {[1, 2, 3, 4, 5, 6, 7].map(id => {
              const evt = scratchEvents.find(e => e.data.cardId === id);
              return (
                <div key={id} className={`scratch-item ${evt ? 'revealed animate-pop' : ''}`}>
                  {evt && <div className="scratch-num">#{evt.data.revealOrder}</div>}
                  {evt ? (
                    <img 
                      src={`/sec7pic${id}Ghibli.${id === 6 ? 'png' : 'jpeg'}`} 
                      alt={`Scratched ${id}`}
                      className="scratch-img"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `/sec7pic${id}.${[4, 5, 7].includes(id) ? 'png' : 'jpeg'}`;
                      }}
                    />
                  ) : (
                    <div className="unrevealed-overlay">Card {id}</div>
                  )}
                </div>
              );
            })}
          </div>
        ) : <div className="empty-state">Not reached yet.</div>}
      </div>
    </div>
  );

  const renderSec8 = () => (
    <div className="tab-pane fade-in">
      <div className="admin-panel full-height">
        <div className="panel-header">
          <div className="panel-icon">📖</div>
          <div className="panel-title">Memory 08 — Favourite Quote</div>
        </div>
        {favQuoteEvent ? (
          <div className="fav-quote-wrap">
            <div className="fav-quote-card premium-glow fade-in">
              <div className="fav-quote-text">"{favQuoteEvent.data.quoteText}"</div>
              <div className="fav-quote-num">★ Quote #{favQuoteEvent.data.quoteIndex + 1} ★</div>
            </div>
          </div>
        ) : <div className="empty-state">Not reached yet.</div>}
      </div>
    </div>
  );

  const renderSec9 = () => (
    <div className="tab-pane fade-in">
      <div className="admin-panel full-height premium-border">
        <div className="panel-header">
          <div className="panel-icon highlight-icon">🌙</div>
          <div className="panel-title highlight-text">Memory 09 — Her Answers</div>
          <div className="panel-badge highlight-badge">⭐ Key Insights</div>
        </div>
        {(sec9Options.length > 0 || Object.keys(data.section9Answers).length > 0) ? (
          <div className="qa-grid">
            {sec9Options.map((evt, i) => (
              <div key={`opt-${i}`} className="qa-card active-glow slide-up">
                <div className="qa-question">
                  <span className="qa-question-num">Q</span>
                  {evt.data.questionText}
                </div>
                <div className="qa-option-selected">
                  → {evt.data.selectedOption}
                </div>
              </div>
            ))}
            {Object.entries(data.section9Answers).map(([qId, entry], i) => (
              <div key={`ans-${qId}`} className="qa-card active-glow gold-border slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="qa-question">
                  <span className="qa-question-num gold-num">Q</span>
                  {entry.question}
                </div>
                <div className="qa-answer handwritten-font">
                  {entry.answer}
                </div>
              </div>
            ))}
          </div>
        ) : <div className="empty-state">Not reached yet.</div>}
      </div>
    </div>
  );

  const renderSec10 = () => (
    <div className="tab-pane fade-in">
      <div className="admin-panel full-height">
        <div className="panel-header">
          <div className="panel-icon">📜</div>
          <div className="panel-title">Memory 10 — Heartfelt Letter</div>
        </div>
        {letterTimeEvent ? (
          <div className="event-list large">
            <div className="event-item active-glow card-style">
              <div className="event-dot gold highlight-glow" />
              <div className="event-text" style={{ fontSize: '1.2rem' }}>
                Read the letter for <strong className="highlight">{formatDuration(letterTimeEvent.data.seconds)}</strong>
              </div>
              <div className="event-time">{formatTime(letterTimeEvent.timestamp)}</div>
            </div>
          </div>
        ) : <div className="empty-state">Not reached yet.</div>}
      </div>
    </div>
  );

  /* ── Main Layout ──────────────────────────────── */
  return (
    <div className="admin-root">
      <Starfield />
      <div className="admin-nebula admin-nebula-1" />
      <div className="admin-nebula admin-nebula-2" />
      <div className="admin-nebula admin-nebula-3" />

      <div className={`admin-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        
        {/* === SIDEBAR === */}
        <aside className="admin-sidebar glass-panel">
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <span className="logo-icon">🌙</span>
              {isSidebarOpen && <span className="logo-text">Mission Control</span>}
            </div>
            <button className="sidebar-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              {isSidebarOpen ? '◀' : '▶'}
            </button>
          </div>

          <div className="sidebar-menu scroll-hidden">
            {MENU_GROUPS.map((group, i) => (
              <div key={i} className="menu-group">
                {isSidebarOpen && <div className="menu-group-title">{group.title}</div>}
                {group.items.map(item => (
                  <button
                    key={item.id}
                    className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(item.id)}
                    title={!isSidebarOpen ? item.label : undefined}
                  >
                    <span className="menu-icon">{item.icon}</span>
                    {isSidebarOpen && <span className="menu-label">{item.label}</span>}
                    {activeTab === item.id && isSidebarOpen && <div className="active-indicator" />}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {isSidebarOpen && (
            <div className="sidebar-footer">
              <button className="admin-btn danger full-width" onClick={handleClear}>
                {confirmClear ? '⚠ Confirm?' : '🗑 Clear Data'}
              </button>
            </div>
          )}
        </aside>

        {/* === MAIN CONTENT === */}
        <main className="admin-main">
          <div className="main-scroll-area">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'scene1' && renderScene1()}
            {activeTab === 'scene3' && renderScene3()}
            {activeTab === 'scene4' && renderScene4()}
            {activeTab === 'sec2' && renderSec2()}
            {activeTab === 'sec4' && renderSec4()}
            {activeTab === 'sec5' && renderSec5()}
            {activeTab === 'sec6' && renderSec6()}
            {activeTab === 'sec7' && renderSec7()}
            {activeTab === 'sec8' && renderSec8()}
            {activeTab === 'sec9' && renderSec9()}
            {activeTab === 'sec10' && renderSec10()}
          </div>
        </main>
      </div>

      {/* === TOAST NOTIFICATION === */}
      {showOnlineToast && (
        <div className="admin-toast slide-in-top">
          <div className="toast-icon">🟢</div>
          <div className="toast-content">
            <div className="toast-title">Person is ONLINE!</div>
            <div className="toast-message">They are actively viewing the experience now.</div>
          </div>
        </div>
      )}
    </div>
  );
}
