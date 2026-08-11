import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Menu as MenuIcon,
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
  MapPin,
  HelpCircle,
  Newspaper,
  Briefcase,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/speedlink-mark.png.asset.json";
import { cn } from "@/lib/utils";

type Item = { label: string; to: string; desc: string; icon: typeof Truck };
type MenuDef = { label: string; to: string; items?: Item[]; footnote?: string };

const nav: MenuDef[] = [
  {
    label: "Services",
    to: "/services",
    footnote: "Every service is tracked end-to-end and fully insured.",
    items: [
      {
        label: "Same-day courier",
        to: "/services",
        desc: "Dedicated vans, direct routes, no depots.",
        icon: Truck,
      },
      {
        label: "Air express",
        to: "/services",
        desc: "Next-flight-out to 220+ countries.",
        icon: Plane,
      },
      {
        label: "Sea & road freight",
        to: "/services",
        desc: "Pallets and full loads across Europe.",
        icon: Ship,
      },
      {
        label: "Secure & medical",
        to: "/services",
        desc: "Temperature-controlled, chain of custody.",
        icon: PackageCheck,
      },
    ],
  },
  {
    label: "Solutions",
    to: "/solutions",
    footnote: "Account customers get consolidated billing and a named manager.",
    items: [
      {
        label: "Business accounts",
        to: "/solutions",
        desc: "Credit terms, SLAs and reporting.",
        icon: Building2,
      },
      {
        label: "Warehousing",
        to: "/solutions",
        desc: "Storage, pick-and-pack, fulfilment.",
        icon: Warehouse,
      },
      {
        label: "Pricing",
        to: "/pricing",
        desc: "Transparent rate cards and surcharges.",
        icon: FileText,
      },
      {
        label: "Flight booking",
        to: "/flight-booking",
        desc: "Corporate travel on the same account.",
        icon: Plane,
      },
    ],
  },
  {
    label: "Network",
    to: "/coverage",
    footnote: "220+ countries, 14 UK collection zones, one control tower.",
    items: [
      {
        label: "Coverage",
        to: "/coverage",
        desc: "Lanes, transit times and cut-offs.",
        icon: Globe2,
      },
      {
        label: "Locations",
        to: "/locations",
        desc: "Depots, hubs and collection points.",
        icon: MapPin,
      },
      {
        label: "Track a shipment",
        to: "/tracking",
        desc: "Live milestones and proof of delivery.",
        icon: PackageCheck,
      },
      {
        label: "Book a shipment",
        to: "/book",
        desc: "Multi-step booking in under two minutes.",
        icon: Truck,
      },
    ],
  },
  {
    label: "Company",
    to: "/about",
    footnote: "Farnborough-based, moving critical freight since 2011.",
    items: [
      { label: "About us", to: "/about", desc: "Who we are and how we operate.", icon: Users },
      { label: "Blog", to: "/blog", desc: "Logistics insight and network news.", icon: Newspaper },
      {
        label: "Careers",
        to: "/careers",
        desc: "Drive, coordinate, build with us.",
        icon: Briefcase,
      },
      {
        label: "FAQs",
        to: "/faqs",
        desc: "Answers on timings, customs and claims.",
        icon: HelpCircle,
      },
    ],
  },
  { label: "Contact", to: "/contact" },
];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setActive(null);
  }, [pathname]);

  const activeMenu = nav.find((m) => m.label === active && m.items);

  return (
    <header className="fixed inset-x-0 top-0 z-50" onMouseLeave={() => setActive(null)}>
      <motion.div
        animate={{
          paddingTop: scrolled ? 10 : 20,
          paddingBottom: scrolled ? 10 : 20,
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "relative transition-colors duration-500",
          scrolled ? "glass shadow-[var(--shadow-soft)]" : "bg-transparent",
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link
            to="/"
            aria-label="Speed Link Express Logistics home"
            className="flex min-w-0 items-center gap-2.5"
          >
            <img
              src={logo.url}
              alt=""
              width={40}
              height={40}
              className="h-9 w-9 shrink-0 object-contain"
            />
            <span className="hidden font-display text-base leading-none font-extrabold tracking-tight uppercase sm:block">
              Speed<span className="text-primary">Link</span>
              <span className="mt-1 block text-[9px] font-semibold tracking-[0.28em] text-muted-foreground">
                Express Logistics
              </span>
            </span>
          </Link>

          <nav aria-label="Primary" className="ml-auto hidden lg:block">
            <ul className="flex items-center gap-1">
              {nav.map((m) => (
                <li key={m.label} onMouseEnter={() => setActive(m.items ? m.label : null)}>
                  <Link
                    to={m.to}
                    className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors hover:text-primary"
                    activeProps={{ className: "text-primary" }}
                  >
                    {m.label}
                    {m.items && (
                      <ChevronDown
                        className={cn(
                          "size-3.5 transition-transform",
                          active === m.label && "rotate-180",
                        )}
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button asChild variant="ghost" size="pill" className="hidden md:inline-flex">
              <Link to="/tracking">Track</Link>
            </Button>
            <Button asChild variant="speed" size="pill" className="hidden sm:inline-flex">
              <Link to="/book">
                Book a shipment <ArrowUpRight className="size-4" />
              </Link>
            </Button>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              className="grid size-10 place-items-center rounded-full border border-border lg:hidden"
            >
              {open ? <X className="size-5" /> : <MenuIcon className="size-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {activeMenu && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-x-0 top-full hidden lg:block"
            >
              <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="grid gap-6 rounded-[var(--radius-3xl)] glass p-6 shadow-[var(--shadow-lift)] lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {activeMenu.items!.map((it) => (
                      <li key={it.label}>
                        <Link
                          to={it.to}
                          onClick={() => setActive(null)}
                          className="group flex gap-4 rounded-2xl p-4 transition-colors hover:bg-secondary"
                        >
                          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-border text-primary">
                            <it.icon className="size-4" aria-hidden="true" />
                          </span>
                          <span className="min-w-0">
                            <span className="block font-display text-sm font-bold">{it.label}</span>
                            <span className="mt-1 block text-xs text-muted-foreground">
                              {it.desc}
                            </span>
                          </span>
                        </Link>
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
                      <Link to="/contact" onClick={() => setActive(null)}>
                        Talk to the team
                      </Link>
                    </Button>
                  </div>
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
                  <Link
                    to={m.to}
                    className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-base font-medium transition-colors hover:bg-secondary"
                  >
                    {m.label}
                    <ArrowUpRight className="size-4 text-primary" />
                  </Link>
                  {m.items && (
                    <ul className="mb-2 ml-4 border-l border-border pl-4">
                      {m.items.map((it) => (
                        <li key={it.label}>
                          <Link to={it.to} className="block py-2 text-sm text-muted-foreground">
                            {it.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
            <Button asChild variant="speed" size="pill" className="mt-2 w-full">
              <Link to="/book">Book a shipment</Link>
            </Button>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
