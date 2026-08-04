import { motion } from "motion/react";
import { ShieldCheck, Clock4, Radar, Headphones, Leaf, Lock } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Counter } from "@/components/motion/counter";

const reasons = [
  {
    icon: Clock4,
    title: "On-time or explained",
    copy: "Delivery windows are contractual, not aspirational. Every exception is reported before you notice it.",
  },
  {
    icon: Radar,
    title: "Live GPS visibility",
    copy: "Vehicle-level tracking with scan events, driver ETA and photographic proof of delivery.",
  },
  {
    icon: ShieldCheck,
    title: "Insured to £25,000",
    copy: "Goods-in-transit cover as standard, with higher limits available for high-value freight.",
  },
  {
    icon: Headphones,
    title: "Humans, 24/7",
    copy: "A named coordinator answers in under 30 seconds — no queues, no chatbots, no scripts.",
  },
  {
    icon: Lock,
    title: "Vetted couriers",
    copy: "DBS-checked, uniformed drivers trained in secure and confidential handling.",
  },
  {
    icon: Leaf,
    title: "Carbon balanced",
    copy: "Every UK mile offset, with an expanding electric fleet across urban routes.",
  },
];

export function WhyUs() {
  return (
    <section id="why" className="section-pad relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute top-1/3 -left-40 -z-10 size-[36rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_22%,transparent),transparent_70%)] blur-3xl"
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <Reveal>
              <p className="text-xs tracking-[0.3em] text-primary uppercase">Why Speed Link</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-5 font-display text-[clamp(2rem,5vw,3.75rem)] leading-[1.02] font-extrabold">
                Trusted with the shipments that cannot fail.
              </h2>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-5 max-w-md text-muted-foreground">
                Hospitals, law firms, film studios and manufacturers rely on us when a missed
                delivery is not an option.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-10 flex items-center gap-8 rounded-3xl surface-card p-6">
                <div>
                  <p className="numeric text-4xl font-bold text-primary">
                    <Counter to={99.4} decimals={1} suffix="%" />
                  </p>
                  <p className="mt-1 text-xs tracking-wider text-muted-foreground uppercase">
                    On-time record
                  </p>
                </div>
                <span className="h-12 w-px bg-border" aria-hidden="true" />
                <div>
                  <p className="numeric text-4xl font-bold">
                    <Counter to={30} suffix="s" />
                  </p>
                  <p className="mt-1 text-xs tracking-wider text-muted-foreground uppercase">
                    Avg. answer time
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {reasons.map((r, i) => (
              <Reveal as="li" key={r.title} delay={0.05 * i} direction="left">
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="h-full rounded-[1.75rem] border border-border bg-surface/40 p-6 transition-colors duration-300 hover:border-primary/40"
                >
                  <r.icon className="size-5 text-primary" aria-hidden="true" />
                  <h3 className="mt-5 text-lg font-bold">{r.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{r.copy}</p>
                </motion.div>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
