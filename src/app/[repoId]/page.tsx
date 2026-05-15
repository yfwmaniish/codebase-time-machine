"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Repository, Author } from "@/types";

interface RepoData extends Repository {
  top_authors: Author[];
  languages: Record<string, number>;
}

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
          <div className="w-12 h-12 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Loading repository...</p>
        </div>
      </div>
    );
  }

  if (!repo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--accent-danger)]">Repository not found</p>
      </div>
    );
  }

  const NAV_ITEMS = [
    { icon: "💬", label: "Why Engine", href: `/${repoId}/chat`, desc: "Ask questions about code history" },
    { icon: "⏳", label: "Time Travel", href: `/${repoId}/time-travel`, desc: "Explore file evolution" },
    { icon: "📋", label: "ADRs", href: `/${repoId}/adrs`, desc: "Architectural Decision Records" },
    { icon: "👻", label: "Ghost Author", href: `/${repoId}/ghost`, desc: "Chat with past contributors" },
  ];

  const topLangs = Object.entries(repo.languages || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="container-app py-6">
          <div className="flex items-center gap-3 mb-1">
            <button onClick={() => router.push("/")} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              ← Home
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{repo.name}</h1>
              <p className="text-[var(--text-secondary)] text-sm mt-1">{repo.github_url}</p>
            </div>
            <div className="badge badge-success">✓ Indexed</div>
          </div>
        </div>
      </header>

      <div className="container-app py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 stagger-children">
          {[
            { label: "Commits", value: repo.total_commits.toLocaleString(), icon: "📝" },
            { label: "Files", value: repo.total_files.toLocaleString(), icon: "📁" },
            { label: "Authors", value: repo.total_authors.toLocaleString(), icon: "👥" },
            { label: "Branch", value: repo.default_branch || "main", icon: "🌿" },
          ].map((stat) => (
            <div key={stat.label} className="card p-5 text-center">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-[var(--text-muted)]">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Feature Navigation */}
        <h2 className="text-lg font-semibold mb-4">Explore</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 stagger-children">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className="card card-glow p-6 text-left group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl group-hover:scale-110 transition-transform">{item.icon}</div>
                <div>
                  <h3 className="font-semibold text-lg group-hover:text-[var(--accent-primary)] transition-colors">
                    {item.label}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">{item.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Two-column: Languages + Top Authors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Languages */}
          <div className="card p-6">
            <h3 className="font-semibold mb-4">Languages</h3>
            <div className="space-y-3">
              {topLangs.map(([lang, count]) => {
                const total = Object.values(repo.languages).reduce((a, b) => a + b, 0);
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={lang}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{lang}</span>
                      <span className="text-[var(--text-muted)]">{pct}%</span>
                    </div>
                    <div className="h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent-primary)] rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Authors */}
          <div className="card p-6">
            <h3 className="font-semibold mb-4">Top Contributors</h3>
            <div className="space-y-3">
              {repo.top_authors?.slice(0, 5).map((author, i) => (
                <div key={author.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--bg-hover)] flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{author.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{author.total_commits} commits</p>
                    </div>
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">{author.files_touched} files</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
