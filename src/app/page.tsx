"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DEMO_REPOS = [
  {
    name: "expressjs/express",
    url: "https://github.com/expressjs/express",
    description: "Fast, unopinionated, minimalist web framework for Node.js",
    stars: "64k",
    language: "JavaScript",
  },
  {
    name: "lodash/lodash",
    url: "https://github.com/lodash/lodash",
    description: "A modern JavaScript utility library delivering modularity",
    stars: "59k",
    language: "JavaScript",
  },
  {
    name: "sindresorhus/got",
    url: "https://github.com/sindresorhus/got",
    description: "Human-friendly HTTP request library for Node.js",
    stars: "14k",
    language: "TypeScript",
  },
];

const FEATURES = [
  {
    icon: "💬",
    title: "Why Engine",
    desc: "Ask any question about your codebase history and get cited answers.",
  },
  {
    icon: "⏳",
    title: "Time Travel",
    desc: "Scrub through a file's evolution with AI-generated summaries.",
  },
  {
    icon: "📋",
    title: "Auto ADRs",
    desc: "Generate Architectural Decision Records from commit history.",
  },
  {
    icon: "👻",
    title: "Ghost Author",
    desc: "Chat with AI profiles of past contributors about their work.",
  },
  {
    icon: "🕸️",
    title: "Knowledge Graph",
    desc: "Visualize connections between files, people, and decisions.",
  },
];

export default function LandingPage() {
  const [repoUrl, setRepoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleIngest = async (url?: string) => {
    const targetUrl = url || repoUrl;
    if (!targetUrl.trim()) {
      setError("Please enter a GitHub repository URL");
      return;
    }

    const githubPattern = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+(\.git)?$/;
    if (!githubPattern.test(targetUrl.trim())) {
      setError("Please enter a valid public GitHub URL (e.g., https://github.com/user/repo)");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/repos/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to start ingestion");
        setIsLoading(false);
        return;
      }

      router.push(`/${data.repo_id}/indexing`);
    } catch {
      setError("Network error. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-radial bg-grid">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/80 backdrop-blur-md">
        <div className="container-app flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center text-lg">
              ⏱
            </div>
            <span className="font-semibold text-lg">Codebase Time Machine</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost text-sm"
            >
              GitHub
            </a>
            <div className="badge badge-cyan">Powered by IBM watsonx</div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-20">
        <div className="container-app text-center">
          <div className="animate-fade-in">
            <div className="badge badge-primary mb-6 text-sm">
              🏆 Built for IBM Build on Bob Hackathon
            </div>
          </div>

          <h1
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            Git tells you{" "}
            <span className="text-[var(--text-muted)]">what</span> changed.
            <br />
            We tell you{" "}
            <span className="text-gradient">why</span>.
          </h1>

          <p
            className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-12 animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            Turn any Git repository into a queryable knowledge base.
            Ask questions, travel through time, and never lose tribal knowledge again.
          </p>

          {/* URL Input */}
          <div
            className="max-w-2xl mx-auto animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex gap-3">
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => {
                  setRepoUrl(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleIngest()}
                placeholder="https://github.com/expressjs/express"
                className="input input-lg flex-1"
                disabled={isLoading}
              />
              <button
                onClick={() => handleIngest()}
                disabled={isLoading}
                className="btn btn-primary btn-lg whitespace-nowrap"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Indexing...
                  </span>
                ) : (
                  "Explore Repository →"
                )}
              </button>
            </div>
            {error && (
              <p className="text-[var(--accent-danger)] text-sm mt-3 text-left">
                {error}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Demo Repos */}
      <section className="pb-20">
        <div className="container-app">
          <p className="text-center text-[var(--text-muted)] text-sm mb-6">
            Or try one of these popular repositories
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto stagger-children">
            {DEMO_REPOS.map((repo) => (
              <button
                key={repo.name}
                onClick={() => {
                  setRepoUrl(repo.url);
                  handleIngest(repo.url);
                }}
                disabled={isLoading}
                className="card card-glow p-5 text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[var(--text-primary)] font-medium group-hover:text-[var(--accent-primary)] transition-colors">
                    {repo.name}
                  </span>
                  <span className="badge badge-amber text-xs">⭐ {repo.stars}</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-3">
                  {repo.description}
                </p>
                <span className="badge badge-primary text-xs">{repo.language}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 border-t border-[var(--border-subtle)]">
        <div className="container-app">
          <h2 className="text-3xl font-bold text-center mb-4">
            Five ways to understand your code
          </h2>
          <p className="text-[var(--text-secondary)] text-center mb-12 max-w-xl mx-auto">
            Each feature is powered by IBM watsonx.ai Granite, reading your full Git history for deep context.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto stagger-children [&>*:last-child:nth-child(3n-1)]:lg:col-start-2 [&>*:last-child:nth-child(3n+1)]:lg:col-start-2">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="card p-6 group hover:border-[var(--accent-primary)] transition-all duration-300"
              >
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 border-t border-[var(--border-subtle)]">
        <div className="container-app text-center">
          <h2 className="text-3xl font-bold mb-12">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Paste a URL", desc: "Drop any public GitHub repo link" },
              { step: "2", title: "We index the history", desc: "Commits, authors, diffs — fully parsed and embedded" },
              { step: "3", title: "Ask anything", desc: "Why, when, who, and what happened — all answered with citations" },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-lg font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 mt-8 border-t border-[var(--border-subtle)]">
        <div className="container-app flex items-center justify-between text-sm text-[var(--text-muted)]">
          <span>Codebase Time Machine — IBM Build on Bob Hackathon 2025</span>
          <span>Powered by IBM watsonx.ai Granite</span>
        </div>
      </footer>
    </div>
  );
}
