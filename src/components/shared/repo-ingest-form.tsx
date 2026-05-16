"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Size = "default" | "lg";

type Props = {
  size?: Size;
  defaultValue?: string;
  ctaLabel?: string;
  placeholder?: string;
  className?: string;
};

const GITHUB_PATTERN = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+(\.git)?$/;

export function RepoIngestForm({
  size = "default",
  defaultValue = "",
  ctaLabel = "Analyze",
  placeholder = "github.com/expressjs/express",
  className,
}: Props) {
  const [url, setUrl] = useState(defaultValue);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Paste a public GitHub URL to start.");
      return;
    }
    const normalized = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    if (!GITHUB_PATTERN.test(normalized)) {
      setError("That doesn't look like a GitHub repo URL.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/repos/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalized }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not start ingestion.");
        setLoading(false);
        return;
      }
      router.push(`/${data.repo_id}/indexing`);
    } catch {
      setError("Network error. Try again.");
      setLoading(false);
    }
  };

  const big = size === "lg";

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "group flex flex-col sm:flex-row gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--surface)]/70 backdrop-blur-sm p-2 transition-colors",
          "focus-within:border-[var(--primary)]/60 focus-within:shadow-[0_0_0_4px_rgba(124,92,255,0.12)]"
        )}
      >
        <div className="flex items-center gap-2 flex-1 px-3">
          <span className="font-mono text-xs text-[var(--text-subtle)] hidden sm:inline">https://</span>
          <Input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={placeholder}
            disabled={loading}
            className={cn(
              "border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-0 px-0",
              big ? "h-12 text-base" : "h-10 text-sm"
            )}
          />
        </div>
        <Button
          type="button"
          onClick={submit}
          disabled={loading}
          size={big ? "lg" : "default"}
          className="group/btn shadow-[0_4px_18px_rgba(124,92,255,0.4)] hover:shadow-[0_6px_24px_rgba(124,92,255,0.55)] hover:-translate-y-0.5 transition-transform"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Indexing
            </>
          ) : (
            <>
              {ctaLabel}
              <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-0.5" />
            </>
          )}
        </Button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-400 font-medium px-1">
          {error}
        </p>
      )}
    </div>
  );
}
