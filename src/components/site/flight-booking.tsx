import { useState } from "react";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ArrowUpRight, CalendarDays, Plane, Users } from "lucide-react";
import terminal from "@/assets/travel-terminal.jpg";

const trips = ["Return", "One way", "Multi-city"] as const;

const fares = [
  { route: "London → Dubai", airline: "Direct · 7h 05m", cabin: "Business", price: "£1,480" },
  { route: "Manchester → New York", airline: "Direct · 8h 10m", cabin: "Premium", price: "£980" },
  { route: "London → Singapore", airline: "Direct · 13h 20m", cabin: "Business", price: "£2,140" },
];

export function FlightBooking() {
  const [trip, setTrip] = useState<(typeof trips)[number]>("Return");

  return (
    <section id="flights" className="section-pad relative bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
          <div>
            <Reveal>
              <p className="eyebrow">Flight booking</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-5 max-w-2xl font-display text-[clamp(2rem,5vw,3.75rem)] leading-[1.02] font-extrabold">
                We move your cargo. We can move your people too.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.14}>
            <p className="max-w-lg text-base leading-relaxed text-muted-foreground lg:pb-2">
              Speed Link Travel books corporate and leisure flights on the same account as your
              freight — one relationship, one invoice, one number to call when a plan changes at
              midnight.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <Reveal>
            <div className="surface-card overflow-hidden">
              <div className="flex flex-wrap gap-1 border-b border-border p-2">
                {trips.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTrip(t)}
                    aria-pressed={trip === t}
                    className={`relative rounded-full px-4 py-2 text-sm transition-colors ${
                      trip === t ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {trip === t && (
                      <motion.span
                        layoutId="trip-pill"
                        className="absolute inset-0 rounded-full bg-primary"
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      />
                    )}
                    <span className="relative">{t}</span>
                  </button>
                ))}
              </div>

              <form
                className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4"
                onSubmit={(e) => e.preventDefault()}
              >
                <Field label="From" placeholder="London (LHR)" icon={<Plane className="size-4 -rotate-45" />} />
                <Field label="To" placeholder="Dubai (DXB)" icon={<Plane className="size-4 rotate-45" />} />
                <Field
                  label={trip === "One way" ? "Departure" : "Dates"}
                  placeholder="12 – 19 Jun"
                  icon={<CalendarDays className="size-4" />}
                />
                <Field label="Travellers" placeholder="1 adult" icon={<Users className="size-4" />} />

                <div className="sm:col-span-2 lg:col-span-4">
                  <Button type="submit" variant="speed" size="pill-lg" className="w-full sm:w-auto">
                    Search flights <ArrowRight className="size-4" />
                  </Button>
                </div>
              </form>

              <div className="border-t border-border">
                <AnimatePresence initial={false}>
                  {fares.map((f, i) => (
                    <motion.div
                      key={f.route}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.05 * i, ease: [0.16, 1, 0.3, 1] }}
                      className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-5 last:border-b-0 transition-colors hover:bg-secondary"
                    >
                      <div className="min-w-0">
                        <p className="font-display text-base font-bold">{f.route}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {f.airline} · {f.cabin}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="numeric text-xl font-bold">{f.price}</p>
                        <span className="grid size-9 place-items-center rounded-full border border-border text-primary">
                          <ArrowUpRight className="size-4" aria-hidden="true" />
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </Reveal>

          <Reveal direction="left" delay={0.1}>
            <figure className="relative h-full min-h-[24rem] overflow-hidden rounded-[var(--radius-3xl)] border border-border">
              <img
                src={terminal}
                alt="Business traveller walking through a bright airport departure hall"
                width={1600}
                height={1200}
                loading="lazy"
                className="size-full object-cover"
              />
              <figcaption className="absolute inset-x-4 bottom-4 rounded-2xl glass-ink p-5 text-ink-foreground">
                <p className="text-[11px] tracking-[0.24em] uppercase opacity-70">Corporate travel</p>
                <p className="mt-2 font-display text-lg font-bold">
                  Fare holds, visa guidance and 24/7 rebooking when the itinerary breaks.
                </p>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  placeholder,
  icon,
}: {
  label: string;
  placeholder: string;
  icon: React.ReactNode;
}) {
  const id = `flight-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div>
      <label htmlFor={id} className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
        {label}
      </label>
      <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 transition-colors focus-within:border-primary/50">
        <span className="text-primary" aria-hidden="true">
          {icon}
        </span>
        <input
          id={id}
          type="text"
          placeholder={placeholder}
          maxLength={60}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
}
