"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { slides } from "./slides";

const TOTAL = slides.length;

function animateCountup(el: HTMLElement) {
  const target = parseFloat(el.dataset.cuTarget ?? "0");
  const prefix = el.dataset.cuPrefix ?? "";
  const suffix = el.dataset.cuSuffix ?? "";
  const decimals = parseInt(el.dataset.cuDecimals ?? "0", 10);
  const duration = 1400;
  const startTime = performance.now();
  function tick(now: number) {
    const p = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = prefix + (target * ease).toFixed(decimals) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function splitChars(el: Element) {
  const text = el.textContent ?? "";
  el.textContent = "";
  Array.from(text).forEach((ch, i) => {
    const span = document.createElement("span");
    span.className = "ch";
    span.style.setProperty("--ch-i", String(i));
    span.textContent = ch;
    el.appendChild(span);
  });
}

export default function DeckPresentation() {
  const [current, setCurrent] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const goTo = useCallback((i: number) => {
    if (i < 0 || i >= TOTAL) return;
    setCurrent(i);
  }, []);

  // Scale to fill screen
  useEffect(() => {
    const scale = () => {
      if (!stageRef.current) return;
      const s = Math.max(window.innerWidth / 1920, window.innerHeight / 1080);
      const x = (window.innerWidth - 1920 * s) / 2;
      const y = (window.innerHeight - 1080 * s) / 2;
      stageRef.current.style.transform = `translate(${x}px,${y}px) scale(${s})`;
    };
    scale();
    window.addEventListener("resize", scale);
    return () => window.removeEventListener("resize", scale);
  }, []);

  // Char split on mount
  useEffect(() => {
    document.querySelectorAll("[data-split-chars]").forEach(splitChars);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowRight", "ArrowDown", " "].includes(e.key)) {
        e.preventDefault();
        setCurrent(c => Math.min(c + 1, TOTAL - 1));
      } else if (["ArrowLeft", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        setCurrent(c => Math.max(c - 1, 0));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Touch navigation
  useEffect(() => {
    let tx = 0;
    let ty = 0;
    const onStart = (e: TouchEvent) => {
      tx = e.touches[0].clientX;
      ty = e.touches[0].clientY;
    };
    const onEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - tx;
      const dy = e.changedTouches[0].clientY - ty;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        setCurrent(c => (dx < 0 ? Math.min(c + 1, TOTAL - 1) : Math.max(c - 1, 0)));
      }
    };
    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchend", onEnd);
    };
  }, []);

  // Countup on slide change
  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const slide = document.querySelector(`[data-slide-idx="${current}"]`);
    if (!slide) return;
    slide.querySelectorAll("[data-countup]").forEach(el => {
      const id = setTimeout(() => animateCountup(el as HTMLElement), 700);
      timers.current.push(id);
    });
  }, [current]);

  return (
    <>
      <div className="stage-wrap">
        <div ref={stageRef} className="deck-stage">
          {slides.map((Slide, index) => (
            <Slide key={index} isActive={current === index} />
          ))}
        </div>
      </div>

      <div className="deck-progress-wrap">
        <div className="deck-progress" style={{ width: `${(current / (TOTAL - 1)) * 100}%` }} />
      </div>

      <div className="deck-nav-bar">
        <button className="deck-nav-btn" onClick={() => goTo(current - 1)}>
          ←
        </button>
        <div className="deck-dots">
          {Array.from({ length: TOTAL }, (_, index) => (
            <button
              key={index}
              className={`deck-dot${index === current ? " active" : ""}`}
              onClick={() => goTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        <span className="deck-nav-counter">
          {String(current + 1).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}
        </span>
        <button className="deck-nav-btn" onClick={() => goTo(current + 1)}>
          →
        </button>
      </div>
    </>
  );
}
