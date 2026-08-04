import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, PackageCheck, MapPin, Warehouse, Plane, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

type Step = {
  icon: typeof MapPin;
  title: string;
  place: string;
  time: string;
  done: boolean;
};

const demoSteps: Step[] = [
  { icon: PackageCheck, title: "Collected", place: "Farnborough, UK", time: "08:12", done: true },
  { icon: Warehouse, title: "Sorted at hub", place: "Heathrow Gateway", time: "10:47", done: true },
  { icon: Plane, title: "Departed", place: "LHR → JFK", time: "14:05", done: true },
  { icon: MapPin, title: "Out for delivery", place: "Manhattan, NY", time: "09:30", done: false },
  { icon: CheckCircle2, title: "Delivered", place: "Awaiting signature", time: "ETA 11:15", done: false },
];

export function TrackingSearch() {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = value.trim();
    if (code.length < 6) {
      setResult(null);
      setError("Enter a tracking number with at least 6 characters.");
      return;
    }
    setError(null);
    setResult(code.toUpperCase());
  };

  return (
    <section id="track" className="section-pad relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-px bg-[var(--gradient-speed)] opacity-40" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          <div>
            <Reveal>
              <p className="text-xs tracking-[0.3em] text-primary uppercase">Live tracking</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-5 font-display text-[clamp(2rem,5vw,3.75rem)] leading-[1.02] font-extrabold">
                Know exactly where it is. Every second.
              </h2>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-5 max-w-md text-muted-foreground">
                Every consignment carries a live scan trail. Enter your tracking number for
                real-time status, proof of delivery and an accurate ETA.
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <form onSubmit={onSubmit} className="mt-8" noValidate>
                <label htmlFor="tracking-number" className="sr-only">
                  Tracking number
                </label>
                <div className="flex flex-col gap-3 rounded-3xl surface-card p-3 sm:flex-row sm:items-center sm:rounded-full">
                  <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
                    <Search className="size-4 shrink-0 text-primary" aria-hidden="true" />
                    <input
                      id="tracking-number"
                      name="tracking"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="e.g. SLC-4471-GB"
                      autoComplete="off"
                      aria-describedby="tracking-help"
                      aria-invalid={error ? true : undefined}
                      className="numeric h-12 w-full min-w-0 bg-transparent text-base text-foreground uppercase placeholder:text-muted-foreground placeholder:normal-case focus:outline-none"
                    />
                  </div>
                  <Button type="submit" variant="speed" size="pill" className="sm:min-w-36">
                    Track parcel
                  </Button>
                </div>
                <p id="tracking-help" className="mt-3 pl-1 text-xs text-muted-foreground">
                  Demo mode — sample timeline shown for any valid-format reference.
                </p>
                <p role="status" aria-live="polite" className="min-h-5 pl-1 text-xs text-primary">
                  {error}
                </p>
              </form>
            </Reveal>
          </div>

          <Reveal direction="left" delay={0.1}>
            <div className="relative rounded-[2rem] surface-card p-6 shadow-[var(--shadow-lift)] sm:p-8">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
                <div className="min-w-0">
                  <p className="text-xs tracking-widest text-muted-foreground uppercase">
                    Consignment
                  </p>
                  <p className="numeric truncate text-xl font-semibold">
                    {result ?? "SLC-4471-GB"}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-primary/15 px-3 py-1.5 text-xs font-medium text-primary">
                  In transit
                </span>
              </div>

              <ol className="mt-8 space-y-0">
                <AnimatePresence initial={false}>
                  {demoSteps.map((step, i) => (
                    <motion.li
                      key={step.title}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-4 pb-7 last:pb-0"
                    >
                      {i < demoSteps.length - 1 && (
                        <span
                          aria-hidden="true"
                          className="absolute top-9 left-[17px] h-full w-px bg-border"
                        >
                          {step.done && (
                            <motion.span
                              initial={{ scaleY: 0 }}
                              whileInView={{ scaleY: 1 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.7, delay: 0.15 * i }}
                              className="block size-full origin-top bg-primary"
                            />
                          )}
                        </span>
                      )}
                      <span
                        className={`grid size-9 shrink-0 place-items-center rounded-full border ${
                          step.done
                            ? "border-primary/40 bg-primary text-primary-foreground"
                            : "border-border bg-secondary text-muted-foreground"
                        }`}
                      >
                        <step.icon className="size-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{step.title}</span>
                        <span className="block truncate text-sm text-muted-foreground">
                          {step.place}
                        </span>
                      </span>
                      <span className="numeric shrink-0 text-sm text-muted-foreground">
                        {step.time}
                      </span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ol>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
