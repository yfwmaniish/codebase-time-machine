"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function IndexingPage() {
  const { repoId } = useParams<{ repoId: string }>();
  const router = useRouter();
  const [status, setStatus] = useState("pending");
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/repos/${repoId}`);
        const data = await res.json();
        setStatus(data.status);
        if (data.status === "ready") {
          clearInterval(poll);
          setTimeout(() => router.push(`/${repoId}`), 1000);
        }
        if (data.status === "failed") clearInterval(poll);
      } catch { /* retry */ }
    }, 2000);
    return () => clearInterval(poll);
  }, [repoId, router]);

  const stages = [
    { key: "pending", label: "Queued", icon: "⏳" },
    { key: "cloning", label: "Cloning repository", icon: "📥" },
    { key: "parsing", label: "Parsing git history", icon: "🔍" },
    { key: "embedding", label: "Generating embeddings", icon: "🧠" },
    { key: "ready", label: "Ready!", icon: "✅" },
  ];

  const currentIdx = stages.findIndex(s => s.key === status);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-radial">
      <div className="text-center max-w-md mx-auto animate-fade-in">
        <div className="text-6xl mb-6 animate-pulse-glow inline-block p-4 rounded-2xl">⏱</div>
        <h1 className="text-2xl font-bold mb-2">Indexing Repository{dots}</h1>
        <p className="text-[var(--text-secondary)] mb-8">This usually takes 30-90 seconds</p>

        {status === "failed" ? (
          <div className="card p-6 border-[var(--accent-danger)]">
            <p className="text-[var(--accent-danger)] font-semibold mb-2">Indexing failed</p>
            <p className="text-sm text-[var(--text-secondary)] mb-4">The repository could not be processed.</p>
            <button onClick={() => router.push("/")} className="btn btn-primary">Try another repo</button>
          </div>
        ) : (
          <div className="space-y-4">
            {stages.map((stage, i) => {
              const isActive = i === currentIdx;
              const isDone = i < currentIdx;
              return (
                <div key={stage.key} className={`flex items-center gap-4 p-3 rounded-lg transition-all ${isActive ? "bg-[var(--bg-elevated)] border border-[var(--accent-primary)]" : isDone ? "opacity-50" : "opacity-30"}`}>
                  <span className="text-xl">{isDone ? "✅" : stage.icon}</span>
                  <span className={`text-sm ${isActive ? "text-[var(--text-primary)] font-medium" : "text-[var(--text-secondary)]"}`}>{stage.label}</span>
                  {isActive && <div className="ml-auto w-4 h-4 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin"/>}
                </div>
              );
            })}
          </div>
        )}

        {status === "ready" && (
          <div className="mt-6 animate-slide-up">
            <p className="text-[var(--accent-success)] font-semibold mb-3">✅ Repository indexed!</p>
            <p className="text-sm text-[var(--text-secondary)]">Redirecting to dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
}
