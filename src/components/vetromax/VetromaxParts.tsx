// Shared presentation for the Vetromax brand area.
//
// Built from the existing Swiftrooms design language — the same type scale,
// palette, spacing and ScrollReveal motion used across the catalogue — rather
// than anything borrowed from vetromax.com.
import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import type { PerfEntry, Spec, VetromaxSystem } from "@/lib/vetromax";
import { COMPARE_ROWS } from "@/lib/vetromax";

/* ── Breadcrumb ─────────────────────────────────────────────────────────── */

export function VetromaxBreadcrumb({ system }: { system?: VetromaxSystem }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-2 text-[0.65rem] tracking-widest uppercase text-gray-400 mb-6 md:mb-8"
    >
      <Link href="/brands" className="hover:text-[#007969] transition-colors">
        Brands
      </Link>
      <span aria-hidden="true">/</span>
      {system ? (
        <>
          <Link href="/brands/vetromax" className="hover:text-[#007969] transition-colors">
            Vetromax
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-[#6b7280]">{system.name}</span>
        </>
      ) : (
        <span className="text-[#6b7280]">Vetromax</span>
      )}
    </nav>
  );
}

/* ── Internal system navigation ─────────────────────────────────────────── */

/**
 * Horizontal on desktop, a scrollable touch row on mobile — deliberately not a
 * dropdown, which would be cramped at small widths.
 */
export function SystemNav({
  systems,
  activeSlug,
}: {
  systems: VetromaxSystem[];
  activeSlug?: string;
}) {
  return (
    <nav aria-label="Vetromax systems" className="border-y border-gray-100 bg-white">
      <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
        <ul className="flex gap-2 overflow-x-auto scrollbar-hide py-4 md:flex-wrap md:overflow-x-visible">
          {systems.map((s) => {
            const active = s.slug === activeSlug;
            return (
              <li key={s.slug} className="flex-shrink-0">
                <Link
                  href={`/brands/vetromax/${s.slug}`}
                  aria-current={active ? "page" : undefined}
                  className={`block px-4 py-2.5 text-[0.7rem] tracking-widest uppercase border transition-all whitespace-nowrap ${
                    active
                      ? "border-[#007969] text-white bg-[#007969]"
                      : "border-gray-200 text-[#6b7280] hover:border-[#007969] hover:text-[#007969]"
                  }`}
                >
                  {s.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

/* ── Technical specifications ───────────────────────────────────────────── */

/** Large values, small labels, thin separators — an architectural grid. */
export function SpecGrid({ specs, title = "Technical specifications" }: { specs: Spec[]; title?: string }) {
  if (specs.length === 0) return null;
  return (
    <section className="py-12 md:py-20 border-t border-gray-100">
      <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
        <ScrollReveal>
          <p className="text-label text-[#007969] mb-3">Specification</p>
          <h2 className="text-title text-[#1c1c1e] mb-8 md:mb-12">{title}</h2>
        </ScrollReveal>
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100 border border-gray-100">
          {specs.map((spec, i) => (
            <ScrollReveal key={spec.label} delay={(i % 3) * 0.06}>
              <div className="bg-white p-6 md:p-8 h-full">
                <dt className="text-[0.6rem] tracking-widest uppercase text-gray-400 mb-3">
                  {spec.label}
                </dt>
                <dd className="font-heading text-2xl md:text-3xl font-bold text-[#1c1c1e] leading-none">
                  {spec.value}
                </dd>
              </div>
            </ScrollReveal>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ── Performance ────────────────────────────────────────────────────────── */

function PerfBlock({ heading, entries }: { heading: string; entries: PerfEntry[] }) {
  return (
    <div>
      <h3 className="text-[0.65rem] tracking-widest uppercase text-[#007969] mb-5">{heading}</h3>
      <dl className="border-t border-gray-200">
        {entries.map((e) => (
          <div
            key={`${e.label}-${e.value}`}
            className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-1 sm:gap-6 py-4 border-b border-gray-100"
          >
            <dt className="text-[#1c1c1e] text-sm font-medium">
              {e.label}
              <span className="block text-xs text-gray-400 font-normal mt-0.5">{e.standard}</span>
            </dt>
            <dd className="text-[#007969] text-sm font-semibold sm:text-right">{e.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function Performance({ system }: { system: VetromaxSystem }) {
  const perf = system.performance;
  if (!perf || (!perf.european?.length && !perf.american?.length)) return null;
  return (
    <section className="py-12 md:py-20 bg-[#f8f9fa] border-t border-gray-100">
      <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
        <ScrollReveal>
          <p className="text-label text-[#007969] mb-3">Performance</p>
          <h2 className="text-title text-[#1c1c1e] mb-3">Tested performance</h2>
          <p className="text-[#6b7280] text-sm md:text-base max-w-2xl mb-8 md:mb-12">
            Classifications and test standards as published by Vetromax for {system.name}.
            Figures belong to this system only.
          </p>
        </ScrollReveal>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {perf.european?.length ? (
            <ScrollReveal>
              <PerfBlock heading="European standard" entries={perf.european} />
            </ScrollReveal>
          ) : null}
          {perf.american?.length ? (
            <ScrollReveal delay={0.1}>
              <PerfBlock heading="American standard" entries={perf.american} />
            </ScrollReveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/* ── Comparison ─────────────────────────────────────────────────────────── */

/**
 * A real table on desktop for scanning across systems; on mobile it becomes one
 * card per system, since a five-column table cannot be squeezed into 320px
 * without horizontal scrolling.
 */
export function ComparisonTable({ systems }: { systems: VetromaxSystem[] }) {
  return (
    <section className="py-12 md:py-20 border-t border-gray-100">
      <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
        <ScrollReveal>
          <p className="text-label text-[#007969] mb-3">Compare</p>
          <h2 className="text-title text-[#1c1c1e] mb-3">The range side by side</h2>
          <p className="text-[#6b7280] text-sm md:text-base max-w-2xl mb-8 md:mb-12">
            Only fields Vetromax publishes are filled in. A dash means the figure is not
            stated for that system rather than that it does not apply.
          </p>
        </ScrollReveal>

        {/* Desktop table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">Vetromax system comparison</caption>
            <thead>
              <tr>
                <th scope="col" className="text-[0.6rem] tracking-widest uppercase text-gray-400 font-normal py-4 pr-6 align-bottom">
                  <span className="sr-only">Attribute</span>
                </th>
                {systems.map((s) => (
                  <th key={s.slug} scope="col" className="py-4 px-4 align-bottom border-b-2 border-[#007969]">
                    <Link href={`/brands/vetromax/${s.slug}`} className="group">
                      <span className="block font-heading font-bold text-[#1c1c1e] group-hover:text-[#007969] transition-colors">
                        {s.name}
                      </span>
                      <span className="block text-xs text-gray-400 font-normal mt-1">{s.category}</span>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row) => (
                <tr key={row.key} className="border-b border-gray-100">
                  <th scope="row" className="text-[0.6rem] tracking-widest uppercase text-gray-400 font-normal py-4 pr-6 align-top whitespace-nowrap">
                    {row.label}
                  </th>
                  {systems.map((s) => (
                    <td key={s.slug} className="py-4 px-4 text-sm text-[#3a3a3c] align-top">
                      {s.compare[row.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile / tablet: one card per system */}
        <div className="lg:hidden space-y-4">
          {systems.map((s, i) => (
            <ScrollReveal key={s.slug} delay={i * 0.05}>
              <div className="border border-gray-100 bg-white">
                <Link
                  href={`/brands/vetromax/${s.slug}`}
                  className="block p-5 border-b border-gray-100 group"
                >
                  <span className="block font-heading font-bold text-[#1c1c1e] group-hover:text-[#007969] transition-colors">
                    {s.name}
                  </span>
                  <span className="block text-xs text-gray-400 mt-1">{s.category}</span>
                </Link>
                <dl className="p-5 space-y-3">
                  {COMPARE_ROWS.map((row) => (
                    <div key={row.key} className="grid grid-cols-[7rem_1fr] gap-3">
                      <dt className="text-[0.55rem] tracking-widest uppercase text-gray-400 pt-0.5">
                        {row.label}
                      </dt>
                      <dd className="text-sm text-[#3a3a3c]">{s.compare[row.key]}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Downloads ──────────────────────────────────────────────────────────── */

/**
 * Brochures are hosted by Vetromax and linked, not mirrored — Swiftrooms has no
 * stated redistribution rights over them.
 */
export function Downloads({
  items,
}: {
  items: { name: string; href: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <section className="py-12 md:py-20 bg-[#f8f9fa] border-t border-gray-100">
      <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
        <ScrollReveal>
          <p className="text-label text-[#007969] mb-3">Downloads</p>
          <h2 className="text-title text-[#1c1c1e] mb-3">Technical downloads</h2>
          <p className="text-[#6b7280] text-sm md:text-base max-w-2xl mb-8 md:mb-12">
            Manufacturer brochures, hosted by Vetromax. Links open the official PDF.
          </p>
        </ScrollReveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item, i) => (
            <ScrollReveal key={item.href} delay={(i % 4) * 0.06}>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col justify-between border border-gray-200 bg-white p-5 hover:border-[#007969] transition-colors"
              >
                <span className="text-[#1c1c1e] font-medium text-sm group-hover:text-[#007969] transition-colors">
                  {item.name}
                </span>
                <span className="text-[0.6rem] tracking-widest uppercase text-gray-400 mt-6 group-hover:text-[#007969] transition-colors">
                  PDF · vetromax.com ↗
                </span>
              </a>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
