import { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
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

  // Drag gesture
  const bind = useDrag(
    ({ active, movement: [mx, my] }) => {
      if (disabled) return;

      setIsDragging(active);

      if (active) {
        x.set(mx);
        y.set(my);
        onDragStart?.();

        if (checkFlameCollision(my)) {
          onDragEnd?.(true);
        } else {
          onDragEnd?.(false);
        }
      } else {
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
    }
  );

  return (
    <motion.div
      ref={cardRef}
      className={`paper-card ${isDragging ? 'dragging' : ''}`}
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

        {!isDragging && value.length === 0 && (
          <span id="drag-hint" className="drag-hint">Drag into the fire to release</span>
        )}
      </div>
    </motion.div>
  );
}
