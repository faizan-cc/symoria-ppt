"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const TOTAL = 32;

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
    let tx = 0, ty = 0;
    const onStart = (e: TouchEvent) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; };
    const onEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - tx;
      const dy = e.changedTouches[0].clientY - ty;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        setCurrent(c => dx < 0 ? Math.min(c + 1, TOTAL - 1) : Math.max(c - 1, 0));
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

  const s = (i: number) => `deck-slide${current === i ? " deck-active" : ""}`;

  return (
    <>
      <div className="stage-wrap">
        <div ref={stageRef} className="deck-stage">

          {/* SLIDE 0 — COVER */}
          <section data-slide-idx={0} className={s(0)} id="s0" style={{ alignItems: "flex-start", justifyContent: "center" }}>
            <div className="cover-grid" />
            <div className="cover-glow" />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div className="eyebrow">AUTONOMOUS AI · DEFI PLATFORM</div>
              <h1 className="title" data-split-chars>SYMORIA</h1>
              <div className="cover-line" />
              <div className="title-sub">AI-Powered Autonomous Trading &amp; Yield Optimization</div>
              <div className="title-meta">SYMORIA.IO · 2026</div>
            </div>
          </section>

          {/* SLIDE 1 — MARKET */}
          <section data-slide-idx={1} className={s(1)} id="s1">
            <div className="eyebrow">THE OPPORTUNITY</div>
            <h2 className="title">DeFi Is the Fastest-Growing Market in History</h2>
            <div className="card-grid">
              <div className="card" data-stagger-item style={{ "--i": 0 } as React.CSSProperties}>
                <div className="kpi-val" data-countup data-cu-target="3.2" data-cu-prefix="$" data-cu-suffix="T+" data-cu-decimals="1">$0.0T+</div>
                <div className="kpi-label">Total DeFi TVL</div>
              </div>
              <div className="card" data-stagger-item style={{ "--i": 1 } as React.CSSProperties}>
                <div className="kpi-val" data-countup data-cu-target="420" data-cu-suffix="M+" data-cu-decimals="0">0M+</div>
                <div className="kpi-label">Active DeFi Wallets</div>
              </div>
              <div className="card" data-stagger-item style={{ "--i": 2 } as React.CSSProperties}>
                <div className="kpi-val" data-countup data-cu-target="67" data-cu-suffix="%" data-cu-decimals="0">0%</div>
                <div className="kpi-label">Annual Growth Rate</div>
              </div>
            </div>
            <div className="market-quote">&ldquo;DeFi isn&apos;t a trend — it&apos;s the inevitable restructuring of global finance.&rdquo;</div>
          </section>

          {/* SLIDE 2 — PROBLEM */}
          <section data-slide-idx={2} className={s(2)} id="s2" style={{ alignItems: "flex-start" }}>
            <div className="eyebrow">THE PROBLEM</div>
            <div className="paradox-hook">of retail DeFi traders</div>
            <div className="stat-95" data-split-chars>95%</div>
            <h2 className="title" style={{ marginTop: 16 }}>Lose Money Every Year</h2>
            <div className="sub" style={{ marginTop: 20 }}>Emotion, timing errors, and information asymmetry cost retail traders billions. The market doesn&apos;t forgive hesitation.</div>
          </section>

          {/* SLIDE 3 — WHY HUMANS FAIL */}
          <section data-slide-idx={3} className={s(3)} id="s3">
            <div className="eyebrow">WHY HUMANS FAIL</div>
            <h2 className="title">Three Unavoidable Cognitive Limits</h2>
            <div className="card-grid">
              <div className="card" data-stagger-item style={{ "--i": 0 } as React.CSSProperties}>
                <div className="card-icon">😰</div>
                <div className="card-title">Fear &amp; Greed</div>
                <div className="card-body">Panic selling at bottoms, FOMO buying at tops. Emotion is the enemy of alpha.</div>
              </div>
              <div className="card" data-stagger-item style={{ "--i": 1 } as React.CSSProperties}>
                <div className="card-icon">⏰</div>
                <div className="card-title">Timing Blindness</div>
                <div className="card-body">Markets move 24/7. You don&apos;t. Sleep costs you edge.</div>
              </div>
              <div className="card" data-stagger-item style={{ "--i": 2 } as React.CSSProperties}>
                <div className="card-icon">💭</div>
                <div className="card-title">Analysis Paralysis</div>
                <div className="card-body">Too much data, too little action. By the time you decide, the trade is gone.</div>
              </div>
            </div>
          </section>

          {/* SLIDE 4 — WHY BOTS FAIL */}
          <section data-slide-idx={4} className={s(4)} id="s4">
            <div className="eyebrow">WHY BOTS FAIL</div>
            <h2 className="title">Old Automation Is Broken</h2>
            <div className="card-grid">
              <div className="card" data-stagger-item style={{ "--i": 0 } as React.CSSProperties}>
                <div className="card-icon">🔧</div>
                <div className="card-title">Single Strategy</div>
                <div className="card-body">One model, one view. A single point of failure in volatile markets.</div>
              </div>
              <div className="card" data-stagger-item style={{ "--i": 1 } as React.CSSProperties}>
                <div className="card-icon">🎯</div>
                <div className="card-title">No Adaptation</div>
                <div className="card-body">Rigid rules in a dynamic system. Pre-programmed bots get wrecked by regime changes.</div>
              </div>
              <div className="card" data-stagger-item style={{ "--i": 2 } as React.CSSProperties}>
                <div className="card-icon">🔓</div>
                <div className="card-title">Easily Exploited</div>
                <div className="card-body">MEV bots, sandwich attacks, and frontrunning destroy predictable scripts.</div>
              </div>
            </div>
          </section>

          {/* SLIDE 5 — SOLUTION */}
          <section data-slide-idx={5} className={s(5)} id="s5">
            <div className="eyebrow">THE SOLUTION</div>
            <h2 className="title">Meet Symoria: AI That Never Sleeps</h2>
            <div className="ai-row" data-stagger-item style={{ "--i": 0 } as React.CSSProperties}>
              <div className="ai-badge"><div className="ai-badge-name">SCOUT</div><div className="ai-badge-role">Market Discovery</div></div>
              <div className="ai-op">+</div>
              <div className="ai-badge"><div className="ai-badge-name">ANALYST</div><div className="ai-badge-role">Signal Processing</div></div>
              <div className="ai-op">×</div>
              <div className="ai-badge"><div className="ai-badge-name">EXECUTOR</div><div className="ai-badge-role">Trade Execution</div></div>
              <div className="ai-op">∑</div>
              <div className="ai-badge"><div className="ai-badge-name">GUARDIAN</div><div className="ai-badge-role">Risk Management</div></div>
              <div className="ai-op">✓</div>
              <div className="ai-badge"><div className="ai-badge-name">ORACLE</div><div className="ai-badge-role">ZK Verification</div></div>
            </div>
            <div className="consensus-msg">▸ MULTI-AGENT CONSENSUS · EVERY TRADE VERIFIED ON-CHAIN</div>
          </section>

          {/* SLIDE 6 — VS */}
          <section data-slide-idx={6} className={s(6)} id="s6">
            <div className="eyebrow">SYMORIA VS THE REST</div>
            <h2 className="title">Not Another Bot. A Different Paradigm.</h2>
            <div className="vs-wrap">
              <div className="vs-box from-left">
                <div className="vs-head">Traditional Bots</div>
                <div className="vs-item"><span className="vs-x">✗</span> Single strategy</div>
                <div className="vs-item"><span className="vs-x">✗</span> Manual updates required</div>
                <div className="vs-item"><span className="vs-x">✗</span> No on-chain proof</div>
                <div className="vs-item"><span className="vs-x">✗</span> Centralized risk</div>
                <div className="vs-item"><span className="vs-x">✗</span> Opaque decisions</div>
              </div>
              <div className="vs-box vs-right from-right">
                <div className="vs-head">Symoria AI</div>
                <div className="vs-item"><span className="vs-check">✓</span> Multi-agent consensus</div>
                <div className="vs-item"><span className="vs-check">✓</span> Self-adapting models</div>
                <div className="vs-item"><span className="vs-check">✓</span> ZK-verified on-chain</div>
                <div className="vs-item"><span className="vs-check">✓</span> Distributed architecture</div>
                <div className="vs-item"><span className="vs-check">✓</span> Full decision transparency</div>
              </div>
            </div>
          </section>

          {/* SLIDE 7 — AI CONSENSUS */}
          <section data-slide-idx={7} className={s(7)} id="s7">
            <div className="eyebrow">HOW IT WORKS</div>
            <h2 className="title">Consensus Before Every Trade</h2>
            <div className="sub">No single agent controls capital. Every decision requires multi-agent agreement — validated by zero-knowledge proof before execution.</div>
            <div className="card-grid" style={{ marginTop: 48 }}>
              {[["01","Signal Detected"],["02","Agents Deliberate"],["03","Consensus Reached"],["04","ZK Proof Generated"],["05","Executed On-Chain"]].map(([step, title], i) => (
                <div key={step} className={`card${i === 4 ? " card-green" : ""}`} data-stagger-item style={{ "--i": i, textAlign: "center" } as React.CSSProperties}>
                  <div className="card-label">Step {step}</div>
                  <div className="card-title">{title}</div>
                </div>
              ))}
            </div>
          </section>

          {/* SLIDE 8 — YIELD OPTIMIZER */}
          <section data-slide-idx={8} className={s(8)} id="s8">
            <div className="eyebrow">CORE ENGINE 01</div>
            <h2 className="title">Yield Optimizer</h2>
            <div className="sub">Continuously scans 200+ DeFi protocols across 8 chains to compound your capital at maximum safe yield — automatically rebalancing as conditions shift.</div>
            <div className="card-grid">
              {[["200+","Protocols Monitored"],["8","Chains Supported"],["< 2s","Rebalance Speed"]].map(([val, label], i) => (
                <div key={label} className="card card-green" data-stagger-item style={{ "--i": i, textAlign: "center" } as React.CSSProperties}>
                  <div className="kpi-val">{val}</div>
                  <div className="kpi-label">{label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* SLIDE 9 — ARBITRAGE */}
          <section data-slide-idx={9} className={s(9)} id="s9">
            <div className="eyebrow">CORE ENGINE 02</div>
            <h2 className="title">Arbitrage Engine</h2>
            <div className="sub">Detects price inefficiencies across DEXes in real time. Executes flash-loan-powered arbitrage with zero capital at risk — profits are pure delta.</div>
            <div className="card-grid">
              {[["50ms","Execution Speed"],["0","Capital at Risk"],["$2.4M","Monthly Arb Volume"]].map(([val, label], i) => (
                <div key={label} className="card card-green" data-stagger-item style={{ "--i": i, textAlign: "center" } as React.CSSProperties}>
                  <div className="kpi-val">{val}</div>
                  <div className="kpi-label">{label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* SLIDE 10 — PORTFOLIO REPLICATOR */}
          <section data-slide-idx={10} className={s(10)} id="s10">
            <div className="eyebrow">CORE ENGINE 03</div>
            <h2 className="title">Portfolio Replicator</h2>
            <div className="sub">Mirror on-chain wallets of verified top traders with customizable lag, risk limits, and position sizing — automated, non-custodial.</div>
            <div className="card-grid">
              {[["500+","Elite Wallets Tracked"],["Custom","Risk Limits"],["Non-custodial","Self-Sovereign"]].map(([val, label], i) => (
                <div key={label} className="card card-green" data-stagger-item style={{ "--i": i, textAlign: "center" } as React.CSSProperties}>
                  <div className="kpi-val" style={{ fontSize: i === 2 ? 42 : undefined }}>{val}</div>
                  <div className="kpi-label">{label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* SLIDE 11 — ZK VERIFICATION */}
          <section data-slide-idx={11} className={s(11)} id="s11">
            <div className="eyebrow">TRUSTLESS BY DESIGN</div>
            <h2 className="title">Zero-Knowledge Proof on Every Trade</h2>
            <div className="sub">Every decision Symoria makes is cryptographically proven on-chain. You never have to trust us — the math speaks for itself.</div>
            <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "1fr auto", gap: 60, alignItems: "center" }}>
              <div className="zk-diagram from-left">
                <div className="zk-node">Agent Decision</div>
                <div className="zk-arrow">→</div>
                <div className="zk-node">ZK Circuit</div>
                <div className="zk-arrow">→</div>
                <div className="zk-node">On-Chain Proof</div>
                <div className="zk-arrow">→</div>
                <div className="zk-node">Verified Execution</div>
              </div>
              <div className="from-right" style={{ maxWidth: 380 }}>
                <div className="zk-truth">No black box.<br />No blind trust.<br />Full verifiability.</div>
              </div>
            </div>
          </section>

          {/* SLIDE 12 — MULTI-CHAIN */}
          <section data-slide-idx={12} className={s(12)} id="s12">
            <div className="eyebrow">MULTI-CHAIN NATIVE</div>
            <h2 className="title">One Platform. Eight Chains.</h2>
            <div className="chain-grid">
              {[["#627EEA","Ethereum"],["#0052FF","Base"],["#28A0F0","Arbitrum"],["#FF0420","Optimism"],["#8247E5","Polygon"],["#E84142","Avalanche"],["#F3BA2F","BNB Chain"],["#9945FF","Solana"]].map(([color, name], i) => (
                <div key={name} className="chain-card" data-stagger-item style={{ "--i": i } as React.CSSProperties}>
                  <div className="chain-dot" style={{ background: color }} />
                  <div className="chain-name">{name}</div>
                </div>
              ))}
            </div>
          </section>

          {/* SLIDE 13 — PERFORMANCE */}
          <section data-slide-idx={13} className={s(13)} id="s13">
            <div className="eyebrow">TRACK RECORD</div>
            <h2 className="title">Six Months. Consistent Alpha.</h2>
            <div className="perf-grid">
              {[["NOV","+18.4%"],["DEC","+22.1%"],["JAN","+31.7%"],["FEB","+19.3%"],["MAR","+27.8%"],["APR","+24.6%"]].map(([month, val], i) => (
                <div key={month} className="perf-card" data-stagger-item style={{ "--i": i } as React.CSSProperties}>
                  <div className="perf-month">{month}</div>
                  <div className="perf-val">{val}</div>
                </div>
              ))}
            </div>
            <div className="sub" style={{ marginTop: 32, fontSize: 18 }}>All figures net of fees. Past performance does not guarantee future results.</div>
          </section>

          {/* SLIDE 14 — CAPITAL SIMULATION */}
          <section data-slide-idx={14} className={s(14)} id="s14">
            <div className="eyebrow">CAPITAL SIMULATION</div>
            <h2 className="title">What $10,000 Becomes</h2>
            <div className="sim-grid">
              <div className="sim-card" data-stagger-item style={{ "--i": 0 } as React.CSSProperties}>
                <div className="sim-label">CONSERVATIVE</div>
                <div className="sim-rate">15% avg/month</div>
                <div className="sim-val">$10K → $44K</div>
                <div className="sim-desc">in 12 months</div>
              </div>
              <div className="sim-card" data-stagger-item style={{ "--i": 1, borderColor: "rgba(0,255,136,0.3)", background: "rgba(0,255,136,0.04)" } as React.CSSProperties}>
                <div className="sim-label">MODERATE</div>
                <div className="sim-rate">22% avg/month</div>
                <div className="sim-val">$10K → $87K</div>
                <div className="sim-desc">in 12 months</div>
              </div>
              <div className="sim-card" data-stagger-item style={{ "--i": 2 } as React.CSSProperties}>
                <div className="sim-label">AGGRESSIVE</div>
                <div className="sim-rate">30% avg/month</div>
                <div className="sim-val">$10K → $137K</div>
                <div className="sim-desc">in 12 months</div>
              </div>
            </div>
            <div className="sub" style={{ marginTop: 28, fontSize: 16, opacity: 0.5 }}>Simulated projections based on historical performance. Not financial advice.</div>
          </section>

          {/* SLIDE 15 — TIME FREEDOM */}
          <section data-slide-idx={15} className={s(15)} id="s15">
            <div className="eyebrow">PASSIVE INCOME</div>
            <h2 className="title">Earn While You Live</h2>
            <div className="two-col">
              <div className="from-left">
                <div className="col-label">Your time back</div>
                <div className="col-body">Symoria runs 24/7 so you don&apos;t have to. Set your risk tolerance, deposit capital, and let the AI handle everything else.</div>
              </div>
              <div className="from-right">
                <div className="col-stat-list">
                  <div className="col-stat"><div className="col-stat-val">24/7</div><div className="col-stat-label">Operation</div></div>
                  <div className="col-stat"><div className="col-stat-val">0 Hours</div><div className="col-stat-label">Required from you</div></div>
                  <div className="col-stat"><div className="col-stat-val">100%</div><div className="col-stat-label">Non-Custodial</div></div>
                </div>
              </div>
            </div>
          </section>

          {/* SLIDE 16 — ASSET SOVEREIGNTY */}
          <section data-slide-idx={16} className={s(16)} id="s16">
            <div className="eyebrow">SELF-CUSTODY</div>
            <h2 className="title">Your Keys. Your Capital. Always.</h2>
            <div className="sub">Symoria never holds your assets. Smart contracts execute trades on your behalf, but ownership never leaves your wallet.</div>
            <div className="card-grid">
              {[["🔑","Non-Custodial"],["⚡","Permission-less"],["🔍","On-Chain Verifiable"]].map(([icon, title], i) => (
                <div key={title} className="card card-green" data-stagger-item style={{ "--i": i, textAlign: "center" } as React.CSSProperties}>
                  <div className="card-icon">{icon}</div>
                  <div className="card-title">{title}</div>
                </div>
              ))}
            </div>
          </section>

          {/* SLIDE 17 — ROADMAP */}
          <section data-slide-idx={17} className={s(17)} id="s17">
            <div className="eyebrow">ROADMAP</div>
            <h2 className="title">Building the Autonomous Finance Layer</h2>
            <div className="roadmap-line">
              {[["Q1 2026","Core AI Agents Live"],["Q2 2026","ZK Verification Layer"],["Q3 2026","Multi-Chain Expansion"],["Q4 2026","Portfolio Replicator Beta"],["Q1 2027","Decentralized Governance"]].map(([label, title], i) => (
                <div key={label} className="rm-step" data-stagger-item style={{ "--i": i } as React.CSSProperties}>
                  <div className="rm-dot" />
                  <div className="rm-label">{label}</div>
                  <div className="rm-title">{title}</div>
                </div>
              ))}
            </div>
          </section>

          {/* SLIDE 18 — ECOSYSTEM */}
          <section data-slide-idx={18} className={s(18)} id="s18">
            <div className="eyebrow">ECOSYSTEM</div>
            <h2 className="title">Integrated Across DeFi</h2>
            <div className="eco-row" data-stagger-item style={{ "--i": 0 } as React.CSSProperties}>
              <div className="eco-row-label">DEX Integrations</div>
              {["Uniswap","Curve","Balancer","dYdX","GMX"].map(t => <div key={t} className="eco-tag">{t}</div>)}
            </div>
            <div className="eco-row" data-stagger-item style={{ "--i": 1 } as React.CSSProperties}>
              <div className="eco-row-label">Chain Infrastructure</div>
              {["Chainlink","The Graph","Alchemy","Infura"].map(t => <div key={t} className="eco-tag">{t}</div>)}
            </div>
            <div className="eco-row" data-stagger-item style={{ "--i": 2 } as React.CSSProperties}>
              <div className="eco-row-label">Security Auditors</div>
              {["OpenZeppelin","Trail of Bits","Certik"].map(t => <div key={t} className="eco-tag">{t}</div>)}
            </div>
          </section>

          {/* SLIDE 19 — MEMBERSHIP TIERS */}
          <section data-slide-idx={19} className={s(19)} id="s19">
            <div className="eyebrow">ACCESS TIERS</div>
            <h2 className="title">Choose Your Level</h2>
            <div className="tier-grid">
              <div className="tier-card" data-stagger-item style={{ "--i": 0 } as React.CSSProperties}>
                <div className="tier-name">SCOUT</div>
                <div className="tier-price">Free</div>
                <div className="tier-feat">Paper trading<br />1 strategy<br />Community access</div>
              </div>
              <div className="tier-card tier-featured" data-stagger-item style={{ "--i": 1 } as React.CSSProperties}>
                <div className="tier-name">SIGNAL</div>
                <div className="tier-price">$99/mo</div>
                <div className="tier-feat">Live trading<br />3 strategies<br />Priority support</div>
              </div>
              <div className="tier-card" data-stagger-item style={{ "--i": 2 } as React.CSSProperties}>
                <div className="tier-name">APEX</div>
                <div className="tier-price">$299/mo</div>
                <div className="tier-feat">All engines<br />Unlimited strategies<br />Dedicated support<br />Early features</div>
              </div>
            </div>
          </section>

          {/* SLIDE 20 — PRICING */}
          <section data-slide-idx={20} className={s(20)} id="s20">
            <div className="eyebrow">TRANSPARENT PRICING</div>
            <h2 className="title">No Hidden Fees. Ever.</h2>
            <div className="pricing-grid">
              <div className="pricing-box from-left">
                <div className="pricing-type">SUBSCRIPTION</div>
                <div className="pricing-headline">Flat monthly fee.</div>
                <div className="pricing-body">No percentage of profits taken. Pay once, access everything in your tier.</div>
              </div>
              <div className="pricing-box from-right">
                <div className="pricing-type">PERFORMANCE</div>
                <div className="pricing-headline">0% performance fee.</div>
                <div className="pricing-body">Your gains are yours. We don&apos;t profit from your success.</div>
              </div>
            </div>
            <div className="sub" style={{ marginTop: 32, fontSize: 18 }}>Symoria earns through subscriptions, not by skimming your alpha.</div>
          </section>

          {/* SLIDE 21 — REFERRAL */}
          <section data-slide-idx={21} className={s(21)} id="s21">
            <div className="eyebrow">REFERRAL PROGRAM</div>
            <h2 className="title">Grow Together. Earn Together.</h2>
            <div className="ref-steps">
              <div className="ref-step" data-stagger-item style={{ "--i": 0 } as React.CSSProperties}>
                <div className="ref-num">01</div>
                <div className="ref-title">Share your link</div>
                <div className="ref-body">Get your unique referral URL from the dashboard</div>
              </div>
              <div className="ref-arrow">→</div>
              <div className="ref-step" data-stagger-item style={{ "--i": 1 } as React.CSSProperties}>
                <div className="ref-num">02</div>
                <div className="ref-title">Friend signs up</div>
                <div className="ref-body">They subscribe to any paid plan</div>
              </div>
              <div className="ref-arrow">→</div>
              <div className="ref-step" data-stagger-item style={{ "--i": 2 } as React.CSSProperties}>
                <div className="ref-num">03</div>
                <div className="ref-title">You earn 20%</div>
                <div className="ref-body">Recurring monthly commission, forever</div>
              </div>
            </div>
            <div className="consensus-msg" style={{ marginTop: 40 }}>▸ UNLIMITED REFERRALS · PAID IN USDC · MONTHLY</div>
          </section>

          {/* SLIDE 22 — COMMUNITY */}
          <section data-slide-idx={22} className={s(22)} id="s22">
            <div className="eyebrow">JOIN THE MOVEMENT</div>
            <h2 className="title">50,000+ Traders. One Mission.</h2>
            <div className="comm-grid">
              <div className="comm-card" data-stagger-item style={{ "--i": 0 } as React.CSSProperties}>
                <div className="comm-val" data-countup data-cu-target="47" data-cu-suffix="K+" data-cu-decimals="0">0K+</div>
                <div className="comm-label">Telegram Members</div>
              </div>
              <div className="comm-card" data-stagger-item style={{ "--i": 1 } as React.CSSProperties}>
                <div className="comm-val" data-countup data-cu-target="31" data-cu-suffix="K+" data-cu-decimals="0">0K+</div>
                <div className="comm-label">X Followers</div>
              </div>
              <div className="comm-card" data-stagger-item style={{ "--i": 2 } as React.CSSProperties}>
                <div className="comm-val" data-countup data-cu-target="12" data-cu-suffix="K+" data-cu-decimals="0">0K+</div>
                <div className="comm-label">Active Traders</div>
              </div>
            </div>
            <div className="comm-cta">
              <a href="https://t.me/symoriaio" target="_blank" rel="noopener noreferrer" className="comm-btn">Join Telegram</a>
              <a href="https://x.com/symoriaio" target="_blank" rel="noopener noreferrer" className="comm-btn">Follow on X</a>
            </div>
          </section>

          {/* SLIDE 23 — SECURITY */}
          <section data-slide-idx={23} className={s(23)} id="s23">
            <div className="eyebrow">SECURITY FIRST</div>
            <h2 className="title">Audited. Verified. Trustless.</h2>
            <div className="sec-grid">
              <div className="sec-card" data-stagger-item style={{ "--i": 0 } as React.CSSProperties}>
                <div className="sec-icon">🛡️</div>
                <div className="sec-title">Smart Contract Audits</div>
                <div className="sec-body">OpenZeppelin certified. Every line reviewed, every function tested.</div>
              </div>
              <div className="sec-card" data-stagger-item style={{ "--i": 1 } as React.CSSProperties}>
                <div className="sec-icon">🔐</div>
                <div className="sec-title">ZK-Proof Engine</div>
                <div className="sec-body">Every trade cryptographically verified. No black box.</div>
              </div>
              <div className="sec-card" data-stagger-item style={{ "--i": 2 } as React.CSSProperties}>
                <div className="sec-icon">🎯</div>
                <div className="sec-title">Bug Bounty</div>
                <div className="sec-body">$500K active bounty program. We pay for your vigilance.</div>
              </div>
            </div>
          </section>

          {/* SLIDE 24 — TEAM */}
          <section data-slide-idx={24} className={s(24)} id="s24">
            <div className="eyebrow">CORE TEAM</div>
            <h2 className="title">Built by DeFi Veterans</h2>
            <div className="team-grid">
              {[["A","Alex K.","CEO & AI ARCHITECT","Ex-Google DeepMind"],["M","Mia Chen","CTO","Ex-Ethereum Foundation"],["R","Raj Patel","HEAD OF QUANT","Ex-Two Sigma"],["S","Sara Liu","HEAD OF SECURITY","Ex-Trail of Bits"]].map(([av, name, role, prev], i) => (
                <div key={name} className="team-card" data-stagger-item style={{ "--i": i } as React.CSSProperties}>
                  <div className="team-avatar">{av}</div>
                  <div className="team-name">{name}</div>
                  <div className="team-role">{role}</div>
                  <div className="team-prev">{prev}</div>
                </div>
              ))}
            </div>
          </section>

          {/* SLIDE 25 — TOKENOMICS */}
          <section data-slide-idx={25} className={s(25)} id="s25">
            <div className="eyebrow">SYM TOKEN</div>
            <h2 className="title">The Fuel of Autonomous Finance</h2>
            <div className="sub">SYM powers fee discounts, governance voting, and staking rewards within the Symoria ecosystem.</div>
            <div className="token-grid">
              {[["40%","Community & Ecosystem"],["20%","Team (4yr vesting)"],["20%","Treasury"],["20%","Early Investors"]].map(([pct, label], i) => (
                <div key={label} className="token-card" data-stagger-item style={{ "--i": i } as React.CSSProperties}>
                  <div className="token-pct">{pct}</div>
                  <div className="token-label">{label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* SLIDE 26 — WHY NOW */}
          <section data-slide-idx={26} className={s(26)} id="s26">
            <div className="eyebrow">TIMING</div>
            <h2 className="title">The Perfect Convergence</h2>
            <div className="two-col" style={{ marginTop: 56 }}>
              <div className="from-left">
                <ul className="why-list">
                  <li>DeFi TVL rebounds to $3T+</li>
                  <li>AI models hit inflection point</li>
                  <li>ZK tech now viable at scale</li>
                  <li>Retail demands smarter tools</li>
                </ul>
              </div>
              <div className="from-right" style={{ display: "flex", alignItems: "center" }}>
                <div className="why-window">The window is open.<br />For now.</div>
              </div>
            </div>
          </section>

          {/* SLIDE 27 — FAQ */}
          <section data-slide-idx={27} className={s(27)} id="s27">
            <div className="eyebrow">FAQ</div>
            <h2 className="title">Common Questions</h2>
            <div className="faq-grid">
              {[
                ["Is my capital safe?","Symoria is non-custodial. Your keys, your assets. We never hold your funds."],
                ["What are the risks?","DeFi involves smart contract and market risk. Start small and understand what you're deploying."],
                ["Which wallets work?","MetaMask, WalletConnect, Ledger, and all EVM-compatible wallets are fully supported."],
                ["Can I withdraw anytime?","Yes. No lockups. Full liquidity, always. Your capital is never locked."],
              ].map(([q, a], i) => (
                <div key={q} className="faq-card" data-stagger-item style={{ "--i": i } as React.CSSProperties}>
                  <div className="faq-q">{q}</div>
                  <div className="faq-a">{a}</div>
                </div>
              ))}
            </div>
          </section>

          {/* SLIDE 28 — TVL GROWTH */}
          <section data-slide-idx={28} className={s(28)} id="s28">
            <div className="eyebrow">GROWTH</div>
            <h2 className="title">Symoria TVL: 0 → $48M in 6 Months</h2>
            <div className="bar-grid">
              {[["$0.8M",40],["$4.2M",100],["$11.7M",190],["$22.3M",270],["$35.1M",340],["$48.4M",400]].map(([val, h], i) => (
                <div key={val} className="bar-col" data-stagger-item style={{ "--i": i } as React.CSSProperties}>
                  <div className="bar-val">{val}</div>
                  <div className="bar-bar" style={{ height: h }} />
                  <div className="bar-label">Month {i + 1}</div>
                </div>
              ))}
            </div>
            <div className="sub" style={{ marginTop: 28, fontSize: 18 }}>Organic growth. No VCs. No paid TVL.</div>
          </section>

          {/* SLIDE 29 — LEGAL */}
          <section data-slide-idx={29} className={s(29)} id="s29">
            <div className="eyebrow">LEGAL</div>
            <h2 className="title">Important Disclosures</h2>
            <div className="legal-body">
              <p>Symoria is a non-custodial AI-powered DeFi automation platform. We do not hold, manage, or control user assets at any time. All trade execution occurs via smart contracts deployed on public blockchains, initiated by user-authorized transactions.</p>
              <p>Nothing in this presentation constitutes financial, investment, legal, or tax advice. All performance data presented is historical or simulated and does not guarantee future results. DeFi markets are highly volatile and may result in partial or total loss of capital.</p>
              <p>Users are responsible for complying with applicable laws and regulations in their jurisdiction. Symoria does not offer services in jurisdictions where such services are prohibited by law, including but not limited to the United States of America.</p>
              <p>Smart contract risk, market risk, liquidity risk, and regulatory risk are inherent to all DeFi activities. Please conduct independent due diligence before using any financial protocol.</p>
            </div>
          </section>

          {/* SLIDE 30 — CTA */}
          <section data-slide-idx={30} className={s(30)} id="s30">
            <div className="eyebrow">GET STARTED</div>
            <h2 className="title">Your Portfolio. Running Itself.</h2>
            <div className="two-col">
              <div className="from-left">
                <div className="col-stat-list">
                  <div className="col-stat">
                    <div className="col-stat-val" data-countup data-cu-target="48" data-cu-prefix="$" data-cu-suffix="M TVL" data-cu-decimals="0">$0M TVL</div>
                    <div className="col-stat-label">Total Value Locked</div>
                  </div>
                  <div className="col-stat">
                    <div className="col-stat-val" data-countup data-cu-target="12400" data-cu-suffix=" Users" data-cu-decimals="0">0 Users</div>
                    <div className="col-stat-label">Active Traders</div>
                  </div>
                  <div className="col-stat">
                    <div className="col-stat-val" data-countup data-cu-target="2.4" data-cu-prefix="$" data-cu-suffix="M/mo" data-cu-decimals="1">$0.0M/mo</div>
                    <div className="col-stat-label">Monthly Volume</div>
                  </div>
                </div>
              </div>
              <div className="from-right" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center" }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: 100, fontWeight: 600, color: "var(--green)", lineHeight: 1 }}>SYM.</div>
                <div style={{ fontSize: 24, fontWeight: 300, color: "rgba(255,255,255,0.5)", marginTop: 16, marginBottom: 32 }}>Autonomous AI · DeFi · 2026</div>
                <div style={{ display: "flex", gap: 16 }}>
                  <a href="https://symoria.io" target="_blank" rel="noopener noreferrer" className="comm-btn">symoria.io</a>
                  <a href="https://x.com/symoriaio" target="_blank" rel="noopener noreferrer" className="comm-btn">@symoria_ai</a>
                </div>
              </div>
            </div>
            <div className="cta-code-box">&gt; symoria.io/start</div>
          </section>

          {/* SLIDE 31 — THANK YOU */}
          <section data-slide-idx={31} className={s(31)} id="s31">
            <div className="end-glow" />
            <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
              <div className="end-mark">SYMORIA <em>AI</em></div>
              <div className="end-msg">Your portfolio.<br />Running itself.</div>
              <div className="end-meta">THANK YOU · SYMORIA.IO · 2026</div>
            </div>
          </section>

        </div>
      </div>

      {/* Progress bar */}
      <div className="deck-progress-wrap">
        <div className="deck-progress" style={{ width: `${(current / (TOTAL - 1)) * 100}%` }} />
      </div>

      {/* Nav bar */}
      <div className="deck-nav-bar">
        <button className="deck-nav-btn" onClick={() => goTo(current - 1)}>←</button>
        <div className="deck-dots">
          {Array.from({ length: TOTAL }, (_, i) => (
            <button
              key={i}
              className={`deck-dot${i === current ? " active" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
        <span className="deck-nav-counter">
          {String(current + 1).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}
        </span>
        <button className="deck-nav-btn" onClick={() => goTo(current + 1)}>→</button>
      </div>
    </>
  );
}
