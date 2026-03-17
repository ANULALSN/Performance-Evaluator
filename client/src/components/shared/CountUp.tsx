import React, { useEffect, useState } from 'react';
import { motion, animate, useMotionValue, useTransform, useReducedMotion } from 'framer-motion';

interface CountUpProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

const CountUp: React.FC<CountUpProps> = ({ value, duration = 1.2, prefix = '', suffix = '' }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(value);
      return;
    }

    const controls = animate(count, value, { 
      duration, 
      ease: "easeOut" 
    });
    
    return controls.stop;
  }, [value, duration, shouldReduceMotion]);

  useEffect(() => {
    if (shouldReduceMotion) return;
    
    const unsubscribe = rounded.on("change", (latest) => {
      setDisplayValue(latest);
    });
    
    return unsubscribe;
  }, [rounded, shouldReduceMotion]);

  return <span>{prefix}{displayValue}{suffix}</span>;
};

export default CountUp;
