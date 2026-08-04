import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowRight, Plane, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RevealText } from "@/components/motion/reveal";
import heroVan from "@/assets/hero-van.jpg";

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
];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.18]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section id="top" ref={ref} className="relative isolate min-h-dvh overflow-hidden">
      <motion.div style={{ y: imageY, scale: imageScale }} className="absolute inset-0 -z-20">
        <img
          src={heroVan}
          alt="Speed Link Courier delivery van moving at speed through a city at night"
          width={1920}
          height={1088}
          fetchPriority="high"
          className="size-full object-cover"
        />
      </motion.div>

      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,oklch(0.145_0_0/85%)_0%,oklch(0.145_0_0/55%)_38%,oklch(0.145_0_0/95%)_100%)]" />
      <div className="grid-lines absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(70%_60%_at_50%_35%,black,transparent)]" />

      {/* Purposeful motion: light-speed streaks tracing a delivery route */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 -z-10 size-full opacity-70"
        preserveAspectRatio="none"
        viewBox="0 0 1200 800"
      >
        {[160, 320, 520, 660].map((y, i) => (
          <motion.line
            key={y}
            x1={-200}
            y1={y}
            x2={140}
            y2={y}
            stroke="var(--primary)"
            strokeWidth={i % 2 ? 1 : 2}
            strokeLinecap="round"
            initial={{ x: 0, opacity: 0 }}
            animate={{ x: [0, 1500], opacity: [0, 0.9, 0] }}
            transition={{
              duration: 2.4 + i * 0.4,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative mx-auto flex min-h-dvh max-w-7xl flex-col justify-end px-4 pt-32 pb-14 sm:px-6 lg:pb-20"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-7 inline-flex w-fit items-center gap-2 rounded-full glass px-4 py-2 text-xs tracking-widest text-muted-foreground uppercase"
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full rounded-full bg-primary [animation:pulse-ring_1.8s_ease-out_infinite]" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          Live network · UK &amp; worldwide
        </motion.div>

        <h1 className="max-w-5xl font-display text-[clamp(2.75rem,9vw,7.5rem)] leading-[0.92] font-extrabold">
          <RevealText text="Delivered before" />
          <br />
          <RevealText text="the clock catches up." highlight="clock" delay={2} />
        </h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Speed Link Courier moves time-critical parcels, documents and freight with dedicated
            drivers, live tracking and guaranteed timings — from Farnborough to anywhere on earth.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center gap-3"
          >
            <Button asChild variant="speed" size="pill-lg">
              <a href="#quote">
                Book a delivery <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button asChild variant="glass" size="pill-lg">
              <a href="#track">Track a shipment</a>
            </Button>
          </motion.div>
        </div>

        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.15 }}
          className="mt-12 grid gap-3 border-t border-border pt-8 sm:grid-cols-3"
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
      </motion.div>

      {/* Route ticker: destinations streaming past like a departure board */}
      <div className="relative border-y border-border bg-background/70 py-3 backdrop-blur">
        <div className="flex w-max [animation:marquee-x_38s_linear_infinite]">
          {[0, 1].map((dup) => (
            <ul key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
              {ticker.map((city) => (
                <li
                  key={`${dup}-${city}`}
                  className="flex items-center gap-6 px-6 text-xs tracking-[0.25em] text-muted-foreground uppercase"
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
