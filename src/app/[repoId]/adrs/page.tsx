"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import type { ADR } from "@/types";

export default function ADRsPage() {
  const { repoId } = useParams<{ repoId: string }>();
  const router = useRouter();
  const [adrs, setAdrs] = useState<ADR[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/repos/${repoId}/adrs`).then(r => r.json()).then(d => { setAdrs(d.adrs || []); setLoading(false); }).catch(() => setLoading(false));
  }, [repoId]);

  const generateADRs = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/repos/${repoId}/adrs`, { method: "POST" });
      const data = await res.json();
      setAdrs(data.adrs || []);
    } finally { setGenerating(false); }
  };

  const downloadAll = () => {
    const md = adrs.map(a => `# ADR: ${a.title}\n\n**Status:** ${a.status}\n\n**Context:**\n${a.context}\n\n**Decision:**\n${a.decision}\n\n**Consequences:**\n${a.consequences}\n\n---\n`).join("\n");
    const blob = new Blob([md], { type: "text/markdown" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "adrs.md"; a.click();
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="container-app py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push(`/${repoId}`)} className="btn btn-ghost text-sm">← Dashboard</button>
            <span className="text-[var(--border-default)]">|</span>
            <h1 className="font-semibold">📋 ADRs</h1>
          </div>
          <div className="flex gap-3">
            {adrs.length > 0 && <button onClick={downloadAll} className="btn btn-secondary text-sm">⬇ Download</button>}
            <button onClick={generateADRs} disabled={generating} className="btn btn-primary text-sm">
              {generating ? "Generating..." : "🔄 Generate ADRs"}
            </button>
          </div>
        </div>
      </header>
      <div className="container-app py-8">
        {loading ? <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="skeleton h-32 w-full"/>)}</div>
        : adrs.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="text-6xl mb-6">📋</div>
            <h2 className="text-2xl font-bold mb-3">No ADRs yet</h2>
            <p className="text-[var(--text-secondary)] mb-6">Click Generate to analyze commit history for architectural decisions.</p>
            <button onClick={generateADRs} disabled={generating} className="btn btn-primary btn-lg">Generate ADRs</button>
          </div>
        ) : (
          <div className="space-y-4 stagger-children">
            <p className="text-sm text-[var(--text-muted)] mb-4">{adrs.length} decisions identified</p>
            {adrs.map(adr => (
              <div key={adr.id} className="card overflow-hidden">
                <button onClick={() => setExpandedId(expandedId === adr.id ? null : adr.id)} className="w-full p-5 text-left flex items-center justify-between hover:bg-[var(--bg-hover)] transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="badge badge-success text-xs">{adr.status || "Accepted"}</span>
                    <h3 className="font-semibold">{adr.title}</h3>
                  </div>
                  <span className="text-[var(--text-muted)]">{expandedId === adr.id ? "▾" : "▸"}</span>
                </button>
                {expandedId === adr.id && (
                  <div className="px-5 pb-5 border-t border-[var(--border-subtle)] animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                      <div><h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2">Context</h4><p className="text-sm text-[var(--text-secondary)]">{adr.context}</p></div>
                      <div><h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2">Decision</h4><p className="text-sm text-[var(--text-secondary)]">{adr.decision}</p></div>
                      <div><h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2">Consequences</h4><p className="text-sm text-[var(--text-secondary)]">{adr.consequences}</p></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
