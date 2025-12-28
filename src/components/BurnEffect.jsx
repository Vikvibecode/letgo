import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import './BurnEffect.css';

export default function BurnEffect({ text, onComplete }) {
    const [showSmoke, setShowSmoke] = useState(false);

    // Generate flying embers
    const embers = useMemo(() => {
        return Array.from({ length: 15 }, (_, i) => ({
            id: i,
            left: 20 + Math.random() * 60,
            top: 30 + Math.random() * 40,
            delay: 0.3 + Math.random() * 1,
            flyX: (Math.random() - 0.5) * 100,
            flyY: -60 - Math.random() * 80,
        }));
    }, []);

    // Start smoke after a delay
    useEffect(() => {
        const timer = setTimeout(() => setShowSmoke(true), 300);
        return () => clearTimeout(timer);
    }, []);

    // Complete callback
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete?.();
        }, 2500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <>
            {/* Screen glow/flash */}
            <div className="burn-screen-glow" />

            {/* Main burn overlay */}
            <motion.div
                className="burn-overlay"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="burning-paper"
                    initial={{ scale: 1, opacity: 1, filter: 'brightness(1)' }}
                    animate={{
                        scale: [1, 0.95, 0.85, 0.7, 0],
                        opacity: [1, 0.9, 0.6, 0.3, 0],
                        filter: [
                            'brightness(1)',
                            'brightness(1.2) sepia(0.3)',
                            'brightness(0.8) sepia(0.5)',
                            'brightness(0.4) sepia(0.7)',
                            'brightness(0) sepia(1)',
                        ],
                    }}
                    transition={{
                        duration: 2.5,
                        ease: [0.4, 0, 0.2, 1],
                        times: [0, 0.2, 0.5, 0.75, 1]
                    }}
                >
                    {/* Spiral binding holes */}
                    <div className="burn-spiral-holes" aria-hidden="true">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="burn-spiral-hole" />
                        ))}
                    </div>

                    {/* Ruled lines */}
                    <div className="burn-lines" />

                    {/* Text content */}
                    <div className="burn-text">{text}</div>

                    {/* Smoke wisps */}
                    {showSmoke && (
                        <div className="smoke-container">
                            <div className="smoke" style={{ left: '20%', top: '30%', '--drift': '-25px', animationDelay: '0.2s' }} />
                            <div className="smoke" style={{ left: '50%', top: '20%', '--drift': '20px', animationDelay: '0.4s' }} />
                            <div className="smoke" style={{ left: '75%', top: '35%', '--drift': '-15px', animationDelay: '0.5s' }} />
                            <div className="smoke" style={{ left: '35%', top: '25%', '--drift': '30px', animationDelay: '0.7s' }} />
                        </div>
                    )}

                    {/* Flying embers */}
                    {embers.map(ember => (
                        <span
                            key={ember.id}
                            className="ember"
                            style={{
                                left: `${ember.left}%`,
                                top: `${ember.top}%`,
                                animation: `emberFly 1.5s ease-out ${ember.delay}s forwards`,
                                '--fly-x': `${ember.flyX}px`,
                                '--fly-y': `${ember.flyY}px`,
                            }}
                        />
                    ))}
                </motion.div>
            </motion.div>
        </>
    );
}
