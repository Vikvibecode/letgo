import { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { useDrag } from '@use-gesture/react';
import './PaperCard.css';

export default function PaperCard({
  value,
  onChange,
  onDragStart,
  onDragEnd,
  onBurn,
  flameRef,
  disabled
}) {
  const cardRef = useRef(null);
  const textareaRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isNearFlame, setIsNearFlame] = useState(false);
  const [showFirstTimeHint, setShowFirstTimeHint] = useState(false);

  // Check for first-time user
  useEffect(() => {
    const hasSeenHint = localStorage.getItem('letgo-drag-hint-seen');
    if (!hasSeenHint) {
      setShowFirstTimeHint(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShowFirstTimeHint(false);
        localStorage.setItem('letgo-drag-hint-seen', 'true');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Motion values for drag
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring physics for smooth return
  const springConfig = { stiffness: 300, damping: 30 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  // Subtle parallax rotation
  const rotateX = useTransform(springY, [-200, 200], [3, -3]);
  const rotateY = useTransform(springX, [-200, 200], [-3, 3]);

  // Scale slightly when dragging
  const scale = useTransform(y, [-100, 0, 300], [1.02, 1, 0.94]);

  // Check if card is over the flame
  const checkFlameCollision = (cardY) => {
    if (!flameRef?.current || !cardRef.current) return false;

    const flameRect = flameRef.current.getBoundingClientRect();
    const cardRect = cardRef.current.getBoundingClientRect();

    const cardBottom = cardRect.bottom;
    const flameTop = flameRect.top - 30;

    return cardBottom > flameTop && cardY > 80;
  };

  // Drag gesture with improved touch handling
  const bind = useDrag(
    ({ active, movement: [mx, my], velocity: [vx, vy], direction: [dx, dy] }) => {
      if (disabled) return;

      setIsDragging(active);

      // Hide first-time hint when user starts dragging
      if (active && showFirstTimeHint) {
        setShowFirstTimeHint(false);
        localStorage.setItem('letgo-drag-hint-seen', 'true');
      }

      if (active) {
        x.set(mx);
        y.set(my);
        onDragStart?.();

        const nearFlame = checkFlameCollision(my);
        setIsNearFlame(nearFlame);

        if (nearFlame) {
          onDragEnd?.(true);
        } else {
          onDragEnd?.(false);
        }
      } else {
        setIsNearFlame(false);
        if (checkFlameCollision(my) && value.trim().length > 0) {
          onBurn?.();
        } else {
          x.set(0);
          y.set(0);
          onDragEnd?.(false);
        }
      }
    },
    {
      from: () => [x.get(), y.get()],
      filterTaps: true,
      rubberband: true,
      // Improved touch settings
      pointer: { touch: true },
      threshold: 5,
    }
  );

  return (
    <motion.div
      ref={cardRef}
      className={`paper-card ${isDragging ? 'dragging' : ''} ${isNearFlame ? 'near-flame' : ''}`}
      style={{
        x: springX,
        y: springY,
        rotateX,
        rotateY,
        scale,
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      role="region"
      aria-label="Thought note - drag to fire to release"
      {...bind()}
    >
      {/* Spiral binding holes */}
      <div className="spiral-holes" aria-hidden="true">
        <div className="spiral-hole" />
        <div className="spiral-hole" />
        <div className="spiral-hole" />
        <div className="spiral-hole" />
        <div className="spiral-hole" />
        <div className="spiral-hole" />
        <div className="spiral-hole" />
        <div className="spiral-hole" />
        <div className="spiral-hole" />
        <div className="spiral-hole" />
      </div>

      {/* Content area */}
      <div className="paper-content">
        {/* Ruled lines */}
        <div className="paper-lines" aria-hidden="true" />

        <textarea
          ref={textareaRef}
          className="paper-textarea"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="Write what you want to let go..."
          autoFocus
          disabled={disabled || isDragging}
          aria-label="Write your thought here"
          aria-describedby="drag-hint"
        />

        {/* Static drag hint */}
        {!isDragging && value.length === 0 && (
          <span id="drag-hint" className="drag-hint">
            <span className="drag-hint-icon">↓</span>
            Drag to fire to release
          </span>
        )}
      </div>

      {/* Drag handle indicator at bottom */}
      <div className={`drag-handle ${showFirstTimeHint ? 'pulse' : ''}`} aria-hidden="true">
        <div className="drag-handle-grip">
          <span className="grip-line" />
          <span className="grip-line" />
          <span className="grip-line" />
        </div>
      </div>

      {/* First-time user tooltip */}
      <AnimatePresence>
        {showFirstTimeHint && (
          <motion.div
            className="first-time-tooltip"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            <span className="tooltip-arrow">↓</span>
            Drag this note into the fire below
          </motion.div>
        )}
      </AnimatePresence>

      {/* Direction arrow when dragging */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            className="drag-direction-arrow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <span className={`direction-arrow ${isNearFlame ? 'near-flame' : ''}`}>
              ↓
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
