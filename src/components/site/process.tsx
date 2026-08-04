import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Reveal } from "@/components/motion/reveal";

const steps = [
  {
    n: "01",
    title: "Book in seconds",
    copy: "Tell us the pickup, destination and deadline. You get a fixed price instantly — no hidden surcharges.",
  },
  {
    n: "02",
    title: "We collect",
    copy: "A vetted driver is dispatched to the nearest point on the network, typically within 60 minutes.",
  },
  {
    n: "03",
    title: "In motion",
    copy: "Your consignment moves on a dedicated route with live GPS and scan events at every handover.",
  },
  {
    n: "04",
    title: "Delivered & proven",
    copy: "Signature, timestamp and photo proof of delivery land in your inbox the moment it arrives.",
  },
];

export function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const truckY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="process" className="section-pad relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <p className="text-xs tracking-[0.3em] text-primary uppercase">How it works</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="mt-5 max-w-3xl font-display text-[clamp(2rem,5vw,3.75rem)] leading-[1.02] font-extrabold">
            Four steps between your desk and their door.
          </h2>
        </Reveal>

        <div ref={ref} className="relative mt-16 pl-10 sm:pl-16">
          {/* The route line fills as you scroll — a parcel travelling the journey */}
          <span
            aria-hidden="true"
            className="absolute top-2 bottom-2 left-[13px] w-px bg-border sm:left-[27px]"
          >
            <motion.span
              style={{ scaleY: lineScale }}
              className="block size-full origin-top bg-[var(--gradient-speed)]"
            />
          </span>
          <motion.span
            aria-hidden="true"
            style={{ top: truckY }}
            className="absolute left-[6px] grid size-4 place-items-center rounded-full bg-primary shadow-[var(--glow-primary)] sm:left-[20px]"
          />

          <ol className="space-y-14 sm:space-y-20">
            {steps.map((s, i) => (
              <Reveal as="li" key={s.n} delay={0.06 * i}>
                <div className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-10">
                  <p className="numeric text-3xl font-bold text-primary sm:text-5xl">{s.n}</p>
                  <div className="min-w-0">
                    <h3 className="text-2xl font-bold sm:text-3xl">{s.title}</h3>
                    <p className="mt-3 max-w-xl leading-relaxed text-muted-foreground">{s.copy}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
