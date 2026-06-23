import {
  PortableText,
  type PortableTextComponents,
  type PortableTextBlock,
} from "@portabletext/react";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";

// Renders Sanity Portable Text in the Swiftrooms blog design language —
// matches the data.ts section rendering for headings/paragraphs, and adds
// rich support: h3/h4, lists, blockquotes, links and inline images.
const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-[#6b7280] leading-relaxed mb-4 last:mb-0">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl md:text-2xl font-semibold text-[#1c1c1e] mb-5 mt-10 first:mt-0">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg md:text-xl font-semibold text-[#1c1c1e] mb-4 mt-8">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-base font-semibold text-[#1c1c1e] mb-3 mt-6">{children}</h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-[#007969] pl-5 my-6 italic text-[#3a3a3c]">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc pl-5 mb-5 space-y-2 text-[#6b7280] leading-relaxed marker:text-[#007969]">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal pl-5 mb-5 space-y-2 text-[#6b7280] leading-relaxed marker:text-[#007969]">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="pl-1">{children}</li>,
    number: ({ children }) => <li className="pl-1">{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-[#3a3a3c]">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ children, value }) => {
      const href = (value?.href as string) ?? "#";
      const external = /^https?:\/\//.test(href) && !href.includes("swiftrooms");
      return external ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#007969] underline underline-offset-2 hover:text-[#005c50] transition-colors"
        >
          {children}
        </a>
      ) : (
        <Link
          href={href}
          className="text-[#007969] underline underline-offset-2 hover:text-[#005c50] transition-colors"
        >
          {children}
        </Link>
      );
    },
  },
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null;
      const alt = (value.alt as string) ?? "";
      return (
        <figure className="my-8">
          <div className="relative w-full aspect-[16/9] overflow-hidden bg-[#f0fdf4]">
            <Image
              src={urlFor(value).width(1400).fit("max").url()}
              alt={alt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 66vw"
            />
          </div>
          {alt && <figcaption className="text-xs text-gray-400 mt-2">{alt}</figcaption>}
        </figure>
      );
    },
  },
};

export default function PortableTextBody({ value }: { value: PortableTextBlock[] }) {
  return <PortableText value={value} components={components} />;
}
