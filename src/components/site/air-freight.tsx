import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Reveal } from "@/components/motion/reveal";
import { Counter } from "@/components/motion/counter";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Clock, Globe2, ThermometerSnowflake } from "lucide-react";
import airFreight from "@/assets/air-freight.jpg";

const specs = [
  { icon: Clock, label: "Next flight out", value: "≤ 90 min", note: "airside cut-off" },
  { icon: Globe2, label: "Direct lanes", value: "180+", note: "airports served" },
  {
    icon: ThermometerSnowflake,
    label: "Temperature control",
    value: "2–8°C",
    note: "pharma validated",
  },
];

export function AirFreight() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section
      id="air-freight"
      ref={ref}
      className="relative overflow-hidden bg-ink text-ink-foreground"
    >
      <div className="grid-lines-ink absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-32">
        <div>
          <Reveal>
            <p className="eyebrow">Air freight</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-5 font-display text-[clamp(2rem,5vw,3.75rem)] leading-[1.02] font-extrabold">
              When the deadline is measured in hours, we put it on a plane.
            </h2>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="mt-6 max-w-xl leading-relaxed text-ink-muted">
              Next-flight-out and charter capacity out of Heathrow, Stansted, Manchester and
              Farnborough. Customs paperwork is filed while the driver is still en route to the
              terminal, so your consignment never waits for a document.
            </p>
          </Reveal>

          <dl className="mt-10 grid gap-6 sm:grid-cols-3">
            {specs.map((s, i) => (
              <Reveal key={s.label} delay={0.06 * i}>
                <div className="border-t border-[oklch(0.9884_0_0/16%)] pt-5">
                  <s.icon className="size-4 text-primary" aria-hidden="true" />
                  <dd className="numeric mt-4 text-2xl font-bold">{s.value}</dd>
                  <dt className="mt-2 text-[11px] tracking-[0.2em] text-ink-muted uppercase">
                    {s.label}
                  </dt>
                  <p className="mt-1 text-xs text-ink-muted">{s.note}</p>
                </div>
              </Reveal>
            ))}
          </dl>

          <Reveal delay={0.2}>
            <Button asChild variant="speed" size="pill-lg" className="mt-10">
              <a href="#quote">
                Price an air shipment <ArrowUpRight className="size-4" />
              </a>
            </Button>
          </Reveal>
        </div>

        <Reveal direction="left">
          <div className="relative">
            <figure className="relative overflow-hidden rounded-[var(--radius-4xl)] border border-[oklch(0.9884_0_0/14%)]">
              <div className="aspect-[4/3] w-full overflow-hidden">
                <motion.img
                  style={{ y }}
                  src={airFreight}
                  alt="Cargo freighter aircraft climbing after departure"
                  width={1600}
                  height={1200}
                  loading="lazy"
                  className="size-full scale-110 object-cover"
                />
              </div>
            </figure>

            <div className="absolute -bottom-6 left-6 right-6 rounded-2xl glass-ink p-5 sm:left-auto sm:right-6 sm:w-64">
              <p className="text-[11px] tracking-[0.22em] uppercase opacity-70">Airside uplift</p>
              <p className="numeric mt-2 text-3xl font-bold">
                <Counter to={38} suffix="t" /> <span className="text-base font-medium">/ day</span>
              </p>
              <p className="mt-1 text-xs text-ink-muted">Average tonnage moved by air</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
