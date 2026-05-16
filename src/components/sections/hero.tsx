"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, Play, Sparkles, GitCommit, Bot } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RepoIngestForm } from "@/components/shared/repo-ingest-form";

type Commit = {
  hash: string;
  author: string;
  message: string;
  time: string;
  insight: string;
};

const COMMITS: Commit[] = [
  {
    hash: "a3f9c2e",
    author: "dougwilson",
    message: "refactor middleware stack to support async handlers",
    time: "2019-04-12",
    insight: "Driven by Node 10's async/await maturity. Cuts cold-start ~40%.",
  },
  {
    hash: "7b1e5d0",
    author: "wesleytodd",
    message: "deprecate res.send(status) signature",
    time: "2020-09-03",
    insight: "API ambiguity caused 12+ issues over 2yrs. See ADR-006.",
  },
  {
    hash: "c2d8a14",
    author: "jonchurch",
    message: "fix: query parser bypass on nested keys",
    time: "2022-02-18",
    insight: "Security: CVE-2022-24999 prototype pollution.",
  },
  {
    hash: "9e6b3f1",
    author: "ulisesgascon",
    message: "drop Node 14 support, target 18 LTS",
    time: "2024-01-15",
    insight: "Aligned with Node release schedule. Unlocks built-in fetch.",
  },
];

export function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-28">
      {/* Backgrounds */}
      <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" aria-hidden />
      <div className="absolute inset-0 radial-glow-primary pointer-events-none" aria-hidden />
      <div className="absolute inset-0 radial-glow-cyan pointer-events-none" aria-hidden />
      <div
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(124,92,255,0.5), transparent)" }}
        aria-hidden
      />

      <div className="container-app relative">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
          {/* Left column */}
          <div id="hero">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 0.68, 0, 1] }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/5 backdrop-blur"
            >
              <Sparkles className="size-3.5 text-[var(--primary)]" />
              <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[var(--text-primary)]">
                Powered by IBM Bob · watsonx.ai
              </span>
            </motion.div>

            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.05]">
              <HeadlineLine text="Git tells you" delay={0} />
              <br />
              <HeadlineLine text="what" delay={0.25} />{" "}
              <HeadlineLine text="changed." delay={0.32} highlight="gradient-text-cyan" />
              <br />
              <HeadlineLine text="We tell you" delay={0.5} />{" "}
              <HeadlineLine text="why." delay={0.7} highlight="gradient-text-purple glow-text" />
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0, ease: [0.22, 0.68, 0, 1] }}
              className="mt-6 max-w-xl text-base sm:text-lg text-[var(--text-muted)] leading-relaxed"
            >
              Codebase Time Machine reads your entire Git history with{" "}
              <span className="text-[var(--text-primary)] font-medium">IBM Bob</span> and turns it into a queryable brain. Onboard in hours, not weeks. Never lose tribal knowledge again.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.15, ease: [0.22, 0.68, 0, 1] }}
              className="mt-8 flex flex-col sm:flex-row gap-3"
            >
              <Button asChild size="lg" className="shadow-[0_4px_20px_rgba(124,92,255,0.45)] hover:shadow-[0_8px_28px_rgba(124,92,255,0.6)] hover:-translate-y-0.5 transition-transform">
                <Link href="#hero-form">
                  Try with any GitHub repo
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-[var(--border-color)] bg-[var(--surface)]/40 hover:bg-[var(--surface)] text-[var(--text-primary)]">
                <Link href="#demo">
                  <Play className="size-4" />
                  Watch 90-sec demo
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.3, ease: [0.22, 0.68, 0, 1] }}
              id="hero-form"
              className="mt-8"
            >
              <RepoIngestForm size="lg" defaultValue="https://github.com/expressjs/express" ctaLabel="Analyze" />
              <p className="mt-3 text-xs text-[var(--text-subtle)] font-mono flex flex-wrap gap-x-4 gap-y-1">
                <span>▸ Public repos work instantly</span>
                <span>▸ ~60s to index</span>
                <span>▸ No credit card</span>
              </p>
            </motion.div>
          </div>

          {/* Right column — animated terminal */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 0.68, 0, 1] }}
            className="relative"
          >
            <div className="absolute -inset-6 -z-10 bg-[var(--primary)]/15 blur-3xl rounded-full" aria-hidden />
            <CommitTimelineMock />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HeadlineLine({ text, delay, highlight }: { text: string; delay: number; highlight?: string }) {
  const reduced = useReducedMotion();
  const words = text.split(" ");
  return (
    <span className={highlight ? `inline-block ${highlight}` : "inline-block text-[var(--text-primary)]"}>
      {words.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.7,
            delay: reduced ? 0 : delay + i * 0.06,
            ease: [0.22, 0.68, 0, 1],
          }}
          className="inline-block mr-[0.25em]"
        >
          {w}
        </motion.span>
      ))}
    </span>
  );
}

function CommitTimelineMock() {
  const [activeIdx, setActiveIdx] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      setActiveIdx((i) => (i + 1) % COMMITS.length);
    }, 3200);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <div className="relative rounded-2xl border border-[var(--border-color)] bg-[var(--surface)]/80 backdrop-blur-sm overflow-hidden glow-border">
      {/* Window chrome */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-[var(--border-color)] bg-[var(--surface-elevated)]/60">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        </div>
        <span className="text-xs font-mono text-[var(--text-subtle)] flex items-center gap-1.5">
          <GitCommit className="size-3.5" />
          expressjs/express · history
        </span>
        <span className="text-[10px] font-mono text-[var(--secondary)] uppercase tracking-[0.2em] hidden sm:inline">
          Live
        </span>
      </div>

      {/* Commit list */}
      <div className="relative p-5 space-y-3 font-mono text-sm h-[380px] overflow-hidden">
        <div className="scan-line" aria-hidden />
        {COMMITS.map((commit, i) => {
          const active = i === activeIdx;
          return (
            <motion.div
              key={commit.hash}
              animate={{
                opacity: active ? 1 : 0.35,
                scale: active ? 1 : 0.98,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={`relative pl-6 pr-3 py-2 rounded-md transition-colors ${
                active ? "bg-[var(--primary)]/10 border border-[var(--primary)]/30" : "border border-transparent"
              }`}
            >
              <span
                className={`absolute left-2 top-3.5 w-2 h-2 rounded-full ${
                  active ? "bg-[var(--primary)] shadow-[0_0_12px_rgba(124,92,255,0.8)]" : "bg-[var(--border-strong)]"
                }`}
              />
              <div className="flex items-center gap-2 text-xs">
                <span className={active ? "text-[var(--primary)]" : "text-[var(--text-subtle)]"}>
                  {commit.hash}
                </span>
                <span className="text-[var(--text-subtle)]">·</span>
                <span className={active ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}>
                  @{commit.author}
                </span>
                <span className="text-[var(--text-subtle)] ml-auto hidden sm:inline">{commit.time}</span>
              </div>
              <div className={`mt-1 text-sm ${active ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>
                {commit.message}
              </div>

              <AnimatePresence>
                {active && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -4, height: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="mt-2 overflow-hidden"
                  >
                    <div className="flex items-start gap-2 rounded-md bg-[var(--secondary)]/8 border border-[var(--secondary)]/30 px-3 py-2 text-xs">
                      <Bot className="size-3.5 text-[var(--secondary)] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[var(--secondary)] font-semibold uppercase tracking-[0.18em] text-[10px]">
                          Bob says
                        </span>
                        <div className="mt-0.5 text-[var(--text-primary)] leading-relaxed font-sans">
                          {commit.insight}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Footer status */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-[var(--border-color)] bg-[var(--surface-elevated)]/40 text-xs font-mono">
        <span className="flex items-center gap-2 text-[var(--text-subtle)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary)]" />
          </span>
          5,432 commits indexed
        </span>
        <span className="text-[var(--text-subtle)]">{activeIdx + 1} / {COMMITS.length}</span>
      </div>
    </div>
  );
}
