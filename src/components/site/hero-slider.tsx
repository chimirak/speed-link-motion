import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroFreight from "@/assets/hero-freight.jpg";
import slideShip from "@/assets/slide-ship.jpg";
import slideTerminal from "@/assets/slide-terminal.jpg";
import slideCourier from "@/assets/slide-courier.jpg";
import warehouse from "@/assets/warehouse.jpg";
import travelTerminal from "@/assets/travel-terminal.jpg";

type Slide = {
  id: string;
  image: string;
  kicker: string;
  title: string;
  highlight: string;
  copy: string;
  primary: { label: string; to: string };
  secondary: { label: string; to: string };
};

const slides: Slide[] = [
  {
    id: "air",
    image: heroFreight,
    kicker: "Global air freight",
    title: "Next flight out.",
    highlight: "Anywhere.",
    copy: "Charter, next-flight-out and consolidated air freight to 220+ countries, cleared through customs before the wheels are up.",
    primary: { label: "Book a shipment", to: "/book" },
    secondary: { label: "Air freight", to: "/services" },
  },
  {
    id: "sea",
    image: slideShip,
    kicker: "Ocean & container",
    title: "Container volume,",
    highlight: "courier care.",
    copy: "FCL and LCL sailings from every major UK port with live milestone tracking and a named coordinator on every booking.",
    primary: { label: "Get a quote", to: "/contact" },
    secondary: { label: "Coverage map", to: "/coverage" },
  },
  {
    id: "terminal",
    image: slideTerminal,
    kicker: "Airport cargo terminals",
    title: "Moving through",
    highlight: "the night.",
    copy: "Dedicated terminal handling, AOG parts and time-definite uplift — our operation runs while the rest of the supply chain sleeps.",
    primary: { label: "Track a shipment", to: "/tracking" },
    secondary: { label: "Business solutions", to: "/solutions" },
  },
  {
    id: "warehouse",
    image: warehouse,
    kicker: "Warehousing & fulfilment",
    title: "Storage, pick, pack,",
    highlight: "dispatch.",
    copy: "Bonded and ambient storage in Farnborough with integrated pick-and-pack, returns handling and same-day dispatch cut-offs.",
    primary: { label: "Explore solutions", to: "/solutions" },
    secondary: { label: "See pricing", to: "/pricing" },
  },
  {
    id: "courier",
    image: slideCourier,
    kicker: "Same-day courier",
    title: "Collected in 60,",
    highlight: "delivered direct.",
    copy: "Dedicated vehicles, no depots, no sorting hubs. One driver, one consignment, door to door across the United Kingdom.",
    primary: { label: "Book a courier", to: "/book" },
    secondary: { label: "Our services", to: "/services" },
  },
  {
    id: "flights",
    image: travelTerminal,
    kicker: "Flight booking",
    title: "We move cargo.",
    highlight: "And people.",
    copy: "Corporate and leisure flight booking on the same account as your freight — one relationship, one invoice, one number to call.",
    primary: { label: "Search flights", to: "/flight-booking" },
    secondary: { label: "Talk to us", to: "/contact" },
  },
];

const AUTOPLAY_MS = 6500;

export function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);

  const go = useCallback((next: number, direction: number) => {
    setDir(direction);
    setIndex((next + slides.length) % slides.length);
  }, []);

  const next = useCallback(() => go(index + 1, 1), [go, index]);
  const prev = useCallback(() => go(index - 1, -1), [go, index]);

  useEffect(() => {
    if (paused) return;
    const t = window.setTimeout(next, AUTOPLAY_MS);
    return () => window.clearTimeout(t);
  }, [index, paused, next]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const slide = slides[index]!;

  return (
    <section
      id="top"
      aria-roledescription="carousel"
      aria-label="Speed Link Express Logistics highlights"
      className="relative isolate h-[92svh] min-h-[38rem] overflow-hidden bg-ink text-ink-foreground"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const start = touchX.current;
        const end = e.changedTouches[0]?.clientX ?? null;
        if (start == null || end == null) return;
        if (Math.abs(end - start) > 50) (end < start ? next : prev)();
        touchX.current = null;
      }}
    >
      <AnimatePresence initial={false} custom={dir} mode="sync">
        <motion.div
          key={slide.id}
          custom={dir}
          initial={{ opacity: 0, scale: 1.08, x: dir * 60 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 1.04, x: dir * -40 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt=""
            width={1920}
            height={1080}
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"}
            className="size-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      <div
        className="absolute inset-0 bg-[linear-gradient(100deg,oklch(0.1776_0_0/88%)_0%,oklch(0.1776_0_0/62%)_45%,oklch(0.1776_0_0/28%)_100%)]"
        aria-hidden="true"
      />
      <div className="grid-lines-ink absolute inset-0 opacity-40" aria-hidden="true" />

      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-28 sm:px-6 lg:pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <p className="text-[11px] font-semibold tracking-[0.28em] text-primary uppercase">
              {slide.kicker}
            </p>
            <h1 className="mt-5 font-display text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.98] font-extrabold">
              {slide.title}{" "}
              <span className="text-gradient-speed">{slide.highlight}</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
              {slide.copy}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild variant="speed" size="pill-lg">
                <Link to={slide.primary.to}>
                  {slide.primary.label} <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="glass" size="pill-lg">
                <Link to={slide.secondary.to}>{slide.secondary.label}</Link>
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute inset-x-0 bottom-0 border-t border-[oklch(0.9884_0_0/14%)]">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous slide"
              className="grid size-10 place-items-center rounded-full border border-[oklch(0.9884_0_0/22%)] transition-colors hover:bg-[oklch(0.9884_0_0/12%)]"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next slide"
              className="grid size-10 place-items-center rounded-full border border-[oklch(0.9884_0_0/22%)] transition-colors hover:bg-[oklch(0.9884_0_0/12%)]"
            >
              <ChevronRight className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Play slideshow" : "Pause slideshow"}
              className="grid size-10 place-items-center rounded-full border border-[oklch(0.9884_0_0/22%)] transition-colors hover:bg-[oklch(0.9884_0_0/12%)]"
            >
              {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
            </button>
          </div>

          <ol className="flex min-w-0 flex-1 items-center gap-2">
            {slides.map((s, i) => (
              <li key={s.id} className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => go(i, i > index ? 1 : -1)}
                  aria-label={`Go to slide ${i + 1}: ${s.kicker}`}
                  aria-current={i === index}
                  className="group block w-full py-3"
                >
                  <span className="block h-[3px] w-full overflow-hidden rounded-full bg-[oklch(0.9884_0_0/22%)]">
                    <motion.span
                      className="block h-full bg-primary"
                      initial={false}
                      animate={{ width: i === index ? "100%" : i < index ? "100%" : "0%" }}
                      transition={
                        i === index && !paused
                          ? { duration: AUTOPLAY_MS / 1000, ease: "linear" }
                          : { duration: 0.3 }
                      }
                    />
                  </span>
                </button>
              </li>
            ))}
          </ol>

          <p className="numeric shrink-0 text-xs tracking-widest text-ink-muted">
            {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </p>
        </div>
      </div>
    </section>
  );
}
