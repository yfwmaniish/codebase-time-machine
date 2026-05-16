"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Menu } from "lucide-react";
import { GithubIcon } from "@/components/shared/brand-icons";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How It Works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#docs", label: "Docs" },
  { href: "https://github.com/", label: "GitHub", external: true },
];

function Logo() {
  return (
    <Link href="#top" className="flex items-center gap-2.5 group">
      <span className="relative inline-flex">
        <span className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shadow-[0_0_20px_-2px_rgba(124,92,255,0.6)]">
          <Clock className="size-4 text-white" />
        </span>
        <span className="absolute inset-0 rounded-lg bg-[var(--primary)] opacity-0 group-hover:opacity-40 blur-md transition-opacity" />
      </span>
      <span className="font-mono font-semibold tracking-tight text-[var(--text-primary)] hidden sm:inline">
        Codebase Time Machine
      </span>
      <span className="font-mono font-semibold tracking-tight text-[var(--text-primary)] sm:hidden">CTM</span>
    </Link>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 0.68, 0, 1] }}
      className="fixed top-0 inset-x-0 z-50"
    >
      <AnimatePresence>
        <motion.div
          animate={{
            backgroundColor: scrolled ? "rgba(10, 10, 15, 0.72)" : "rgba(10, 10, 15, 0)",
            backdropFilter: scrolled ? "blur(14px)" : "blur(0px)",
            WebkitBackdropFilter: scrolled ? "blur(14px)" : "blur(0px)",
            borderBottomColor: scrolled ? "rgba(42, 42, 56, 0.7)" : "rgba(42, 42, 56, 0)",
          }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="border-b w-full"
        >
          <div className="container-app">
            <div className="flex items-center justify-between h-16">
              <Logo />

              <nav className="hidden lg:flex items-center gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noreferrer" : undefined}
                    className="px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors rounded-md hover:bg-white/5"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex text-[var(--text-muted)]">
                  <Link href="#demo">Try Demo</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="hidden sm:inline-flex shadow-[0_4px_14px_rgba(124,92,255,0.4)]"
                >
                  <Link href="#hero">Get Started Free</Link>
                </Button>

                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="lg:hidden text-[var(--text-primary)]"
                      aria-label="Open menu"
                    >
                      <Menu className="size-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="bg-[var(--surface)] border-[var(--border-color)] w-[280px] sm:w-[320px]">
                    <SheetHeader>
                      <SheetTitle className="text-[var(--text-primary)] font-mono">Menu</SheetTitle>
                    </SheetHeader>
                    <nav className="flex flex-col gap-1 px-4 pb-6">
                      {NAV_LINKS.map((link) => (
                        <Link
                          key={link.label}
                          href={link.href}
                          target={link.external ? "_blank" : undefined}
                          rel={link.external ? "noreferrer" : undefined}
                          onClick={() => setMobileOpen(false)}
                          className="px-3 py-3 rounded-md text-base text-[var(--text-primary)] hover:bg-white/5 border-b border-[var(--border-color)]/40 last:border-0"
                        >
                          {link.label}
                        </Link>
                      ))}
                      <div className="mt-6 flex flex-col gap-2">
                        <Button asChild variant="outline" className="border-[var(--border-color)]">
                          <Link href="#demo" onClick={() => setMobileOpen(false)}>Try Demo</Link>
                        </Button>
                        <Button asChild>
                          <Link href="#hero" onClick={() => setMobileOpen(false)}>Get Started Free</Link>
                        </Button>
                        <Button asChild variant="ghost" className="gap-2">
                          <Link href="https://github.com/" target="_blank" rel="noreferrer" onClick={() => setMobileOpen(false)}>
                            <GithubIcon size={16} />
                            GitHub
                          </Link>
                        </Button>
                      </div>
                    </nav>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.header>
  );
}

export function NavbarSpacer({ className }: { className?: string }) {
  return <div className={cn("h-16", className)} aria-hidden />;
}
