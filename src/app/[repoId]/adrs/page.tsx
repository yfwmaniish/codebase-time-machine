"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScrollText,
  Download,
  RefreshCw,
  ChevronDown,
  Sparkles,
  Loader2,
} from "lucide-react";
import type { ADR } from "@/types";
import { RepoShell } from "@/components/shared/repo-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ITEM_EASE = [0.22, 0.68, 0, 1] as [number, number, number, number];

export default function ADRsPage() {
  const { repoId } = useParams<{ repoId: string }>();
  const [adrs, setAdrs] = useState<ADR[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/repos/${repoId}/adrs`)
      .then((r) => r.json())
      .then((d) => {
        setAdrs(d.adrs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [repoId]);

  const generateADRs = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/repos/${repoId}/adrs`, { method: "POST" });
      const data = await res.json();
      setAdrs(data.adrs || []);
    } finally {
      setGenerating(false);
    }
  };

  const downloadAll = () => {
    const md = adrs
      .map(
        (a) =>
          `# ADR: ${a.title}\n\n**Status:** ${a.status}\n\n**Context:**\n${a.context}\n\n**Decision:**\n${a.decision}\n\n**Consequences:**\n${a.consequences}\n\n---\n`
      )
      .join("\n");
    const blob = new Blob([md], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "adrs.md";
    a.click();
  };

  return (
    <RepoShell
      repoId={repoId}
      sectionIcon={ScrollText}
      sectionLabel="ADRs"
      sectionSubLabel="Architectural decisions"
      actions={
        <>
          {adrs.length > 0 && (
            <Button onClick={downloadAll} size="sm" variant="outline" className="border-[var(--border-color)] bg-[var(--surface)]/60 text-[var(--text-primary)]">
              <Download className="size-3.5" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          )}
          <Button
            onClick={generateADRs}
            disabled={generating}
            size="sm"
            className="shadow-[0_4px_14px_rgba(124,92,255,0.4)]"
          >
            {generating ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Generating
              </>
            ) : (
              <>
                <RefreshCw className="size-3.5" />
                {adrs.length > 0 ? "Regenerate" : "Generate"}
              </>
            )}
          </Button>
        </>
      }
    >
      <div className="container-app py-10">
        {loading ? (
          <div className="space-y-3 max-w-4xl mx-auto">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-20 w-full" />
            ))}
          </div>
        ) : adrs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: ITEM_EASE }}
            className="max-w-md mx-auto text-center py-16"
          >
            <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] items-center justify-center shadow-[0_0_36px_-6px_rgba(124,92,255,0.6)]">
              <ScrollText className="size-7 text-white" />
            </div>
            <h2 className="mt-5 text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              No <span className="gradient-text-purple">ADRs</span> yet.
            </h2>
            <p className="mt-3 text-[var(--text-muted)] leading-relaxed">
              Bob will analyze the commit history, surface major architectural decisions, and write each one as a structured Markdown record.
            </p>
            <Button
              onClick={generateADRs}
              disabled={generating}
              size="lg"
              className="mt-6 shadow-[0_4px_18px_rgba(124,92,255,0.45)] hover:shadow-[0_6px_24px_rgba(124,92,255,0.6)]"
            >
              {generating ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Reading history…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Generate ADRs
                </>
              )}
            </Button>
          </motion.div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: ITEM_EASE }}
              className="flex items-center justify-between mb-5"
            >
              <div>
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">Identified decisions</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)] font-mono">
                  {adrs.length} record{adrs.length === 1 ? "" : "s"} · synthesized by Bob
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/30 text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--primary)]">
                <Sparkles className="size-3" />
                AI-generated
              </span>
            </motion.div>

            <div className="space-y-3">
              {adrs.map((adr, i) => {
                const isOpen = expandedId === adr.id;
                return (
                  <motion.div
                    key={adr.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: i * 0.05, ease: ITEM_EASE }}
                    className={cn(
                      "rounded-xl border transition-all overflow-hidden",
                      isOpen
                        ? "border-[var(--primary)]/40 bg-[var(--surface)]/80 shadow-[0_8px_28px_-12px_rgba(124,92,255,0.4)]"
                        : "border-[var(--border-color)] bg-[var(--surface)]/55 hover:border-[var(--primary)]/30 hover:bg-[var(--surface)]/75"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedId(isOpen ? null : adr.id)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4"
                      aria-expanded={isOpen}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 shrink-0">
                          {adr.status || "Accepted"}
                        </span>
                        <span className="font-mono text-xs text-[var(--text-subtle)] shrink-0 hidden sm:inline">
                          ADR-{String(i + 1).padStart(3, "0")}
                        </span>
                        <h3 className="font-semibold text-[var(--text-primary)] truncate">{adr.title}</h3>
                      </div>
                      <ChevronDown
                        className={cn(
                          "size-4 text-[var(--text-muted)] shrink-0 transition-transform",
                          isOpen && "rotate-180 text-[var(--primary)]"
                        )}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: ITEM_EASE }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 border-t border-[var(--border-color)] pt-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                            <AdrColumn label="Context" body={adr.context} />
                            <AdrColumn label="Decision" body={adr.decision} accent />
                            <AdrColumn label="Consequences" body={adr.consequences} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </RepoShell>
  );
}

function AdrColumn({ label, body, accent }: { label: string; body: string; accent?: boolean }) {
  return (
    <div>
      <h4
        className={cn(
          "text-[10px] font-mono uppercase tracking-[0.22em] mb-2",
          accent ? "text-[var(--primary)]" : "text-[var(--text-subtle)]"
        )}
      >
        {label}
      </h4>
      <p className="text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-wrap">{body}</p>
    </div>
  );
}
