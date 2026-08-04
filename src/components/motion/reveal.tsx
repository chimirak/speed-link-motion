import { motion, useInView, type Variants } from "motion/react";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "left" | "right" | "none";

const offsets: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 28 },
  down: { x: 0, y: -28 },
  left: { x: 32, y: 0 },
  right: { x: -32, y: 0 },
  none: { x: 0, y: 0 },
};

export function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: Direction;
  as?: "div" | "section" | "li" | "span";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12% 0px -8% 0px" });
  const { x, y } = offsets[direction];
  const Comp = motion[as] as typeof motion.div;

  return (
    <Comp
      ref={ref}
      initial={{ opacity: 0, x, y, filter: "blur(6px)" }}
      animate={
        inView
          ? { opacity: 1, x: 0, y: 0, filter: "blur(0px)" }
          : { opacity: 0, x, y, filter: "blur(6px)" }
      }
      transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </Comp>
  );
}

const wordVariants: Variants = {
  hidden: { opacity: 0, y: "0.55em", rotate: 2 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: { duration: 0.9, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] },
  }),
};

/** Cinematic word-by-word headline reveal. */
export function RevealText({
  text,
  className,
  highlight,
  delay = 0,
}: {
  text: string;
  className?: string;
  highlight?: string;
  delay?: number;
}) {
  const words = text.split(" ");
  return (
    <span className={cn("inline-block", className)}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            className={cn(
              "inline-block",
              highlight && word.replace(/[^\w]/g, "") === highlight && "text-gradient-speed",
            )}
            custom={i + delay}
            variants={wordVariants}
            initial="hidden"
            animate="visible"
          >
            {word}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
