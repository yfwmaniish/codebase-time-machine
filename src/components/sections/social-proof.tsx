"use client";

import { motion } from "framer-motion";
import { GitCommit, Timer, Sparkles } from "lucide-react";

const LOGOS = ["Vercel", "Linear", "Supabase", "Cloudflare", "Replicate", "Stripe"];

const STATS = [
  { value: "10,000+", label: "commits analyzed", icon: GitCommit },
  { value: "60s", label: "avg index time", icon: Timer },
  { value: "IBM Bob", label: "powers every answer", icon: Sparkles },
];

export function SocialProof() {
  return (
    <section className="relative border-y border-[var(--border-color)]/60 bg-[var(--surface)]/40 backdrop-blur-sm">
      <div className="container-app py-12 lg:py-14">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: [0.22, 0.68, 0, 1] }}
          className="text-center"
        >
          <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-[var(--text-subtle)]">
            Trusted by builders at
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {LOGOS.map((name, i) => (
              <motion.span
                key={name}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.05, ease: "easeOut" }}
                className="font-mono text-base sm:text-lg font-semibold text-[var(--text-muted)]/70 hover:text-[var(--text-primary)] transition-colors"
              >
                {name}
              </motion.span>
            ))}
          </div>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 0.68, 0, 1] }}
                className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--background)]/60 px-5 py-4"
              >
                <span className="w-9 h-9 rounded-md bg-[var(--primary)]/15 border border-[var(--primary)]/30 flex items-center justify-center shrink-0">
                  <Icon className="size-4 text-[var(--primary)]" />
                </span>
                <div>
                  <div className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">{stat.label}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
