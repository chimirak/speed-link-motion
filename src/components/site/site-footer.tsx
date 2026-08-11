import { Mail, MapPin, MessageCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { WHATSAPP_DEFAULT_MESSAGE, WHATSAPP_DISPLAY, whatsappUrl } from "@/lib/brand";
import logo from "@/assets/speedlink-mark.png";

const columns = [
  {
    title: "Services",
    links: [
      { label: "Services overview", to: "/services" },
      { label: "Book a shipment", to: "/book" },
      { label: "Track a shipment", to: "/tracking" },
      { label: "Flight booking", to: "/flight-booking" },
      { label: "Pricing", to: "/pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", to: "/about" },
      { label: "Business solutions", to: "/solutions" },
      { label: "Coverage", to: "/coverage" },
      { label: "Locations", to: "/locations" },
      { label: "Careers", to: "/careers" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact", to: "/contact" },
      { label: "FAQs", to: "/faqs" },
      { label: "Blog", to: "/blog" },
      { label: "Privacy policy", to: "/privacy" },
      { label: "Terms & conditions", to: "/terms" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer id="contact-footer" className="relative border-t border-border bg-surface/30">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,0.8fr))_minmax(0,1.1fr)]">
          <div>
            <div className="flex min-w-0 items-center gap-2.5">
              <img
                src={logo}
                alt=""
                width={40}
                height={40}
                loading="lazy"
                className="h-9 w-9 shrink-0 object-contain"
              />
              <span className="font-display text-base leading-none font-extrabold tracking-tight uppercase">
                Speed<span className="text-primary">Link</span>
                <span className="mt-1 block text-[9px] font-semibold tracking-[0.28em] text-muted-foreground">
                  Express Logistics
                </span>
              </span>
            </div>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Time-critical courier, freight and travel services across the United Kingdom and 220+
              countries worldwide.
            </p>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
                {col.title}
              </h2>
              <ul className="mt-5 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sm text-foreground/85 transition-colors hover:text-primary"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="text-xs tracking-[0.25em] text-muted-foreground uppercase">Contact</h2>
            <ul className="mt-5 space-y-4 text-sm">
              <li className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <address className="text-muted-foreground not-italic">
                  The Hub, Fowler Avenue
                  <br />
                  Farnborough, United Kingdom
                </address>
              </li>
              <li className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <a
                  href="mailto:Speedlinkcourier6@gmail.com"
                  className="break-all text-muted-foreground transition-colors hover:text-primary"
                >
                  Speedlinkcourier6@gmail.com
                </a>
              </li>
              <li className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                <MessageCircle className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <a
                  href={whatsappUrl(WHATSAPP_DEFAULT_MESSAGE)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  WhatsApp customer support
                  <span className="block text-xs">{WHATSAPP_DISPLAY}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-t border-border pt-8">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Speed Link Express Logistics. All rights reserved.
          </p>
          <p className="numeric shrink-0 text-xs tracking-widest text-muted-foreground uppercase">
            Farnborough · UK
          </p>
        </div>
      </div>
    </footer>
  );
}
