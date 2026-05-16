"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Bot, GitCommit, Zap, ArrowRight, FolderGit2 } from "lucide-react";
import { Section, SectionEyebrow, SectionHeading, SectionLead } from "@/components/shared/section";

const SESSION_LOG = [
  { time: "09:14", label: "design", message: "Scoped RAG retrieval to per-author + per-file slices" },
  { time: "11:42", label: "implement", message: "Built pgvector index with HNSW for 12ms p95 lookup" },
  { time: "14:03", label: "debug", message: "Caught off-by-one in diff hunk attribution" },
  { time: "16:27", label: "ship", message: "Cut release v0.3 — Ghost Author mode GA" },
];

export function BuiltWithBob() {
  return (
    <Section divider className="relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(60% 50% at 50% 50%, rgba(124, 92, 255, 0.08), transparent 70%)" }}
        aria-hidden
      />

      <div className="container-app relative">
        <div className="grid lg:grid-cols-[1fr_1.05fr] gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.55, ease: [0.22, 0.68, 0, 1] }}
          >
            <SectionEyebrow>Built with IBM Bob</SectionEyebrow>
            <SectionHeading>
              We didn&apos;t just use AI.<br />
              We <span className="gradient-text-purple">built with</span> the smartest dev partner there is.
            </SectionHeading>
            <SectionLead>
              IBM Bob pair-programmed every layer of this product — from the pgvector schema to the Ghost Author persona engine. Every architectural call is checked in under <span className="code-chip">bob_sessions/</span>.
            </SectionLead>

            <div className="mt-8 grid sm:grid-cols-2 gap-3">
              {[
                { icon: GitCommit, label: "1,200+ commits co-authored" },
                { icon: Zap, label: "3 weeks, 1 dev, 1 Bob" },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface)]/60 px-4 py-3">
                    <span className="w-8 h-8 rounded-md bg-[var(--primary)]/15 border border-[var(--primary)]/30 flex items-center justify-center">
                      <Icon className="size-4 text-[var(--primary)]" />
                    </span>
                    <span className="text-sm text-[var(--text-primary)]">{stat.label}</span>
                  </div>
                );
              })}
            </div>

            <Link
              href="https://github.com/"
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-2 text-sm font-mono text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
            >
              <FolderGit2 className="size-4" />
              Browse bob_sessions/ on GitHub
              <ArrowRight className="size-3.5" />
            </Link>
          </motion.div>

          {/* Session report card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.65, ease: [0.22, 0.68, 0, 1] }}
            className="relative"
          >
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-[var(--primary)]/12 blur-3xl" aria-hidden />

            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)]/85 backdrop-blur-sm overflow-hidden glow-border">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-color)] bg-[var(--surface-elevated)]/60">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-md bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shadow-[0_0_16px_-2px_rgba(124,92,255,0.6)]">
                    <Bot className="size-4 text-white" />
                  </span>
                  <div>
                    <div className="font-mono text-sm font-semibold text-[var(--text-primary)]">bob_session_0042.md</div>
                    <div className="font-mono text-[10px] text-[var(--text-subtle)] uppercase tracking-[0.2em]">Session report</div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-300">
                  <Sparkles className="size-3" />
                  Shipped
                </span>
              </div>

              <div className="p-5 space-y-3">
                {SESSION_LOG.map((entry, i) => (
                  <motion.div
                    key={entry.time}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.15 + i * 0.1, ease: "easeOut" }}
                    className="flex items-start gap-3 font-mono text-xs"
                  >
                    <span className="text-[var(--text-subtle)] shrink-0 w-12">{entry.time}</span>
                    <span
                      className={`shrink-0 px-1.5 py-0.5 rounded uppercase tracking-[0.15em] text-[10px] ${
                        entry.label === "ship"
                          ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                          : entry.label === "debug"
                          ? "bg-amber-500/10 border border-amber-500/30 text-amber-300"
                          : "bg-[var(--primary)]/10 border border-[var(--primary)]/30 text-[var(--primary)]"
                      }`}
                    >
                      {entry.label}
                    </span>
                    <span className="text-[var(--text-primary)] leading-relaxed font-sans">{entry.message}</span>
                  </motion.div>
                ))}
              </div>

              <div className="border-t border-[var(--border-color)] px-5 py-3 bg-[var(--surface-elevated)]/40 font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--text-subtle)] flex justify-between">
                <span>session 0042 / 1,247</span>
                <span className="text-[var(--secondary)]">watsonx.ai · granite-3.3</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}
