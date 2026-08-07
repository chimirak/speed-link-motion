import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section } from "@/components/site/page-shell";
import { Services } from "@/components/site/services";
import { AirFreight } from "@/components/site/air-freight";
import { Process } from "@/components/site/process";
import { CallToAction } from "@/components/site/call-to-action";
import { Reveal } from "@/components/motion/reveal";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/services")({
  head: () =>
    pageHead({
      title: "Services",
      description:
        "Same-day courier, international air express, ocean and road freight, secure medical logistics and warehousing from Speed Link Express Logistics.",
      path: "/services",
    }),
  component: ServicesPage,
});

const matrix = [
  { service: "Same-day dedicated", lead: "Collection within 60 mins", cover: "UK-wide" },
  { service: "Next-flight-out air", lead: "Uplift same day", cover: "220+ countries" },
  { service: "Economy air express", lead: "2–4 working days", cover: "220+ countries" },
  { service: "Road freight & pallets", lead: "24–72 hours", cover: "UK & Europe" },
  { service: "Ocean FCL / LCL", lead: "Scheduled sailings", cover: "Global ports" },
  { service: "Secure & medical", lead: "Time-definite", cover: "UK & EU" },
];

function ServicesPage() {
  return (
    <>
      <PageHero
        kicker="Services"
        title="Every mode, one"
        highlight="control tower."
        intro="Road, air, ocean and secure specialist logistics — coordinated by the same team, tracked on the same system, billed on the same invoice."
      />

      <Services />

      <Section
        tone="muted"
        eyebrow="Service matrix"
        title="Lead times and coverage at a glance"
        intro="Indicative timings for standard consignments. Charters, AOG and out-of-gauge freight are quoted individually."
      >
        <Reveal>
          <div className="surface-card overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                  <th scope="col" className="px-6 py-4 font-medium">Service</th>
                  <th scope="col" className="px-6 py-4 font-medium">Lead time</th>
                  <th scope="col" className="px-6 py-4 font-medium">Coverage</th>
                </tr>
              </thead>
              <tbody>
                {matrix.map((r) => (
                  <tr key={r.service} className="border-b border-border last:border-b-0 transition-colors hover:bg-secondary">
                    <th scope="row" className="px-6 py-5 font-display font-bold">{r.service}</th>
                    <td className="px-6 py-5 text-muted-foreground">{r.lead}</td>
                    <td className="px-6 py-5 text-muted-foreground">{r.cover}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </Section>

      <AirFreight />
      <Process />
      <CallToAction />
    </>
  );
}
