import { useState } from "react";
import { motion } from "motion/react";

/** Coarse land mask: [startCol, endCol] ranges per row on a 72 x 28 grid. */
const LAND: [number, number][][] = [
  [[14, 22], [30, 34], [44, 60]],
  [[10, 24], [29, 35], [40, 62]],
  [[8, 26], [29, 35], [38, 64]],
  [[8, 27], [30, 34], [35, 66]],
  [[7, 26], [31, 33], [34, 67]],
  [[8, 25], [33, 36], [37, 66]],
  [[9, 25], [34, 37], [38, 65]],
  [[10, 25], [34, 40], [41, 64]],
  [[12, 25], [33, 42], [44, 62]],
  [[13, 24], [32, 44], [46, 60]],
  [[14, 23], [31, 45], [47, 58]],
  [[15, 22], [31, 44], [48, 57]],
  [[16, 21], [31, 42], [49, 56]],
  [[17, 21], [32, 41], [50, 55]],
  [[19, 23], [32, 40], [51, 57]],
  [[21, 25], [33, 40], [52, 58]],
  [[22, 27], [33, 40], [53, 59]],
  [[22, 28], [33, 40], [54, 60]],
  [[22, 29], [33, 39], [55, 60]],
  [[22, 29], [33, 39], [56, 61]],
  [[23, 29], [33, 39], [58, 62]],
  [[23, 28], [34, 38], [59, 63]],
  [[24, 28], [34, 38], [59, 64]],
  [[24, 27], [35, 37], [60, 64]],
  [[25, 27], [61, 63]],
  [[25, 26]],
  [[25, 26]],
  [[25, 26]],
];

const COLS = 72;
const ROWS = LAND.length;
const LAT_TOP = 84;
const LAT_BOTTOM = -56;

const project = (lon: number, lat: number) => ({
  x: ((lon + 180) / 360) * 100,
  y: ((LAT_TOP - lat) / (LAT_TOP - LAT_BOTTOM)) * 100,
});

export type Hub = {
  name: string;
  region: string;
  lon: number;
  lat: number;
  detail: string;
};

export const hubs: Hub[] = [
  { name: "Farnborough", region: "United Kingdom", lon: -0.77, lat: 51.28, detail: "Global HQ · 24/7 control room" },
  { name: "Amsterdam", region: "Europe", lon: 4.9, lat: 52.37, detail: "European road & air gateway" },
  { name: "New York", region: "North America", lon: -74.0, lat: 40.71, detail: "Transatlantic express hub" },
  { name: "Dubai", region: "Middle East", lon: 55.27, lat: 25.2, detail: "Middle East consolidation" },
  { name: "Singapore", region: "Asia Pacific", lon: 103.82, lat: 1.35, detail: "APAC distribution centre" },
  { name: "Hong Kong", region: "Asia Pacific", lon: 114.17, lat: 22.32, detail: "Manufacturing corridor" },
  { name: "São Paulo", region: "South America", lon: -46.63, lat: -23.55, detail: "LATAM partner network" },
  { name: "Johannesburg", region: "Africa", lon: 28.05, lat: -26.2, detail: "Sub-Saharan gateway" },
  { name: "Sydney", region: "Oceania", lon: 151.2, lat: -33.87, detail: "Oceania final mile" },
];

const routes: [string, string][] = [
  ["Farnborough", "New York"],
  ["Farnborough", "Dubai"],
  ["Dubai", "Singapore"],
  ["Singapore", "Sydney"],
  ["Farnborough", "Johannesburg"],
  ["New York", "São Paulo"],
  ["Hong Kong", "Amsterdam"],
];

const byName = (n: string) => hubs.find((h) => h.name === n)!;

export function WorldMap() {
  const [active, setActive] = useState<Hub | null>(null);

  const dots: { x: number; y: number }[] = [];
  LAND.forEach((ranges, r) => {
    ranges.forEach(([a, b]) => {
      for (let c = a; c <= b; c++) {
        dots.push({ x: (c / (COLS - 1)) * 100, y: (r / (ROWS - 1)) * 100 });
      }
    });
  });

  return (
    <div className="relative w-full">
      <div className="relative aspect-[16/9] w-full">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full"
          role="img"
          aria-label="World map showing Speed Link Express Logistics hubs and trade lanes"
        >
          {dots.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={0.32} fill="var(--foreground)" opacity={0.22} />
          ))}

          {routes.map(([from, to], i) => {
            const a = project(byName(from).lon, byName(from).lat);
            const b = project(byName(to).lon, byName(to).lat);
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2 - Math.abs(b.x - a.x) * 0.16 - 4;
            const d = `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`;
            return (
              <g key={`${from}-${to}`}>
                <path d={d} fill="none" stroke="var(--primary)" strokeWidth={0.18} opacity={0.35} />
                <motion.circle
                  r={0.55}
                  fill="var(--primary)"
                  initial={{ offsetDistance: "0%" }}
                  animate={{ offsetDistance: "100%" }}
                  transition={{ duration: 5 + i * 0.6, repeat: Infinity, ease: "easeInOut" }}
                  style={{ offsetPath: `path("${d}")`, offsetRotate: "0deg" }}
                />
              </g>
            );
          })}
        </svg>

        {hubs.map((h) => {
          const p = project(h.lon, h.lat);
          const isActive = active?.name === h.name;
          return (
            <button
              key={h.name}
              type="button"
              onMouseEnter={() => setActive(h)}
              onFocus={() => setActive(h)}
              onMouseLeave={() => setActive(null)}
              onBlur={() => setActive(null)}
              aria-label={`${h.name}, ${h.region}`}
              className="absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              <span
                className="absolute size-3 rounded-full bg-primary/40"
                style={{ animation: "pulse-ring 2.4s ease-out infinite" }}
                aria-hidden="true"
              />
              <span
                className={`relative rounded-full bg-primary transition-all duration-300 ${
                  isActive ? "size-3.5 ring-4 ring-primary/20" : "size-2"
                }`}
              />
            </button>
          );
        })}

        {active && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-none absolute z-10 w-52 -translate-x-1/2 -translate-y-[135%] rounded-xl border border-border bg-surface p-3 shadow-[var(--shadow-lift)]"
            style={{
              left: `${project(active.lon, active.lat).x}%`,
              top: `${project(active.lon, active.lat).y}%`,
            }}
          >
            <p className="text-sm font-bold">{active.name}</p>
            <p className="text-[11px] tracking-[0.18em] text-primary uppercase">{active.region}</p>
            <p className="mt-1.5 text-xs text-muted-foreground">{active.detail}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
