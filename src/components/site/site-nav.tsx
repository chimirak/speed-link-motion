import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Menu,
  X,
  ArrowUpRight,
  ChevronDown,
  Truck,
  Plane,
  Ship,
  PackageCheck,
  Building2,
  Globe2,
  Warehouse,
  FileText,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/speedlink-mark.png.asset.json";
import { cn } from "@/lib/utils";

type Item = { label: string; href: string; desc: string; icon: typeof Truck };
type Menu = { label: string; href: string; items?: Item[]; footnote?: string };

const nav: Menu[] = [
  {
    label: "Services",
    href: "#services",
    footnote: "Every service is tracked end-to-end and fully insured.",
    items: [
      {
        label: "Same-day courier",
        href: "#services",
        desc: "Dedicated vans, direct routes, no depots.",
        icon: Truck,
      },
      {
        label: "Air express",
        href: "#air-freight",
        desc: "Next-flight-out to 220+ countries.",
        icon: Plane,
      },
      {
        label: "Sea & road freight",
        href: "#services",
        desc: "Pallets and full loads across Europe.",
        icon: Ship,
      },
      {
        label: "Secure & medical",
        href: "#services",
        desc: "Temperature-controlled, chain of custody.",
        icon: PackageCheck,
      },
    ],
  },
  {
    label: "Solutions",
    href: "#solutions",
    footnote: "Account customers get consolidated billing and an named manager.",
    items: [
      {
        label: "Business accounts",
        href: "#solutions",
        desc: "Credit terms, SLAs and reporting.",
        icon: Building2,
      },
      {
        label: "Warehousing",
        href: "#solutions",
        desc: "Storage, pick-and-pack, fulfilment.",
        icon: Warehouse,
      },
      {
        label: "E-commerce",
        href: "#solutions",
        desc: "Plug-in label printing and returns.",
        icon: PackageCheck,
      },
      {
        label: "Customs & documents",
        href: "#solutions",
        desc: "Clearance handled before wheels up.",
        icon: FileText,
      },
    ],
  },
  { label: "Coverage", href: "#coverage" },
  { label: "Flights", href: "#flights" },
  { label: "News", href: "#news" },
  { label: "Contact", href: "#contact" },
];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openMenu = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActive(label);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setActive(null), 140);
  };

  const activeMenu = nav.find((n) => n.label === active && n.items);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <motion.div
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className={cn(
          "mx-auto max-w-7xl px-4 transition-all duration-500 sm:px-6",
          scrolled ? "mt-3" : "mt-5",
        )}
        onMouseLeave={scheduleClose}
      >
        <div
          className={cn(
            "grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-full px-4 py-2.5 transition-all duration-500 sm:px-5 lg:grid-cols-[auto_1fr_auto]",
            scrolled || active
              ? "glass shadow-[var(--shadow-soft)]"
              : "border border-transparent bg-transparent",
          )}
        >
          <a
            href="#top"
            className="flex min-w-0 items-center gap-2.5"
            aria-label="Speed Link Courier home"
          >
            <img
              src={logo.url}
              alt=""
              width={40}
              height={40}
              className="h-8 w-8 shrink-0 object-contain"
            />
            <span className="min-w-0 truncate font-display text-sm font-extrabold tracking-tight uppercase">
              Speed<span className="text-primary">Link</span>
            </span>
          </a>

          <nav aria-label="Primary" className="hidden justify-center lg:flex">
            <ul className="flex items-center gap-0.5">
              {nav.map((m) => (
                <li key={m.label} onMouseEnter={() => openMenu(m.label)}>
                  <a
                    href={m.href}
                    aria-expanded={m.items ? active === m.label : undefined}
                    onFocus={() => openMenu(m.label)}
                    className={cn(
                      "flex items-center gap-1 rounded-full px-3.5 py-2 text-sm transition-colors",
                      active === m.label
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {m.label}
                    {m.items && (
                      <ChevronDown
                        className={cn(
                          "size-3.5 transition-transform duration-300",
                          active === m.label && "rotate-180",
                        )}
                        aria-hidden="true"
                      />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <a
              href="tel:+441252000000"
              className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground xl:inline-flex"
            >
              <Phone className="size-4" aria-hidden="true" />
              24/7 desk
            </a>
            <Button asChild variant="speed" size="pill" className="hidden sm:inline-flex">
              <a href="#quote">
                Get a quote <ArrowUpRight className="size-4" />
              </a>
            </Button>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              className="grid size-11 place-items-center rounded-full border border-border bg-surface text-foreground lg:hidden"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mega menu */}
        <AnimatePresence>
          {activeMenu && (
            <motion.div
              key={activeMenu.label}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={() => openMenu(activeMenu.label)}
              className="absolute inset-x-4 top-full z-50 mt-2 hidden overflow-hidden rounded-[var(--radius-3xl)] border border-border bg-surface shadow-[var(--shadow-lift)] lg:block"
            >
              <div className="grid gap-8 p-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <ul className="grid gap-2 sm:grid-cols-2">
                  {activeMenu.items?.map((it) => (
                    <li key={it.label}>
                      <a
                        href={it.href}
                        onClick={() => setActive(null)}
                        className="group flex gap-4 rounded-2xl p-4 transition-colors hover:bg-secondary"
                      >
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-background text-primary transition-colors group-hover:border-primary/40">
                          <it.icon className="size-4" aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-1 text-sm font-semibold">
                            {it.label}
                            <ArrowUpRight className="size-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                          </span>
                          <span className="mt-1 block text-sm text-muted-foreground">{it.desc}</span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col justify-between rounded-2xl bg-ink p-6 text-ink-foreground">
                  <div>
                    <Globe2 className="size-5 text-primary" aria-hidden="true" />
                    <p className="mt-4 font-display text-lg leading-snug font-bold">
                      {activeMenu.footnote}
                    </p>
                  </div>
                  <Button asChild variant="speed" size="pill" className="mt-6 w-full">
                    <a href="#quote" onClick={() => setActive(null)}>
                      Talk to the team
                    </a>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            aria-label="Mobile"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="mx-4 mt-2 max-h-[75dvh] overflow-y-auto rounded-3xl glass p-3 lg:hidden"
          >
            <ul className="flex flex-col">
              {nav.map((m) => (
                <li key={m.label}>
                  <a
                    href={m.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-base font-medium transition-colors hover:bg-secondary"
                  >
                    {m.label}
                    <ArrowUpRight className="size-4 text-primary" />
                  </a>
                  {m.items && (
                    <ul className="mb-2 ml-4 border-l border-border pl-4">
                      {m.items.map((it) => (
                        <li key={it.label}>
                          <a
                            href={it.href}
                            onClick={() => setOpen(false)}
                            className="block py-2 text-sm text-muted-foreground"
                          >
                            {it.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
            <Button asChild variant="speed" size="pill" className="mt-2 w-full">
              <a href="#quote" onClick={() => setOpen(false)}>
                Get a quote
              </a>
            </Button>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
