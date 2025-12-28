import { forwardRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Flame.css';

const Flame = forwardRef(function Flame({ isExcited }, ref) {
    const [sparks, setSparks] = useState([]);

    // Generate sparks when excited
    useEffect(() => {
        if (!isExcited) return;

        const interval = setInterval(() => {
            const newSpark = {
                id: Date.now() + Math.random(),
                x: Math.random() * 80 - 40,
                delay: Math.random() * 0.15,
            };
            setSparks(prev => [...prev.slice(-15), newSpark]);
        }, 80);

        return () => clearInterval(interval);
    }, [isExcited]);

    // Clean up old sparks
    useEffect(() => {
        if (sparks.length === 0) return;
        const timeout = setTimeout(() => {
            setSparks(prev => prev.slice(1));
        }, 900);
        return () => clearTimeout(timeout);
    }, [sparks.length]);

    return (
        <div
            ref={ref}
            className={`flame-container ${isExcited ? 'excited' : ''}`}
        >
            <div className="flame-wrapper">
                {/* Ground shadow */}
                <div className="ground-shadow" />

                {/* Base glow */}
                <div className="flame-glow" />

                {/* Campfire logs base */}
                <div className="campfire-base">
                    <div className="log" />
                    <div className="log" />
                    <div className="log" />
                    <div className="log" />
                    <div className="log" />
                    <div className="log" />
                </div>

                {/* Fire structure */}
                <div className="fire">
                    {/* Side flames */}
                    <div className="fire-left" />
                    <div className="fire-right" />

                    {/* Main flame body */}
                    <div className="main-fire" />

                    {/* Flame tip */}
                    <div className="flame-tip" />

                    {/* Floating particles */}
                    <div className="particle-fire" />
                    <div className="particle-fire" />
                    <div className="particle-fire" />
                    <div className="particle-fire" />
                </div>

                {/* Dynamic sparks when excited */}
                <AnimatePresence>
                    {sparks.map(spark => (
                        <motion.span
                            key={spark.id}
                            className="spark"
                            initial={{
                                opacity: 1,
                                x: spark.x,
                                y: 0,
                                scale: 1
                            }}
                            animate={{
                                opacity: 0,
                                y: -120,
                                scale: 0
                            }}
                            exit={{ opacity: 0 }}
                            transition={{
                                duration: 0.9,
                                delay: spark.delay,
                                ease: [0.22, 1, 0.36, 1]
                            }}
                            style={{
                                position: 'absolute',
                                bottom: '70%',
                                left: '50%',
                            }}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {!isExcited && (
                <motion.span
                    className="flame-hint"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ delay: 1 }}
                >
                    Drop here to release
                </motion.span>
            )}
        </div>
    );
});

export default Flame;
