import React, { useRef, useState, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import './DiaryBook.css';

/* ── Individual Page Wrapper ── */
const Page = React.forwardRef((props, ref) => {
  return (
    <div className={`db-page db-page-${props.side}`} ref={ref}>
      {/* Decorative shadows / edge */}
      <div className="db-page-glare" />

      {/* Content wrapper */}
      <div className="db-page-inner">
        {props.children}
      </div>
    </div>
  );
});

export default function DiaryBook({ quotes, onComplete }) {
  const bookRef = useRef();
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobilePortrait, setIsMobilePortrait] = useState(false);

  useEffect(() => {
    // Check orientation on mount and resize
    const checkOrientation = () => {
      const isMobile = window.innerWidth <= 768;
      const isPortrait = window.innerHeight > window.innerWidth;
      setIsMobilePortrait(isMobile && isPortrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  const pages = [];

  // Generate 2 pages for each quote
  quotes.forEach((q, i) => {
    // ── LEFT PAGE ──
    if (i === 0) {
      pages.push(
        <Page side="left" key={`l-${i}`}>
          <div className="db-page-content db-left-content">
            <div className="db-ornament">❧</div>
            <div className="db-intro-text">
              <p className="db-intro-title">A diary written</p>
              <p className="db-intro-title">just for you,</p>
              <p className="db-intro-sub">Lunar.</p>
              <div className="db-divider">— ✦ —</div>
              <p className="db-intro-note">Turn each page to discover<br />words written from the heart.</p>
            </div>
          </div>
        </Page>
      );
    } else {
      pages.push(
        <Page side="left" key={`l-${i}`}>
          <div className="db-page-content db-left-content">
            <div className="db-prev-quote">
              <p className="db-prev-num">— {i} —</p>
              <p className="db-prev-text">"{quotes[i - 1]}"</p>
            </div>
          </div>
        </Page>
      );
    }

    // ── RIGHT PAGE ──
    pages.push(
      <Page side="right" key={`r-${i}`}>
        <div className="db-page-content db-right-content">
          <div className="db-page-num">{i + 1} / {quotes.length}</div>
          <div className="db-quote-icon">💌</div>
          <blockquote className="db-quote-text">
            "{q}"
          </blockquote>
          <div className="db-divider">— ✦ —</div>
          <div className="db-page-lines">
            {Array.from({ length: 8 }, (_, idx) => (
              <div key={idx} className="db-line" />
            ))}
          </div>
        </div>
      </Page>
    );
  });

  // ── FINAL CLOSE PAGES ──
  pages.push(
    <Page side="left" key="l-end">
      <div className="db-page-content db-left-content">
        <div className="db-prev-quote">
          <p className="db-prev-num">— {quotes.length} —</p>
          <p className="db-prev-text">"{quotes[quotes.length - 1]}"</p>
        </div>
      </div>
    </Page>
  );
  pages.push(
    <Page side="right" key="r-end">
      <div className="db-page-content db-right-content">
        <div className="db-ornament" style={{ fontSize: '4rem', color: '#ccaa44' }}>✧</div>
        <p style={{ fontFamily: "'Dancing Script', cursive", fontSize: '2rem', color: '#5a0096', marginTop: '16px' }}>
          End of Diary
        </p>
      </div>
    </Page>
  );

  const onFlip = (e) => {
    // Current page is the left index (0, 2, 4...)
    setCurrentPage(e.data);
  };

  const handleNext = () => {
    if (currentPage >= quotes.length * 2) {
      onComplete(); // Last spread is open, close diary
    } else {
      if (bookRef.current) {
        bookRef.current.pageFlip().flipNext();
      }
    }
  };

  const handlePrev = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipPrev();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        const currentPairIndex = Math.floor(currentPage / 2);
        if (currentPairIndex > 0) {
          handlePrev();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, quotes.length]);

  const currentPairIndex = Math.floor(currentPage / 2);
  const isEnd = currentPairIndex >= quotes.length;
  
  if (isMobilePortrait) {
    return (
      <div className="db-overlay" style={{ flexDirection: 'column', textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📱 ⤹</div>
        <h2 style={{ color: '#fff', fontFamily: "'Dancing Script', cursive", fontSize: '2.5rem' }}>
          Please rotate your phone
        </h2>
        <p style={{ color: '#ccc', fontSize: '1.2rem', marginTop: '1rem' }}>
          This diary is best viewed sideways (landscape mode) so you have enough space to read the pages.
        </p>
      </div>
    );
  }

  // Calculate dynamic dimensions for landscape mobile vs desktop
  const isMobileLandscape = window.innerHeight <= 450; 
  const bookWidth = isMobileLandscape ? window.innerWidth * 0.42 : 400;
  const bookHeight = isMobileLandscape ? window.innerHeight * 0.85 : 530;

  return (
    <div className="db-overlay">
      <div className="db-book-wrapper">

        {/* The react-pageflip book component */}
        {/* We wrap it in a container with the cover spine background */}
        <div className="db-book-container">
          <HTMLFlipBook
            width={bookWidth}
            height={bookHeight}
            size="fixed"
            minWidth={300}
            maxWidth={450}
            minHeight={300}
            maxHeight={600}
            maxShadowOpacity={0.65}
            showCover={false}
            usePortrait={false}
            mobileScrollSupport={true}
            ref={bookRef}
            onFlip={onFlip}
            className="db-html-book"
            flippingTime={1200}
          >
            {pages}
          </HTMLFlipBook>
        </div>

        {/* Controls */}
        <div className="db-controls">
          <div className="db-progress">
            {quotes.map((_, i) => (
              <div key={i} className={`db-dot ${i <= currentPairIndex ? 'active' : ''}`} />
            ))}
          </div>

          <div className="db-btn-group">
            <button className="db-turn-btn" onClick={handlePrev} disabled={currentPairIndex === 0}>
              ← Back
            </button>
            <button className="db-turn-btn primary" onClick={handleNext}>
              {isEnd ? '📖 Close the Diary' : 'Turn the Page →'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
