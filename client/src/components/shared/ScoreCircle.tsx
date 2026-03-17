import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate, useReducedMotion } from 'framer-motion';

interface ScoreCircleProps {
    score: number;
    color?: string;
    size?: number;
}

const ScoreCircle: React.FC<ScoreCircleProps> = ({ score, color = '#10b981', size = 160 }) => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeValue = useMotionValue(circumference);
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest));
    const [displayScore, setDisplayScore] = useState(0);
    const shouldReduceMotion = useReducedMotion();

    useEffect(() => {
        if (shouldReduceMotion) {
            strokeValue.set(circumference * (1 - score / 100));
            setDisplayScore(score);
            return;
        }

        const strokeAnimation = animate(strokeValue, circumference * (1 - score / 100), {
            duration: 1.5,
            ease: "easeOut"
        });

        const countAnimation = animate(count, score, {
            duration: 1.5,
            ease: "easeOut"
        });

        const unsubscribe = rounded.on("change", (latest) => setDisplayScore(latest));

        return () => {
            strokeAnimation.stop();
            countAnimation.stop();
            unsubscribe();
        };
    }, [score, circumference, shouldReduceMotion]);

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox="0 0 160 160" className="-rotate-90">
                {/* Background Circle */}
                <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="12"
                />
                {/* Progress Circle */}
                <motion.circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke={color}
                    strokeWidth="12"
                    strokeLinecap="round"
                    style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: strokeValue
                    }}
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                <motion.span className="text-4xl font-black font-outfit tracking-tighter">
                    {displayScore}%
                </motion.span>
                <span className="text-[10px] uppercase font-black tracking-widest text-text-muted opacity-40">Accuracy</span>
            </div>
        </div>
    );
};

export default ScoreCircle;
