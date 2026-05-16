"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  CloudDownload,
  Search,
  BrainCircuit,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ITEM_EASE = [0.22, 0.68, 0, 1] as [number, number, number, number];

const STAGES = [
  { key: "pending", label: "Queued", icon: Clock, body: "Waiting for an indexing slot." },
  { key: "cloning", label: "Cloning repository", icon: CloudDownload, body: "Pulling commits, refs, and metadata." },
  { key: "parsing", label: "Parsing git history", icon: Search, body: "Extracting diffs, authors, decisions." },
  { key: "embedding", label: "Generating embeddings", icon: BrainCircuit, body: "IBM Bob is converting commits to vectors." },
  { key: "ready", label: "Ready", icon: CheckCircle2, body: "Your queryable brain is live." },
] as const;

export default function IndexingPage() {
  const { repoId } = useParams<{ repoId: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<string>("pending");

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
      } catch {
        /* retry */
      }
    }, 2000);
    return () => clearInterval(poll);
  }, [repoId, router]);

  const currentIdx = STAGES.findIndex((s) => s.key === status);
  const isFailed = status === "failed";

  return (
    <div className="min-h-screen relative isolate overflow-hidden flex items-center justify-center px-4 py-12">
      {/* Background */}
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" aria-hidden />
      <div className="absolute inset-0 radial-glow-primary pointer-events-none" aria-hidden />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: ITEM_EASE }}
        className="relative w-full max-w-xl"
      >
        <div className="relative rounded-2xl border border-[var(--border-color)] bg-[var(--surface)]/80 backdrop-blur-sm p-7 sm:p-9 glow-border">
          <div className="text-center">
            <div className="inline-flex items-center justify-center">
              <motion.span
                className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shadow-[0_0_36px_-4px_rgba(124,92,255,0.7)]"
                animate={isFailed ? {} : { scale: [1, 1.04, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              >
                {isFailed ? (
                  <AlertTriangle className="size-7 text-white" />
                ) : (
                  <Clock className="size-7 text-white" />
                )}
              </motion.span>
            </div>

            <h1 className="mt-5 text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              {isFailed ? (
                <>Indexing <span className="text-red-400">failed</span></>
              ) : status === "ready" ? (
                <>Repository <span className="gradient-text-purple">indexed</span></>
              ) : (
                <>Indexing your repository<AnimatedDots /></>
              )}
            </h1>
            <p className="mt-2 text-sm text-[var(--text-muted)] font-mono">
              {isFailed
                ? "We couldn't process this repository."
                : status === "ready"
                ? "Redirecting to your dashboard…"
                : "Usually 30–90 seconds. Bob is reading every commit."}
            </p>
          </div>

          {isFailed ? (
            <div className="mt-7 rounded-xl border border-red-500/30 bg-red-500/5 p-5 text-center">
              <p className="text-sm text-red-200 leading-relaxed">
                The repo may be private, archived, or too large for the free tier. Try a different public repo.
              </p>
              <Button
                onClick={() => router.push("/")}
                className="mt-5 shadow-[0_4px_14px_rgba(124,92,255,0.4)]"
              >
                Try another repo
                <ArrowRight className="size-4" />
              </Button>
            </div>
          ) : (
            <ol className="mt-7 space-y-2.5">
              {STAGES.map((stage, i) => {
                const isActive = i === currentIdx;
                const isDone = i < currentIdx || status === "ready";
                const Icon = stage.icon;
                return (
                  <li key={stage.key}>
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{
                        opacity: isActive || isDone ? 1 : 0.45,
                        x: 0,
                      }}
                      transition={{ duration: 0.4, ease: ITEM_EASE, delay: i * 0.04 }}
                      className={cn(
                        "flex items-center gap-3.5 px-4 py-3 rounded-lg border transition-all",
                        isActive
                          ? "border-[var(--primary)]/50 bg-[var(--primary)]/8 shadow-[0_0_24px_-8px_rgba(124,92,255,0.5)]"
                          : isDone
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : "border-[var(--border-color)] bg-[var(--surface)]/30"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex w-8 h-8 rounded-md items-center justify-center shrink-0",
                          isActive
                            ? "bg-[var(--primary)]/15 border border-[var(--primary)]/40"
                            : isDone
                            ? "bg-emerald-500/15 border border-emerald-500/40"
                            : "bg-[var(--surface-elevated)] border border-[var(--border-color)]"
                        )}
                      >
                        {isDone && !isActive ? (
                          <CheckCircle2 className="size-4 text-emerald-300" />
                        ) : (
                          <Icon
                            className={cn(
                              "size-4",
                              isActive ? "text-[var(--primary)]" : "text-[var(--text-muted)]"
                            )}
                          />
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div
                          className={cn(
                            "text-sm font-medium",
                            isActive
                              ? "text-[var(--text-primary)]"
                              : isDone
                              ? "text-emerald-200"
                              : "text-[var(--text-muted)]"
                          )}
                        >
                          {stage.label}
                        </div>
                        <div className="text-xs text-[var(--text-subtle)] truncate">{stage.body}</div>
                      </div>
                      {isActive && (
                        <Loader2 className="size-4 text-[var(--primary)] animate-spin shrink-0" />
                      )}
                    </motion.div>
                  </li>
                );
              })}
            </ol>
          )}

          <AnimatePresence>
            {status === "ready" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: ITEM_EASE }}
                className="mt-6 text-center inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/8 text-xs font-mono uppercase tracking-[0.2em] text-emerald-300 mx-auto"
              >
                <Sparkles className="size-3" />
                Knowledge base live
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function AnimatedDots() {
  const [dots, setDots] = useState("");
  useEffect(() => {
    const id = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(id);
  }, []);
  return <span className="inline-block w-6 text-left text-[var(--primary)]">{dots}</span>;
}
