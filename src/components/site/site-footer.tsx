import { Mail, MapPin } from "lucide-react";
import logo from "@/assets/speedlink-mark.png.asset.json";

const columns = [
  {
    title: "Services",
    links: [
      { label: "Same-day dedicated", href: "#services" },
      { label: "International express", href: "#services" },
      { label: "Legal & confidential", href: "#services" },
      { label: "Pallets & freight", href: "#services" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Why Speed Link", href: "#why" },
      { label: "How it works", href: "#process" },
      { label: "Track a shipment", href: "#track" },
      { label: "Request a quote", href: "#quote" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer id="contact" className="relative border-t border-border bg-surface/30">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)]">
          <div>
            <div className="flex min-w-0 items-center gap-2.5">
              <img
                src={logo.url}
                alt=""
                width={40}
                height={40}
                loading="lazy"
                className="h-9 w-9 shrink-0 object-contain"
              />
              <span className="font-display text-base font-extrabold tracking-tight uppercase">
                Speed<span className="text-primary">Link</span> Courier
              </span>
            </div>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Time-critical courier and freight services across the United Kingdom and 220+
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
                    <a
                      href={l.href}
                      className="text-sm text-foreground/85 transition-colors hover:text-primary"
                    >
                      {l.label}
                    </a>
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
                <address className="not-italic text-muted-foreground">
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
            </ul>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-t border-border pt-8">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Speed Link Courier. All rights reserved.
          </p>
          <p className="numeric shrink-0 text-xs tracking-widest text-muted-foreground uppercase">
            Farnborough · UK
          </p>
        </div>
      </div>
    </footer>
  );
}
