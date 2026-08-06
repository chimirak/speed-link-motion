import { Reveal } from "@/components/motion/reveal";

const partners = [
  "NORTHFIELD",
  "ARCLINE",
  "MERIDIAN",
  "KESTREL",
  "BLACKWOOD",
  "AVANTI",
  "HALDANE",
  "ORBIS",
  "VECTOR",
  "STANMORE",
];

export function Partners() {
  return (
    <section aria-label="Business partners" className="relative border-y border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <Reveal>
          <p className="text-center text-[11px] tracking-[0.28em] text-muted-foreground uppercase">
            Trusted by operations teams at
          </p>
        </Reveal>

        <div className="relative mt-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <div className="flex w-max [animation:marquee-x_46s_linear_infinite]">
            {[0, 1].map((dup) => (
              <ul key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
                {partners.map((p) => (
                  <li
                    key={`${dup}-${p}`}
                    className="px-10 font-display text-xl font-extrabold tracking-[0.12em] text-foreground/35 transition-colors duration-300 hover:text-foreground"
                  >
                    {p}
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
