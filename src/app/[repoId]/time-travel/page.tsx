"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock3,
  Folder,
  FolderOpen,
  FileCode2,
  ChevronRight,
  X,
  Plus,
  Minus,
} from "lucide-react";
import { RepoShell } from "@/components/shared/repo-shell";
import { cn } from "@/lib/utils";

interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
  language?: string;
  commit_count?: number;
  risk_score?: number;
}

interface TimelineCommit {
  id: string;
  sha: string;
  message: string;
  author_name: string;
  authored_at: string;
  insertions: number;
  deletions: number;
}

const ITEM_EASE = [0.22, 0.68, 0, 1] as [number, number, number, number];

export default function TimeTravelPage() {
  const { repoId } = useParams<{ repoId: string }>();
  const [tree, setTree] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<TimelineCommit[]>([]);
  const [selectedCommit, setSelectedCommit] = useState<TimelineCommit | null>(null);
  const [loading, setLoading] = useState(true);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(`/api/repos/${repoId}/files`)
      .then((r) => r.json())
      .then((data) => {
        setTree(data.tree || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [repoId]);

  const loadTimeline = async (filePath: string) => {
    setSelectedFile(filePath);
    setTimelineLoading(true);
    setSelectedCommit(null);
    try {
      const res = await fetch(`/api/repos/${repoId}/timeline?file=${encodeURIComponent(filePath)}`);
      const data = await res.json();
      setTimeline(data.timeline || []);
    } catch {
      setTimeline([]);
    } finally {
      setTimelineLoading(false);
    }
  };

  const toggleDir = (path: string) => {
    setExpandedDirs((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const renderTree = (nodes: FileNode[], depth = 0): React.ReactNode => (
    <ul className="space-y-0.5" style={{ paddingLeft: depth === 0 ? 0 : 12 }}>
      {nodes.map((node) => {
        const isExpanded = expandedDirs.has(node.path);
        if (node.type === "directory") {
          return (
            <li key={node.path}>
              <button
                type="button"
                onClick={() => toggleDir(node.path)}
                className="flex items-center gap-1.5 w-full py-1.5 px-2 text-sm rounded-md hover:bg-[var(--surface-elevated)] text-left transition-colors group"
              >
                <ChevronRight
                  className={cn(
                    "size-3.5 text-[var(--text-subtle)] transition-transform",
                    isExpanded && "rotate-90"
                  )}
                />
                {isExpanded ? (
                  <FolderOpen className="size-3.5 text-[var(--secondary)]" />
                ) : (
                  <Folder className="size-3.5 text-[var(--text-muted)]" />
                )}
                <span className="text-[var(--text-primary)] truncate">{node.name}</span>
              </button>
              {isExpanded && node.children && renderTree(node.children, depth + 1)}
            </li>
          );
        }
        const isSelected = selectedFile === node.path;
        return (
          <li key={node.path}>
            <button
              type="button"
              onClick={() => loadTimeline(node.path)}
              className={cn(
                "flex items-center justify-between gap-2 w-full py-1.5 pl-7 pr-2 text-sm rounded-md transition-colors text-left group",
                isSelected
                  ? "bg-[var(--primary)]/12 text-[var(--primary)] border border-[var(--primary)]/30"
                  : "hover:bg-[var(--surface-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-transparent"
              )}
            >
              <span className="flex items-center gap-1.5 truncate">
                <FileCode2 className={cn("size-3.5 shrink-0", isSelected ? "text-[var(--primary)]" : "text-[var(--text-subtle)]")} />
                <span className="truncate">{node.name}</span>
              </span>
              {node.commit_count != null && (
                <span className="text-[10px] font-mono text-[var(--text-subtle)] shrink-0">
                  {node.commit_count}c
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <RepoShell
      repoId={repoId}
      sectionIcon={Clock3}
      sectionLabel="Time Travel"
      sectionSubLabel="File evolution"
      fullHeight
    >
      <div className="flex-1 min-h-0 flex">
        {/* File Tree */}
        <aside className="w-64 lg:w-72 shrink-0 border-r border-[var(--border-color)] bg-[var(--surface)]/40 overflow-y-auto">
          <div className="sticky top-0 z-10 bg-[var(--surface)]/60 backdrop-blur-sm border-b border-[var(--border-color)] px-4 py-3">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--text-subtle)]">
              Files
            </h3>
          </div>
          <div className="p-3">
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="skeleton h-7 w-full" />
                ))}
              </div>
            ) : tree.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] px-2 py-4">No files indexed yet.</p>
            ) : (
              renderTree(tree)
            )}
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 flex flex-col">
          {!selectedFile ? (
            <div className="flex-1 flex items-center justify-center px-6">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: ITEM_EASE }}
                className="text-center max-w-md"
              >
                <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] items-center justify-center shadow-[0_0_36px_-6px_rgba(124,92,255,0.6)]">
                  <Clock3 className="size-7 text-white" />
                </div>
                <h2 className="mt-5 text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                  Pick a file to <span className="gradient-text-cyan">time-travel</span>
                </h2>
                <p className="mt-3 text-[var(--text-muted)] text-sm leading-relaxed">
                  Select any file from the tree on the left to see how it grew, who shaped it, and what each major change meant.
                </p>
              </motion.div>
            </div>
          ) : (
            <>
              {/* File header */}
              <div className="border-b border-[var(--border-color)] bg-[var(--surface)]/40 backdrop-blur-sm px-6 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-sm text-[var(--secondary)] truncate">{selectedFile}</p>
                    <p className="mt-0.5 text-xs text-[var(--text-muted)] font-mono">
                      {timelineLoading ? "Loading…" : `${timeline.length} commits in history`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="flex-1 overflow-y-auto px-6 py-8">
                {timelineLoading ? (
                  <div className="max-w-2xl space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="skeleton h-24 w-full" />
                    ))}
                  </div>
                ) : timeline.length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)]">No commits found for this file.</p>
                ) : (
                  <ol className="relative max-w-3xl">
                    <div
                      className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-[var(--primary)] via-[var(--secondary)] to-transparent"
                      aria-hidden
                    />
                    <div className="space-y-3">
                      {timeline.map((commit, i) => {
                        const isActive = selectedCommit?.id === commit.id;
                        return (
                          <motion.li
                            key={commit.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: i * 0.04, ease: ITEM_EASE }}
                            className="relative pl-12"
                          >
                            <span
                              className={cn(
                                "absolute left-[15px] top-5 w-[11px] h-[11px] rounded-full border-2 transition-all",
                                isActive
                                  ? "bg-[var(--primary)] border-white shadow-[0_0_18px_rgba(124,92,255,0.7)] scale-110"
                                  : "bg-[var(--surface)] border-[var(--primary)]/60"
                              )}
                            />
                            <button
                              type="button"
                              onClick={() => setSelectedCommit(commit)}
                              className={cn(
                                "w-full text-left rounded-lg border p-4 transition-all",
                                isActive
                                  ? "border-[var(--primary)]/60 bg-[var(--primary)]/8 shadow-[0_8px_28px_-12px_rgba(124,92,255,0.45)]"
                                  : "border-[var(--border-color)] bg-[var(--surface)]/55 hover:border-[var(--primary)]/40 hover:bg-[var(--surface)]/75"
                              )}
                            >
                              <div className="flex items-center justify-between mb-2 gap-2">
                                <span className="font-mono text-xs text-[var(--secondary)] bg-[var(--secondary)]/10 border border-[var(--secondary)]/30 px-2 py-0.5 rounded">
                                  {commit.sha.slice(0, 8)}
                                </span>
                                <span className="text-[10px] text-[var(--text-subtle)] font-mono shrink-0">
                                  {new Date(commit.authored_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-[var(--text-primary)] leading-snug line-clamp-2">
                                {commit.message}
                              </p>
                              <div className="mt-3 flex items-center gap-3 text-xs font-mono text-[var(--text-muted)]">
                                <span>by {commit.author_name}</span>
                                <span className="text-emerald-400 inline-flex items-center gap-0.5">
                                  <Plus className="size-3" />
                                  {commit.insertions}
                                </span>
                                <span className="text-red-400 inline-flex items-center gap-0.5">
                                  <Minus className="size-3" />
                                  {commit.deletions}
                                </span>
                              </div>
                            </button>
                          </motion.li>
                        );
                      })}
                    </div>
                  </ol>
                )}
              </div>
            </>
          )}
        </main>

        {/* Detail panel */}
        <AnimatePresence>
          {selectedCommit && (
            <motion.aside
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 60, opacity: 0 }}
              transition={{ duration: 0.3, ease: ITEM_EASE }}
              className="w-80 lg:w-96 shrink-0 border-l border-[var(--border-color)] bg-[var(--surface)]/60 backdrop-blur-md overflow-y-auto"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-color)] bg-[var(--surface)]/90 backdrop-blur">
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)] text-sm">Commit details</h3>
                  <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                    Inspection
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCommit(null)}
                  className="w-7 h-7 rounded-md hover:bg-[var(--surface-elevated)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  aria-label="Close commit details"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="p-5 space-y-5">
                <Field label="SHA">
                  <span className="font-mono text-sm text-[var(--secondary)] break-all">{selectedCommit.sha}</span>
                </Field>
                <Field label="Author">
                  <span className="text-sm text-[var(--text-primary)]">{selectedCommit.author_name}</span>
                </Field>
                <Field label="Date">
                  <span className="text-sm text-[var(--text-primary)] font-mono">
                    {new Date(selectedCommit.authored_at).toLocaleString()}
                  </span>
                </Field>
                <Field label="Message">
                  <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                    {selectedCommit.message}
                  </p>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/8 p-3 text-center">
                    <div className="text-xl font-bold text-emerald-300">+{selectedCommit.insertions}</div>
                    <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-emerald-300/80 mt-0.5">
                      Additions
                    </div>
                  </div>
                  <div className="rounded-lg border border-red-500/30 bg-red-500/8 p-3 text-center">
                    <div className="text-xl font-bold text-red-300">−{selectedCommit.deletions}</div>
                    <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-red-300/80 mt-0.5">
                      Deletions
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </RepoShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-subtle)] mb-1.5">
        {label}
      </div>
      {children}
    </div>
  );
}
