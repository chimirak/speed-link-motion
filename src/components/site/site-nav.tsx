import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/speedlink-logo.png.asset.json";
import { cn } from "@/lib/utils";

const links = [
  { label: "Services", href: "#services" },
  { label: "Why us", href: "#why" },
  { label: "Process", href: "#process" },
  { label: "Tracking", href: "#track" },
  { label: "Contact", href: "#contact" },
];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <motion.div
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-all duration-500 sm:px-6",
          scrolled ? "mt-3" : "mt-5",
        )}
      >
        <div
          className={cn(
            "grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-full px-4 py-2.5 transition-all duration-500 sm:px-5 lg:grid-cols-[auto_1fr_auto]",
            scrolled ? "glass shadow-[var(--shadow-lift)]" : "border border-transparent",
          )}
        >
          <a href="#top" className="flex min-w-0 items-center gap-2.5" aria-label="Speed Link Courier home">
            <img
              src={logo.url}
              alt=""
              width={40}
              height={40}
              className="h-9 w-9 shrink-0 rounded-lg object-cover"
              style={{ objectPosition: "31% 55%", transform: "scale(2.6)" }}
            />
            <span className="min-w-0 truncate font-display text-sm font-extrabold tracking-tight uppercase">
              Speed<span className="text-primary">Link</span>
            </span>
          </a>

          <nav aria-label="Primary" className="hidden justify-center lg:flex">
            <ul className="flex items-center gap-1">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="relative rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
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
              className="grid size-11 place-items-center rounded-full border border-border text-foreground lg:hidden"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
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
            className="mx-4 mt-2 rounded-3xl glass p-3 lg:hidden"
          >
            <ul className="flex flex-col">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-base text-foreground/90 transition-colors hover:bg-secondary"
                  >
                    {l.label}
                    <ArrowUpRight className="size-4 text-primary" />
                  </a>
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
