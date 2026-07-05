"use client";

import { useEffect, useRef } from "react";

export default function LearnCursor() {
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const prefersFinePointer = window.matchMedia("(pointer: fine)").matches;

    if (prefersReducedMotion || !prefersFinePointer) return;

    document.documentElement.classList.add("learn-custom-cursor-active");

    let x = 0;
    let y = 0;
    let frameX = 0;
    let frameY = 0;
    let spread = 10;
    let currentSpread = 10;
    let raf = 0;

    const onMove = (event: MouseEvent) => {
      x = event.clientX;
      y = event.clientY;
    };

    const onOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const hovering = Boolean(
        target.closest("a, button, [role='button'], input, textarea, select, label")
      );
      spread = hovering ? 17 : 10;
      if (frameRef.current) {
        frameRef.current.dataset.hover = hovering ? "true" : "false";
      }
    };

    const animate = () => {
      frameX += (x - frameX) * 0.2;
      frameY += (y - frameY) * 0.2;
      currentSpread += (spread - currentSpread) * 0.14;

      if (frameRef.current) {
        frameRef.current.style.transform = `translate3d(${frameX}px, ${frameY}px, 0)`;
        frameRef.current.style.setProperty("--spread", `${currentSpread}px`);
      }

      raf = window.requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    raf = window.requestAnimationFrame(animate);

    return () => {
      document.documentElement.classList.remove("learn-custom-cursor-active");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={frameRef} className="learn-cursor-frame" aria-hidden>
      <span className="learn-cursor-corner learn-cursor-corner-tl" />
      <span className="learn-cursor-corner learn-cursor-corner-tr" />
      <span className="learn-cursor-corner learn-cursor-corner-bl" />
      <span className="learn-cursor-corner learn-cursor-corner-br" />
      <span className="learn-cursor-mark" />
    </div>
  );
}
