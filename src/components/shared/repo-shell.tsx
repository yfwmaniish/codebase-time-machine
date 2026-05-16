"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Home, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Crumb = { label: string; href?: string };

type Props = {
  repoId: string;
  sectionIcon?: LucideIcon;
  sectionLabel: string;
  sectionSubLabel?: string;
  crumbs?: Crumb[];
  actions?: ReactNode;
  children: ReactNode;
  fullHeight?: boolean;
};

export function RepoShell({
  repoId,
  sectionIcon: SectionIcon,
  sectionLabel,
  sectionSubLabel,
  crumbs,
  actions,
  children,
  fullHeight = false,
}: Props) {
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={cn("relative", fullHeight ? "h-screen flex flex-col" : "min-h-screen")}>
      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 0.68, 0, 1] }}
        className={cn(
          "sticky top-0 z-40 border-b transition-colors duration-200",
          scrolled
            ? "bg-[var(--background)]/75 backdrop-blur-md border-[var(--border-color)]/70"
            : "bg-[var(--background)] border-[var(--border-color)]/40"
        )}
      >
        <div className="container-app">
          <div className="flex items-center justify-between h-14 gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Link
                href={`/${repoId}`}
                className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shrink-0 group"
                aria-label="Back to repo dashboard"
              >
                <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
                <span className="text-sm hidden sm:inline">Dashboard</span>
              </Link>
              <span className="text-[var(--border-color)]" aria-hidden>|</span>
              <div className="flex items-center gap-2 min-w-0">
                {SectionIcon && (
                  <span className="inline-flex w-6 h-6 rounded-md bg-[var(--primary)]/15 border border-[var(--primary)]/30 items-center justify-center shrink-0">
                    <SectionIcon className="size-3.5 text-[var(--primary)]" />
                  </span>
                )}
                <h1 className="font-semibold text-sm sm:text-base text-[var(--text-primary)] truncate">
                  {sectionLabel}
                </h1>
                {sectionSubLabel && (
                  <span className="hidden md:inline text-xs text-[var(--text-subtle)] font-mono uppercase tracking-[0.18em]">
                    {sectionSubLabel}
                  </span>
                )}
              </div>
            </div>

            {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
          </div>

          {crumbs && crumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="pb-2 -mt-1">
              <ol className="flex items-center gap-1.5 text-xs text-[var(--text-subtle)] font-mono">
                <li>
                  <button
                    onClick={() => router.push("/")}
                    className="inline-flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors"
                    type="button"
                  >
                    <Home className="size-3" />
                    Home
                  </button>
                </li>
                {crumbs.map((c, i) => (
                  <li key={`${c.label}-${i}`} className="flex items-center gap-1.5">
                    <span aria-hidden>/</span>
                    {c.href ? (
                      <Link href={c.href} className="hover:text-[var(--text-primary)] transition-colors truncate">
                        {c.label}
                      </Link>
                    ) : (
                      <span className="text-[var(--text-muted)] truncate">{c.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </div>
      </motion.header>

      <div className={cn("relative", fullHeight && "flex-1 min-h-0 flex flex-col")}>{children}</div>
    </div>
  );
}

/* Small badge for "Indexed", "Live", etc — uses shadcn Badge under the hood */
export function RepoShellStatus({ children, tone = "primary" }: { children: ReactNode; tone?: "primary" | "success" | "warn" }) {
  const variant = tone === "success" ? "default" : tone === "warn" ? "secondary" : "secondary";
  return (
    <Badge
      variant={variant}
      className={cn(
        "rounded-full font-mono text-[10px] uppercase tracking-[0.18em] gap-1.5",
        tone === "success" && "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30",
        tone === "primary" && "bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30",
        tone === "warn" && "bg-amber-500/10 text-amber-300 border border-amber-500/30"
      )}
    >
      {children}
    </Badge>
  );
}

/* Floating CTM logo for use in shell when needed (e.g., empty states) */
export function CtmGlyph({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] items-center justify-center shadow-[0_0_20px_-2px_rgba(124,92,255,0.6)]", className)}>
      <Clock className="size-4 text-white" />
    </span>
  );
}
