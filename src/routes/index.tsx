import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site/site-nav";
import { Hero } from "@/components/site/hero";
import { TrackingSearch } from "@/components/site/tracking-search";
import { Services } from "@/components/site/services";
import { WhyUs } from "@/components/site/why-us";
import { Stats } from "@/components/site/stats";
import { Process } from "@/components/site/process";
import { Testimonials } from "@/components/site/testimonials";
import { CallToAction } from "@/components/site/call-to-action";
import { SiteFooter } from "@/components/site/site-footer";

const title = "Speed Link Courier — Same-Day & Global Express Delivery";
const description =
  "Time-critical courier and freight from Farnborough to 220+ countries. Live tracking, guaranteed timings, fully insured, 24/7 human support.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MovingCompany",
          name: "Speed Link Courier",
          description,
          email: "Speedlinkcourier6@gmail.com",
          address: {
            "@type": "PostalAddress",
            streetAddress: "The Hub, Fowler Avenue",
            addressLocality: "Farnborough",
            addressCountry: "GB",
          },
          areaServed: "Worldwide",
          openingHours: "Mo-Su 00:00-23:59",
        }),
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-full focus:bg-primary focus:px-5 focus:py-3 focus:text-sm focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <SiteNav />
      <main id="main">
        <Hero />
        <TrackingSearch />
        <Services />
        <WhyUs />
        <Stats />
        <Process />
        <Testimonials />
        <CallToAction />
      </main>
      <SiteFooter />
    </>
  );
}
