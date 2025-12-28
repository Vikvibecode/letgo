import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PaperCard from './components/PaperCard';
import Flame from './components/Flame';
import BurnEffect from './components/BurnEffect';
import ReleaseState from './components/ReleaseState';
import { useReleaseHistory } from './hooks/useReleaseHistory';
import './App.css';

// App states
const STATES = {
  WRITING: 'writing',
  BURNING: 'burning',
  RELEASED: 'released',
};

// Writing prompts
const PROMPTS = [
  "What's weighing on you?",
  "What do you want to forgive?",
  "What fear can you release?",
  "What regret haunts you?",
  "What anger can you let go?",
];

export default function App() {
  const [appState, setAppState] = useState(STATES.WRITING);
  const [text, setText] = useState('');
  const [isFlameExcited, setIsFlameExcited] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isDimmed, setIsDimmed] = useState(false);
  const [lastEnterTime, setLastEnterTime] = useState(0);

  const flameRef = useRef(null);
  const audioRef = useRef(null);

  // Release history hook
  const { releaseCount, recordRelease } = useReleaseHistory();

  // Generate more firefly particles - spread across screen
  const fireflies = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: 5 + Math.random() * 90,
      bottom: 10 + Math.random() * 60,
      size: 3 + Math.random() * 3,
      delay: Math.random() * 8,
    }));
  }, []);

  // Generate ambient particles
  const ambientParticles = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 12 + Math.random() * 8,
    }));
  }, []);

  // Haptic feedback helper
  const triggerHaptic = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 30, 100]);
    }
  }, []);

  // Handle drag proximity to flame
  const handleDragUpdate = useCallback((isNearFlame) => {
    setIsFlameExcited(isNearFlame);
    setIsDimmed(isNearFlame);
  }, []);

  // Handle burn action
  const handleBurn = useCallback(() => {
    if (text.trim().length === 0) return;

    setAppState(STATES.BURNING);
    setIsFlameExcited(false);
    setIsDimmed(false);
    triggerHaptic();
    recordRelease();

    // Play fire sound if enabled
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => { });
    }
  }, [text, soundEnabled, triggerHaptic, recordRelease]);

  // Handle burn complete
  const handleBurnComplete = useCallback(() => {
    setAppState(STATES.RELEASED);
  }, []);

  // Handle write again
  const handleWriteAgain = useCallback(() => {
    setText('');
    setAppState(STATES.WRITING);
  }, []);

  // Toggle sound
  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  // Handle prompt selection
  const handlePromptClick = useCallback((prompt) => {
    setText(prompt + ' ');
  }, []);

  // Keyboard shortcut: Double Enter to burn
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (appState !== STATES.WRITING) return;
      if (e.key === 'Enter' && !e.shiftKey && text.trim().length > 0) {
        const now = Date.now();
        if (now - lastEnterTime < 500) {
          e.preventDefault();
          handleBurn();
        } else {
          setLastEnterTime(now);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appState, text, lastEnterTime, handleBurn]);

  return (
    <div className="app">
      {/* Forest background with trees */}
      <div className="forest-background">
        <div className="ground" />

        {/* Back row of trees */}
        <div className="tree-row-back">
          <div className="tree-back" />
          <div className="tree-back tall" />
          <div className="tree-back" />
          <div className="tree-back tall" />
          <div className="tree-back" />
          <div className="tree-back tall" />
          <div className="tree-back" />
        </div>

        {/* Front row of trees */}
        <div className="tree-row-front">
          <div className="tree-front tall" />
          <div className="tree-front short" />
          <div className="tree-front" />
          <div className="tree-front short" />
          <div className="tree-front tall" />
        </div>
      </div>

      {/* Screen dimming overlay */}
      <div className={`dim-overlay ${isDimmed ? 'active' : ''}`} />

      {/* Firefly particles - spread across forest */}
      <div className="fireflies-container">
        {fireflies.map(fly => (
          <span
            key={fly.id}
            className="firefly"
            style={{
              left: `${fly.left}%`,
              bottom: `${fly.bottom}%`,
              width: `${fly.size}px`,
              height: `${fly.size}px`,
              animationDelay: `${fly.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Ambient background particles */}
      <div className="ambient-bg">
        {ambientParticles.map(particle => (
          <span
            key={particle.id}
            className="ambient-particle"
            style={{
              left: `${particle.left}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>

      {/* History counter */}
      {releaseCount > 0 && (
        <div className="history-counter">
          Thoughts released: <strong>{releaseCount}</strong>
        </div>
      )}

      {/* Sound toggle */}
      <button
        className={`sound-toggle ${soundEnabled ? 'active' : ''}`}
        onClick={toggleSound}
        aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
      >
        {soundEnabled ? '🔊' : '🔇'}
      </button>

      {/* Hidden audio element for fire sound */}
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/fire-crackle.mp3" type="audio/mpeg" />
      </audio>

      {/* Prompt suggestions - Fixed at top of screen */}
      {appState === STATES.WRITING && text.length === 0 && (
        <div className="prompt-suggestions">
          {PROMPTS.slice(0, 3).map((prompt, i) => (
            <button
              key={i}
              className="prompt-chip"
              onClick={() => handlePromptClick(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Writing State */}
        {appState === STATES.WRITING && (
          <motion.div
            className="writing-area"
            key="writing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <PaperCard
              value={text}
              onChange={setText}
              onDragEnd={handleDragUpdate}
              onBurn={handleBurn}
              flameRef={flameRef}
              disabled={false}
            />
          </motion.div>
        )}

        {/* Burning State */}
        {appState === STATES.BURNING && (
          <BurnEffect
            key="burning"
            text={text}
            onComplete={handleBurnComplete}
          />
        )}

        {/* Released State */}
        {appState === STATES.RELEASED && (
          <ReleaseState
            key="released"
            onWriteAgain={handleWriteAgain}
            releaseCount={releaseCount}
          />
        )}
      </AnimatePresence>

      {/* Flame (always visible except during release) */}
      {appState !== STATES.RELEASED && (
        <Flame
          ref={flameRef}
          isExcited={isFlameExcited}
        />
      )}

      {/* Keyboard hint */}
      {appState === STATES.WRITING && text.trim().length > 0 && (
        <div className="keyboard-hint">
          Press <kbd>Enter</kbd> twice to release
        </div>
      )}
    </div>
  );
}
