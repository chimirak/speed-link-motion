import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, CardGrid, InfoCard } from "@/components/site/page-shell";
import { WorldwideCoverage } from "@/components/site/worldwide-coverage";
import { CallToAction } from "@/components/site/call-to-action";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/coverage")({
  head: () =>
    pageHead({
      title: "Global Coverage",
      description:
        "Speed Link Express Logistics delivers to 220+ countries with UK-wide same-day collection, European road freight and global air and ocean lanes.",
      path: "/coverage",
    }),
  component: CoveragePage,
});

const lanes = [
  {
    title: "United Kingdom",
    body: "Same-day dedicated collection nationwide, with 60-minute response across the M3 and M4 corridors.",
  },
  {
    title: "Europe",
    body: "Road groupage and dedicated vans to all EU states, plus next-day air into major hubs.",
  },
  {
    title: "Middle East",
    body: "Daily uplift into Dubai, Doha and Riyadh with in-house customs documentation.",
  },
  {
    title: "North America",
    body: "Next-flight-out into JFK, ORD and LAX with bonded onward delivery.",
  },
  {
    title: "Asia Pacific",
    body: "Consolidated and express air into Singapore, Hong Kong, Shanghai and Sydney.",
  },
  {
    title: "Africa & LatAm",
    body: "Scheduled air and ocean services supported by vetted local delivery partners.",
  },
];

function CoveragePage() {
  return (
    <>
      <PageHero
        kicker="Coverage"
        title="220+ countries."
        highlight="One control tower."
        intro="Our network combines owned UK capacity with vetted partners overseas, so a consignment never changes hands without changing status."
      />

      <WorldwideCoverage />

      <Section tone="muted" eyebrow="Regional lanes" title="How the network is structured">
        <CardGrid cols={3}>
          {lanes.map((l, i) => (
            <InfoCard key={l.title} index={i} title={l.title} body={l.body} />
          ))}
        </CardGrid>
      </Section>

      <CallToAction />
    </>
  );
}
