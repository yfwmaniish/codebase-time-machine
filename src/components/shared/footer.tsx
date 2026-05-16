import Link from "next/link";
import { Clock, Sparkles } from "lucide-react";
import { GithubIcon, TwitterIcon, LinkedinIcon } from "@/components/shared/brand-icons";

type Column = { title: string; links: { label: string; href: string }[] };

const COLUMNS: Column[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Demo", href: "#demo" },
      { label: "Roadmap", href: "#roadmap" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Docs", href: "#docs" },
      { label: "Blog", href: "#blog" },
      { label: "GitHub", href: "https://github.com/" },
      { label: "API", href: "#api" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Hackathon", href: "#hackathon" },
      { label: "Contact", href: "mailto:hello@ctm.app" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#privacy" },
      { label: "Terms", href: "#terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-[var(--border-color)]/60 bg-[var(--background)]">
      <div className="absolute inset-0 grid-bg-static opacity-30 pointer-events-none" aria-hidden />
      <div className="container-app relative py-16">
        <div className="grid gap-12 lg:grid-cols-[2fr_3fr]">
          <div>
            <Link href="#top" className="inline-flex items-center gap-2.5 group">
              <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shadow-[0_0_24px_-4px_rgba(124,92,255,0.7)]">
                <Clock className="size-4 text-white" />
              </span>
              <span className="font-mono font-semibold tracking-tight text-[var(--text-primary)] text-lg">
                Codebase Time Machine
              </span>
            </Link>
            <p className="mt-4 text-sm text-[var(--text-muted)] max-w-md leading-relaxed">
              Git tells you what changed. We tell you why. Powered by IBM Bob.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/5">
              <Sparkles className="size-3.5 text-[var(--primary)]" />
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--text-primary)]">
                Built with IBM Bob
              </span>
            </div>

            <div className="mt-6 flex items-center gap-2">
              <Link
                href="https://github.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="w-9 h-9 rounded-md border border-[var(--border-color)] hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] flex items-center justify-center text-[var(--text-muted)] transition-colors"
              >
                <GithubIcon size={16} />
              </Link>
              <Link
                href="https://twitter.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="X (Twitter)"
                className="w-9 h-9 rounded-md border border-[var(--border-color)] hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] flex items-center justify-center text-[var(--text-muted)] transition-colors"
              >
                <TwitterIcon size={16} />
              </Link>
              <Link
                href="https://linkedin.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-md border border-[var(--border-color)] hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] flex items-center justify-center text-[var(--text-muted)] transition-colors"
              >
                <LinkedinIcon size={16} />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <div className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--text-subtle)] mb-4">
                  {col.title}
                </div>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        target={link.href.startsWith("http") ? "_blank" : undefined}
                        rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                        className="text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[var(--border-color)]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[var(--text-subtle)] font-mono">
          <div>© 2026 Codebase Time Machine. All rights reserved.</div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            All systems nominal
          </div>
        </div>
      </div>
    </footer>
  );
}
