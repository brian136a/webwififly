'use client';

import { useEffect, useState } from 'react';

interface AnimatedCounterProps {
  targetValue: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

export default function AnimatedCounter({
  targetValue,
  duration = 2,
  prefix = '',
  suffix = '',
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    let startTime: number | null = null;
    const durationMs = duration * 1000;

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);

      setDisplayValue(Math.round(targetValue * progress));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [targetValue, duration]);

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}
