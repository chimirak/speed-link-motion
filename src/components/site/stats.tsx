import { Reveal } from "@/components/motion/reveal";
import { Counter } from "@/components/motion/counter";

const stats = [
  { value: 1.2, decimals: 1, suffix: "M+", label: "Parcels delivered" },
  { value: 220, decimals: 0, suffix: "+", label: "Countries served" },
  { value: 99.4, decimals: 1, suffix: "%", label: "On-time delivery" },
  { value: 14, decimals: 0, suffix: " yrs", label: "Moving critical freight" },
];

export function Stats() {
  return (
    <section
      aria-label="Company statistics"
      className="relative border-y border-border bg-[var(--gradient-ink)]"
    >
      <div className="grid-lines absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <dl className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={0.08 * i}>
              <div className="border-l border-border pl-6">
                <dd className="numeric text-[clamp(2.5rem,6vw,4.25rem)] leading-none font-bold">
                  <Counter to={s.value} decimals={s.decimals} suffix={s.suffix} />
                </dd>
                <dt className="mt-4 text-xs tracking-[0.22em] text-muted-foreground uppercase">
                  {s.label}
                </dt>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
