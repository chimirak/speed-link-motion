import { Reveal } from "@/components/motion/reveal";
import { ArrowUpRight } from "lucide-react";
import newsSea from "@/assets/news-sea.jpg";
import newsOffice from "@/assets/news-office.jpg";
import newsScan from "@/assets/news-scan.jpg";

const posts = [
  {
    img: newsSea,
    alt: "Stacked shipping containers at a port, one painted red",
    category: "Network",
    date: "12 March 2026",
    title: "New Rotterdam sea-freight lane cuts EU pallet transit to 48 hours",
    excerpt:
      "A dedicated weekly sailing plus our own cross-dock at Farnborough removes two handovers from the European pallet route.",
  },
  {
    img: newsOffice,
    alt: "Two logistics professionals reviewing shipment data on a laptop",
    category: "Product",
    date: "28 February 2026",
    title: "Live shipment API now available to every business account",
    excerpt:
      "Push scan events straight into your ERP or storefront with webhooks, and give customers a branded tracking page in minutes.",
  },
  {
    img: newsScan,
    alt: "A handheld scanner reading a barcode label on a parcel",
    category: "Operations",
    date: "9 February 2026",
    title: "Every consignment now carries photographic proof of delivery",
    excerpt:
      "Signature, GPS timestamp and photo capture are standard across the fleet — no upgrade, no surcharge, no disputes.",
  },
];

export function News() {
  return (
    <section id="news" className="section-pad relative bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Reveal>
              <p className="eyebrow">Latest news</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-5 max-w-2xl font-display text-[clamp(2rem,5vw,3.75rem)] leading-[1.02] font-extrabold">
                What we&rsquo;re building next.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.12}>
            <a
              href="#news"
              className="inline-flex items-center gap-2 border-b border-foreground pb-1 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
            >
              All updates <ArrowUpRight className="size-4" />
            </a>
          </Reveal>
        </div>

        <ul className="mt-14 grid gap-8 lg:grid-cols-3">
          {posts.map((p, i) => (
            <Reveal as="li" key={p.title} delay={0.07 * i}>
              <article className="group h-full">
                <a href="#news" className="flex h-full flex-col">
                  <div className="overflow-hidden rounded-[var(--radius-2xl)] border border-border">
                    <div className="aspect-[4/3] w-full">
                      <img
                        src={p.img}
                        alt={p.alt}
                        width={1200}
                        height={900}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-700 ease-[var(--ease-premium)] group-hover:scale-105"
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-3 text-[11px] tracking-[0.2em] uppercase">
                    <span className="text-primary">{p.category}</span>
                    <span className="text-muted-foreground">{p.date}</span>
                  </div>

                  <h3 className="mt-3 text-xl leading-snug font-bold transition-colors group-hover:text-primary">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.excerpt}</p>

                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                    Read more
                    <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </a>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
