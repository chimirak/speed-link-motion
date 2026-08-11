import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section } from "@/components/site/page-shell";
import { CallToAction } from "@/components/site/call-to-action";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/pricing")({
  head: () =>
    pageHead({
      title: "Pricing",
      description:
        "Transparent courier and freight pricing from Speed Link Express Logistics — same-day, air express and account rate cards with no hidden surcharges.",
      path: "/pricing",
    }),
  component: PricingPage,
});

const tiers = [
  {
    name: "On demand",
    price: "From £39",
    unit: "per consignment",
    body: "Pay-as-you-go same-day and next-day collections with no account required.",
    features: ["Collection within 60 mins", "Live tracking", "£100 cover included", "Card payment"],
    featured: false,
  },
  {
    name: "Business account",
    price: "From £249",
    unit: "per month + usage",
    body: "Credit terms, negotiated lane rates and a named coordinator for daily shippers.",
    features: [
      "30-day credit terms",
      "Named coordinator",
      "Consolidated monthly invoice",
      "Lane-based rate card",
      "Monthly performance reporting",
    ],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Bespoke",
    unit: "contracted SLA",
    body: "Dedicated capacity, warehousing and integration for national operations.",
    features: [
      "Contracted SLAs & penalties",
      "Dedicated vehicles",
      "Warehousing & fulfilment",
      "API and ERP integration",
      "Customs brokerage in-house",
    ],
    featured: false,
  },
];

const surcharges = [
  ["Out-of-hours collection (22:00–06:00)", "+25%"],
  ["Weekend & bank holiday", "+30%"],
  ["Waiting time after 15 free minutes", "£0.60 / min"],
  ["Fuel surcharge", "Indexed monthly"],
  ["Remote-area delivery", "Quoted per postcode"],
];

function PricingPage() {
  return (
    <>
      <PageHero
        kicker="Pricing"
        title="Priced on distance and deadline."
        highlight="Nothing hidden."
        intro="Every quote shows the base rate, applicable surcharges and cover level before you confirm. No invoice ever arrives with a surprise on it."
      />

      <Section>
        <div className="grid gap-5 lg:grid-cols-3">
          {tiers.map((t, i) => (
            <Reveal key={t.name} delay={0.06 * i}>
              <article
                className={`flex h-full flex-col p-8 ${
                  t.featured
                    ? "rounded-[var(--radius-2xl)] bg-ink text-ink-foreground shadow-[var(--shadow-lift)]"
                    : "surface-card"
                }`}
              >
                <p className="text-[11px] tracking-[0.24em] text-primary uppercase">{t.name}</p>
                <p className="numeric mt-5 text-4xl font-bold">{t.price}</p>
                <p
                  className={`mt-1 text-xs ${t.featured ? "text-ink-muted" : "text-muted-foreground"}`}
                >
                  {t.unit}
                </p>
                <p
                  className={`mt-5 text-sm leading-relaxed ${t.featured ? "text-ink-muted" : "text-muted-foreground"}`}
                >
                  {t.body}
                </p>
                <ul className="mt-7 space-y-3 text-sm">
                  {t.features.map((f) => (
                    <li key={f} className="flex gap-3">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                      <span className={t.featured ? "text-ink-muted" : "text-muted-foreground"}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant={t.featured ? "speed" : "outline"}
                  size="pill-lg"
                  className="mt-8 w-full"
                >
                  <Link to={t.name === "On demand" ? "/book" : "/contact"}>
                    {t.name === "On demand" ? "Book now" : "Talk to sales"}
                  </Link>
                </Button>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="muted" eyebrow="Surcharges" title="What can change a quote">
        <Reveal>
          <div className="surface-card overflow-hidden">
            <dl>
              {surcharges.map(([k, v]) => (
                <div
                  key={k}
                  className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-5 last:border-b-0"
                >
                  <dt className="text-sm">{k}</dt>
                  <dd className="numeric text-sm font-bold text-primary">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </Section>

      <CallToAction />
    </>
  );
}
