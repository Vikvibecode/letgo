import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ReleaseState.css';

// Motivational quotes
const QUOTES = [
    "Every ending is a new beginning.",
    "You don't have to carry everything.",
    "Peace comes from letting go.",
    "What you release makes room for what's next.",
    "The past has no power over you.",
    "Breathe. Release. Begin again.",
    "Lightness follows surrender.",
    "You are not your thoughts.",
];

// Breathing phases with proper timing
const BREATHING_PHASES = [
    { text: 'Breathe in', duration: 2000 },
    { text: 'Hold', duration: 2000 },
    { text: 'Breathe out', duration: 2000 },
    { text: 'Rest', duration: 2000 },
];

export default function ReleaseState({ onWriteAgain, releaseCount = 0 }) {
    const [showButton, setShowButton] = useState(false);
    const [breathingPhase, setBreathingPhase] = useState(0);

    // Random quote selection
    const quote = useMemo(() => {
        return QUOTES[Math.floor(Math.random() * QUOTES.length)];
    }, []);

    // Show button after 5 seconds
    useEffect(() => {
        const timer = setTimeout(() => setShowButton(true), 5000);
        return () => clearTimeout(timer);
    }, []);

    // Breathing phase cycle
    useEffect(() => {
        const interval = setInterval(() => {
            setBreathingPhase(prev => (prev + 1) % BREATHING_PHASES.length);
        }, BREATHING_PHASES[breathingPhase].duration);
        return () => clearInterval(interval);
    }, [breathingPhase]);

    return (
        <motion.div
            className="release-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
            {/* Main message */}
            <motion.div
                className="release-text"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
            >
                <h2>It's gone.</h2>
                <p>Take a moment to breathe.</p>
            </motion.div>

            {/* Enhanced Breathing animation */}
            <motion.div
                className="breathing-container"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, duration: 0.8 }}
            >
                {/* Floating particles */}
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="breathing-particle" />
                ))}

                {/* Outer ring */}
                <div className="breathing-ring-outer" />

                {/* Middle ring */}
                <div className="breathing-ring-middle" />

                {/* Main circle */}
                <div className="breathing-circle" />

                {/* Inner core glow */}
                <div className="breathing-core" />

                {/* Instruction text */}
                <AnimatePresence mode="wait">
                    <motion.span
                        className="breathing-instruction"
                        key={breathingPhase}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                    >
                        {BREATHING_PHASES[breathingPhase].text}
                    </motion.span>
                </AnimatePresence>
            </motion.div>

            {/* Motivational quote */}
            <motion.div
                className="motivational-quote"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
            >
                <blockquote>"{quote}"</blockquote>
            </motion.div>

            {/* Release count */}
            {releaseCount > 1 && (
                <motion.div
                    className="release-count"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8, duration: 0.6 }}
                >
                    <strong>{releaseCount}</strong> thoughts released so far
                </motion.div>
            )}

            {/* Write again button */}
            <AnimatePresence>
                {showButton && (
                    <motion.button
                        className="write-again-btn"
                        onClick={onWriteAgain}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Write again
                    </motion.button>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
