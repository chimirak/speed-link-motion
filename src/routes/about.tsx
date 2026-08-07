import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, CardGrid, InfoCard } from "@/components/site/page-shell";
import { Stats } from "@/components/site/stats";
import { CallToAction } from "@/components/site/call-to-action";
import { pageHead } from "@/lib/seo";
import { Reveal } from "@/components/motion/reveal";
import warehouse from "@/assets/warehouse.jpg";

export const Route = createFileRoute("/about")({
  head: () =>
    pageHead({
      title: "About Us",
      description:
        "Speed Link Express Logistics is a Farnborough-based courier and freight operator moving time-critical consignments across the UK and 220+ countries.",
      path: "/about",
    }),
  component: AboutPage,
});

const values = [
  {
    title: "Time is the product",
    body: "Every process we run exists to protect a deadline. Routing, staffing and escalation are all built backwards from the delivery window.",
  },
  {
    title: "One accountable owner",
    body: "Each consignment has a named coordinator. No ticket queues, no handoffs between departments, no chasing an anonymous inbox.",
  },
  {
    title: "Transparent by default",
    body: "Live milestones, honest ETAs and proactive calls when something changes. We tell you before you have to ask.",
  },
  {
    title: "Built for scale",
    body: "From a single envelope to a chartered freighter, the same control tower handles the movement with the same discipline.",
  },
];

const timeline = [
  { year: "2011", body: "Founded in Farnborough with two dedicated vans and a same-day promise." },
  { year: "2015", body: "First international air express desk opened; customs brokerage brought in-house." },
  { year: "2019", body: "Warehousing and fulfilment launched at The Hub, Fowler Avenue." },
  { year: "2022", body: "Ocean freight and full container load services added across UK ports." },
  { year: "2025", body: "Corporate flight booking introduced alongside freight accounts." },
];

function AboutPage() {
  return (
    <>
      <PageHero
        kicker="About us"
        title="A logistics operator built around"
        highlight="the deadline."
        intro="Speed Link Express Logistics moves time-critical parcels, documents and freight for businesses that cannot afford a missed window. We are headquartered at The Hub, Fowler Avenue in Farnborough, United Kingdom."
      />

      <Section eyebrow="Our approach" title="Four principles that shape every movement">
        <CardGrid cols={4}>
          {values.map((v, i) => (
            <InfoCard key={v.title} index={i} title={v.title} body={v.body} />
          ))}
        </CardGrid>
      </Section>

      <Stats />

      <Section
        tone="muted"
        eyebrow="Our story"
        title="Fourteen years of moving critical freight"
        intro="What began as a two-van same-day operation now spans air, ocean, road, warehousing and corporate travel."
      >
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
          <ol className="relative border-l border-border pl-8">
            {timeline.map((t, i) => (
              <Reveal key={t.year} delay={0.06 * i}>
                <li className="relative pb-10 last:pb-0">
                  <span className="absolute -left-[2.15rem] top-1 grid size-4 place-items-center rounded-full bg-primary" />
                  <p className="numeric text-sm font-bold text-primary">{t.year}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
                </li>
              </Reveal>
            ))}
          </ol>
          <Reveal direction="left">
            <img
              src={warehouse}
              alt="Speed Link Express Logistics warehouse operation in Farnborough"
              width={1600}
              height={1200}
              loading="lazy"
              className="w-full rounded-[var(--radius-3xl)] border border-border object-cover"
            />
          </Reveal>
        </div>
      </Section>

      <CallToAction />
    </>
  );
}
