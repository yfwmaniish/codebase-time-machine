"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Section, SectionEyebrow, SectionHeading, SectionLead } from "@/components/shared/section";

type Tier = {
  name: string;
  tagline: string;
  monthly: number | null;
  annual: number | null;
  priceLabel?: string;
  cta: string;
  href: string;
  features: string[];
  highlighted?: boolean;
};

const TIERS: Tier[] = [
  {
    name: "Explorer",
    tagline: "For solo builders and OSS maintainers.",
    monthly: 0,
    annual: 0,
    cta: "Start free",
    href: "#hero-form",
    features: [
      "Up to 3 public repos",
      "Full Why Engine + Time Travel",
      "Community support",
      "API rate-limited to 50 queries/day",
    ],
  },
  {
    name: "Team",
    tagline: "For teams ready to time-travel together.",
    monthly: 19,
    annual: 15,
    cta: "Start 14-day trial",
    href: "#hero-form",
    highlighted: true,
    features: [
      "Unlimited public + private repos",
      "Ghost Author + ADR export",
      "Team workspaces & roles",
      "Slack integration",
      "Priority support",
      "10k queries/month per dev",
    ],
  },
  {
    name: "Enterprise",
    tagline: "For platforms with serious history.",
    monthly: null,
    annual: null,
    priceLabel: "Custom",
    cta: "Talk to sales",
    href: "mailto:sales@ctm.app",
    features: [
      "SSO (Okta, Azure AD)",
      "RBAC + audit logs",
      "On-prem deployment option",
      "Custom integrations",
      "Dedicated success manager",
      "Volume pricing",
    ],
  },
];

export function Pricing() {
  const [annual, setAnnual] = useState(true);

  return (
    <Section id="pricing" divider className="relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(60% 50% at 50% 0%, rgba(124, 92, 255, 0.06), transparent 70%)" }}
        aria-hidden
      />

      <div className="container-app relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: [0.22, 0.68, 0, 1] }}
          className="text-center max-w-3xl mx-auto"
        >
          <SectionEyebrow className="justify-center"><span className="flex items-center gap-2"><span className="h-px w-6 bg-[var(--secondary)]/60" />Pricing</span></SectionEyebrow>
          <SectionHeading className="mx-auto">
            Free for public code.<br />
            <span className="gradient-text-purple">Fair</span> for teams.
          </SectionHeading>
          <SectionLead className="mx-auto">
            No seat traps. No usage cliffs. Cancel anytime, export everything.
          </SectionLead>

          <div className="mt-8 inline-flex items-center gap-1 p-1 rounded-full border border-[var(--border-color)] bg-[var(--surface)]/70">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={cn(
                "px-4 py-1.5 text-sm rounded-full transition-colors font-medium",
                !annual ? "bg-[var(--primary)] text-white shadow-[0_2px_12px_rgba(124,92,255,0.45)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              )}
              aria-pressed={!annual}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={cn(
                "px-4 py-1.5 text-sm rounded-full transition-colors font-medium flex items-center gap-2",
                annual ? "bg-[var(--primary)] text-white shadow-[0_2px_12px_rgba(124,92,255,0.45)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              )}
              aria-pressed={annual}
            >
              Annual
              <span className={cn(
                "text-[10px] font-mono uppercase tracking-[0.15em] px-1.5 py-0.5 rounded",
                annual ? "bg-white/20 text-white" : "bg-[var(--secondary)]/15 text-[var(--secondary)]"
              )}>
                2 months free
              </span>
            </button>
          </div>
        </motion.div>

        <div className="mt-14 grid md:grid-cols-3 gap-6 items-stretch">
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 0.68, 0, 1] }}
              className={cn(
                "relative rounded-2xl p-7 sm:p-8 transition-all flex flex-col",
                tier.highlighted
                  ? "border-2 border-[var(--primary)]/60 bg-gradient-to-b from-[var(--primary)]/10 via-[var(--surface)]/80 to-[var(--surface)]/80 shadow-[0_12px_48px_-12px_rgba(124,92,255,0.45)] md:-mt-4 md:mb-4"
                  : "border border-[var(--border-color)] bg-[var(--surface)]/60 hover:border-[var(--border-strong)]"
              )}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white text-[10px] font-mono uppercase tracking-[0.2em] shadow-[0_4px_16px_rgba(124,92,255,0.5)]">
                  <Sparkles className="size-3" />
                  Most Popular
                </div>
              )}

              <div>
                <h3 className="text-xl font-semibold text-[var(--text-primary)]">{tier.name}</h3>
                <p className="mt-1.5 text-sm text-[var(--text-muted)] min-h-[40px]">{tier.tagline}</p>
              </div>

              <div className="mt-6">
                {tier.priceLabel ? (
                  <div className="text-4xl font-bold text-[var(--text-primary)] tracking-tight">{tier.priceLabel}</div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-[var(--text-primary)] tracking-tight">
                      ${annual ? tier.annual : tier.monthly}
                    </span>
                    {(tier.monthly ?? 0) > 0 && (
                      <span className="text-sm text-[var(--text-muted)]">/dev/mo</span>
                    )}
                  </div>
                )}
                {(tier.monthly ?? 0) > 0 && (
                  <p className="mt-1 text-xs text-[var(--text-subtle)] font-mono">
                    {annual ? "billed annually" : "billed monthly"}
                  </p>
                )}
                {tier.priceLabel === "Custom" && (
                  <p className="mt-1 text-xs text-[var(--text-subtle)] font-mono">tailored to your team</p>
                )}
              </div>

              <Button
                asChild
                size="lg"
                variant={tier.highlighted ? "default" : "outline"}
                className={cn(
                  "mt-6 w-full",
                  tier.highlighted
                    ? "shadow-[0_4px_18px_rgba(124,92,255,0.4)] hover:shadow-[0_6px_24px_rgba(124,92,255,0.6)] hover:-translate-y-0.5 transition-transform"
                    : "border-[var(--border-color)] bg-[var(--background)]/40 hover:bg-[var(--surface-elevated)] text-[var(--text-primary)]"
                )}
              >
                <Link href={tier.href}>
                  {tier.cta}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>

              <ul className="mt-7 space-y-3 flex-1">
                {tier.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-sm text-[var(--text-muted)]">
                    <span className={cn(
                      "mt-0.5 inline-flex w-4 h-4 rounded-full items-center justify-center shrink-0",
                      tier.highlighted ? "bg-[var(--primary)]/20" : "bg-[var(--surface-elevated)]"
                    )}>
                      <Check className={cn("size-3", tier.highlighted ? "text-[var(--primary)]" : "text-[var(--secondary)]")} />
                    </span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}
