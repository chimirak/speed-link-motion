import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section } from "@/components/site/page-shell";
import { CallToAction } from "@/components/site/call-to-action";
import { Reveal } from "@/components/motion/reveal";
import { MapPin, Clock } from "lucide-react";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/locations")({
  head: () =>
    pageHead({
      title: "Locations",
      description:
        "Speed Link Express Logistics operates from The Hub, Fowler Avenue, Farnborough, with collection coverage across the United Kingdom.",
      path: "/locations",
    }),
  component: LocationsPage,
});

const sites = [
  {
    name: "Farnborough — Head office & hub",
    address: "The Hub, Fowler Avenue, Farnborough, United Kingdom",
    hours: "24 hours, 7 days",
    role: "Control tower, warehousing, fulfilment and same-day fleet base.",
  },
  {
    name: "London & Home Counties",
    address: "Collection coverage across Greater London and the M25 corridor",
    hours: "24 hours, 7 days",
    role: "60-minute dedicated collection response and legal document runs.",
  },
  {
    name: "Heathrow & Gatwick air desks",
    address: "Airside agent handling at LHR and LGW cargo terminals",
    hours: "05:00 – 23:00 daily",
    role: "Next-flight-out uplift, AOG parts and customs presentation.",
  },
  {
    name: "Midlands & North",
    address: "Partner depots serving Birmingham, Manchester and Leeds",
    hours: "06:00 – 22:00",
    role: "Pallet freight, groupage and scheduled trunking to Farnborough.",
  },
  {
    name: "Scotland & Northern Ireland",
    address: "Glasgow, Edinburgh and Belfast delivery coverage",
    hours: "07:00 – 20:00",
    role: "Overnight air and road linehaul with morning delivery windows.",
  },
  {
    name: "European road network",
    address: "Direct vans and groupage across the EU",
    hours: "By schedule",
    role: "Dedicated cross-Channel movements and customs documentation.",
  },
];

function LocationsPage() {
  return (
    <>
      <PageHero
        kicker="Locations"
        title="One hub."
        highlight="National reach."
        intro="Everything runs through Farnborough, supported by air desks, partner depots and a European road network."
      />

      <Section>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map((s, i) => (
            <Reveal key={s.name} delay={0.05 * i}>
              <article className="surface-card h-full p-7">
                <MapPin className="size-5 text-primary" aria-hidden="true" />
                <h2 className="mt-5 font-display text-lg font-bold">{s.name}</h2>
                <address className="mt-3 text-sm leading-relaxed text-muted-foreground not-italic">
                  {s.address}
                </address>
                <p className="mt-4 flex items-center gap-2 text-xs tracking-[0.16em] text-muted-foreground uppercase">
                  <Clock className="size-3.5 text-primary" aria-hidden="true" />
                  {s.hours}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{s.role}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <CallToAction />
    </>
  );
}
