"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";

/* ─────────────────────────────────────────────
   Dashboard Preview — Animated live mockup
   ───────────────────────────────────────────── */

const agentData = [
  {
    name: "research-bot",
    model: "gpt-4o",
    tokens: "142K",
    cost: 12.47,
    dotColor: "bg-sky-400/70",
    costColor: "text-sky-400/70",
  },
  {
    name: "writer-agent",
    model: "claude-3.5-sonnet",
    tokens: "85K",
    cost: 8.32,
    dotColor: "bg-violet-400/70",
    costColor: "text-violet-400/70",
  },
  {
    name: "code-gen",
    model: "gpt-4o-mini",
    tokens: "312K",
    cost: 1.05,
    dotColor: "bg-emerald-400/70",
    costColor: "text-emerald-400/70",
  },
  {
    name: "router",
    model: "gpt-4o-mini",
    tokens: "28K",
    cost: 0.14,
    dotColor: "bg-amber-400/70",
    costColor: "text-amber-400/70",
  },
];

const chartPath =
  "M 0 14 C 25 14, 45 22, 66 22 C 87 22, 110 32, 133 32 C 156 32, 178 24, 200 24 C 222 24, 248 40, 266 40 C 284 40, 312 55, 333 55 C 354 55, 382 68, 400 68";
const chartFillPath =
  "M 0 14 C 25 14, 45 22, 66 22 C 87 22, 110 32, 133 32 C 156 32, 178 24, 200 24 C 222 24, 248 40, 266 40 C 284 40, 312 55, 333 55 C 354 55, 382 68, 400 68 L 400 80 L 0 80 Z";

function AnimatedChart() {
  return (
    <svg
      viewBox="0 0 400 80"
      className="w-full h-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="heroChartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(14,165,233,0.12)" />
          <stop offset="100%" stopColor="rgba(14,165,233,0)" />
        </linearGradient>
      </defs>
      <path
        d={chartFillPath}
        fill="url(#heroChartGrad)"
        className="animate-chart-fill"
      />
      <path
        d={chartPath}
        fill="none"
        stroke="rgba(14,165,233,0.45)"
        strokeWidth="2"
        strokeLinecap="round"
        className="animate-chart-draw"
      />
      {/* End dot */}
      <circle
        cx="400"
        cy="68"
        r="3"
        fill="rgba(14,165,233,0.6)"
        className="animate-chart-fill"
      />
      <circle
        cx="400"
        cy="68"
        r="6"
        fill="rgba(14,165,233,0.15)"
        className="animate-chart-fill"
      />
    </svg>
  );
}

function DashboardPreview() {
  const [visibleRows, setVisibleRows] = useState(0);

  useEffect(() => {
    if (visibleRows >= agentData.length) return;
    const timer = setTimeout(() => setVisibleRows((v) => v + 1), 600);
    return () => clearTimeout(timer);
  }, [visibleRows]);

  const totalCost = useMemo(
    () => agentData.slice(0, visibleRows).reduce((sum, a) => sum + a.cost, 0),
    [visibleRows],
  );

  return (
    <div className="relative rounded-2xl border border-white/8 bg-[#0c0c0e]/90 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/60">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-sky-500/30 to-transparent" />

      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/1.5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]/80" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]/80" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]/80" />
          </div>
          <span className="ml-3 text-xs text-neutral-600 font-mono">
            AgentCost Dashboard
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[10px] text-neutral-700 font-mono">live</span>
        </div>
      </div>

      {/* Chart area */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-neutral-600 font-mono uppercase tracking-wider">
            Cost Trend (7d)
          </span>
          <span className="text-[11px] text-emerald-400/60 font-mono">
            ↓ 18%
          </span>
        </div>
        <div className="h-16 w-full">
          <AnimatedChart />
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-white/4" />

      {/* Agent rows */}
      <div className="px-5 py-3 space-y-0">
        {/* Header */}
        <div className="flex items-center text-[10px] text-neutral-700 font-mono uppercase tracking-wider mb-2">
          <span className="flex-1">Agent</span>
          <span className="w-28 text-right hidden sm:block">Model</span>
          <span className="w-14 text-right">Tokens</span>
          <span className="w-16 text-right">Cost</span>
        </div>
        {agentData.slice(0, visibleRows).map((agent) => (
          <motion.div
            key={agent.name}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center text-[12px] font-mono py-1.5"
          >
            <span className="flex-1 flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${agent.dotColor}`} />
              <span className="text-neutral-400">{agent.name}</span>
            </span>
            <span className="w-28 text-right text-neutral-600 hidden sm:block">
              {agent.model}
            </span>
            <span className="w-14 text-right text-neutral-600">
              {agent.tokens}
            </span>
            <span className={`w-16 text-right ${agent.costColor}`}>
              ${agent.cost.toFixed(2)}
            </span>
          </motion.div>
        ))}
        {visibleRows < agentData.length && (
          <div className="flex items-center gap-1.5 py-1.5">
            <span className="inline-block w-1.5 h-3 bg-sky-400/50 animate-pulse rounded-sm" />
            <span className="text-[11px] text-neutral-700 font-mono">
              processing...
            </span>
          </div>
        )}
      </div>

      {/* Total bar */}
      {visibleRows > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-5 mt-1 mb-4 px-0 py-3 border-t border-white/4 flex items-center justify-between font-mono text-[12px]"
        >
          <span className="text-neutral-500">Total today</span>
          <motion.span
            key={totalCost.toFixed(2)}
            initial={{ opacity: 0.5, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white font-medium"
          >
            ${totalCost.toFixed(2)}
          </motion.span>
        </motion.div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Avatar row
   ───────────────────────────────────────────── */
const avatarColors = [
  "bg-neutral-700",
  "bg-neutral-600",
  "bg-neutral-700",
  "bg-neutral-600",
  "bg-neutral-700",
];
const avatarInitials = ["A", "K", "R", "M", "L"];

/* ─────────────────────────────────────────────
   Hero Section
   ───────────────────────────────────────────── */
export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* ── Background layers ── */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 pointer-events-none"
        aria-hidden
      >
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Aurora gradient blobs */}
        <div className="absolute top-[8%] -left-32 w-150 h-150 bg-sky-600/7 rounded-full blur-[150px] animate-aurora-1" />
        <div className="absolute top-[25%] right-[-5%] w-125 h-125 bg-indigo-500/5 rounded-full blur-[130px] animate-aurora-2" />
        <div className="absolute bottom-[5%] left-[25%] w-100 h-100 bg-cyan-500/4 rounded-full blur-[120px] animate-aurora-3" />

        {/* Radial vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0a0a0b_70%)]" />
      </motion.div>

      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-1 opacity-[0.012]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "180px 180px",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-32 pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* ── Left column ── */}
          <div>
            {/* Open-source badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2.5 px-4 py-2 mb-8 rounded-full border border-white/6 bg-white/2 text-xs text-neutral-500"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-30" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="font-mono tracking-wide">
                Open Source · MIT License
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-white leading-[1.08] mb-6"
            >
              Know exactly
              <br />
              what your{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-linear-to-r from-sky-300 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  AI&nbsp;agents
                </span>
                <span className="absolute -bottom-1 left-0 right-0 h-px bg-linear-to-r from-sky-400/50 via-cyan-400/20 to-transparent" />
              </span>{" "}
              cost.
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="text-[17px] text-neutral-500 max-w-lg leading-relaxed mb-10"
            >
              The open-source observability platform for LLM-powered
              applications. Track every call, token, and dollar across{" "}
              <span className="text-neutral-300 font-medium">
                1,900+ models
              </span>{" "}
              — with zero code changes.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex flex-wrap gap-3"
            >
              <Link
                href="/auth/register"
                className="group relative inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-[#0a0a0b] bg-white hover:bg-neutral-100 rounded-xl transition-all duration-200 shadow-[0_1px_32px_rgba(255,255,255,0.08)]"
              >
                Start Tracking
                <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-neutral-400 hover:text-white border border-white/8 hover:border-white/15 rounded-xl transition-all duration-200 hover:bg-white/2"
              >
                Documentation
              </Link>
            </motion.div>

            {/* Trust indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-14 flex items-center gap-4"
            >
              <div className="flex -space-x-2.5">
                {avatarColors.map((color, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full ${color} border-2 border-[#0a0a0b] flex items-center justify-center text-[11px] font-semibold text-white/90`}
                  >
                    {avatarInitials[i]}
                  </div>
                ))}
              </div>
              <p className="text-sm text-neutral-500">
                Trusted by developers building with AI
              </p>
            </motion.div>
          </div>

          {/* ── Right column — Dashboard preview ── */}
          <div className="hidden lg:block relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                duration: 0.9,
                delay: 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <DashboardPreview />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
