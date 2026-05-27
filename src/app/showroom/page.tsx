import type { Metadata } from "next";
import Link from "next/link";
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
      <section className="pt-40 pb-20 md:pt-52 md:pb-28">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <ScrollReveal>
            <p className="text-label text-[#c4a55f] mb-6">Experience in person</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-headline text-white mb-8 max-w-3xl">
              Visit our
              <br />
              <span className="text-white/40 italic font-light" style={{ fontFamily: "var(--font-dm-serif)" }}>
                Jebel Ali showroom.
              </span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-body-lg text-white/50 max-w-2xl">
              The only way to truly understand a window or door system is to operate it yourself.
              Our Jebel Ali showroom features full-scale working displays of our most popular
              systems, available to view by appointment seven days a week.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-6 md:px-10">
        <div className="rule-gold" />
      </div>

      <section className="py-20">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <ScrollReveal>
              <p className="text-label text-[#c4a55f] mb-6">What&apos;s on Display</p>
              <ul className="space-y-3">
                {displays.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/50 text-sm">
                    <div className="w-1 h-1 rounded-full bg-[#c4a55f] flex-shrink-0 mt-2" />
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
                  <p className="text-label text-[#c4a55f] mb-4">Location</p>
                  <p className="text-white/60">
                    Jebel Ali Industrial Area 1<br />
                    Dubai, UAE
                  </p>
                  <p className="text-white/30 text-sm mt-2">
                    Full address provided on appointment confirmation
                  </p>
                </div>
                <div>
                  <p className="text-label text-[#c4a55f] mb-4">Opening Hours</p>
                  <div className="space-y-2 text-white/50 text-sm">
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
                <div className="border-t border-white/10 pt-8">
                  <p className="text-label text-[#c4a55f] mb-6">Book a Visit</p>
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[0.6rem] tracking-widests uppercase text-white/40 block mb-2">Name</label>
                        <input
                          type="text"
                          className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#c4a55f]/50 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[0.6rem] tracking-widests uppercase text-white/40 block mb-2">Phone</label>
                        <input
                          type="tel"
                          className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#c4a55f]/50 transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[0.6rem] tracking-widests uppercase text-white/40 block mb-2">Email</label>
                      <input
                        type="email"
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#c4a55f]/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[0.6rem] tracking-widests uppercase text-white/40 block mb-2">Preferred Date & Time</label>
                      <input
                        type="text"
                        placeholder="e.g. Tuesday morning, any time"
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#c4a55f]/50 transition-colors placeholder:text-white/20"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[#c4a55f] text-black py-4 text-[0.75rem] tracking-widest uppercase font-medium hover:bg-[#d4b87a] transition-colors"
                    >
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
