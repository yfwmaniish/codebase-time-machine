"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { RepoIngestForm } from "@/components/shared/repo-ingest-form";
import { Section } from "@/components/shared/section";

export function FinalCTA() {
  return (
    <Section divider className="relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" aria-hidden />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(50% 80% at 50% 50%, rgba(124, 92, 255, 0.18), transparent 70%)" }}
        aria-hidden
      />

      <div className="container-app relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.22, 0.68, 0, 1] }}
          className="relative max-w-4xl mx-auto text-center rounded-3xl border border-[var(--primary)]/30 bg-[var(--surface)]/70 backdrop-blur-sm p-10 sm:p-14 lg:p-16 overflow-hidden glow-border"
        >
          <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-[var(--primary)]/22 blur-3xl" aria-hidden />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-[var(--secondary)]/18 blur-3xl" aria-hidden />

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--primary)]/40 bg-[var(--primary)]/10">
              <Sparkles className="size-3.5 text-[var(--primary)]" />
              <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[var(--text-primary)]">
                Free forever for public repos
              </span>
            </div>

            <h2 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text-primary)] leading-tight">
              Stop losing knowledge.<br />
              Start <span className="gradient-text-purple glow-text">time-traveling</span>.
            </h2>
            <p className="mt-5 max-w-xl mx-auto text-base sm:text-lg text-[var(--text-muted)]">
              Free forever for public repos. No credit card required. ~60 seconds to your first answer.
            </p>

            <div className="mt-8 max-w-2xl mx-auto">
              <RepoIngestForm
                size="lg"
                placeholder="github.com/your-org/your-repo"
                ctaLabel="Analyze your repo"
              />
            </div>

            <p className="mt-5 text-xs text-[var(--text-subtle)] font-mono flex items-center justify-center flex-wrap gap-x-4 gap-y-1">
              <span>▸ Works with any public repo</span>
              <span>▸ Indexed in ~60s</span>
              <span>▸ No setup</span>
            </p>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
