import { Reveal } from "@/components/motion/reveal";
import { Counter } from "@/components/motion/counter";
import { WorldMap, hubs } from "@/components/site/world-map";

const regions = [
  { label: "Europe", value: 44, suffix: " countries" },
  { label: "Americas", value: 35, suffix: " countries" },
  { label: "Asia Pacific", value: 41, suffix: " countries" },
  { label: "Middle East & Africa", value: 62, suffix: " countries" },
];

export function WorldwideCoverage() {
  return (
    <section id="coverage" className="section-pad relative bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
          <div>
            <Reveal>
              <p className="eyebrow">Worldwide coverage</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-5 max-w-2xl font-display text-[clamp(2rem,5vw,3.75rem)] leading-[1.02] font-extrabold">
                Nine hubs. One network. Two hundred and twenty destinations.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.14}>
            <p className="max-w-lg text-base leading-relaxed text-muted-foreground lg:pb-2">
              Hover a hub to see what it handles. Every lane below is operated on scheduled capacity
              we hold ourselves, which is why we can commit to a delivery window instead of an
              estimate.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="mt-14 overflow-hidden rounded-[var(--radius-3xl)] border border-border bg-surface p-4 shadow-[var(--shadow-soft)] sm:p-8">
            <WorldMap />
          </div>
        </Reveal>

        <dl className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {regions.map((r, i) => (
            <Reveal key={r.label} delay={0.06 * i}>
              <div className="border-t border-border pt-5">
                <dd className="numeric text-3xl font-bold">
                  <Counter to={r.value} suffix={r.suffix} />
                </dd>
                <dt className="mt-2 text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
                  {r.label}
                </dt>
              </div>
            </Reveal>
          ))}
        </dl>

        <Reveal delay={0.12}>
          <ul className="mt-10 flex flex-wrap gap-2">
            {hubs.map((h) => (
              <li
                key={h.name}
                className="rounded-full border border-border px-4 py-2 text-xs tracking-wide text-muted-foreground"
              >
                {h.name}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
