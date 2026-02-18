"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    Terminal,
    Activity,
    CheckCircle2,
    Copy,
    ChevronRight,
    ExternalLink,
} from "lucide-react";

/* ─────────────────────────────────────────────
   CONSTANTS & DATA
   ───────────────────────────────────────────── */
const INSTALL_CMD = "pip install agentcost";

const SETUP_CODE = `from agentcost import track_costs
import openai

# Initialize with one line
track_costs.init(api_key="ac_kp...")

# Use your LLM as usual
client = openai.OpenAI()
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Analyze this..."}]
)`;

/* Dashboard preview data — realistic production values */
const COST_CHART_POINTS = [
    { day: "Mon", val: 38 },
    { day: "Tue", val: 52 },
    { day: "Wed", val: 61 },
    { day: "Thu", val: 45 },
    { day: "Fri", val: 73 },
    { day: "Sat", val: 29 },
    { day: "Sun", val: 47 },
];

const MODEL_USAGE = [
    { model: "gpt-4o", requests: "1,247", tokens: "2.1M", cost: "$31.40", pct: 42 },
    { model: "claude-3.5-sonnet", requests: "834", tokens: "1.4M", cost: "$18.76", pct: 25 },
    { model: "gpt-4o-mini", requests: "2,891", tokens: "890K", cost: "$4.23", pct: 6 },
    { model: "gemini-1.5-pro", requests: "412", tokens: "680K", cost: "$8.16", pct: 11 },
    { model: "deepseek-v3", requests: "1,103", tokens: "1.8M", cost: "$2.34", pct: 3 },
];

/* ─────────────────────────────────────────────
   SVG Area Chart
   ───────────────────────────────────────────── */

function CostChart() {
    const W = 520;
    const H = 120;
    const padX = 40;
    const padY = 16;
    const chartW = W - padX * 2;
    const chartH = H - padY * 2;

    const maxVal = Math.max(...COST_CHART_POINTS.map((p) => p.val));
    const points = COST_CHART_POINTS.map((p, i) => ({
        x: padX + (i / (COST_CHART_POINTS.length - 1)) * chartW,
        y: padY + chartH - (p.val / maxVal) * chartH,
    }));

    // Build smooth curve path
    const linePath = points
        .map((p, i) => {
            if (i === 0) return `M ${p.x} ${p.y}`;
            const prev = points[i - 1];
            const cpx = (prev.x + p.x) / 2;
            return `C ${cpx} ${prev.y}, ${cpx} ${p.y}, ${p.x} ${p.y}`;
        })
        .join(" ");

    const areaPath = `${linePath} L ${points[points.length - 1].x} ${H} L ${points[0].x} ${H} Z`;

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
            <defs>
                <linearGradient id="costAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(14,165,233,0.15)" />
                    <stop offset="100%" stopColor="rgba(14,165,233,0)" />
                </linearGradient>
            </defs>

            {/* Y-axis labels */}
            {[0, 0.5, 1].map((pct) => {
                const y = padY + chartH - pct * chartH;
                const label = `$${Math.round(pct * maxVal)}`;
                return (
                    <g key={pct}>
                        <line x1={padX} y1={y} x2={padX + chartW} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                        <text x={padX - 6} y={y + 3} textAnchor="end" className="fill-neutral-700 text-[9px] font-mono">
                            {label}
                        </text>
                    </g>
                );
            })}

            {/* X-axis labels */}
            {COST_CHART_POINTS.map((p, i) => (
                <text
                    key={p.day}
                    x={padX + (i / (COST_CHART_POINTS.length - 1)) * chartW}
                    y={H - 2}
                    textAnchor="middle"
                    className="fill-neutral-700 text-[9px] font-mono"
                >
                    {p.day}
                </text>
            ))}

            {/* Area fill */}
            <path d={areaPath} fill="url(#costAreaGrad)" />

            {/* Line */}
            <path d={linePath} fill="none" stroke="rgba(14,165,233,0.6)" strokeWidth="1.5" strokeLinecap="round" />

            {/* Data points */}
            {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#0a0a0b" stroke="rgba(14,165,233,0.7)" strokeWidth="1.5" />
            ))}
        </svg>
    );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────── */


export function CommandCenterDemo() {
    const [activeTab, setActiveTab] = useState<"setup" | "preview">("setup");
    const [copied, setCopied] = useState(false);

    const copyCode = () => {
        navigator.clipboard.writeText(SETUP_CODE);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full max-w-5xl mx-auto">
            {/* ─── Window Frame ─── */}
            <div className="relative bg-[#0c0c0e]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden ring-1 ring-white/5">

                {/* Window Header / Tabs */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/2">
                    {/* Traffic Lights */}
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                    </div>

                    {/* Centered Tabs */}
                    <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                        <button
                            onClick={() => setActiveTab("setup")}
                            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === "setup"
                                ? "bg-neutral-800 text-white shadow-sm"
                                : "text-neutral-500 hover:text-neutral-300"
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                <Terminal className="size-3.5" />
                                Quick Start
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab("preview")}
                            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === "preview"
                                ? "bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-sm shadow-sky-900/20"
                                : "text-neutral-500 hover:text-neutral-300"
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                <Activity className="size-3.5" />
                                Dashboard Preview
                            </span>
                        </button>
                    </div>

                    {/* Right spacer for centering */}
                    <div className="w-16" />
                </div>

                {/* ─── Content Area ─── */}
                <div className="relative min-h-105 bg-[#0a0a0b]">
                    <AnimatePresence mode="wait">

                        {/* SETUP VIEW */}
                        {activeTab === "setup" && (
                            <motion.div
                                key="setup"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.2 }}
                                className="p-6 md:p-8 font-mono text-sm"
                            >
                                <div className="space-y-6">
                                    {/* Step 1: Install */}
                                    <div>
                                        <div className="flex items-center gap-2 text-neutral-500 mb-2">
                                            <ChevronRight className="size-4" />
                                            <span>1. Install</span>
                                        </div>
                                        <div className="flex items-center justify-between bg-black/40 border border-white/5 p-4 rounded-lg">
                                            <code className="text-sky-300">
                                                <span className="text-neutral-600 mr-1">$</span> {INSTALL_CMD}
                                            </code>
                                            <CheckCircle2 className="size-4 text-emerald-500/60" />
                                        </div>
                                    </div>

                                    {/* Step 2: Code */}
                                    <div>
                                        <div className="flex items-center justify-between text-neutral-500 mb-2">
                                            <div className="flex items-center gap-2">
                                                <ChevronRight className="size-4" />
                                                <span>2. Add two lines to your code</span>
                                            </div>
                                            <button
                                                onClick={copyCode}
                                                className="flex items-center gap-1 text-xs hover:text-white transition-colors"
                                            >
                                                {copied ? <CheckCircle2 className="size-3" /> : <Copy className="size-3" />}
                                                {copied ? "Copied" : "Copy"}
                                            </button>
                                        </div>
                                        <div className="relative bg-[#1e1e1e] border border-white/5 rounded-lg overflow-hidden">
                                            <pre className="text-neutral-300 leading-7 text-[13px]">
                                                <code>
                                                    <div className="border-l-2 border-emerald-400/40 pl-3 ml-1 py-0.5">
                                                        <span className="text-purple-400">from</span> <span className="text-sky-300">agentcost</span> <span className="text-purple-400">import</span> <span className="text-sky-300">track_costs</span>
                                                    </div>
                                                    <div className="px-4 py-0.5">
                                                        <span className="text-purple-400">import</span> openai
                                                    </div>
                                                    <div className="px-4 py-0.5">
                                                        <span className="text-neutral-600">&nbsp;</span>
                                                    </div>
                                                    <div className="px-4 py-0.5">
                                                        <span className="text-neutral-500"># Initialize</span>
                                                    </div>
                                                    <div className="border-l-2 border-emerald-400/40 pl-3 ml-1 py-0.5">
                                                        <span className="text-yellow-300">track_costs</span>.<span className="text-blue-300">init</span>(api_key=<span className="text-green-400">&quot;ac_kp...&quot;</span>)
                                                    </div>
                                                    <div className="px-4 py-0.5">
                                                        <span className="text-neutral-600">&nbsp;</span>
                                                    </div>
                                                    <div className="px-4 py-0.5">
                                                        <span className="text-neutral-500"># Use your LLM as usual — calls are tracked automatically</span>
                                                    </div>
                                                    <div className="px-4 py-0.5">
                                                        client = openai.<span className="text-blue-300">OpenAI</span>()
                                                    </div>
                                                    <div className="px-4 py-0.5">
                                                        response = client.chat.completions.<span className="text-blue-300">create</span>(
                                                    </div>
                                                    <div className="px-4 py-0.5">
                                                        {"    "}model=<span className="text-green-400">&quot;gpt-4o&quot;</span>,
                                                    </div>
                                                    <div className="px-4 py-0.5">
                                                        {"    "}messages=[...]
                                                    </div>
                                                    <div className="px-4 py-0.5">
                                                        )
                                                    </div>
                                                </code>
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* DASHBOARD PREVIEW */}
                        {activeTab === "preview" && (
                            <motion.div
                                key="preview"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="h-full flex flex-col"
                            >
                                {/* Metric Bar */}
                                <div className="grid grid-cols-4 gap-px border-b border-white/5">
                                    {[
                                        { label: "Today's Spend", value: "$47.83", change: "↓ 12%", positive: true },
                                        { label: "Requests", value: "6,487", change: "↑ 8%", positive: true },
                                        { label: "Avg Latency", value: "1.1s", change: "↓ 3%", positive: true },
                                        { label: "Models", value: "6", change: "", positive: true },
                                    ].map((m, i) => (
                                        <div key={i} className="px-5 py-3 bg-[#0a0a0b]">
                                            <div className="text-[10px] text-neutral-600 mb-1 tracking-wide">
                                                {m.label}
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-[15px] font-semibold text-neutral-100 tabular-nums">{m.value}</span>
                                                {m.change && (
                                                    <span className="text-[10px] text-emerald-500/60">{m.change}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Chart + Table */}
                                <div className="flex-1 p-5 grid grid-cols-5 gap-5">

                                    {/* Cost Over Time Chart */}
                                    <div className="col-span-2 flex flex-col">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-[11px] text-neutral-500 tracking-wide">Cost · 7 days</h4>
                                            <span className="text-[10px] text-neutral-700 tabular-nums">$312.89 total</span>
                                        </div>
                                        <div className="flex-1 min-h-27.5">
                                            <CostChart />
                                        </div>
                                    </div>

                                    {/* Model Breakdown Table */}
                                    <div className="col-span-3 border-l border-white/5 pl-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-[11px] text-neutral-500 tracking-wide">Model breakdown</h4>
                                            <span className="text-[10px] text-neutral-700">5 models</span>
                                        </div>

                                        {/* Table header */}
                                        <div className="grid grid-cols-[1fr_64px_72px_68px_48px] gap-2 text-[9px] text-neutral-600 uppercase tracking-wider mb-2 px-2">
                                            <span>Model</span>
                                            <span className="text-right">Reqs</span>
                                            <span className="text-right">Tokens</span>
                                            <span className="text-right">Cost</span>
                                            <span className="text-right"></span>
                                        </div>

                                        {/* Table rows */}
                                        <div className="space-y-0.5">
                                            {MODEL_USAGE.map((row, i) => (
                                                <motion.div
                                                    key={row.model}
                                                    initial={{ opacity: 0, x: -6 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.08 }}
                                                    className="grid grid-cols-[1fr_64px_72px_68px_48px] gap-2 items-center px-2 py-2 rounded text-[11px] hover:bg-white/3 transition-colors"
                                                >
                                                    <span className="text-neutral-300 truncate font-mono text-[10px]">{row.model}</span>
                                                    <span className="text-neutral-500 text-right tabular-nums">{row.requests}</span>
                                                    <span className="text-neutral-600 text-right tabular-nums">{row.tokens}</span>
                                                    <span className="text-sky-400/70 text-right tabular-nums font-medium">{row.cost}</span>
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <div className="w-8 h-1 bg-white/5 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${row.pct}%` }}
                                                                transition={{ duration: 0.8, delay: 0.3 + i * 0.08 }}
                                                                className="h-full bg-sky-500/40 rounded-full"
                                                            />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* Footer link */}
                                        <div className="mt-4 pt-3 border-t border-white/4">
                                            <Link href="/auth/register" className="inline-flex items-center gap-1.5 text-[10px] text-neutral-600 hover:text-neutral-400 transition-colors">
                                                Open full dashboard
                                                <ExternalLink className="size-2.5" />
                                            </Link>
                                        </div>
                                    </div>

                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>

            </div>

            {/* Decorative Glow */}
            <div className="absolute -inset-10 bg-linear-to-r from-sky-600/20 via-blue-600/20 to-purple-600/20 blur-3xl opacity-30 -z-10 rounded-full" />
        </div>
    );
}
