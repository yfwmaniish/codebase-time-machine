"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

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

export default function TimeTravelPage() {
  const { repoId } = useParams<{ repoId: string }>();
  const router = useRouter();
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

  const renderTree = (nodes: FileNode[], depth: number = 0) => (
    <div style={{ paddingLeft: depth * 16 }}>
      {nodes.map((node) => (
        <div key={node.path}>
          {node.type === "directory" ? (
            <button
              onClick={() => toggleDir(node.path)}
              className="flex items-center gap-2 w-full py-1.5 px-2 text-sm hover:bg-[var(--bg-hover)] rounded text-left transition-colors"
            >
              <span className="text-xs">{expandedDirs.has(node.path) ? "📂" : "📁"}</span>
              <span className="text-[var(--text-secondary)]">{node.name}</span>
            </button>
          ) : (
            <button
              onClick={() => loadTimeline(node.path)}
              className={`flex items-center justify-between w-full py-1.5 px-2 text-sm rounded transition-colors ${
                selectedFile === node.path
                  ? "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]"
                  : "hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-xs">📄</span>
                {node.name}
              </span>
              {node.commit_count && (
                <span className="text-xs text-[var(--text-muted)]">{node.commit_count}c</span>
              )}
            </button>
          )}
          {node.type === "directory" && expandedDirs.has(node.path) && node.children && renderTree(node.children, depth + 1)}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="container-app py-4 flex items-center gap-3">
          <button onClick={() => router.push(`/${repoId}`)} className="btn btn-ghost text-sm">
            ← Dashboard
          </button>
          <span className="text-[var(--border-default)]">|</span>
          <h1 className="font-semibold flex items-center gap-2">⏳ Time Travel</h1>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* File Tree */}
        <div className="w-72 border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-y-auto p-3">
          <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3 px-2">
            Files
          </h3>
          {loading ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton h-6 w-full" />
              ))}
            </div>
          ) : (
            renderTree(tree)
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {!selectedFile ? (
            <div className="flex-1 flex items-center justify-center text-center">
              <div className="animate-fade-in">
                <div className="text-6xl mb-4">⏳</div>
                <h2 className="text-xl font-bold mb-2">Select a file to time travel</h2>
                <p className="text-[var(--text-secondary)]">
                  Pick a file from the tree to see how it evolved over time
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Selected file header */}
              <div className="border-b border-[var(--border-subtle)] p-4 bg-[var(--bg-elevated)]">
                <p className="text-sm font-mono text-[var(--accent-secondary)]">{selectedFile}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {timeline.length} commits in history
                </p>
              </div>

              {/* Timeline */}
              <div className="flex-1 overflow-y-auto p-6">
                {timelineLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="skeleton h-20 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--accent-primary)] to-[var(--accent-secondary)]" />
                    <div className="space-y-4">
                      {timeline.map((commit) => (
                        <button
                          key={commit.id}
                          onClick={() => setSelectedCommit(commit)}
                          className={`relative pl-14 w-full text-left group ${
                            selectedCommit?.id === commit.id ? "" : ""
                          }`}
                        >
                          <div className="absolute left-3.5 top-3 w-3 h-3 rounded-full bg-[var(--accent-primary)] border-2 border-[var(--bg-primary)] group-hover:scale-125 transition-transform" />
                          <div
                            className={`card p-4 group-hover:border-[var(--accent-primary)] transition-colors ${
                              selectedCommit?.id === commit.id ? "border-[var(--accent-primary)] bg-[var(--bg-elevated)]" : ""
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="badge badge-cyan text-xs">{commit.sha.slice(0, 8)}</span>
                              <span className="text-xs text-[var(--text-muted)]">
                                {new Date(commit.authored_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm mb-2 line-clamp-2">{commit.message}</p>
                            <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                              <span>by {commit.author_name}</span>
                              <span className="text-[var(--accent-success)]">+{commit.insertions}</span>
                              <span className="text-[var(--accent-danger)]">-{commit.deletions}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Commit Detail Panel */}
        {selectedCommit && (
          <div className="w-96 border-l border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-y-auto p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Commit Details</h3>
              <button onClick={() => setSelectedCommit(null)} className="btn btn-ghost text-sm">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-1">SHA</p>
                <p className="font-mono text-sm text-[var(--accent-secondary)]">{selectedCommit.sha}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-1">Author</p>
                <p className="text-sm">{selectedCommit.author_name}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-1">Date</p>
                <p className="text-sm">{new Date(selectedCommit.authored_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-1">Message</p>
                <p className="text-sm">{selectedCommit.message}</p>
              </div>
              <div className="flex gap-4">
                <div className="card p-3 flex-1 text-center">
                  <p className="text-lg font-bold text-[var(--accent-success)]">+{selectedCommit.insertions}</p>
                  <p className="text-xs text-[var(--text-muted)]">additions</p>
                </div>
                <div className="card p-3 flex-1 text-center">
                  <p className="text-lg font-bold text-[var(--accent-danger)]">-{selectedCommit.deletions}</p>
                  <p className="text-xs text-[var(--text-muted)]">deletions</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
