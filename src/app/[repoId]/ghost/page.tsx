"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Ghost, Send, User, AlertTriangle, Sparkles } from "lucide-react";
import type { Author, ChatMessage } from "@/types";
import { RepoShell, RepoShellStatus } from "@/components/shared/repo-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const ITEM_EASE = [0.22, 0.68, 0, 1] as [number, number, number, number];

const STARTER_QUESTIONS = [
  "What areas did you focus on?",
  "What was your biggest contribution?",
  "Why did you make those architectural choices?",
];

export default function GhostAuthorPage() {
  const { repoId } = useParams<{ repoId: string }>();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loadingAuthors, setLoadingAuthors] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/repos/${repoId}/authors`)
      .then((r) => r.json())
      .then((d) => {
        setAuthors(d.authors || []);
        setLoadingAuthors(false);
      })
      .catch(() => setLoadingAuthors(false));
  }, [repoId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectAuthor = (author: Author) => {
    setSelectedAuthor(author);
    setMessages([]);
    setSessionId(null);
  };

  const sendMessage = async (text?: string) => {
    const message = (text || input).trim();
    if (!message || isLoading || !selectedAuthor) return;
    setInput("");
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        session_id: "",
        role: "user",
        content: message,
        citations: [],
        created_at: new Date().toISOString(),
      },
    ]);
    setIsLoading(true);
    try {
      const res = await fetch(`/api/repos/${repoId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          mode: "ghost",
          session_id: sessionId,
          ghost_author_id: selectedAuthor.id,
        }),
      });
      const data = await res.json();
      if (data.session_id) setSessionId(data.session_id);
      if (data.message) {
        setMessages((prev) => [...prev, { ...data.message, created_at: new Date().toISOString() }]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          session_id: "",
          role: "assistant",
          content: "Error generating response.",
          citations: [],
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const topDomains = (domains: Record<string, number> = {}) =>
    Object.entries(domains)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

  return (
    <RepoShell
      repoId={repoId}
      sectionIcon={Ghost}
      sectionLabel="Ghost Author"
      sectionSubLabel="AI synthesis"
      fullHeight
      actions={
        <RepoShellStatus tone="warn">
          <AlertTriangle className="size-3" />
          Synthetic
        </RepoShellStatus>
      }
    >
      <div className="flex-1 min-h-0 flex">
        {/* Contributors list */}
        <aside className="w-64 lg:w-72 shrink-0 border-r border-[var(--border-color)] bg-[var(--surface)]/40 overflow-y-auto">
          <div className="sticky top-0 z-10 bg-[var(--surface)]/60 backdrop-blur-sm border-b border-[var(--border-color)] px-4 py-3">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--text-subtle)]">
              Contributors
            </h3>
          </div>
          <div className="p-3 space-y-1.5">
            {loadingAuthors
              ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-14 w-full" />)
              : authors.slice(0, 20).map((author, i) => {
                  const isActive = selectedAuthor?.id === author.id;
                  return (
                    <button
                      key={author.id}
                      type="button"
                      onClick={() => selectAuthor(author)}
                      className={cn(
                        "w-full text-left p-2.5 rounded-lg transition-all border",
                        isActive
                          ? "bg-[var(--primary)]/12 border-[var(--primary)]/40"
                          : "border-transparent hover:bg-[var(--surface-elevated)] hover:border-[var(--border-color)]"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 font-mono",
                            isActive
                              ? "bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white shadow-[0_0_12px_-2px_rgba(124,92,255,0.6)]"
                              : "bg-[var(--surface-elevated)] text-[var(--text-muted)]"
                          )}
                        >
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-sm font-medium truncate",
                              isActive ? "text-[var(--primary)]" : "text-[var(--text-primary)]"
                            )}
                          >
                            {author.name}
                          </p>
                          <p className="text-[11px] text-[var(--text-subtle)] font-mono truncate">
                            {author.total_commits} commits · {author.files_touched} files
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
          </div>
        </aside>

        {/* Chat area */}
        <main className="flex-1 min-w-0 flex flex-col">
          {!selectedAuthor ? (
            <div className="flex-1 flex items-center justify-center px-6">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: ITEM_EASE }}
                className="text-center max-w-md"
              >
                <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] items-center justify-center shadow-[0_0_36px_-6px_rgba(124,92,255,0.6)]">
                  <Ghost className="size-7 text-white" />
                </div>
                <h2 className="mt-5 text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
                  Summon a <span className="gradient-text-purple">past contributor</span>.
                </h2>
                <p className="mt-3 text-[var(--text-muted)] leading-relaxed">
                  Pick anyone from the list. We&apos;ll synthesize their style from commits, PRs, and code patterns — then let you ask anything.
                </p>
                <div className="mt-5 inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-500/30 bg-amber-500/5">
                  <AlertTriangle className="size-3.5 text-amber-400" />
                  <p className="text-xs text-amber-200 italic">
                    Responses are AI synthesis from public Git data — not the actual person.
                  </p>
                </div>
              </motion.div>
            </div>
          ) : (
            <>
              {/* Profile header */}
              <motion.div
                key={selectedAuthor.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: ITEM_EASE }}
                className="border-b border-[var(--border-color)] bg-[var(--surface)]/40 backdrop-blur-sm px-6 py-4"
              >
                <div className="flex items-center gap-4">
                  <span className="relative w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shadow-[0_0_18px_-2px_rgba(124,92,255,0.6)]">
                    <Ghost className="size-5 text-white" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[var(--background)]" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[var(--text-primary)]">
                      {selectedAuthor.name}{" "}
                      <span className="text-xs font-mono text-[var(--secondary)] ml-1">ghost</span>
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] font-mono">
                      {selectedAuthor.total_commits} commits · Active{" "}
                      {new Date(selectedAuthor.first_commit_at).getFullYear()}–
                      {new Date(selectedAuthor.last_commit_at).getFullYear()}
                    </p>
                  </div>
                </div>
                {topDomains(selectedAuthor.domains).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {topDomains(selectedAuthor.domains).map(([domain]) => (
                      <span
                        key={domain}
                        className="text-[10px] font-mono uppercase tracking-[0.15em] px-2 py-0.5 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/30 text-[var(--primary)]"
                      >
                        {domain}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto">
                <div className="container-app py-8 space-y-5">
                  {messages.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, ease: ITEM_EASE }}
                      className="text-center py-8"
                    >
                      <p className="text-[var(--text-muted)] mb-4">
                        Ask {selectedAuthor.name} about their contributions
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {STARTER_QUESTIONS.map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => sendMessage(q)}
                            className="px-3 py-2 rounded-full border border-[var(--border-color)] bg-[var(--surface)]/60 hover:bg-[var(--surface)] hover:border-[var(--primary)]/40 text-xs sm:text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {msg.role === "assistant" && (
                          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shrink-0 shadow-[0_0_14px_-2px_rgba(124,92,255,0.6)]">
                            <Ghost className="size-4 text-white" />
                          </span>
                        )}
                        <div
                          className={`max-w-[80%] px-5 py-3.5 ${
                            msg.role === "user" ? "chat-bubble-user" : "chat-bubble-assistant"
                          }`}
                        >
                          {msg.role === "assistant" && (
                            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--primary)] mb-1">
                              @{selectedAuthor.name} (ghost)
                            </div>
                          )}
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                        </div>
                        {msg.role === "user" && (
                          <span className="w-8 h-8 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center justify-center shrink-0">
                            <User className="size-4 text-[var(--text-muted)]" />
                          </span>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shrink-0">
                        <Ghost className="size-4 text-white" />
                      </span>
                      <div className="chat-bubble-assistant px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse [animation-delay:150ms]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse [animation-delay:300ms]" />
                          </div>
                          <span className="text-xs text-[var(--text-muted)] font-mono">Channeling…</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={endRef} />
                </div>
              </div>

              {/* Composer */}
              <div className="border-t border-[var(--border-color)] bg-[var(--background)]/85 backdrop-blur-md">
                <div className="container-app py-4">
                  <div className="flex items-end gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface)]/70 p-2 focus-within:border-[var(--primary)]/50 focus-within:shadow-[0_0_0_4px_rgba(124,92,255,0.10)] transition-shadow">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                      placeholder={`Ask ${selectedAuthor.name}…`}
                      disabled={isLoading}
                      className="border-0 bg-transparent shadow-none focus-visible:ring-0 h-10 text-sm"
                    />
                    <Button
                      type="button"
                      onClick={() => sendMessage()}
                      disabled={isLoading || !input.trim()}
                      className="shrink-0 shadow-[0_4px_14px_rgba(124,92,255,0.4)]"
                    >
                      {isLoading ? <Sparkles className="size-4 animate-pulse" /> : <Send className="size-4" />}
                      <span className="hidden sm:inline">Send</span>
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </RepoShell>
  );
}
