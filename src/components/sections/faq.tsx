"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Section, SectionEyebrow, SectionHeading } from "@/components/shared/section";

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "Which repos are supported?",
    a: (
      <>
        Any GitHub repository — public works instantly with no auth. Private repos work on <span className="text-[var(--text-primary)]">Team</span> and above via a GitHub App install. GitLab and Bitbucket support is on the roadmap (Q3).
      </>
    ),
  },
  {
    q: "How is this different from GitHub Copilot or Cursor?",
    a: (
      <>
        Copilot and Cursor are great at <span className="text-[var(--text-primary)]">writing the next line</span>. We&apos;re built for understanding <span className="text-[var(--text-primary)]">the last 5,000 lines</span> — the why behind every decision in your history, with citations to specific commits. Different layer, complementary tool.
      </>
    ),
  },
  {
    q: "What does IBM Bob actually do here?",
    a: (
      <>
        Bob (running on IBM watsonx.ai Granite) handles three jobs: embedding your commits into semantic vectors, generating the narrative answers from retrieved context, and writing the ADRs / Ghost Author responses. The entire build was also pair-programmed with Bob — sessions are in our public repo.
      </>
    ),
  },
  {
    q: "Is my code private and secure?",
    a: (
      <>
        Your code never leaves the indexing pipeline. We store embeddings + metadata, not source files. Enterprise customers can deploy entirely on-prem with their own watsonx instance. SOC 2 Type II is in progress (audit closes Q2).
      </>
    ),
  },
  {
    q: "How big a repo can I analyze?",
    a: (
      <>
        Tested up to <span className="font-mono text-[var(--primary)]">~250k commits</span> (think linux/linux scale). Indexing is incremental — after the first run, only new commits get processed. Most repos finish in under two minutes.
      </>
    ),
  },
  {
    q: "Can I export the generated docs?",
    a: (
      <>
        Yes. ADRs export as markdown directly into your repo&apos;s <span className="code-chip">docs/adrs/</span> folder, including a PR. Knowledge graph exports as JSON. Chat transcripts export as markdown with citation links. Your data, your formats.
      </>
    ),
  },
];

export function FAQ() {
  return (
    <Section id="faq" divider>
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: [0.22, 0.68, 0, 1] }}
          className="text-center max-w-3xl mx-auto"
        >
          <SectionEyebrow className="justify-center"><span className="flex items-center gap-2"><span className="h-px w-6 bg-[var(--secondary)]/60" />FAQ</span></SectionEyebrow>
          <SectionHeading className="mx-auto">
            Questions, <span className="gradient-text-cyan">answered</span>.
          </SectionHeading>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 0.68, 0, 1] }}
          className="mt-12 max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible defaultValue="item-0" className="w-full">
            {FAQS.map((item, i) => (
              <AccordionItem
                key={item.q}
                value={`item-${i}`}
                className="border border-[var(--border-color)] bg-[var(--surface)]/50 rounded-xl mb-3 px-5 data-[state=open]:border-[var(--primary)]/40 data-[state=open]:bg-[var(--surface)]/80 transition-colors"
              >
                <AccordionTrigger className="text-left text-base font-semibold text-[var(--text-primary)] hover:no-underline py-5">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-[var(--text-muted)] leading-relaxed text-sm sm:text-base pb-5">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </Section>
  );
}
