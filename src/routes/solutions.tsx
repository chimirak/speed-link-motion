import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, CardGrid, InfoCard } from "@/components/site/page-shell";
import { BusinessSolutions } from "@/components/site/business-solutions";
import { WhyUs } from "@/components/site/why-us";
import { CallToAction } from "@/components/site/call-to-action";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/solutions")({
  head: () =>
    pageHead({
      title: "Business Solutions",
      description:
        "Business accounts, warehousing and fulfilment, e-commerce integrations and customs brokerage from Speed Link Express Logistics.",
      path: "/solutions",
    }),
  component: SolutionsPage,
});

const sectors = [
  {
    title: "Aerospace & AOG",
    body: "Grounded aircraft parts moved on the next available uplift with full chain of custody.",
  },
  {
    title: "Healthcare & life science",
    body: "Temperature-controlled, validated packaging and time-definite clinical deliveries.",
  },
  {
    title: "Legal & financial",
    body: "Confidential documents, signature-only handover and audited delivery records.",
  },
  {
    title: "Manufacturing",
    body: "Line-stop prevention, inbound consolidation and scheduled milk runs.",
  },
  {
    title: "E-commerce & retail",
    body: "Pick-and-pack fulfilment, label printing and managed returns.",
  },
  {
    title: "Events & media",
    body: "Fragile kit, tight get-in windows and on-site waiting drivers.",
  },
];

function SolutionsPage() {
  return (
    <>
      <PageHero
        kicker="Business solutions"
        title="Logistics that plugs into"
        highlight="your operation."
        intro="Credit accounts, SLAs, integrated warehousing and customs brokerage — designed for teams that ship every day, not once a year."
      />

      <BusinessSolutions />

      <Section
        tone="muted"
        eyebrow="Sectors"
        title="Specialist handling where the stakes are highest"
      >
        <CardGrid cols={3}>
          {sectors.map((s, i) => (
            <InfoCard key={s.title} index={i} title={s.title} body={s.body} />
          ))}
        </CardGrid>
      </Section>

      <WhyUs />
      <CallToAction />
    </>
  );
}
