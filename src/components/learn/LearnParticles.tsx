"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  hollow: boolean;
  opacity: number;
}

const PARTICLES: Particle[] = [
  { x: 8, y: 14, size: 3, delay: 0, duration: 14, hollow: false, opacity: 0.45 },
  { x: 18, y: 38, size: 2, delay: 1.4, duration: 16, hollow: false, opacity: 0.3 },
  { x: 28, y: 10, size: 4, delay: 0.6, duration: 18, hollow: true, opacity: 0.35 },
  { x: 42, y: 26, size: 2.5, delay: 2.2, duration: 15, hollow: false, opacity: 0.4 },
  { x: 55, y: 8, size: 3, delay: 0.9, duration: 17, hollow: false, opacity: 0.35 },
  { x: 68, y: 32, size: 5, delay: 1.8, duration: 19, hollow: true, opacity: 0.28 },
  { x: 82, y: 18, size: 2, delay: 2.6, duration: 14, hollow: false, opacity: 0.32 },
  { x: 92, y: 44, size: 3, delay: 0.3, duration: 16, hollow: false, opacity: 0.38 },
  { x: 12, y: 62, size: 2, delay: 1.1, duration: 15, hollow: false, opacity: 0.25 },
  { x: 35, y: 72, size: 4, delay: 2, duration: 18, hollow: true, opacity: 0.3 },
  { x: 58, y: 58, size: 2.5, delay: 0.5, duration: 14, hollow: false, opacity: 0.3 },
  { x: 76, y: 68, size: 3, delay: 1.6, duration: 17, hollow: false, opacity: 0.35 },
  { x: 48, y: 88, size: 2, delay: 2.4, duration: 16, hollow: false, opacity: 0.22 },
  { x: 88, y: 82, size: 3.5, delay: 0.8, duration: 19, hollow: true, opacity: 0.26 },
];

export default function LearnParticles() {
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const onMove = (event: MouseEvent) => {
      if (!fieldRef.current) return;
      const x = (event.clientX / window.innerWidth - 0.5) * 12;
      const y = (event.clientY / window.innerHeight - 0.5) * 12;
      fieldRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      ref={fieldRef}
      className="learn-particle-field absolute inset-0 overflow-hidden will-change-transform"
    >
      {PARTICLES.map((particle, index) => (
        <span
          key={index}
          className={`learn-particle-shape ${particle.hollow ? "learn-particle-hollow" : ""}`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            opacity: particle.opacity,
            ["--dur" as string]: `${particle.duration}s`,
            ["--delay" as string]: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
