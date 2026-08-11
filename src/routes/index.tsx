import { createFileRoute } from "@tanstack/react-router";
import { getPublishedPosts, type PublicPost } from "@/lib/content.functions";
import { HeroSlider } from "@/components/site/hero-slider";
import { TrackingSearch } from "@/components/site/tracking-search";
import { Stats } from "@/components/site/stats";
import { Services } from "@/components/site/services";
import { WhyUs } from "@/components/site/why-us";
import { BusinessSolutions } from "@/components/site/business-solutions";
import { AirFreight } from "@/components/site/air-freight";
import { FlightBooking } from "@/components/site/flight-booking";
import { WorldwideCoverage } from "@/components/site/worldwide-coverage";
import { Process } from "@/components/site/process";
import { Testimonials } from "@/components/site/testimonials";
import { Partners } from "@/components/site/partners";
import { News } from "@/components/site/news";
import { CallToAction } from "@/components/site/call-to-action";

const title = "Speed Link Express Logistics — Same-Day & Global Express Delivery";
const description =
  "Time-critical courier and freight from Farnborough to 220+ countries. Live tracking, guaranteed timings, fully insured, 24/7 human support.";

export const Route = createFileRoute("/")({
  // The homepage must render even if the CMS is unavailable.
  loader: async () => {
    try {
      return { posts: await getPublishedPosts({ data: { limit: 3 } }) };
    } catch (error) {
      console.error("[home] could not load posts:", error);
      return { posts: [] as PublicPost[] };
    }
  },
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
          name: "Speed Link Express Logistics",
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
  const { posts } = Route.useLoaderData();

  return (
    <>
      <HeroSlider />
      <TrackingSearch />
      <Stats />
      <Services />
      <WhyUs />
      <BusinessSolutions />
      <AirFreight />
      <FlightBooking />
      <WorldwideCoverage />
      <Process />
      <Testimonials />
      <Partners />
      <News posts={posts} />
      <CallToAction />
    </>
  );
}
