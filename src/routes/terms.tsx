import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, Prose } from "@/components/site/page-shell";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () =>
    pageHead({
      title: "Terms & Conditions",
      description:
        "Terms and conditions of carriage for courier, freight and travel booking services provided by Speed Link Express Logistics.",
      path: "/terms",
    }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <>
      <PageHero
        kicker="Terms & conditions"
        title="The terms we"
        highlight="carry under."
        intro="These conditions apply to all courier, freight, warehousing and travel booking services we provide."
      />
      <Section>
        <Prose>
          <h2>1. Definitions</h2>
          <p>
            "We", "us" and "our" mean Speed Link Express Logistics of The Hub, Fowler Avenue,
            Farnborough, United Kingdom. "You" means the customer placing the booking. "Consignment"
            means the goods presented for carriage under a single booking reference.
          </p>

          <h2>2. Quotations and charges</h2>
          <p>
            Quotations are based on the information supplied at booking. Where actual weight,
            dimensions, waiting time or access differ from that information, charges may be adjusted
            and you will be notified before any additional charge is applied.
          </p>

          <h2>3. Collection and delivery</h2>
          <p>
            Timings quoted are estimates made in good faith and are subject to traffic, weather, air
            and ocean schedules, and customs. Where a guaranteed time-definite service is purchased,
            the specific guarantee stated on the booking confirmation applies.
          </p>

          <h2>4. Prohibited goods</h2>
          <ul>
            <li>Cash, bullion and negotiable instruments</li>
            <li>Live animals and human remains</li>
            <li>Illegal, counterfeit or prohibited items</li>
            <li>Unclassified or improperly packaged dangerous goods</li>
          </ul>

          <h2>5. Liability and insurance</h2>
          <p>
            Standard cover of £100 per consignment is included. Extended cover may be purchased at
            booking. Except where extended cover has been purchased, our liability is limited in
            accordance with the RHA Conditions of Carriage for domestic road movements and the
            applicable international convention for air and ocean movements.
          </p>

          <h2>6. Claims</h2>
          <p>
            Notice of loss or damage must be given in writing within seven days of delivery, or
            within 28 days of the collection date where a consignment is not delivered. Claims
            should be sent to <strong>Speedlinkcourier6@gmail.com</strong>.
          </p>

          <h2>7. Payment</h2>
          <p>
            On-demand bookings are payable at the time of booking. Account customers are invoiced
            monthly with payment due 30 days from invoice date. Late payment may incur statutory
            interest.
          </p>

          <h2>8. Travel bookings</h2>
          <p>
            Flight bookings are subject to the fare rules, change fees and cancellation terms of the
            operating carrier. We act as a booking agent and pass those terms through unchanged.
          </p>

          <h2>9. Governing law</h2>
          <p>
            These conditions are governed by the laws of England and Wales, and the courts of
            England and Wales have exclusive jurisdiction.
          </p>
        </Prose>
      </Section>
    </>
  );
}
