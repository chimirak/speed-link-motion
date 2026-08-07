import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { Reveal, RevealText } from "@/components/motion/reveal";

export function PageHero({
  kicker,
  title,
  highlight,
  intro,
  children,
}: {
  kicker: string;
  title: string;
  highlight?: string;
  intro?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-ink pt-36 pb-20 text-ink-foreground lg:pt-44 lg:pb-28">
      <div className="grid-lines-ink absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-[11px] tracking-[0.2em] text-ink-muted uppercase">
            <li>
              <Link to="/" className="transition-colors hover:text-primary">
                Home
              </Link>
            </li>
            <ChevronRight className="size-3" aria-hidden="true" />
            <li aria-current="page">{kicker}</li>
          </ol>
        </nav>
        <p className="text-[11px] font-semibold tracking-[0.28em] text-primary uppercase">
          {kicker}
        </p>
        <h1 className="mt-5 max-w-4xl font-display text-[clamp(2.25rem,6vw,4.75rem)] leading-[1] font-extrabold">
          <RevealText text={title} />
          {highlight ? (
            <>
              {" "}
              <span className="text-gradient-speed">{highlight}</span>
            </>
          ) : null}
        </h1>
        {intro && (
          <Reveal delay={0.12}>
            <p className="mt-7 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
              {intro}
            </p>
          </Reveal>
        )}
        {children && <div className="mt-10">{children}</div>}
      </div>
    </section>
  );
}

export function Section({
  id,
  title,
  eyebrow,
  intro,
  children,
  tone = "default",
}: {
  id?: string;
  title?: string;
  eyebrow?: string;
  intro?: string;
  children: ReactNode;
  tone?: "default" | "muted";
}) {
  return (
    <section
      id={id}
      className={`section-pad ${tone === "muted" ? "bg-surface-2" : "bg-background"}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {(eyebrow || title) && (
          <div className="max-w-3xl">
            {eyebrow && (
              <Reveal>
                <p className="eyebrow">{eyebrow}</p>
              </Reveal>
            )}
            {title && (
              <Reveal delay={0.06}>
                <h2 className="mt-5 font-display text-[clamp(1.75rem,4.5vw,3.25rem)] leading-[1.04] font-extrabold">
                  {title}
                </h2>
              </Reveal>
            )}
            {intro && (
              <Reveal delay={0.1}>
                <p className="mt-5 text-base leading-relaxed text-muted-foreground">{intro}</p>
              </Reveal>
            )}
          </div>
        )}
        <div className={eyebrow || title ? "mt-12" : ""}>{children}</div>
      </div>
    </section>
  );
}

export function CardGrid({ children, cols = 3 }: { children: ReactNode; cols?: 2 | 3 | 4 }) {
  const map = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  } as const;
  return <div className={`grid gap-5 ${map[cols]}`}>{children}</div>;
}

export function InfoCard({
  title,
  body,
  index = 0,
  icon,
}: {
  title: string;
  body: string;
  index?: number;
  icon?: ReactNode;
}) {
  return (
    <Reveal delay={0.05 * index}>
      <article className="surface-card group h-full p-7 transition-transform duration-500 hover:-translate-y-1">
        {icon && <span className="mb-5 inline-flex text-primary">{icon}</span>}
        <h3 className="font-display text-lg font-bold">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
      </article>
    </Reveal>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-3xl space-y-6 text-sm leading-relaxed text-muted-foreground [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-foreground">
      {children}
    </div>
  );
}
