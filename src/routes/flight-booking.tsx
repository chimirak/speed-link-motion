import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section } from "@/components/site/page-shell";
import { FlightBooking } from "@/components/site/flight-booking";
import { CardGrid, InfoCard } from "@/components/site/page-shell";
import { CallToAction } from "@/components/site/call-to-action";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/flight-booking")({
  head: () =>
    pageHead({
      title: "Flight Booking",
      description:
        "Corporate and leisure flight booking from Speed Link Express Logistics — fare holds, visa guidance and 24/7 rebooking on the same account as your freight.",
      path: "/flight-booking",
    }),
  component: FlightBookingPage,
});

const perks = [
  { title: "Fare holds", body: "Hold a quoted fare while approvals go through, without losing the price." },
  { title: "Visa guidance", body: "Documentation checks before you fly so nobody is turned away at the gate." },
  { title: "24/7 rebooking", body: "One number to call when an itinerary breaks at midnight in another timezone." },
  { title: "One invoice", body: "Travel and freight consolidated onto a single monthly account statement." },
];

function FlightBookingPage() {
  return (
    <>
      <PageHero
        kicker="Flight booking"
        title="We move your cargo."
        highlight="And your people."
        intro="Book corporate and leisure travel on the same account as your freight — one relationship, one invoice, one number to call when a plan changes."
      />

      <FlightBooking />

      <Section tone="muted" eyebrow="Why book with us" title="Travel handled like freight">
        <CardGrid cols={4}>
          {perks.map((p, i) => (
            <InfoCard key={p.title} index={i} title={p.title} body={p.body} />
          ))}
        </CardGrid>
      </Section>

      <CallToAction />
    </>
  );
}
