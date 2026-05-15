"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import type { ChatMessage, Citation } from "@/types";

export default function ChatPage() {
  const { repoId } = useParams<{ repoId: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showCitations, setShowCitations] = useState<Citation[] | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const SUGGESTED_QUESTIONS = [
    "Why was this architecture chosen?",
    "What are the most significant refactors in this codebase?",
    "Who were the key contributors and what did they focus on?",
    "What patterns are most commonly used?",
    "Were there any major breaking changes in the history?",
  ];

  const sendMessage = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isLoading) return;

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
        body: JSON.stringify({
          message: messageText,
          mode: "why",
          session_id: sessionId,
        }),
      });

      const data = await res.json();

      if (data.session_id) setSessionId(data.session_id);

      if (data.message) {
        setMessages((prev) => [...prev, {
          ...data.message,
          created_at: new Date().toISOString(),
        }]);
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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="container-app py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push(`/${repoId}`)} className="btn btn-ghost text-sm">
              ← Dashboard
            </button>
            <span className="text-[var(--border-default)]">|</span>
            <h1 className="font-semibold flex items-center gap-2">
              💬 Why Engine
            </h1>
          </div>
          <div className="badge badge-primary">AI-powered Q&A</div>
        </div>
      </header>

      {/* Chat area */}
      <div className="flex-1 flex">
        {/* Messages */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-20 animate-fade-in">
                <div className="text-6xl mb-6">💬</div>
                <h2 className="text-2xl font-bold mb-3">Ask anything about this codebase</h2>
                <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
                  I&apos;ll search through the Git history and give you cited answers about why code exists the way it does.
                </p>
                <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="btn btn-secondary text-sm"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div
                  className={`max-w-2xl px-5 py-4 ${
                    msg.role === "user"
                      ? "chat-bubble-user"
                      : "chat-bubble-assistant"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                  {msg.role === "assistant" && msg.citations.length > 0 && (
                    <button
                      onClick={() => setShowCitations(msg.citations)}
                      className="mt-3 text-xs text-[var(--accent-secondary)] hover:underline flex items-center gap-1"
                    >
                      📎 {msg.citations.length} sources — Show evidence
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="chat-bubble-assistant px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-sm text-[var(--text-muted)]">Searching history...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-[var(--border-subtle)] p-4 bg-[var(--bg-surface)]">
            <div className="container-app flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Ask why something was built this way..."
                className="input flex-1"
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={isLoading || !input.trim()}
                className="btn btn-primary"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Citations Panel */}
        {showCitations && (
          <div className="w-96 border-l border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-y-auto p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Sources</h3>
              <button
                onClick={() => setShowCitations(null)}
                className="btn btn-ghost text-sm"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              {showCitations.map((citation, i) => (
                <div key={i} className="card p-4 text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge badge-cyan text-xs">
                      {citation.sha?.slice(0, 8)}
                    </span>
                    <span className="text-[var(--text-muted)] text-xs">
                      {citation.date ? new Date(citation.date).toLocaleDateString() : ""}
                    </span>
                  </div>
                  <p className="text-[var(--text-secondary)] mb-1">{citation.message}</p>
                  <p className="text-xs text-[var(--text-muted)]">by {citation.author}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
