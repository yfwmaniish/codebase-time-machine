"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Author, ChatMessage } from "@/types";

export default function GhostAuthorPage() {
  const { repoId } = useParams<{ repoId: string }>();
  const router = useRouter();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loadingAuthors, setLoadingAuthors] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/repos/${repoId}/authors`).then(r => r.json()).then(d => {
      setAuthors(d.authors || []);
      setLoadingAuthors(false);
    }).catch(() => setLoadingAuthors(false));
  }, [repoId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const selectAuthor = (author: Author) => {
    setSelectedAuthor(author);
    setMessages([]);
    setSessionId(null);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !selectedAuthor) return;
    const text = input;
    setInput("");
    setMessages(prev => [...prev, { id: Date.now().toString(), session_id: "", role: "user", content: text, citations: [], created_at: new Date().toISOString() }]);
    setIsLoading(true);
    try {
      const res = await fetch(`/api/repos/${repoId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, mode: "ghost", session_id: sessionId, ghost_author_id: selectedAuthor.id }),
      });
      const data = await res.json();
      if (data.session_id) setSessionId(data.session_id);
      if (data.message) setMessages(prev => [...prev, { ...data.message, created_at: new Date().toISOString() }]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now().toString(), session_id: "", role: "assistant", content: "Error generating response.", citations: [], created_at: new Date().toISOString() }]);
    } finally { setIsLoading(false); }
  };

  const topDomains = (domains: Record<string, number>) => Object.entries(domains).sort(([,a],[,b]) => b - a).slice(0, 5);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="container-app py-4 flex items-center gap-3">
          <button onClick={() => router.push(`/${repoId}`)} className="btn btn-ghost text-sm">← Dashboard</button>
          <span className="text-[var(--border-default)]">|</span>
          <h1 className="font-semibold">👻 Ghost Author</h1>
          <span className="badge badge-amber text-xs">AI Synthesis</span>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Author List */}
        <div className="w-80 border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-y-auto p-4">
          <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">Contributors</h3>
          {loadingAuthors ? (
            <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="skeleton h-16 w-full"/>)}</div>
          ) : (
            <div className="space-y-2">
              {authors.slice(0, 15).map((author, i) => (
                <button key={author.id} onClick={() => selectAuthor(author)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${selectedAuthor?.id === author.id ? "bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]" : "hover:bg-[var(--bg-hover)] border border-transparent"}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-sm font-bold">{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{author.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{author.total_commits} commits · {author.files_touched} files</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {!selectedAuthor ? (
            <div className="flex-1 flex items-center justify-center animate-fade-in">
              <div className="text-center">
                <div className="text-6xl mb-4">👻</div>
                <h2 className="text-xl font-bold mb-2">Select a contributor</h2>
                <p className="text-[var(--text-secondary)] max-w-md">Choose a past contributor to chat with their AI-synthesized profile based on Git history.</p>
                <p className="text-xs text-[var(--text-muted)] mt-4 max-w-sm mx-auto italic">⚠️ Responses are AI synthesis based on public Git data, not the actual person.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Author profile header */}
              <div className="border-b border-[var(--border-subtle)] p-4 bg-[var(--bg-elevated)]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center text-xl">👻</div>
                  <div>
                    <h3 className="font-semibold">{selectedAuthor.name}</h3>
                    <p className="text-xs text-[var(--text-muted)]">{selectedAuthor.total_commits} commits · Active {new Date(selectedAuthor.first_commit_at).getFullYear()}–{new Date(selectedAuthor.last_commit_at).getFullYear()}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {topDomains(selectedAuthor.domains || {}).map(([domain]) => (
                    <span key={domain} className="badge badge-primary text-xs">{domain}</span>
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8 animate-fade-in">
                    <p className="text-[var(--text-secondary)] mb-4">Ask {selectedAuthor.name} about their contributions</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {["What areas did you focus on?", "What was your biggest contribution?", "Why did you make those architectural choices?"].map(q => (
                        <button key={q} onClick={() => { setInput(q); }} className="btn btn-secondary text-sm">{q}</button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
                    <div className={`max-w-2xl px-5 py-4 ${msg.role === "user" ? "chat-bubble-user" : "chat-bubble-assistant"}`}>
                      <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start"><div className="chat-bubble-assistant px-5 py-4">
                    <div className="flex gap-1"><div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-bounce"/><div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-bounce" style={{animationDelay:"150ms"}}/><div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-bounce" style={{animationDelay:"300ms"}}/></div>
                  </div></div>
                )}
                <div ref={endRef}/>
              </div>

              {/* Input */}
              <div className="border-t border-[var(--border-subtle)] p-4 bg-[var(--bg-surface)]">
                <div className="flex gap-3">
                  <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder={`Ask ${selectedAuthor.name}...`} className="input flex-1" disabled={isLoading}/>
                  <button onClick={sendMessage} disabled={isLoading || !input.trim()} className="btn btn-primary">Send</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
