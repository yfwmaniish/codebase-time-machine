"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  GitCommit,
  Files,
  Users,
  GitBranch,
  MessageSquare,
  Clock3,
  ScrollText,
  Ghost,
  Network,
  ArrowRight,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type { Repository, Author } from "@/types";
import { CtmGlyph, RepoShell, RepoShellStatus } from "@/components/shared/repo-shell";
import { GithubIcon } from "@/components/shared/brand-icons";

interface RepoData extends Repository {
  top_authors: Author[];
  languages: Record<string, number>;
}

const ITEM_EASE = [0.22, 0.68, 0, 1] as [number, number, number, number];

export default function RepoDashboard() {
  const { repoId } = useParams<{ repoId: string }>();
  const router = useRouter();
  const [repo, setRepo] = useState<RepoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/repos/${repoId}`)
      .then((r) => r.json())
      .then((data) => {
        setRepo(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [repoId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-5 relative">
            <CtmGlyph className="w-12 h-12" />
            <Loader2 className="absolute -inset-2 size-16 text-[var(--primary)]/40 animate-spin" />
          </div>
          <p className="text-[var(--text-muted)] font-mono text-sm">Loading repository…</p>
        </div>
      </div>
    );
  }

  if (!repo) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center rounded-2xl border border-red-500/30 bg-red-500/5 p-8">
          <AlertCircle className="size-10 text-red-400 mx-auto mb-3" />
          <p className="text-lg font-semibold text-[var(--text-primary)]">Repository not found</p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            The link may be stale or the index may have been removed.
          </p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-medium transition-colors"
          >
            Back to home
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    );
  }

  if (repo.status && repo.status !== "ready") {
    router.push(`/${repoId}/indexing`);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--text-muted)] font-mono text-sm">Redirecting to indexing…</p>
      </div>
    );
  }

  const NAV_ITEMS = [
    {
      icon: MessageSquare,
      label: "Why Engine",
      href: `/${repoId}/chat`,
      desc: "Ask questions about code history. Get cited answers from real commits.",
      accent: "purple",
    },
    {
      icon: Clock3,
      label: "Time Travel",
      href: `/${repoId}/time-travel`,
      desc: "Scrub through any file's evolution with AI-generated summaries.",
      accent: "cyan",
    },
    {
      icon: ScrollText,
      label: "ADRs",
      href: `/${repoId}/adrs`,
      desc: "Architectural Decision Records auto-extracted from commit patterns.",
      accent: "purple",
    },
    {
      icon: Ghost,
      label: "Ghost Author",
      href: `/${repoId}/ghost`,
      desc: "Chat with AI-synthesized profiles of past contributors.",
      accent: "cyan",
    },
    {
      icon: Network,
      label: "Knowledge Graph",
      href: `/${repoId}/graph`,
      desc: "Interactive visualization of codebase relationships.",
      accent: "purple",
    },
  ] as const;

  const STATS = [
    { label: "Commits", value: (repo.total_commits ?? 0).toLocaleString(), icon: GitCommit },
    { label: "Files", value: (repo.total_files ?? 0).toLocaleString(), icon: Files },
    { label: "Authors", value: (repo.total_authors ?? 0).toLocaleString(), icon: Users },
    { label: "Branch", value: repo.default_branch || "main", icon: GitBranch, mono: true },
  ];

  const totalLangBytes = Object.values(repo.languages || {}).reduce((a, b) => a + b, 0) || 1;
  const topLangs = Object.entries(repo.languages || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  return (
    <RepoShell
      repoId={repoId}
      sectionIcon={GitBranch}
      sectionLabel={repo.name}
      actions={
        <>
          <Link
            href={repo.github_url || "#"}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors font-mono"
          >
            <GithubIcon size={14} />
            <span className="truncate max-w-[200px]">{stripGithubPrefix(repo.github_url)}</span>
          </Link>
          <RepoShellStatus tone="success">
            <Check className="size-3" />
            Indexed
          </RepoShellStatus>
        </>
      }
    >
      <div className="relative">
        {/* Hero gradient backdrop */}
        <div
          className="absolute inset-x-0 top-0 h-64 pointer-events-none"
          style={{ background: "radial-gradient(60% 80% at 50% 0%, rgba(124, 92, 255, 0.12), transparent 70%)" }}
          aria-hidden
        />

        <div className="container-app relative py-10 sm:py-12">
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: ITEM_EASE }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
          >
            {STATS.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.08 * i, ease: ITEM_EASE }}
                  className="surface-card p-5 sm:p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                      {stat.label}
                    </div>
                    <span className="inline-flex w-7 h-7 rounded-md bg-[var(--primary)]/12 border border-[var(--primary)]/25 items-center justify-center">
                      <Icon className="size-3.5 text-[var(--primary)]" />
                    </span>
                  </div>
                  <div className={`mt-3 text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight ${stat.mono ? "font-mono" : ""}`}>
                    {stat.value}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Explore */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)]">Explore</h2>
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--text-subtle)]">
                Four tools · One history
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {NAV_ITEMS.map((item, i) => {
                const Icon = item.icon;
                const accentColor = item.accent === "cyan" ? "var(--secondary)" : "var(--primary)";
                return (
                  <motion.button
                    key={item.label}
                    type="button"
                    onClick={() => router.push(item.href)}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.1 + i * 0.07, ease: ITEM_EASE }}
                    whileHover={{ y: -4 }}
                    className="group relative text-left rounded-2xl border border-[var(--border-color)] bg-[var(--surface)]/55 hover:bg-[var(--surface)]/85 hover:border-[var(--primary)]/40 p-6 overflow-hidden transition-colors"
                  >
                    <span
                      className="absolute -top-14 -right-14 w-36 h-36 rounded-full opacity-0 group-hover:opacity-100 blur-3xl transition-opacity"
                      style={{ background: `${accentColor === "var(--secondary)" ? "rgba(34, 211, 238, 0.18)" : "rgba(124, 92, 255, 0.18)"}` }}
                      aria-hidden
                    />
                    <div className="relative flex items-start gap-4">
                      <span
                        className="inline-flex w-12 h-12 rounded-xl items-center justify-center border shrink-0 transition-transform group-hover:scale-105"
                        style={{
                          background: accentColor === "var(--secondary)" ? "rgba(34, 211, 238, 0.1)" : "rgba(124, 92, 255, 0.12)",
                          borderColor: accentColor === "var(--secondary)" ? "rgba(34, 211, 238, 0.3)" : "rgba(124, 92, 255, 0.3)",
                        }}
                      >
                        <Icon className="size-5" style={{ color: accentColor }} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                          {item.label}
                        </h3>
                        <p className="mt-1.5 text-sm text-[var(--text-muted)] leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                      <ArrowRight className="size-4 text-[var(--text-subtle)] mt-1 shrink-0 transition-all group-hover:text-[var(--primary)] group-hover:translate-x-0.5" />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Languages + Contributors */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.4, ease: ITEM_EASE }}
              className="surface-card p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-[var(--text-primary)]">Languages</h3>
                <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                  Top {topLangs.length}
                </span>
              </div>
              {topLangs.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">No language data available.</p>
              ) : (
                <div className="space-y-3.5">
                  {topLangs.map(([lang, count], i) => {
                    const pct = Math.round((count / totalLangBytes) * 100);
                    return (
                      <div key={lang}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-[var(--text-primary)] font-medium">{lang}</span>
                          <span className="text-[var(--text-muted)] font-mono text-xs">{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-[var(--background)] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.9, delay: 0.5 + i * 0.06, ease: ITEM_EASE }}
                            className={`h-full rounded-full ${
                              i === 0
                                ? "bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]"
                                : "bg-[var(--primary)]/60"
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.45, ease: ITEM_EASE }}
              className="surface-card p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-[var(--text-primary)]">Top Contributors</h3>
                <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                  By commits
                </span>
              </div>
              {repo.top_authors && repo.top_authors.length > 0 ? (
                <ul className="space-y-3">
                  {repo.top_authors.slice(0, 5).map((author, i) => (
                    <li key={author.id} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`inline-flex w-8 h-8 rounded-full items-center justify-center text-xs font-bold shrink-0 font-mono ${
                            i === 0
                              ? "bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white shadow-[0_0_12px_-2px_rgba(124,92,255,0.6)]"
                              : "bg-[var(--surface-elevated)] text-[var(--text-muted)]"
                          }`}
                        >
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--text-primary)] truncate">{author.name}</p>
                          <p className="text-xs text-[var(--text-muted)] font-mono">
                            {author.total_commits} commits
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-[var(--text-subtle)] font-mono shrink-0">
                        {author.files_touched} files
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">No contributor data available.</p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </RepoShell>
  );
}

function stripGithubPrefix(url?: string | null) {
  if (!url) return "";
  return url.replace(/^https?:\/\/(www\.)?github\.com\//i, "");
}
