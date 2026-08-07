import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section } from "@/components/site/page-shell";
import { BookingWizard } from "@/components/site/booking-wizard";
import { Process } from "@/components/site/process";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/book")({
  head: () =>
    pageHead({
      title: "Book a Shipment",
      description:
        "Book a same-day, air express, freight or ocean shipment with Speed Link Express Logistics in a guided five-step flow.",
      path: "/book",
    }),
  component: BookPage,
});

function BookPage() {
  return (
    <>
      <PageHero
        kicker="Book a shipment"
        title="Five steps."
        highlight="Two minutes."
        intro="Tell us where it starts, where it ends and what it is. A coordinator confirms pricing and collection within 30 minutes."
      />
      <Section>
        <BookingWizard />
      </Section>
      <Process />
    </>
  );
}
