import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, Prose } from "@/components/site/page-shell";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () =>
    pageHead({
      title: "Privacy Policy",
      description:
        "How Speed Link Express Logistics collects, uses, stores and protects personal data relating to bookings, tracking and enquiries.",
      path: "/privacy",
    }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <>
      <PageHero
        kicker="Privacy policy"
        title="How we handle"
        highlight="your data."
        intro="This policy explains what we collect, why we collect it, how long we keep it and the rights you have over it."
      />
      <Section>
        <Prose>
          <p>
            Speed Link Express Logistics, The Hub, Fowler Avenue, Farnborough, United Kingdom, is
            the data controller for personal data processed through this website and our booking and
            tracking systems.
          </p>

          <h2>What we collect</h2>
          <ul>
            <li>Contact details you provide: name, email address, telephone number and company.</li>
            <li>
              Consignment details: collection and delivery addresses, contents description, weight
              and dimensions.
            </li>
            <li>Delivery evidence: signatures, timestamps and delivery location data.</li>
            <li>
              Technical data: IP address, device type and pages visited, used only to keep the site
              secure and working.
            </li>
          </ul>

          <h2>Why we process it</h2>
          <p>
            To perform the contract of carriage, to keep you informed of a consignment's progress,
            to meet customs and transport legal obligations, and to answer enquiries you send us. We
            do not sell personal data and we do not use it for third-party advertising.
          </p>

          <h2>How long we keep it</h2>
          <p>
            Consignment and proof-of-delivery records are retained for six years to meet accounting
            and customs requirements. Enquiry correspondence is retained for 24 months. Technical
            logs are retained for 90 days.
          </p>

          <h2>Sharing</h2>
          <p>
            We share the minimum necessary data with airlines, shipping lines, final-mile partners
            and customs authorities to complete a movement. All partners are bound by contractual
            confidentiality and data protection obligations.
          </p>

          <h2>Your rights</h2>
          <p>
            You may request access to, correction of, or deletion of your personal data, and object
            to or restrict processing. Email <strong>Speedlinkcourier6@gmail.com</strong> and we
            will respond within 30 days. You also have the right to complain to the UK Information
            Commissioner's Office.
          </p>

          <h2>Cookies</h2>
          <p>
            We use only strictly necessary cookies to keep the site secure and remember your
            session. No advertising or cross-site tracking cookies are set.
          </p>
        </Prose>
      </Section>
    </>
  );
}
