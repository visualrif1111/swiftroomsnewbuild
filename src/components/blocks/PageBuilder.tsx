import Image from "next/image";
import Link from "next/link";
import type { PortableTextBlock } from "@portabletext/react";
import { urlFor } from "@/sanity/lib/image";
import PortableTextBody from "@/components/PortableTextBody";
import type { PageSection } from "@/lib/page";

/* ── helpers ─────────────────────────────────────────────────────────── */

const CONTAINER = "max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10";

function bgClass(bg?: string): string {
  switch (bg) {
    case "alt": return "bg-[#f8f9fa] text-[#1c1c1e]";
    case "dark": return "bg-[#0f0f0f] text-white";
    case "brand": return "bg-[#007969] text-white";
    default: return "bg-white text-[#1c1c1e]";
  }
}

type ButtonData = { _key?: string; label?: string; href?: string; style?: string };

function Btn({ b }: { b: ButtonData }) {
  const href = b.href || "#";
  const cls =
    b.style === "outline"
      ? "btn-outline"
      : b.style === "link"
        ? "font-accent text-[0.8rem] tracking-[0.12em] uppercase font-semibold text-[#007969] hover:underline"
        : "btn-brand";
  const external = /^https?:\/\//.test(href);
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{b.label}</a>
  ) : (
    <Link href={href} className={cls}>{b.label}</Link>
  );
}

function img(source: unknown, width: number): string | null {
  if (!source) return null;
  try {
    return urlFor(source as never).width(width).fit("max").url();
  } catch {
    return null;
  }
}

/* ── blocks ──────────────────────────────────────────────────────────── */

function Hero({ s }: { s: PageSection }) {
  const src = img(s.image, 2000);
  const center = s.align === "center";
  const buttons = (s.buttons as ButtonData[]) ?? [];
  return (
    <section id={s.anchorId} className="relative min-h-[62vh] flex items-center overflow-hidden bg-[#0f0f0f]">
      {src && (
        <>
          <Image src={src} alt={(s.image as { alt?: string })?.alt || (s.heading as string) || ""} fill priority className="object-cover opacity-70" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/40" />
        </>
      )}
      <div className={`${CONTAINER} relative py-28 md:py-36 w-full`}>
        <div className={`max-w-3xl ${center ? "mx-auto text-center" : ""}`}>
          {typeof s.eyebrow === "string" && s.eyebrow && (
            <p className="text-label text-white/80 mb-4">{s.eyebrow}</p>
          )}
          {typeof s.heading === "string" && (
            <h1 className="text-headline text-white mb-6 leading-tight">{s.heading}</h1>
          )}
          {typeof s.subheading === "string" && s.subheading && (
            <p className="text-body-lg text-white/85 mb-8 max-w-2xl">{s.subheading}</p>
          )}
          {buttons.length > 0 && (
            <div className={`flex flex-wrap gap-3 ${center ? "justify-center" : ""}`}>
              {buttons.map((b, i) => <Btn key={b._key || i} b={b} />)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function RichText({ s }: { s: PageSection }) {
  const narrow = (s.width ?? "narrow") === "narrow";
  return (
    <section id={s.anchorId} className={`py-16 md:py-24 ${bgClass(s.background)}`}>
      <div className={CONTAINER}>
        <div className={narrow ? "max-w-3xl" : "max-w-5xl"}>
          {typeof s.heading === "string" && s.heading && (
            <h2 className="text-title mb-8">{s.heading}</h2>
          )}
          {Array.isArray(s.content) && <PortableTextBody value={s.content as PortableTextBlock[]} />}
        </div>
      </div>
    </section>
  );
}

function ImageSection({ s }: { s: PageSection }) {
  const src = img(s.image, 2000);
  if (!src) return null;
  const width = (s.width as string) ?? "wide";
  const maxW = width === "narrow" ? "max-w-3xl" : width === "full" ? "max-w-none" : "max-w-6xl";
  return (
    <section id={s.anchorId} className={`py-10 md:py-16 ${bgClass(s.background)}`}>
      <div className={width === "full" ? "" : CONTAINER}>
        <figure className={`${maxW} mx-auto`}>
          <div className="relative w-full aspect-[16/9] overflow-hidden bg-[#f0fdf4]">
            <Image src={src} alt={(s.image as { alt?: string })?.alt || ""} fill className="object-cover" sizes="100vw" />
          </div>
          {typeof s.caption === "string" && s.caption && (
            <figcaption className="text-xs text-gray-400 mt-3 text-center">{s.caption}</figcaption>
          )}
        </figure>
      </div>
    </section>
  );
}

function Gallery({ s }: { s: PageSection }) {
  const images = (s.images as { _key?: string; alt?: string }[]) ?? [];
  const cols = (s.columns as number) ?? 3;
  const colClass = cols === 2 ? "sm:grid-cols-2" : cols === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <section id={s.anchorId} className={`py-16 md:py-24 ${bgClass(s.background)}`}>
      <div className={CONTAINER}>
        {typeof s.heading === "string" && s.heading && <h2 className="text-title mb-8">{s.heading}</h2>}
        <div className={`grid grid-cols-1 ${colClass} gap-4`}>
          {images.map((im, i) => {
            const src = img(im, 900);
            if (!src) return null;
            return (
              <div key={im._key || i} className="relative aspect-[4/3] overflow-hidden bg-[#f0fdf4]">
                <Image src={src} alt={im.alt || ""} fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function VideoSection({ s }: { s: PageSection }) {
  const id = s.youtubeId as string;
  if (!id) return null;
  return (
    <section id={s.anchorId} className={`py-16 md:py-24 ${bgClass(s.background)}`}>
      <div className={CONTAINER}>
        {typeof s.heading === "string" && s.heading && <h2 className="text-title mb-8">{s.heading}</h2>}
        <div className="relative w-full aspect-video max-w-5xl mx-auto overflow-hidden bg-black">
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube-nocookie.com/embed/${id}`}
            title={(s.caption as string) || "Video"}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        {typeof s.caption === "string" && s.caption && <p className="text-xs text-gray-400 mt-3 text-center">{s.caption}</p>}
      </div>
    </section>
  );
}

function Stats({ s }: { s: PageSection }) {
  const items = (s.items as { _key?: string; value?: string; label?: string }[]) ?? [];
  const dark = s.background === "dark" || s.background === "brand";
  return (
    <section id={s.anchorId} className={`py-16 md:py-20 ${bgClass(s.background)}`}>
      <div className={CONTAINER}>
        {typeof s.heading === "string" && s.heading && <h2 className="text-title mb-10 text-center">{s.heading}</h2>}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {items.map((it, i) => (
            <div key={it._key || i} className="text-center">
              <p className={`text-3xl md:text-4xl font-bold mb-1 ${dark ? "text-white" : "text-[#007969]"}`}>{it.value}</p>
              <p className={`text-[0.65rem] tracking-widest uppercase ${dark ? "text-white/70" : "text-gray-400"}`}>{it.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureGrid({ s }: { s: PageSection }) {
  const items = (s.items as { _key?: string; icon?: string; title?: string; text?: string }[]) ?? [];
  const cols = (s.columns as number) ?? 3;
  const colClass = cols === 2 ? "md:grid-cols-2" : cols === 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3";
  return (
    <section id={s.anchorId} className={`py-16 md:py-24 ${bgClass(s.background)}`}>
      <div className={CONTAINER}>
        {typeof s.heading === "string" && s.heading && <h2 className="text-title mb-4 text-center">{s.heading}</h2>}
        {typeof s.intro === "string" && s.intro && <p className="text-[#6b7280] text-center max-w-2xl mx-auto mb-12">{s.intro}</p>}
        <div className={`grid grid-cols-1 ${colClass} gap-8`}>
          {items.map((it, i) => (
            <div key={it._key || i} className="border border-gray-100 p-6">
              {it.icon && <div className="text-2xl mb-4">{it.icon}</div>}
              <h3 className="font-semibold text-[#1c1c1e] mb-2">{it.title}</h3>
              {it.text && <p className="text-sm text-[#6b7280] leading-relaxed">{it.text}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials({ s }: { s: PageSection }) {
  const items = (s.testimonials as { _id?: string; quote?: string; author?: string; location?: string; project?: string }[]) ?? [];
  if (items.length === 0) return null;
  return (
    <section id={s.anchorId} className={`py-16 md:py-24 ${bgClass(s.background)}`}>
      <div className={CONTAINER}>
        {typeof s.heading === "string" && s.heading && <h2 className="text-title mb-12 text-center">{s.heading}</h2>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((t, i) => (
            <figure key={t._id || i} className="border border-gray-100 p-8 flex flex-col">
              <blockquote className="text-[#3a3a3c] leading-relaxed mb-6 flex-1">&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className="text-sm">
                <span className="font-semibold text-[#1c1c1e] block">{t.author}</span>
                {(t.project || t.location) && (
                  <span className="text-gray-400 text-xs">{[t.project, t.location].filter(Boolean).join(" · ")}</span>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Logos({ s }: { s: PageSection }) {
  const brands = (s.brands as { _id?: string; title?: string; logo?: unknown }[]) ?? [];
  if (brands.length === 0) return null;
  return (
    <section id={s.anchorId} className={`py-14 md:py-20 ${bgClass(s.background)}`}>
      <div className={CONTAINER}>
        {typeof s.heading === "string" && s.heading && <h2 className="text-label text-[#007969] mb-10 text-center">{s.heading}</h2>}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 items-center">
          {brands.map((b, i) => {
            const src = img(b.logo, 240);
            return (
              <div key={b._id || i} className="relative h-12 flex items-center justify-center">
                {src ? (
                  <Image src={src} alt={b.title || ""} width={160} height={48} className="max-h-12 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" />
                ) : (
                  <span className="text-sm text-gray-400">{b.title}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Faq({ s }: { s: PageSection }) {
  const items = (s.faqs as { _id?: string; question?: string; answer?: string }[]) ?? [];
  if (items.length === 0) return null;
  return (
    <section id={s.anchorId} className={`py-16 md:py-24 ${bgClass(s.background)}`}>
      <div className={CONTAINER}>
        <div className="max-w-3xl mx-auto">
          {typeof s.heading === "string" && s.heading && <h2 className="text-title mb-8">{s.heading}</h2>}
          <div className="divide-y divide-gray-100 border-y border-gray-100">
            {items.map((f, i) => (
              <details key={f._id || i} className="group py-5">
                <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-[#1c1c1e]">
                  {f.question}
                  <span className="ml-4 text-[#007969] transition-transform group-open:rotate-45 text-xl leading-none">+</span>
                </summary>
                {f.answer && <p className="text-[#6b7280] leading-relaxed mt-3">{f.answer}</p>}
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Cta({ s }: { s: PageSection }) {
  const buttons = (s.buttons as ButtonData[]) ?? [];
  const dark = s.background === "dark" || s.background === "brand";
  return (
    <section id={s.anchorId} className={`py-16 md:py-24 ${s.background && s.background !== "white" ? bgClass(s.background) : "bg-[#007969] text-white"}`}>
      <div className={`${CONTAINER} text-center`}>
        {typeof s.heading === "string" && (
          <h2 className={`text-title mb-4 ${dark || !s.background || s.background === "white" ? "text-white" : ""}`}>{s.heading}</h2>
        )}
        {typeof s.text === "string" && s.text && <p className="text-white/85 max-w-2xl mx-auto mb-8">{s.text}</p>}
        {buttons.length > 0 && (
          <div className="flex flex-wrap gap-3 justify-center">
            {buttons.map((b, i) => <Btn key={b._key || i} b={b} />)}
          </div>
        )}
      </div>
    </section>
  );
}

/* ── dispatcher ──────────────────────────────────────────────────────── */

const REGISTRY: Record<string, (props: { s: PageSection }) => React.ReactElement | null> = {
  heroBlock: Hero,
  richTextBlock: RichText,
  imageBlock: ImageSection,
  galleryBlock: Gallery,
  videoBlock: VideoSection,
  statsBlock: Stats,
  featureGridBlock: FeatureGrid,
  testimonialsBlock: Testimonials,
  logosBlock: Logos,
  faqBlock: Faq,
  ctaBlock: Cta,
};

export default function PageBuilder({ sections }: { sections?: PageSection[] }) {
  if (!Array.isArray(sections)) return null;
  return (
    <>
      {sections.map((s) => {
        if (s?.hidden) return null;
        const Component = REGISTRY[s?._type];
        if (!Component) return null;
        return <Component key={s._key} s={s} />;
      })}
    </>
  );
}
