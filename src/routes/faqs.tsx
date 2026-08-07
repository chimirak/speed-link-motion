import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section } from "@/components/site/page-shell";
import { CallToAction } from "@/components/site/call-to-action";
import { Reveal } from "@/components/motion/reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { pageHead, ORIGIN } from "@/lib/seo";

const faqs = [
  {
    q: "How quickly can you collect?",
    a: "Dedicated same-day collections are typically on site within 60 minutes across the M3 and M4 corridors, and within two hours nationwide.",
  },
  {
    q: "Do you deliver internationally?",
    a: "Yes. We deliver to more than 220 countries using next-flight-out air, economy air express, ocean freight and vetted final-mile partners.",
  },
  {
    q: "Is my shipment insured?",
    a: "Every consignment includes £100 of cover as standard. Extended cover to £1,000 or full declared value can be added at booking.",
  },
  {
    q: "How does tracking work?",
    a: "You receive a tracking reference on booking. Milestones, current location and estimated delivery update live, and proof of delivery is available for 12 months.",
  },
  {
    q: "Can you handle customs paperwork?",
    a: "Customs brokerage is handled in-house. We prepare and present documentation before uplift so consignments are not held at the border.",
  },
  {
    q: "Do you offer credit accounts?",
    a: "Business accounts include 30-day credit terms, negotiated lane rates, a named coordinator and one consolidated monthly invoice.",
  },
  {
    q: "What can't you carry?",
    a: "We cannot carry cash, live animals, illegal goods or unpackaged hazardous materials. Dangerous goods can be moved under the correct classification — talk to us first.",
  },
  {
    q: "Do you book flights for people as well as freight?",
    a: "Yes. Corporate and leisure travel can be booked on the same account as your freight, with fare holds, visa guidance and 24/7 rebooking.",
  },
];

export const Route = createFileRoute("/faqs")({
  head: () => {
    const base = pageHead({
      title: "FAQs",
      description:
        "Answers on collection times, international delivery, insurance, tracking, customs and business accounts at Speed Link Express Logistics.",
      path: "/faqs",
    });
    return {
      ...base,
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            url: `${ORIGIN}/faqs`,
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        },
      ],
    };
  },
  component: FaqPage,
});

function FaqPage() {
  return (
    <>
      <PageHero
        kicker="FAQs"
        title="The questions we get"
        highlight="most often."
        intro="Timings, cover, customs and accounts. If your question isn't here, the team answers the phone at any hour."
      />
      <Section>
        <Reveal>
          <Accordion type="single" collapsible className="mx-auto max-w-3xl">
            {faqs.map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger className="text-left font-display text-base font-bold">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </Section>
      <CallToAction />
    </>
  );
}
