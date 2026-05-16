"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Clock3,
  ScrollText,
  Ghost,
  Network,
  ChevronDown,
  Bot,
  User,
  FileText,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Section, SectionEyebrow, SectionHeading, SectionLead } from "@/components/shared/section";

type Feature = {
  id: string;
  eyebrow: string;
  icon: typeof MessageSquare;
  title: React.ReactNode;
  body: string;
  howItWorks: string;
  visual: React.ReactNode;
};

const FEATURES: Feature[] = [
  {
    id: "why-engine",
    eyebrow: "01 — The Why Engine",
    icon: MessageSquare,
    title: <>Ask any question. Get a <span className="gradient-text-purple">narrative answer</span> with citations.</>,
    body: "RAG over your full Git history — commits, diffs, PR descriptions, ADRs. Every answer cites the exact commits it learned from.",
    howItWorks: "We embed each commit + diff with IBM Granite, store vectors in pgvector, and retrieve the top-k for any question. Bob synthesizes the narrative.",
    visual: <WhyEngineMock />,
  },
  {
    id: "time-travel",
    eyebrow: "02 — Time Travel Mode",
    icon: Clock3,
    title: <>Scrub through any file&apos;s history. See <span className="gradient-text-cyan">every major change</span> explained.</>,
    body: "Drag the timeline. Watch a file grow. See the commit that introduced this if-statement, the PR that refactored it, the author who removed it.",
    howItWorks: "Pre-rendered AI summaries at each significant commit. Diff visualizer with side-by-side comparison and per-line attribution.",
    visual: <TimeTravelMock />,
  },
  {
    id: "auto-adr",
    eyebrow: "03 — Auto-Generated ADRs",
    icon: ScrollText,
    title: <>Architectural Decision Records, extracted from history in <span className="gradient-text-purple">one click</span>.</>,
    body: "Bob detects decision patterns across commits, surfaces the alternatives that were considered, and writes the ADR you wish someone had written.",
    howItWorks: "Clustering on commit patterns + LLM extraction of constraints, alternatives, and consequences. Editable markdown output.",
    visual: <AdrMock />,
  },
  {
    id: "ghost-author",
    eyebrow: "04 — Ghost Author Mode",
    icon: Ghost,
    title: <>Chat with the <span className="gradient-text-cyan">synthesized expertise</span> of contributors who left.</>,
    body: "Their commits, comments, and decisions become a persona you can interrogate. Get the answer the departed senior dev would have given.",
    howItWorks: "Per-author commit corpus + comment history → personality embedding. Conversational interface scoped to their actual code surface area.",
    visual: <GhostMock />,
  },
  {
    id: "knowledge-graph",
    eyebrow: "05 — Knowledge Graph",
    icon: Network,
    title: <>Files, authors, decisions — visualized as an <span className="gradient-text-purple">interactive map</span>.</>,
    body: "Hover any node to see who owns it, what depends on it, and which decisions shaped it. Find the load-bearing files no one wants to touch.",
    howItWorks: "Co-edit graph from git blame + AST imports. Decision nodes link to ADRs. Force-directed layout with semantic clustering.",
    visual: <GraphMock />,
  },
];

export function Features() {
  return (
    <Section id="features" divider className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(50% 50% at 50% 0%, rgba(124, 92, 255, 0.06), transparent 70%)" }}
        />
      </div>

      <div className="container-app relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: [0.22, 0.68, 0, 1] }}
          className="max-w-3xl"
        >
          <SectionEyebrow>Features</SectionEyebrow>
          <SectionHeading>
            Five ways to <span className="gradient-text">time-travel</span> your code.
          </SectionHeading>
          <SectionLead>
            Each one reads the same shared brain: your repository&apos;s full history, embedded and indexed by IBM Bob.
          </SectionLead>
        </motion.div>

        <div className="mt-16 space-y-20 sm:space-y-28">
          {FEATURES.map((feature, i) => (
            <FeatureRow key={feature.id} feature={feature} reverse={i % 2 === 1} index={i} />
          ))}
        </div>
      </div>
    </Section>
  );
}

function FeatureRow({ feature, reverse, index }: { feature: Feature; reverse: boolean; index: number }) {
  const [open, setOpen] = useState(false);
  const Icon = feature.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 0.68, 0, 1] }}
      className={cn(
        "grid lg:grid-cols-2 gap-10 lg:gap-16 items-center",
        reverse && "lg:[&>*:first-child]:order-2"
      )}
    >
      {/* Text */}
      <div>
        <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.25em] text-[var(--secondary)]">
          <Icon className="size-3.5" />
          {feature.eyebrow}
        </span>
        <h3 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-[var(--text-primary)] leading-tight">
          {feature.title}
        </h3>
        <p className="mt-4 text-[var(--text-muted)] text-base sm:text-lg leading-relaxed">
          {feature.body}
        </p>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-mono text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
          aria-expanded={open}
        >
          <span>How it works</span>
          <ChevronDown className={cn("size-4 transition-transform duration-300", open && "rotate-180")} />
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 0.68, 0, 1] }}
              className="overflow-hidden"
            >
              <p className="mt-3 text-sm text-[var(--text-muted)] leading-relaxed border-l-2 border-[var(--primary)]/40 pl-4">
                {feature.howItWorks}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Visual */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.4, ease: [0.22, 0.68, 0, 1] }}
        className="relative group"
      >
        <div
          className="absolute -inset-2 -z-10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: index % 2 === 0 ? "rgba(124, 92, 255, 0.18)" : "rgba(34, 211, 238, 0.14)", filter: "blur(40px)" }}
          aria-hidden
        />
        <div className="relative rounded-2xl border border-[var(--border-color)] bg-[var(--surface)]/70 backdrop-blur-sm overflow-hidden transition-colors group-hover:border-[var(--primary)]/40">
          {feature.visual}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Mock visuals — small, illustrative, dependency-free                 */
/* ------------------------------------------------------------------ */

function WhyEngineMock() {
  return (
    <div className="p-5 sm:p-6 space-y-3 min-h-[320px] font-sans">
      <div className="flex gap-2 items-start">
        <span className="w-7 h-7 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center justify-center shrink-0">
          <User className="size-3.5 text-[var(--text-muted)]" />
        </span>
        <div className="bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%]">
          <p className="text-sm text-[var(--text-primary)]">Why does <span className="code-chip">middleware.ts</span> early-return on null?</p>
        </div>
      </div>
      <div className="flex gap-2 items-start">
        <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shrink-0 shadow-[0_0_16px_-2px_rgba(124,92,255,0.6)]">
          <Bot className="size-3.5 text-white" />
        </span>
        <div className="bg-[var(--primary)]/8 border border-[var(--primary)]/30 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">
            Added in <span className="code-chip">a3f9c2e</span> by <span className="text-[var(--primary)]">@dougwilson</span> after a prod incident where a falsy session crashed the request chain. See PR #4421.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="code-chip">commit:a3f9c2e</span>
            <span className="code-chip">PR #4421</span>
            <span className="code-chip">ADR-012</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2 items-start opacity-60">
        <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shrink-0">
          <Bot className="size-3.5 text-white" />
        </span>
        <div className="flex items-center gap-1 px-3 py-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

function TimeTravelMock() {
  const points = [12, 28, 40, 55, 64, 78, 90];
  return (
    <div className="p-5 sm:p-6 min-h-[320px] font-mono">
      <div className="flex items-center justify-between mb-4 text-xs">
        <span className="text-[var(--text-muted)]">src/middleware.ts</span>
        <span className="text-[var(--text-subtle)]">2018 → 2026</span>
      </div>

      <div className="relative h-12">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-[var(--border-color)]" />
        <div className="absolute top-1/2 left-0 h-px bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]" style={{ width: "60%" }} />
        {points.map((p, i) => (
          <span
            key={i}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2",
              p < 60 ? "bg-[var(--primary)] border-[var(--primary)]" : "bg-[var(--surface)] border-[var(--border-strong)]"
            )}
            style={{ left: `${p}%` }}
          />
        ))}
        <span
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[var(--primary)] border-2 border-white shadow-[0_0_20px_rgba(124,92,255,0.7)]"
          style={{ left: "60%", marginLeft: "-10px" }}
        />
      </div>

      <div className="mt-6 rounded-lg border border-[var(--border-color)] bg-[var(--background)]/60 p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--primary)]">e8b27cf</span>
          <span className="text-[var(--text-subtle)]">2022-02-18 · @jonchurch</span>
        </div>
        <div className="mt-2 text-sm text-[var(--text-primary)]">
          Patch prototype pollution on nested query keys
        </div>
        <div className="mt-3 text-xs text-[var(--text-muted)] leading-relaxed font-sans">
          Fixes CVE-2022-24999. Express now strips <span className="code-chip">__proto__</span> before parsing nested params.
        </div>
      </div>
    </div>
  );
}

function AdrMock() {
  return (
    <div className="p-5 sm:p-6 min-h-[320px]">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="size-4 text-[var(--secondary)]" />
        <span className="font-mono text-xs text-[var(--text-muted)]">ADR-012-middleware-null-guard.md</span>
      </div>
      <div className="rounded-lg border border-[var(--border-color)] bg-[var(--background)]/60 p-5 font-mono text-xs leading-relaxed space-y-3">
        <div>
          <span className="text-[var(--text-subtle)]"># ADR 012:</span>{" "}
          <span className="text-[var(--text-primary)]">Null-guard middleware chain</span>
        </div>
        <div>
          <span className="text-[var(--secondary)]">## Context</span>
          <p className="text-[var(--text-muted)] mt-1 font-sans">
            Sessions can be falsy after Redis expiry. Pre-fix, middleware downstream of <span className="code-chip">requireAuth</span> would crash.
          </p>
        </div>
        <div>
          <span className="text-[var(--secondary)]">## Decision</span>
          <p className="text-[var(--text-muted)] mt-1 font-sans">
            Return <span className="code-chip">401</span> early when <span className="code-chip">req.session</span> is null.
          </p>
        </div>
        <div>
          <span className="text-[var(--secondary)]">## Consequences</span>
          <p className="text-[var(--text-muted)] mt-1 font-sans">
            + Clean error semantics. − Custom flows must opt-out via header.
          </p>
        </div>
        <div className="pt-3 border-t border-[var(--border-color)] flex items-center gap-1.5 text-[10px] text-[var(--text-subtle)]">
          <Sparkles className="size-3 text-[var(--secondary)]" />
          Generated from 14 commits · 1 PR · 2 issue threads
        </div>
      </div>
    </div>
  );
}

function GhostMock() {
  return (
    <div className="p-5 sm:p-6 min-h-[320px] font-sans space-y-4">
      <div className="flex items-center gap-3 rounded-lg border border-[var(--border-color)] bg-[var(--background)]/60 p-4">
        <span className="relative w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shrink-0">
          <Ghost className="size-5 text-white" />
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[var(--surface)]" />
        </span>
        <div className="flex-1">
          <div className="text-sm font-semibold text-[var(--text-primary)]">@dougwilson <span className="text-[var(--secondary)] text-xs font-mono ml-1">ghost</span></div>
          <div className="text-xs text-[var(--text-muted)] font-mono">Maintainer · 2014 → 2023 · 1,247 commits</div>
        </div>
      </div>

      <div className="rounded-2xl rounded-tl-sm bg-[var(--surface-elevated)] border border-[var(--border-color)] px-4 py-3 max-w-[85%]">
        <div className="text-xs text-[var(--text-subtle)] mb-1">You</div>
        <p className="text-sm text-[var(--text-primary)]">How would you have handled the streaming body case?</p>
      </div>

      <div className="rounded-2xl rounded-tl-sm bg-[var(--primary)]/8 border border-[var(--primary)]/30 px-4 py-3 max-w-[85%] ml-auto">
        <div className="text-xs text-[var(--primary)] mb-1 font-mono">@dougwilson (ghost)</div>
        <p className="text-sm text-[var(--text-primary)] leading-relaxed">
          Don&apos;t buffer. Use the lazy parser introduced in <span className="code-chip">body-parser@1.18</span>. I shipped that exact pattern in <span className="code-chip">c2d8a14</span>.
        </p>
      </div>
    </div>
  );
}

function GraphMock() {
  const nodes = [
    { x: 50, y: 50, r: 18, color: "var(--primary)", label: "app.ts" },
    { x: 22, y: 30, r: 10, color: "var(--secondary)", label: "auth" },
    { x: 75, y: 28, r: 12, color: "var(--secondary)", label: "router" },
    { x: 18, y: 70, r: 8, color: "var(--text-muted)", label: "logger" },
    { x: 78, y: 75, r: 11, color: "var(--primary)", label: "session" },
    { x: 45, y: 88, r: 7, color: "var(--text-muted)", label: "utils" },
  ];
  const edges = [
    [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [2, 4], [1, 3],
  ];

  return (
    <div className="p-5 sm:p-6 min-h-[320px] relative">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-xs text-[var(--text-muted)]">repo://expressjs/express</span>
        <span className="font-mono text-xs text-[var(--text-subtle)]">76 nodes · 142 edges</span>
      </div>

      <div className="relative aspect-[4/3] rounded-lg border border-[var(--border-color)] bg-[var(--background)]/60 overflow-hidden">
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
          {edges.map(([a, b], i) => (
            <line
              key={i}
              x1={nodes[a].x}
              y1={nodes[a].y}
              x2={nodes[b].x}
              y2={nodes[b].y}
              stroke="rgba(124, 92, 255, 0.25)"
              strokeWidth="0.4"
              strokeDasharray="0.8 0.8"
            />
          ))}
          {nodes.map((n, i) => (
            <g key={i}>
              <circle
                cx={n.x}
                cy={n.y}
                r={n.r / 4}
                fill={n.color}
                opacity={0.18}
              />
              <circle
                cx={n.x}
                cy={n.y}
                r={n.r / 5.5}
                fill={n.color}
              />
            </g>
          ))}
        </svg>
        {nodes.slice(0, 4).map((n, i) => (
          <span
            key={i}
            className="absolute font-mono text-[10px] text-[var(--text-muted)] -translate-x-1/2"
            style={{ left: `${n.x}%`, top: `${n.y + 8}%` }}
          >
            {n.label}
          </span>
        ))}
      </div>
    </div>
  );
}
