"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Send,
  Paperclip,
  X,
  User,
  Bot,
  Sparkles,
} from "lucide-react";
import type { ChatMessage, Citation } from "@/types";
import { RepoShell, RepoShellStatus } from "@/components/shared/repo-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SUGGESTED_QUESTIONS = [
  "Why was this architecture chosen?",
  "What are the most significant refactors in this codebase?",
  "Who were the key contributors and what did they focus on?",
  "What patterns are most commonly used?",
  "Were there any major breaking changes in the history?",
];

export default function ChatPage() {
  const { repoId } = useParams<{ repoId: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showCitations, setShowCitations] = useState<Citation[] | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const messageText = (text || input).trim();
    if (!messageText || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      session_id: sessionId || "",
      role: "user",
      content: messageText,
      citations: [],
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`/api/repos/${repoId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText, mode: "why", session_id: sessionId }),
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
          content: "Sorry, I encountered an error. Please try again.",
          citations: [],
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RepoShell
      repoId={repoId}
      sectionIcon={MessageSquare}
      sectionLabel="Why Engine"
      sectionSubLabel="AI-powered Q&A"
      fullHeight
      actions={
        <RepoShellStatus tone="primary">
          <Sparkles className="size-3" />
          IBM Bob
        </RepoShellStatus>
      }
    >
      <div className="flex-1 min-h-0 flex">
        {/* Chat */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <div className="container-app py-8 space-y-5">
              {messages.length === 0 && (
                <EmptyState onSuggest={(q) => sendMessage(q)} />
              )}

              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 0.68, 0, 1] }}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && <BotAvatar />}
                    <div
                      className={`max-w-[80%] px-5 py-3.5 ${
                        msg.role === "user" ? "chat-bubble-user" : "chat-bubble-assistant"
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                      {msg.role === "assistant" && msg.citations && msg.citations.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowCitations(msg.citations)}
                          className="mt-3 inline-flex items-center gap-1.5 text-xs text-[var(--secondary)] hover:text-[var(--secondary-hover)] transition-colors font-mono"
                        >
                          <Paperclip className="size-3.5" />
                          {msg.citations.length} sources — show evidence
                        </button>
                      )}
                    </div>
                    {msg.role === "user" && <UserAvatar />}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 justify-start"
                >
                  <BotAvatar />
                  <div className="chat-bubble-assistant px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse [animation-delay:300ms]" />
                      </div>
                      <span className="text-xs text-[var(--text-muted)] font-mono">Searching history…</span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
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
                  placeholder="Ask why something was built this way…"
                  disabled={isLoading}
                  className="border-0 bg-transparent shadow-none focus-visible:ring-0 h-10 text-sm"
                />
                <Button
                  type="button"
                  onClick={() => sendMessage()}
                  disabled={isLoading || !input.trim()}
                  className="shrink-0 shadow-[0_4px_14px_rgba(124,92,255,0.4)]"
                >
                  <Send className="size-4" />
                  <span className="hidden sm:inline">Send</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Citations Panel */}
        <AnimatePresence>
          {showCitations && (
            <motion.aside
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 60, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 0.68, 0, 1] }}
              className="w-80 lg:w-96 shrink-0 border-l border-[var(--border-color)] bg-[var(--surface)]/60 backdrop-blur-md overflow-y-auto"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-color)] bg-[var(--surface)]/90 backdrop-blur">
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)] text-sm">Sources</h3>
                  <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                    {showCitations.length} cited commits
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCitations(null)}
                  className="w-7 h-7 rounded-md hover:bg-[var(--surface-elevated)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  aria-label="Close sources panel"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                {showCitations.map((citation, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-[var(--border-color)] bg-[var(--background)]/50 p-4 hover:border-[var(--primary)]/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-xs text-[var(--secondary)] bg-[var(--secondary)]/10 border border-[var(--secondary)]/30 px-2 py-0.5 rounded">
                        {citation.sha?.slice(0, 8)}
                      </span>
                      {citation.date && (
                        <span className="text-[10px] text-[var(--text-subtle)] font-mono">
                          {new Date(citation.date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--text-primary)] leading-relaxed">{citation.message}</p>
                    <p className="mt-2 text-xs text-[var(--text-muted)] font-mono">by {citation.author}</p>
                  </div>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </RepoShell>
  );
}

function EmptyState({ onSuggest }: { onSuggest: (q: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 0.68, 0, 1] }}
      className="max-w-2xl mx-auto text-center py-16"
    >
      <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] items-center justify-center shadow-[0_0_36px_-6px_rgba(124,92,255,0.6)]">
        <MessageSquare className="size-7 text-white" />
      </div>
      <h2 className="mt-5 text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
        Ask anything about <span className="gradient-text-purple">this codebase</span>.
      </h2>
      <p className="mt-3 text-[var(--text-muted)] max-w-md mx-auto">
        I&apos;ll search through the Git history and give you cited answers about why code exists the way it does.
      </p>

      <div className="mt-8 flex flex-wrap gap-2 justify-center">
        {SUGGESTED_QUESTIONS.map((q, i) => (
          <motion.button
            key={q}
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 + i * 0.06, ease: [0.22, 0.68, 0, 1] }}
            onClick={() => onSuggest(q)}
            className="px-3 py-2 rounded-full border border-[var(--border-color)] bg-[var(--surface)]/60 hover:bg-[var(--surface)] hover:border-[var(--primary)]/40 text-xs sm:text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
          >
            {q}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function BotAvatar() {
  return (
    <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shrink-0 shadow-[0_0_14px_-2px_rgba(124,92,255,0.6)]">
      <Bot className="size-4 text-white" />
    </span>
  );
}

function UserAvatar() {
  return (
    <span className="w-8 h-8 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center justify-center shrink-0">
      <User className="size-4 text-[var(--text-muted)]" />
    </span>
  );
}
