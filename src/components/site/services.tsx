import { motion } from "motion/react";
import { Truck, Plane, Building2, Snowflake, FileText, PackageOpen, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

const services = [
  {
    icon: Truck,
    title: "Same-day dedicated",
    copy: "One driver, one vehicle, direct from A to B. Nothing else on board.",
    meta: "From 60 min collection",
  },
  {
    icon: Plane,
    title: "International express",
    copy: "Air-freight priority lanes into 220+ countries with customs handled end to end.",
    meta: "220+ countries",
  },
  {
    icon: FileText,
    title: "Legal & confidential",
    copy: "Chain-of-custody documents, contracts and tenders moved under signature.",
    meta: "Signed, sealed, audited",
  },
  {
    icon: Building2,
    title: "Business contracts",
    copy: "Scheduled multi-drop routes and account billing for teams shipping daily.",
    meta: "Dedicated account lead",
  },
  {
    icon: Snowflake,
    title: "Temperature critical",
    copy: "Pharma, clinical samples and perishables in monitored cold-chain packaging.",
    meta: "2–8 °C monitored",
  },
  {
    icon: PackageOpen,
    title: "Pallets & freight",
    copy: "Tail-lift vehicles and full-load capacity for oversized and heavy consignments.",
    meta: "Up to 26 pallets",
  },
];

export function Services() {
  return (
    <section id="services" className="section-pad relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <Reveal>
              <p className="text-xs tracking-[0.3em] text-primary uppercase">Services</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-5 max-w-2xl font-display text-[clamp(2rem,5vw,3.75rem)] leading-[1.02] font-extrabold">
                Every kind of urgent, handled properly.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.16}>
            <p className="max-w-sm text-muted-foreground">
              Six specialist lanes, one network. Whatever the consignment, it moves under the same
              standard of care.
            </p>
          </Reveal>
        </div>

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal as="li" key={s.title} delay={0.05 * i}>
              <motion.article
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 320, damping: 24 }}
                className="group relative h-full overflow-hidden rounded-[1.75rem] surface-card p-7"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 -top-24 h-40 bg-[radial-gradient(60%_100%_at_50%_100%,color-mix(in_oklab,var(--primary)_35%,transparent),transparent)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
                <span className="grid size-12 place-items-center rounded-2xl bg-secondary text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                  <s.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-6 text-xl font-bold">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.copy}</p>
                <p className="numeric mt-6 flex items-center gap-2 border-t border-border pt-4 text-xs tracking-wider text-muted-foreground uppercase">
                  {s.meta}
                  <ArrowUpRight className="ml-auto size-4 text-primary transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </p>
              </motion.article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
