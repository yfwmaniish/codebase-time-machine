"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = {
  text: string;
  className?: string;
  wordClassName?: (word: string, index: number) => string | undefined;
  delay?: number;
  stagger?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
};

const MotionH1 = motion.h1;
const MotionH2 = motion.h2;
const MotionH3 = motion.h3;
const MotionP = motion.p;
const MotionSpan = motion.span;

export function AnimatedText({
  text,
  className,
  wordClassName,
  delay = 0,
  stagger = 0.05,
  as = "h1",
}: Props) {
  const reduced = useReducedMotion();
  const words = text.split(" ");

  const container = {
    hidden: {},
    visible: {
      transition: { delayChildren: delay, staggerChildren: reduced ? 0 : stagger },
    },
  };

  const child = {
    hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: [0.22, 0.68, 0, 1] as [number, number, number, number] } },
  };

  const Wrapper =
    as === "h1" ? MotionH1 :
    as === "h2" ? MotionH2 :
    as === "h3" ? MotionH3 :
    as === "p" ? MotionP : MotionSpan;

  return (
    <Wrapper
      variants={container}
      initial="hidden"
      animate="visible"
      className={cn("inline-block", className)}
    >
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          variants={child}
          className={cn("inline-block mr-[0.25em]", wordClassName?.(word, i))}
        >
          {word}
        </motion.span>
      ))}
    </Wrapper>
  );
}
