import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, CardGrid, InfoCard } from "@/components/site/page-shell";
import { TrackingSearch } from "@/components/site/tracking-search";
import { CallToAction } from "@/components/site/call-to-action";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/tracking")({
  head: () =>
    pageHead({
      title: "Track a Shipment",
      description:
        "Track your Speed Link Express Logistics consignment with live milestones, current location, estimated delivery and proof of delivery.",
      path: "/tracking",
    }),
  component: TrackingPage,
});

const help = [
  {
    title: "Where is my tracking number?",
    body: "It appears on your booking confirmation email and on the collection receipt. UK consignments start SLX, international start SLE.",
  },
  {
    title: "Status hasn't moved",
    body: "Milestones update as the consignment is scanned. Long-haul air legs can run several hours between scans; the ETA stays live throughout.",
  },
  {
    title: "Proof of delivery",
    body: "A signature, timestamp and geotag are attached to every completed delivery and available to download for 12 months.",
  },
];

function TrackingPage() {
  return (
    <>
      <PageHero
        kicker="Tracking"
        title="Know exactly where"
        highlight="it is."
        intro="Live milestones, current location, estimated delivery and downloadable proof of delivery for every consignment we carry."
      />

      <TrackingSearch />

      <Section tone="muted" eyebrow="Tracking help" title="Common questions about tracking">
        <CardGrid cols={3}>
          {help.map((h, i) => (
            <InfoCard key={h.title} index={i} title={h.title} body={h.body} />
          ))}
        </CardGrid>
      </Section>

      <CallToAction />
    </>
  );
}
