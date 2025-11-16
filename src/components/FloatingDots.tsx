"use client";

import { useMemo } from "react";

export function FloatingDots() {
  const dots = useMemo(
    () =>
      Array.from({ length: 20 }).map((_, i) => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 6}s`,
        duration: `${8 + Math.random() * 4}s`,
        opacity: 0.2 + Math.random() * 0.3,
        id: i,
      })),
    []
  );

  return (
    <>
      {dots.map((dot) => (
        <div
          key={dot.id}
          className="absolute w-1 h-1 bg-white/10 rounded-full animate-float"
          style={{
            left: dot.left,
            top: dot.top,
            animationDelay: dot.delay,
            animationDuration: dot.duration,
            opacity: dot.opacity,
          }}
        />
      ))}
    </>
  );
}