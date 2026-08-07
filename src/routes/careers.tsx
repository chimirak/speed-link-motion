import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section, CardGrid, InfoCard } from "@/components/site/page-shell";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/careers")({
  head: () =>
    pageHead({
      title: "Careers",
      description:
        "Join Speed Link Express Logistics in Farnborough — driver, coordinator, customs and technology roles across a 24/7 logistics operation.",
      path: "/careers",
    }),
  component: CareersPage,
});

const roles = [
  { title: "Same-day driver (Owner-driver)", type: "Full time · Farnborough", body: "Dedicated collections across the South East on a guaranteed weekly minimum." },
  { title: "Operations coordinator", type: "Shift work · Farnborough", body: "Own consignments end to end on the 24/7 control tower desk." },
  { title: "Customs specialist", type: "Full time · Farnborough", body: "Prepare and present documentation for air and ocean movements." },
  { title: "Warehouse operative", type: "Full time · Farnborough", body: "Goods in, slotting, pick-and-pack and dispatch cut-off discipline." },
  { title: "Account manager", type: "Full time · Hybrid", body: "Grow and retain business accounts across aerospace and healthcare." },
  { title: "Software engineer", type: "Full time · Hybrid", body: "Build the tracking, booking and reporting tools the operation runs on." },
];

const benefits = [
  { title: "Paid properly", body: "Above-market base rates, overtime paid at premium and no unpaid waiting time." },
  { title: "Real progression", body: "Coordinators become team leads and managers — most of our leadership started on a desk or in a van." },
  { title: "Modern kit", body: "Handheld scanners, route tools and vehicles that are maintained, not tolerated." },
  { title: "Family operation", body: "Farnborough-based, independently owned, and small enough that everyone knows your name." },
];

function CareersPage() {
  return (
    <>
      <PageHero
        kicker="Careers"
        title="Move things that"
        highlight="actually matter."
        intro="We are hiring across driving, operations, customs, warehousing and technology at our Farnborough hub."
      />

      <Section eyebrow="Open roles" title="Current vacancies">
        <div className="grid gap-4">
          {roles.map((r, i) => (
            <Reveal key={r.title} delay={0.04 * i}>
              <article className="surface-card flex flex-wrap items-center justify-between gap-4 p-6 transition-colors hover:bg-secondary">
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-bold">{r.title}</h3>
                  <p className="mt-1 text-xs tracking-[0.16em] text-muted-foreground uppercase">
                    {r.type}
                  </p>
                  <p className="mt-3 max-w-xl text-sm text-muted-foreground">{r.body}</p>
                </div>
                <Button asChild variant="outline" size="pill">
                  <Link to="/contact">
                    Apply <ArrowUpRight className="size-4" />
                  </Link>
                </Button>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="muted" eyebrow="Why join" title="What we offer">
        <CardGrid cols={4}>
          {benefits.map((b, i) => (
            <InfoCard key={b.title} index={i} title={b.title} body={b.body} />
          ))}
        </CardGrid>
      </Section>
    </>
  );
}
