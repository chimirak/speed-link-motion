import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowRight, Plane, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RevealText } from "@/components/motion/reveal";
import heroFreight from "@/assets/hero-freight.jpg";

const ticker = [
  "London",
  "Farnborough",
  "Manchester",
  "Dublin",
  "Paris",
  "Amsterdam",
  "Frankfurt",
  "Dubai",
  "New York",
  "Singapore",
  "Hong Kong",
  "Sydney",
];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.14]);
  const copyY = useTransform(scrollYProgress, [0, 1], ["0%", "26%"]);

  return (
    <section id="top" ref={ref} className="relative isolate overflow-hidden bg-background">
      <div
        className="grid-lines pointer-events-none absolute inset-0 -z-10 opacity-70 [mask-image:radial-gradient(80%_70%_at_50%_0%,black,transparent)]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 pt-36 pb-10 sm:px-6 lg:pt-44">
        <motion.div style={{ y: copyY }} className="relative">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 inline-flex w-fit items-center gap-2.5 rounded-full border border-border bg-surface px-4 py-2 text-[11px] font-medium tracking-[0.2em] text-muted-foreground uppercase shadow-[var(--shadow-soft)]"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full rounded-full bg-primary [animation:pulse-ring_2s_ease-out_infinite]" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            Live network · UK &amp; worldwide
          </motion.div>

          <h1 className="max-w-[16ch] font-display text-[clamp(2.75rem,8.5vw,7rem)] leading-[0.9] font-extrabold">
            <RevealText text="Delivered before" />
            <br />
            <RevealText text="the clock catches up." highlight="clock" delay={2} />
          </h1>

          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              Speed Link Courier moves time-critical parcels, documents and freight with dedicated
              drivers, live tracking and guaranteed timings — from Farnborough to anywhere on earth.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center gap-3"
            >
              <Button asChild variant="speed" size="pill-lg">
                <a href="#quote">
                  Book a delivery <ArrowRight className="size-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="pill-lg">
                <a href="#track">Track a shipment</a>
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Cinematic freight frame */}
        <motion.figure
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-14 overflow-hidden rounded-[var(--radius-4xl)] border border-border shadow-[var(--shadow-lift)]"
        >
          <div className="relative aspect-[16/9] w-full sm:aspect-[21/9]">
            <motion.img
              style={{ y: imageY, scale: imageScale }}
              src={heroFreight}
              alt="Freight pallets being loaded onto a cargo aircraft at first light"
              width={1920}
              height={1088}
              fetchPriority="high"
              className="size-full object-cover"
            />

            {/* Purposeful motion: route streaks tracing a delivery corridor */}
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 size-full"
              preserveAspectRatio="none"
              viewBox="0 0 1200 500"
            >
              {[90, 180, 300, 400].map((y, i) => (
                <motion.line
                  key={y}
                  x1={-260}
                  y1={y}
                  x2={90}
                  y2={y}
                  stroke="var(--primary)"
                  strokeWidth={i % 2 ? 1 : 2}
                  strokeLinecap="round"
                  initial={{ x: 0, opacity: 0 }}
                  animate={{ x: [0, 1500], opacity: [0, 0.85, 0] }}
                  transition={{
                    duration: 2.6 + i * 0.4,
                    repeat: Infinity,
                    delay: i * 0.85,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </svg>
          </div>

          <figcaption className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full glass-ink px-4 py-2 text-[11px] tracking-[0.2em] text-ink-foreground uppercase">
            <Plane className="size-3.5" aria-hidden="true" />
            Air express · departing hourly
          </figcaption>
        </motion.figure>

        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-10 grid gap-4 border-t border-border pt-8 sm:grid-cols-3"
        >
          {[
            { icon: Truck, label: "Same-day dedicated vans" },
            { icon: Plane, label: "International air express" },
            { icon: ShieldCheck, label: "Fully insured, signed for" },
          ].map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3 text-sm text-muted-foreground">
              <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
              {label}
            </li>
          ))}
        </motion.ul>
      </div>

      {/* Route ticker: destinations streaming past like a departure board */}
      <div className="relative border-y border-border bg-surface py-3">
        <div className="flex w-max [animation:marquee-x_44s_linear_infinite]">
          {[0, 1].map((dup) => (
            <ul key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
              {ticker.map((city) => (
                <li
                  key={`${dup}-${city}`}
                  className="flex items-center gap-6 px-6 text-[11px] tracking-[0.25em] text-muted-foreground uppercase"
                >
                  {city}
                  <span className="size-1 rounded-full bg-primary" />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
