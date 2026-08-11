import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section } from "@/components/site/page-shell";
import { CallToAction } from "@/components/site/call-to-action";
import { Reveal } from "@/components/motion/reveal";
import { ArrowUpRight } from "lucide-react";
import newsSea from "@/assets/news-sea.jpg";
import newsOffice from "@/assets/news-office.jpg";
import newsScan from "@/assets/news-scan.jpg";
import airFreight from "@/assets/air-freight.jpg";
import warehouse from "@/assets/warehouse.jpg";
import slideCourier from "@/assets/slide-courier.jpg";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/blog")({
  head: () =>
    pageHead({
      title: "Blog",
      description:
        "Logistics insight, network updates and operational guidance from the Speed Link Express Logistics team in Farnborough.",
      path: "/blog",
    }),
  component: BlogPage,
});

const posts = [
  {
    title: "What actually causes a missed delivery window",
    excerpt:
      "Nine times in ten it is not the road. We break down where time really disappears between booking and doorstep.",
    tag: "Operations",
    date: "12 May 2026",
    image: slideCourier,
  },
  {
    title: "Air versus ocean: choosing by total landed cost",
    excerpt:
      "Freight rate is only one line of the calculation. Here is the full model we run for account customers.",
    tag: "Freight",
    date: "28 April 2026",
    image: newsSea,
  },
  {
    title: "Customs documentation that clears first time",
    excerpt:
      "A practical checklist for commercial invoices, HS codes and incoterms that avoids border holds.",
    tag: "Customs",
    date: "9 April 2026",
    image: newsOffice,
  },
  {
    title: "AOG logistics: the first sixty minutes",
    excerpt:
      "How a grounded aircraft part moves from a supplier shelf to an airside handover overnight.",
    tag: "Aerospace",
    date: "21 March 2026",
    image: airFreight,
  },
  {
    title: "Designing a warehouse for same-day dispatch",
    excerpt:
      "Slotting, pick paths and cut-off discipline — the three things that decide whether same-day is real.",
    tag: "Warehousing",
    date: "3 March 2026",
    image: warehouse,
  },
  {
    title: "Barcodes, scans and the truth about tracking gaps",
    excerpt: "Why a status can sit still for six hours while a consignment is moving at 500 knots.",
    tag: "Technology",
    date: "17 February 2026",
    image: newsScan,
  },
];

function BlogPage() {
  return (
    <>
      <PageHero
        kicker="Blog"
        title="Notes from the"
        highlight="control tower."
        intro="Operational writing from the people who run the network — no press releases, no filler."
      />
      <Section>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => (
            <Reveal key={p.title} delay={0.05 * i}>
              <article className="surface-card group h-full overflow-hidden">
                <div className="overflow-hidden">
                  <img
                    src={p.image}
                    alt=""
                    width={1600}
                    height={1000}
                    loading="lazy"
                    className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <p className="flex items-center gap-3 text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                    <span className="text-primary">{p.tag}</span>
                    <span aria-hidden="true">·</span>
                    <time>{p.date}</time>
                  </p>
                  <h2 className="mt-4 font-display text-lg leading-snug font-bold">{p.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.excerpt}</p>
                  <p className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary">
                    Read article <ArrowUpRight className="size-4" aria-hidden="true" />
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>
      <CallToAction />
    </>
  );
}
