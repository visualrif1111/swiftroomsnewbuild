import Image from "next/image";
import SchucoLogo from "@/components/logos/SchucoLogo";
import DeceuninckLogo from "@/components/logos/DeceuninckLogo";
import CortizoLogo from "@/components/logos/CortizoLogo";

// "Brands We Work With" — partner manufacturers shown on the Swiftrooms
// landing page. SVG logos are tinted to the design-system teal (#007969)
// via currentColor; GEX & Vetromax have no SVG source, so their original
// logos are used. Logos keep their aspect ratio (object-contain / viewBox).
type Brand =
  | { name: string; type: "svg"; Logo: (p: { className?: string }) => React.ReactElement }
  | { name: string; type: "img"; src: string };

const brands: Brand[] = [
  { name: "Cortizo", type: "svg", Logo: CortizoLogo },
  { name: "Schüco", type: "svg", Logo: SchucoLogo },
  { name: "Deceuninck", type: "svg", Logo: DeceuninckLogo },
  { name: "Gulf Extrusions (GEX)", type: "img", src: "/brand/logos/gulf-extrusions-teal.png" },
  { name: "Vetromax", type: "img", src: "/brand/logos/vetromax-teal.png" },
];

export default function PartnerBrands({ heading = "Brands We Work With" }: { heading?: string }) {
  return (
    <section aria-label="Partner brands" className="w-full">
      <p className="text-label text-[#007969] mb-3 text-center">Manufacturer Partners</p>
      <h2 className="text-title text-[#1c1c1e] mb-10 md:mb-12 text-center max-w-2xl mx-auto">
        {heading}
      </h2>
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-gray-100 border border-gray-100">
        {brands.map((brand) => (
          <li
            key={brand.name}
            className="bg-white flex items-center justify-center p-6 md:p-8 h-28 md:h-32"
          >
            {brand.type === "svg" ? (
              <brand.Logo
                className="w-full max-w-[150px] h-10 md:h-11 text-[#007969] opacity-80 hover:opacity-100 transition-opacity duration-300"
              />
            ) : (
              <div className="relative w-full max-w-[150px] h-12 opacity-70 hover:opacity-100 transition-opacity duration-300">
                <Image
                  src={brand.src}
                  alt={`${brand.name} logo`}
                  fill
                  className="object-contain"
                  sizes="150px"
                />
              </div>
            )}
            <span className="sr-only">{brand.name}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
