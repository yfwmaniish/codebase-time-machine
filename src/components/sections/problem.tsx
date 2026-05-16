"use client";

import { motion } from "framer-motion";
import { Users, MessageCircleQuestion, Hourglass } from "lucide-react";
import { Section, SectionEyebrow, SectionHeading, SectionLead } from "@/components/shared/section";

const PAINS = [
  {
    icon: Users,
    title: "Senior devs leave. Their context leaves with them.",
    body: "Years of decisions, trade-offs, and gotchas live in heads, not files. When they walk, your codebase forgets how to explain itself.",
  },
  {
    icon: MessageCircleQuestion,
    title: "PR descriptions just say \"fix.\" Slack threads vanish.",
    body: "Why did we choose this library? Why is this loop here? The answers are scattered across Notion pages no one updates and DMs no one searches.",
  },
  {
    icon: Hourglass,
    title: "New hires lose 2–4 weeks asking \"why is this like this?\"",
    body: "Every onboarding repeats the same archaeology. Multiply by team size and you've burned a quarter of velocity on rediscovery.",
  },
];

export function Problem() {
  return (
    <Section className="relative">
      <div className="container-app">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, ease: [0.22, 0.68, 0, 1] }}
          >
            <SectionEyebrow>The problem</SectionEyebrow>
            <SectionHeading>
              Your codebase has a <span className="gradient-text-purple">memory problem</span>.
            </SectionHeading>
            <SectionLead>
              Git records every keystroke and forgets every reason. We turn that asymmetry into your competitive advantage.
            </SectionLead>
          </motion.div>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {PAINS.map((pain, i) => {
            const Icon = pain.icon;
            return (
              <motion.div
                key={pain.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 0.68, 0, 1] }}
                whileHover={{ y: -6 }}
                className="group relative rounded-2xl border border-[var(--border-color)] bg-[var(--surface)]/50 hover:bg-[var(--surface)]/80 hover:border-[var(--primary)]/40 p-7 overflow-hidden transition-colors"
              >
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[var(--primary)]/15 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden />
                <span className="inline-flex w-11 h-11 items-center justify-center rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/30 mb-5">
                  <Icon className="size-5 text-[var(--primary)]" />
                </span>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] leading-snug">{pain.title}</h3>
                <p className="mt-3 text-sm text-[var(--text-muted)] leading-relaxed">{pain.body}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
