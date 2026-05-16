import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.ComponentProps<"section"> & {
  bleed?: boolean;
  divider?: boolean;
};

export function Section({ className, bleed, divider, children, ...rest }: Props) {
  return (
    <section
      className={cn(
        "relative",
        !bleed && "py-20 sm:py-24 lg:py-28",
        divider && "border-t border-[var(--border-color)]/60",
        className
      )}
      {...rest}
    >
      {children}
    </section>
  );
}

export function SectionEyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.3em] text-[var(--secondary)]",
        className
      )}
    >
      <span className="h-px w-6 bg-[var(--secondary)]/60" />
      {children}
    </div>
  );
}

export function SectionHeading({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn("mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text-primary)]", className)}>
      {children}
    </h2>
  );
}

export function SectionLead({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("mt-4 max-w-2xl text-base sm:text-lg text-[var(--text-muted)] leading-relaxed", className)}>
      {children}
    </p>
  );
}
