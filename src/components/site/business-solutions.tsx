import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Building2, FileText, PackageCheck, Warehouse } from "lucide-react";
import warehouse from "@/assets/warehouse.jpg";

const solutions = [
  {
    icon: Building2,
    title: "Business accounts",
    copy: "Credit terms, consolidated invoicing, contractual SLAs and a named account manager on speed dial.",
    points: ["30-day terms", "Bespoke SLAs", "Monthly reporting"],
  },
  {
    icon: Warehouse,
    title: "Warehousing & fulfilment",
    copy: "Bonded and ambient storage with pick-and-pack, same-day dispatch cut-offs and live stock visibility.",
    points: ["Ambient & bonded", "Pick and pack", "Live stock feed"],
  },
  {
    icon: PackageCheck,
    title: "E-commerce logistics",
    copy: "Label generation, branded tracking pages and a returns portal that plugs straight into your store.",
    points: ["Bulk labels", "Branded tracking", "Returns portal"],
  },
  {
    icon: FileText,
    title: "Customs & compliance",
    copy: "Export documentation, duties and clearance prepared before the consignment ever leaves your dock.",
    points: ["EORI support", "Duty & VAT", "Dangerous goods"],
  },
];

export function BusinessSolutions() {
  return (
    <section id="solutions" className="section-pad relative bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
          <div>
            <Reveal>
              <p className="eyebrow">Business solutions</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-5 max-w-2xl font-display text-[clamp(2rem,5vw,3.75rem)] leading-[1.02] font-extrabold">
                Logistics built around how your business actually runs.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.14}>
            <p className="max-w-lg text-base leading-relaxed text-muted-foreground lg:pb-2">
              From a single urgent envelope to a full contract logistics programme, we design the
              route, the paperwork and the reporting around your operation — not the other way
              around.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <Reveal>
            <figure className="relative h-full min-h-[22rem] overflow-hidden rounded-[var(--radius-3xl)] border border-border">
              <img
                src={warehouse}
                alt="Team scanning parcels inside a bright Speed Link distribution centre"
                width={1600}
                height={1008}
                loading="lazy"
                className="size-full object-cover"
              />
              <figcaption className="absolute inset-x-4 bottom-4 rounded-2xl glass-ink p-5 text-ink-foreground">
                <p className="text-[11px] tracking-[0.24em] uppercase opacity-70">
                  Farnborough hub
                </p>
                <p className="mt-2 font-display text-lg font-bold">
                  42,000 sq ft of storage, dispatch and cross-dock capacity.
                </p>
              </figcaption>
            </figure>
          </Reveal>

          <ul className="grid gap-4 sm:grid-cols-2">
            {solutions.map((s, i) => (
              <Reveal as="li" key={s.title} delay={0.06 * i}>
                <div className="surface-card group h-full p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
                  <span className="grid size-11 place-items-center rounded-xl border border-border bg-background text-primary transition-colors group-hover:border-primary/40">
                    <s.icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.copy}</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {s.points.map((p) => (
                      <li
                        key={p}
                        className="rounded-full border border-border px-3 py-1 text-[11px] tracking-wide text-muted-foreground"
                      >
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>

        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button asChild variant="inverse" size="pill-lg">
              <a href="#quote">
                Open a business account <ArrowUpRight className="size-4" />
              </a>
            </Button>
            <p className="text-sm text-muted-foreground">
              Typical onboarding: under 48 hours from first call.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
