"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { slides } from "./slides";

type Locale = "en" | "kr";

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
  const [locale, setLocale] = useState<Locale>("kr");
  const [introDismissed, setIntroDismissed] = useState(false);
  const [introReady, setIntroReady] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const introVideoRef = useRef<HTMLVideoElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const copy =
    locale === "kr"
      ? {
          introKicker: "◆ 세일즈 · 2026",
          loading: "불러오는 중...",
          enter: "입장하기",
          skip: "건너뛰기",
          language: "언어",
        }
      : {
          introKicker: "◆ Sales · 2026",
          loading: "Loading...",
          enter: "Click to enter",
          skip: "Skip",
          language: "Language",
        };

  const goTo = useCallback((i: number) => {
    if (i < 0 || i >= TOTAL) return;
    setCurrent(i);
  }, []);

  const dismissIntro = useCallback(() => {
    const video = introVideoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    setIntroDismissed(true);
  }, []);

  const navigateToHomePageIntro = useCallback(() => {
    window.open(`https://app.symoria.io/${locale}`, "_blank", "noopener,noreferrer");
  }, [locale]);

  useEffect(() => {
    if (introDismissed || !introReady) return;
    const video = introVideoRef.current;
    if (!video) return;

    const playPromise = video.play();
    playPromise?.catch(() => {});
  }, [introDismissed, introReady]);

  useEffect(() => {
    if (introDismissed) return;
    const video = introVideoRef.current;
    if (!video) return;

    if (video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
      setIntroReady(true);
      return;
    }

    video.load();
  }, [introDismissed]);

  // Scale to fit screen
  useEffect(() => {
    if (!introDismissed) return;

    const scale = () => {
      if (!stageRef.current) return;
      const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
      const x = (window.innerWidth - 1920 * s) / 2;
      const y = (window.innerHeight - 1080 * s) / 2;
      stageRef.current.style.transform = `translate(${x}px,${y}px) scale(${s})`;
    };
    scale();
    window.addEventListener("resize", scale);
    return () => window.removeEventListener("resize", scale);
  }, [introDismissed]);

  // Char split on mount
  useEffect(() => {
    if (!introDismissed) return;
    document.querySelectorAll("[data-split-chars]").forEach(splitChars);
  }, [introDismissed]);

  // Keyboard navigation
  useEffect(() => {
    if (!introDismissed) return;

    const onKey = (e: KeyboardEvent) => {
      if (["ArrowRight", "ArrowDown", " "].includes(e.key)) {
        e.preventDefault();
        setCurrent((c) => Math.min(c + 1, TOTAL - 1));
      } else if (["ArrowLeft", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        setCurrent((c) => Math.max(c - 1, 0));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [introDismissed]);

  // Touch navigation
  useEffect(() => {
    if (!introDismissed) return;

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
        setCurrent((c) =>
          dx < 0 ? Math.min(c + 1, TOTAL - 1) : Math.max(c - 1, 0),
        );
      }
    };
    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchend", onEnd);
    };
  }, [introDismissed]);

  // Countup on slide change
  useEffect(() => {
    if (!introDismissed) return;

    timers.current.forEach(clearTimeout);
    timers.current = [];
    const slide = stageRef.current?.children.item(
      current,
    ) as HTMLElement | null;
    if (!slide) return;
    slide.querySelectorAll("[data-countup]").forEach((el) => {
      const id = setTimeout(() => animateCountup(el as HTMLElement), 700);
      timers.current.push(id);
    });
  }, [current, introDismissed]);

  return (
    <>
      {!introDismissed && (
        <div className={`app-intro${introReady ? " app-intro-ready" : ""}`}>
          <video
            ref={introVideoRef}
            className={`app-intro-video${introReady ? " app-intro-video-ready" : ""}`}
            src="/assets/landing-video.mp4"
            muted
            loop
            playsInline
            preload="auto"
            onLoadedData={() => setIntroReady(true)}
            onCanPlayThrough={() => setIntroReady(true)}
          />
          <div
            className={`app-intro-loader${introReady ? " app-intro-loader-hidden" : ""}`}
          >
            <div className="app-intro-loader-kicker">{copy.introKicker}</div>
            <div className="app-intro-loader-center">
              <div className="app-intro-loader-subtitle"> SYMORIA </div>
            </div>
            <div className="app-intro-loader-status">{copy.loading}</div>
          </div>

          {introReady && (
            <>
              <div className="app-intro-shade" />
              <div className="app-intro-controls">
                <button className="app-intro-enter" onClick={dismissIntro}>
                  {copy.enter}
                </button>

                <button className="app-intro-skip" onClick={navigateToHomePageIntro}>
                  {copy.skip}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {introDismissed && (
        <>
          <div className="stage-wrap">
            <div ref={stageRef} className="deck-stage">
              {slides.map((Slide, index) => (
                <Slide
                  key={index}
                  isActive={current === index}
                  locale={locale}
                  onAdvance={() => goTo(index + 1)}
                />
              ))}
            </div>
          </div>

          <div className="deck-progress-wrap">
            <div
              className="deck-progress"
              style={{ width: `${(current / (TOTAL - 1)) * 100}%` }}
            />
          </div>

          <div className="deck-nav-bar">
            <button className="deck-nav-btn" onClick={() => goTo(current - 1)}>
              ←
            </button>
            <span className="deck-nav-counter">
              {String(current + 1).padStart(2, "0")} /{" "}
              {String(TOTAL).padStart(2, "0")}
            </span>
            <div className="deck-locale-switch" aria-label={copy.language}>
              <button
                className={`deck-locale-btn${locale === "en" ? " active" : ""}`}
                onClick={() => setLocale("en")}
                type="button"
              >
                EN
              </button>
              <button
                className={`deck-locale-btn${locale === "kr" ? " active" : ""}`}
                onClick={() => setLocale("kr")}
                type="button"
              >
                KR
              </button>
            </div>
            <button className="deck-nav-btn" onClick={() => goTo(current + 1)}>
              →
            </button>
          </div>
        </>
      )}
    </>
  );
}
