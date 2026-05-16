"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Cpu, MessageSquare } from "lucide-react";
import { GithubIcon } from "@/components/shared/brand-icons";
import { Section, SectionEyebrow, SectionHeading, SectionLead } from "@/components/shared/section";

const STEPS = [
  {
    num: "01",
    icon: GithubIcon,
    title: "Paste any GitHub URL",
    body: "Public repos work instantly. Drop in expressjs/express, your-org/api, or a side project.",
  },
  {
    num: "02",
    icon: Cpu,
    title: "We index your history",
    body: "IBM Bob analyzes commits, diffs, authors, and decisions. ~60 seconds for a 5k-commit repo.",
  },
  {
    num: "03",
    icon: MessageSquare,
    title: "Ask anything, travel anywhere",
    body: "Chat, scrub the timeline, generate ADRs, explore the graph. The whole brain is yours.",
  },
];

export function HowItWorks() {
  const reduced = useReducedMotion();

  return (
    <Section id="how" divider className="relative overflow-hidden">
      <div className="absolute inset-0 grid-bg-static opacity-30 pointer-events-none" aria-hidden />

      <div className="container-app relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: [0.22, 0.68, 0, 1] }}
          className="max-w-3xl"
        >
          <SectionEyebrow>How it works</SectionEyebrow>
          <SectionHeading>Three steps from URL to <span className="gradient-text-cyan">queryable brain</span>.</SectionHeading>
          <SectionLead>No setup, no plugins, no manual tagging. Paste, wait a minute, ask anything.</SectionLead>
        </motion.div>

        <div className="mt-16 relative grid md:grid-cols-3 gap-10 md:gap-6">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-7 left-[8%] right-[8%] h-px overflow-hidden" aria-hidden>
            <motion.div
              initial={{ scaleX: 0, transformOrigin: "left" }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: reduced ? 0 : 1.4, ease: [0.22, 0.68, 0, 1], delay: 0.2 }}
              className="h-px bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--primary)]"
            />
          </div>

          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, delay: 0.3 + i * 0.15, ease: [0.22, 0.68, 0, 1] }}
                className="relative text-center"
              >
                <div className="relative inline-flex w-14 h-14 rounded-full bg-[var(--background)] border-2 border-[var(--primary)] items-center justify-center font-mono font-bold text-[var(--primary)] z-10">
                  {step.num}
                  <span className="absolute inset-0 rounded-full bg-[var(--primary)]/30 blur-lg -z-10" />
                </div>
                <div className="mt-5 flex items-center justify-center gap-2 text-[var(--secondary)]">
                  <Icon className="size-4" />
                  <span className="text-xs font-mono uppercase tracking-[0.25em]">Step {step.num}</span>
                </div>
                <h3 className="mt-3 text-xl font-semibold text-[var(--text-primary)]">{step.title}</h3>
                <p className="mt-2 text-sm text-[var(--text-muted)] leading-relaxed max-w-xs mx-auto">{step.body}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
