"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

export function AnimatedCounter({
  end,
  duration = 2,
  prefix = "",
  suffix = "",
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: NodeJS.Timeout;
    const startValue = 0;
    const range = end - startValue;
    const increment = end / (duration * 60);

    let current = startValue;
    startTime = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(startTime);
      } else {
        setCount(Math.floor(current));
      }
    }, 1000 / 60);

    return () => clearInterval(startTime);
  }, [end, duration]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-4xl md:text-5xl font-bold text-primary-600"
    >
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </motion.div>
  );
}
