import React, { useState, useEffect, useMemo, useRef } from 'react';
import './Section6.css';
import { trackEvent } from '../../analytics';

const GRID_SIZE = 12;
const WORDS_DATA = [
  { question: "What is your nick name?", answer: "LUNAR" },
  { question: "What color you like?", answer: "VIOLET" },
  { question: "What is your Zodiac Sign?", answer: "SCORPION" },
  { question: "What chocolate you like?", answer: "SNICKERS" },
  { question: "Your little brother name?", answer: "ADITHYA" },
  { question: "Your little sister name?", answer: "KAVIYA" },
  { question: "You are from where?", answer: "PALACODE" }
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default function Section6({ onNext }) {
  const [boardData, setBoardData] = useState(null);
  const [foundWords, setFoundWords] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null); // {r, c}
  const [currentSelection, setCurrentSelection] = useState([]); // array of {r, c} strings
  const [completed, setCompleted] = useState(false);
  const [hintedCell, setHintedCell] = useState(null);

  const boardRef = useRef(null);

  // Generate background balloons
  const balloons = useMemo(() => {
    return Array(30).fill(null).map((_, i) => ({
      id: i,
      left: `${-5 + Math.random() * 110}%`,
      delay: `${Math.random() * 10}s`,
      duration: `${10 + Math.random() * 15}s`,
      scale: 0.3 + Math.random() * 0.8,
      rotation: `${-20 + Math.random() * 40}deg`
    }));
  }, []);


  useEffect(() => {
    // Generate grid safely once
    const grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
    const wordsPlaced = [];

    const canPlaceWord = (word, row, col, dRow, dCol) => {
      for (let i = 0; i < word.length; i++) {
        const r = row + i * dRow;
        const c = col + i * dCol;
        if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return false;
        if (grid[r][c] !== '' && grid[r][c] !== word[i]) return false;
      }
      return true;
    };

    const placeWord = (word, row, col, dRow, dCol) => {
      const coords = [];
      for (let i = 0; i < word.length; i++) {
        const r = row + i * dRow;
        const c = col + i * dCol;
        grid[r][c] = word[i];
        coords.push(`${r},${c}`);
      }
      return coords;
    };

    const directions = [
      [0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]
    ];

    WORDS_DATA.forEach(wd => {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 500) {
        const d = directions[Math.floor(Math.random() * directions.length)];
        const row = Math.floor(Math.random() * GRID_SIZE);
        const col = Math.floor(Math.random() * GRID_SIZE);
        
        if (canPlaceWord(wd.answer, row, col, d[0], d[1])) {
          const coords = placeWord(wd.answer, row, col, d[0], d[1]);
          wordsPlaced.push({ word: wd.answer, coords });
          placed = true;
        }
        attempts++;
      }
      // Fallback if not placed (rare, but just in case)
      if (!placed) {
          console.warn("Failed to place word:", wd.answer);
      }
    });

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c] === '') {
          grid[r][c] = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
        }
      }
    }

    setBoardData({ grid, wordsPlaced });
  }, []);

  const handlePointerDown = (r, c) => {
    setIsDragging(true);
    setSelectionStart({ r, c });
    setCurrentSelection([`${r},${c}`]);
  };

  const handlePointerEnter = (r, c) => {
    if (!isDragging || !selectionStart) return;

    // Calculate line path
    const dr = r - selectionStart.r;
    const dc = c - selectionStart.c;
    
    // Ensure straight line (horizontal, vertical, diagonal)
    if (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)) {
      const steps = Math.max(Math.abs(dr), Math.abs(dc));
      const stepR = steps === 0 ? 0 : dr / steps;
      const stepC = steps === 0 ? 0 : dc / steps;
      
      const newSelection = [];
      for (let i = 0; i <= steps; i++) {
        newSelection.push(`${selectionStart.r + i * stepR},${selectionStart.c + i * stepC}`);
      }
      setCurrentSelection(newSelection);
    }
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (currentSelection.length > 0 && boardData) {
      // Check if selected word matches any required word
      const selectedWordStr = currentSelection.map(coord => {
        const [r, c] = coord.split(',').map(Number);
        return boardData.grid[r][c];
      }).join('');
      
      const reverseSelectedWordStr = selectedWordStr.split('').reverse().join('');

      const matchedWord = boardData.wordsPlaced.find(wp => 
        (wp.word === selectedWordStr || wp.word === reverseSelectedWordStr) && 
        !foundWords.includes(wp.word)
      );

      if (matchedWord) {
        const newFound = [...foundWords, matchedWord.word];
        trackEvent('Section6', 'word_found', {
          word: matchedWord.word,
          foundOrder: newFound.length,
        });
        setFoundWords(newFound);
        setHintedCell(null);
        if (newFound.length === WORDS_DATA.length) {
          trackEvent('Section6', 'puzzle_complete', { totalWords: WORDS_DATA.length });
          setTimeout(() => setCompleted(true), 1500);
        }
      }
    }

    setCurrentSelection([]);
  };

  const giveHint = () => {
    if (!boardData) return;
    trackEvent('Section6', 'hint_used', { hintsTotal: 'increment' });
    const unfoundWords = boardData.wordsPlaced.filter(wp => !foundWords.includes(wp.word));
    if (unfoundWords.length > 0) {
      // Pick a random unfound word
      const randomWord = unfoundWords[Math.floor(Math.random() * unfoundWords.length)];
      setHintedCell(randomWord.coords[0]);
    }
  };

  if (!boardData) return null;

  return (
    <div className="section6-container" onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
      <audio autoPlay loop src="/bg-music-3.mp3" style={{ display: 'none' }} />

      {/* Floating Balloons Background */}
      <div className="s6-balloons-container">
        {balloons.map(b => (
          <img 
            key={b.id}
            src="/section3-balloon-ref.png" 
            className="s6-floating-balloon"
            alt="floating balloon"
            style={{
              left: b.left,
              animationDelay: b.delay,
              animationDuration: b.duration,
              '--scale': b.scale,
              '--rotation': b.rotation
            }}
          />
        ))}
      </div>

      <div className={`success-overlay ${completed ? 'show' : ''}`}>
        <div className="success-content">
          <h2>You found all the Words!</h2>
          <p>Every piece of your life forms a beautiful Memory.</p>
          <button className="next-section-btn s6-next" onClick={onNext}>
            Can we go next section
          </button>
        </div>
      </div>

      <div className="s6-header">
        <h1>Memories in the Stars</h1>
        <p>Find the answers hidden in the constellation.</p>
      </div>

      <div className="s6-content">
        <div className="s6-board-container">
          <div 
            className="s6-grid" 
            ref={boardRef}
            style={{ 
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
            }}
          >
            {boardData.grid.map((row, r) => (
              row.map((char, c) => {
                const coord = `${r},${c}`;
                const isSelected = currentSelection.includes(coord);
                // Check if part of already found words
                const isFound = boardData.wordsPlaced.some(wp => foundWords.includes(wp.word) && wp.coords.includes(coord));
                const isHinted = hintedCell === coord;

                return (
                  <div 
                    key={coord} 
                    className={`s6-cell ${isSelected ? 'selected' : ''} ${isFound ? 'found' : ''} ${isHinted ? 'hinted' : ''}`}
                    onPointerDown={(e) => { e.preventDefault(); handlePointerDown(r, c); }}
                    onPointerEnter={(e) => { e.preventDefault(); handlePointerEnter(r, c); }}
                    // Touch support requires different handling or rely on pointer events
                  >
                    {char}
                  </div>
                );
              })
            ))}
          </div>
        </div>

        <div className="s6-questions">
          {WORDS_DATA.map((item, idx) => {
            const isFound = foundWords.includes(item.answer);
            return (
              <div key={idx} className={`s6-question-item ${isFound ? 'completed' : ''}`}>
                <div className="q-number">{idx + 1}</div>
                <div className="q-text">
                  <div className="q-title">{item.question}</div>
                  <div className="q-answer">{isFound ? item.answer : '_ '.repeat(item.answer.length)}</div>
                </div>
                {isFound && <div className="q-check">✓</div>}
              </div>
            );
          })}
          
          {!completed && (
            <button className="s6-hint-btn" onClick={giveHint}>
              💡 Need a Hint?
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
