import type { Metadata } from "next";
import ScrollReveal from "@/components/ui/ScrollReveal";

export const metadata: Metadata = {
  title: "Showroom",
  description:
    "Visit the Swiftrooms showroom in Jebel Ali, Dubai to experience our full product range at full scale.",
};

const displays = [
  "Cortizo Cor Vision 4700 Lift & Slide — full width display",
  "Cortizo Cor Vision Plus — flush threshold display",
  "Cortizo Cor 70 Hidden Sash windows — multiple configurations",
  "Cortizo Bi-fold Door — 4-leaf demonstration",
  "Gulf Extrusion TB600 — tilt-and-turn window and door",
  "Cortizo TP52 Curtain Wall — structural panel section",
  "uPVC Casement and Sliding — side-by-side comparison",
  "Full finish library — powder coat, anodised and RAL samples",
  "Hardware library — all standard and optional hardware ranges",
];

export default function ShowroomPage() {
  return (
    <>
      <section className="pt-32 pb-12 md:pt-44 md:pb-20 lg:pt-52 lg:pb-28">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
          <ScrollReveal>
            <p className="text-label text-[#007969] mb-6">Experience in person</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-headline text-[#1c1c1e] mb-8 max-w-3xl">
              Visit our Jebel Ali showroom.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-body-lg text-[#6b7280] max-w-2xl">
              The only way to truly understand a window or door system is to operate it yourself.
              Our Jebel Ali showroom features full-scale working displays of our most popular
              systems, available to view by appointment seven days a week.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10">
        <div className="divider-brand" />
      </div>

      <section className="py-20">
        <div className="max-w-screen-xl mx-auto px-5 md:px-8 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <div>
            <ScrollReveal>
              <p className="text-label text-[#007969] mb-6">What&apos;s on Display</p>
              <ul className="space-y-3">
                {displays.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-[#6b7280] text-sm">
                    <div className="w-1 h-1 rounded-full bg-[#007969] flex-shrink-0 mt-2" />
                    {item}
                  </li>
                ))}
              </ul>
            </ScrollReveal>
          </div>

          <div>
            <ScrollReveal delay={0.15}>
              <div className="space-y-8">
                <div>
                  <p className="text-label text-[#007969] mb-4">Location</p>
                  <p className="text-[#3a3a3c]">
                    Jebel Ali Industrial Area 1<br />
                    Dubai, UAE
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Full address provided on appointment confirmation
                  </p>
                </div>
                <div>
                  <p className="text-label text-[#007969] mb-4">Opening Hours</p>
                  <div className="space-y-2 text-[#6b7280] text-sm">
                    <div className="flex justify-between max-w-xs">
                      <span>Sunday – Thursday</span>
                      <span>9:00 – 18:00</span>
                    </div>
                    <div className="flex justify-between max-w-xs">
                      <span>Saturday</span>
                      <span>10:00 – 15:00</span>
                    </div>
                  </div>
                </div>

                {/* Booking form */}
                <div className="border-t border-gray-100 pt-8">
                  <p className="text-label text-[#007969] mb-6">Book a Visit</p>
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[0.6rem] tracking-widests uppercase text-[#6b7280] block mb-2">Name</label>
                        <input
                          type="text"
                          className="w-full bg-white border border-gray-200 text-[#1c1c1e] px-4 py-3 text-sm focus:outline-none focus:border-[#007969] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[0.6rem] tracking-widests uppercase text-[#6b7280] block mb-2">Phone</label>
                        <input
                          type="tel"
                          className="w-full bg-white border border-gray-200 text-[#1c1c1e] px-4 py-3 text-sm focus:outline-none focus:border-[#007969] transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[0.6rem] tracking-widests uppercase text-[#6b7280] block mb-2">Email</label>
                      <input
                        type="email"
                        className="w-full bg-white border border-gray-200 text-[#1c1c1e] px-4 py-3 text-sm focus:outline-none focus:border-[#007969] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[0.6rem] tracking-widests uppercase text-[#6b7280] block mb-2">Preferred Date & Time</label>
                      <input
                        type="text"
                        placeholder="e.g. Tuesday morning, any time"
                        className="w-full bg-white border border-gray-200 text-[#1c1c1e] px-4 py-3 text-sm focus:outline-none focus:border-[#007969] transition-colors placeholder:text-gray-300"
                      />
                    </div>
                    <button type="submit" className="btn-brand w-full justify-center">
                      Request Appointment
                    </button>
                  </form>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}
