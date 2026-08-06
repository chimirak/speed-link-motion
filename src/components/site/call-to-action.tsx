import { motion } from "motion/react";
import { ArrowRight, Mail, MapPin, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

export function CallToAction() {
  return (
    <section id="quote" className="section-pad relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] border border-border bg-[var(--gradient-ink)] px-6 py-16 text-ink-foreground sm:px-14 sm:py-24">
            <motion.span
              aria-hidden="true"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: [0.35, 0.75, 0.35] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute -top-40 -right-24 size-[34rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_38%,transparent),transparent_68%)] blur-3xl"
            />
            <div className="grid-lines-ink absolute inset-0" aria-hidden="true" />


            <div className="relative grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end">
              <div>
                <p className="text-xs tracking-[0.3em] text-primary uppercase">Get moving</p>
                <h2 className="mt-5 max-w-2xl font-display text-[clamp(2.1rem,5.5vw,4.25rem)] leading-[1.02] font-extrabold">
                  Send it today. Prove it tomorrow.
                </h2>
                <p className="mt-5 max-w-lg text-ink-muted">
                  Tell us what needs to move and where. You'll have a fixed quote and a collection
                  window within minutes.
                </p>
                <div className="mt-9 flex flex-wrap gap-3">
                  <Button asChild variant="speed" size="pill-lg">
                    <a href="mailto:Speedlinkcourier6@gmail.com?subject=Shipping%20enquiry">
                      Request a quote <ArrowRight className="size-4" />
                    </a>
                  </Button>
                  <Button asChild variant="glass" size="pill-lg">
                    <a href="#track">Track a shipment</a>
                  </Button>
                </div>
              </div>

              <ul className="space-y-4">
                {[
                  {
                    icon: Mail,
                    label: "Email us",
                    value: "Speedlinkcourier6@gmail.com",
                    href: "mailto:Speedlinkcourier6@gmail.com",
                  },
                  {
                    icon: MapPin,
                    label: "Visit the hub",
                    value: "The Hub, Fowler Avenue, Farnborough, UK",
                  },
                  {
                    icon: PhoneCall,
                    label: "Operations desk",
                    value: "Open 24 hours, 7 days a week",
                  },
                ].map((item) => (
                  <li
                    key={item.label}
                    className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4 rounded-2xl glass-ink p-5"
                  >
                    <item.icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-xs tracking-widest text-ink-muted uppercase">
                        {item.label}

                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="mt-1 block break-words font-medium hover:text-primary"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="mt-1 font-medium">{item.value}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
