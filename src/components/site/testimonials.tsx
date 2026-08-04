import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Quote, ArrowLeft, ArrowRight, Star } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

const testimonials = [
  {
    quote:
      "A theatre print missed its freight slot at 6pm. Speed Link had it in Edinburgh before the doors opened. They have never once let us down since.",
    name: "Marcus Ellery",
    role: "Head of Logistics, Northgate Studios",
  },
  {
    quote:
      "We move clinical samples that expire in hours. The cold-chain tracking is genuinely the best we have used, and the coordinators answer instantly.",
    name: "Dr. Anita Raval",
    role: "Operations Director, Meridian Diagnostics",
  },
  {
    quote:
      "Contracts to Frankfurt, signed and back the next morning. The proof-of-delivery trail alone has saved us two disputes this year.",
    name: "Helen Okafor",
    role: "Partner, Brackston Legal",
  },
];

export function Testimonials() {
  const [index, setIndex] = useState(0);
  const active = testimonials[index]!;

  const go = (dir: number) =>
    setIndex((i) => (i + dir + testimonials.length) % testimonials.length);

  return (
    <section
      aria-label="Client testimonials"
      className="section-pad relative overflow-hidden border-y border-border bg-surface/30"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Reveal>
          <div className="flex items-center gap-3">
            <div className="flex gap-0.5" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-primary text-primary" />
              ))}
            </div>
            <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
              4.9 / 5 from 2,100+ businesses
            </p>
          </div>
        </Reveal>

        <Quote className="mt-10 size-10 text-primary" aria-hidden="true" />

        <div className="relative mt-6 min-h-64 sm:min-h-56">
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={index}
              initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -24, filter: "blur(8px)" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="font-display text-[clamp(1.4rem,3.4vw,2.5rem)] leading-[1.2] font-semibold">
                “{active.quote}”
              </p>
              <footer className="mt-8 text-sm">
                <span className="font-semibold">{active.name}</span>
                <span className="block text-muted-foreground">{active.role}</span>
              </footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>

        <div className="mt-10 flex items-center gap-3">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous testimonial"
            className="grid size-11 place-items-center rounded-full border border-border transition-colors hover:border-primary hover:text-primary"
          >
            <ArrowLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next testimonial"
            className="grid size-11 place-items-center rounded-full border border-border transition-colors hover:border-primary hover:text-primary"
          >
            <ArrowRight className="size-4" />
          </button>
          <p aria-live="polite" className="numeric ml-3 text-sm text-muted-foreground">
            {String(index + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
          </p>
        </div>
      </div>
    </section>
  );
}
