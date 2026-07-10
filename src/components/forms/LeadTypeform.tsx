"use client";

// Multi-step "typeform" lead form — one question per screen — mirroring the
// Swiftrooms landing-page LeadForm. Reused on /enquire, /contact and /showroom.
// Posts to the existing /api/enquire endpoint (WhatsApp/CallMeBot notify + log).
import { useState, useRef, useMemo, KeyboardEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const WA_PHONE = "971505269149";

type Country = { code: string; country: string; flag: string; minLength: number; maxLength: number };

const COUNTRIES: Country[] = [
  { code: "+971", country: "UAE", flag: "🇦🇪", minLength: 9, maxLength: 9 },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦", minLength: 9, maxLength: 9 },
  { code: "+974", country: "Qatar", flag: "🇶🇦", minLength: 8, maxLength: 8 },
  { code: "+965", country: "Kuwait", flag: "🇰🇼", minLength: 8, maxLength: 8 },
  { code: "+973", country: "Bahrain", flag: "🇧🇭", minLength: 8, maxLength: 8 },
  { code: "+968", country: "Oman", flag: "🇴🇲", minLength: 8, maxLength: 8 },
  { code: "+91", country: "India", flag: "🇮🇳", minLength: 10, maxLength: 10 },
  { code: "+92", country: "Pakistan", flag: "🇵🇰", minLength: 10, maxLength: 10 },
  { code: "+20", country: "Egypt", flag: "🇪🇬", minLength: 10, maxLength: 10 },
  { code: "+44", country: "UK", flag: "🇬🇧", minLength: 10, maxLength: 10 },
  { code: "+1", country: "USA/Canada", flag: "🇺🇸", minLength: 10, maxLength: 10 },
];

type Option = { value: string; label: string; icon: string };

// Minimal inline icons (single-path SVGs) keyed per option.
const ICONS: Record<string, string> = {
  villa: "M3 12l9-9 9 9M5 10v10h14V10",
  apartment: "M4 21V5a1 1 0 011-1h6a1 1 0 011 1v16M12 21V9a1 1 0 011-1h5a1 1 0 011 1v12M7 8h1m-1 4h1m-1 4h1m8-4h1m-1 4h1",
  commercial: "M3 21h18M5 21V7l7-4 7 4v14M9 9h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1",
  "aluminum-sliding-doors": "M3 4h18v16H3zM12 4v16M3 12h9",
  "aluminum-windows": "M4 4h16v16H4zM12 4v16M4 12h16",
  "bifold-doors": "M3 4h18v16H3zM8 4v16M13 4v16M18 4v16",
  "upvc-windows-doors": "M5 3h14v18H5zM12 3v18M5 12h7",
  skylights: "M4 14l8-9 8 9M4 14v6h16v-6M4 14h16",
  "new-build": "M3 21h18M6 21V11l6-5 6 5v10M10 21v-5h4v5",
  renovation: "M14 6l4 4-8 8-4 1 1-4 8-8zM13 7l4 4",
};

const PROPERTY_TYPES: Option[] = [
  { value: "villa", label: "Villa or Townhouse", icon: "villa" },
  { value: "apartment", label: "Apartment", icon: "apartment" },
  { value: "commercial", label: "Commercial Property", icon: "commercial" },
];

const PRODUCTS: Option[] = [
  { value: "aluminum-sliding-doors", label: "Aluminum Sliding Doors", icon: "aluminum-sliding-doors" },
  { value: "aluminum-windows", label: "Aluminum Windows", icon: "aluminum-windows" },
  { value: "bifold-doors", label: "Bi-Fold Doors", icon: "bifold-doors" },
  { value: "upvc-windows-doors", label: "UPVC Windows and Doors", icon: "upvc-windows-doors" },
  { value: "skylights", label: "Skylights and Garden Rooms", icon: "skylights" },
];

const PROJECT_TYPES: Option[] = [
  { value: "new-build", label: "New Build", icon: "new-build" },
  { value: "renovation", label: "Renovation Project", icon: "renovation" },
];

const TIMELINES = [
  { value: "asap", label: "As soon as possible" },
  { value: "1-3-months", label: "Within 1–3 months" },
  { value: "3-6-months", label: "Within 3–6 months" },
  { value: "exploring", label: "Just exploring options" },
];

const TEMP_EMAIL_DOMAINS = [
  "mailinator.com", "tempmail.com", "10minutemail.com", "guerrillamail.com",
  "yopmail.com", "trashmail.com", "throwawaymail.com", "getnada.com", "sharklasers.com",
];

const MAX_FILES = 5;
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPT = ".pdf,.jpg,.jpeg,.png";
const ALLOWED_EXT = ["pdf", "jpg", "jpeg", "png"];

const STEP_KEYS = [
  "name", "phone", "email", "property", "products", "project", "timeline", "location", "details",
] as const;
type StepKey = (typeof STEP_KEYS)[number];

type Data = {
  name: string;
  countryCode: string;
  phone: string;
  email: string;
  propertyType: string;
  productsNeeded: string[];
  projectType: string;
  timeline: string;
  siteLocation: string;
  message: string;
  privacyConsent: boolean;
  marketingConsent: boolean;
};

const EMPTY: Data = {
  name: "", countryCode: "+971", phone: "", email: "", propertyType: "",
  productsNeeded: [], projectType: "", timeline: "", siteLocation: "", message: "",
  privacyConsent: false, marketingConsent: false,
};

function validateEmail(email: string): string {
  if (!email.trim()) return "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email address";
  const domain = email.split("@")[1]?.toLowerCase();
  if (domain && TEMP_EMAIL_DOMAINS.includes(domain)) return "Temporary email addresses are not allowed";
  return "";
}

function validatePhone(phone: string, country: Country): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "Phone number is required";
  if (digits.length < country.minLength || digits.length > country.maxLength)
    return `Enter a valid ${country.country} number`;
  return "";
}

export default function LeadTypeform({
  source = "enquire",
  heading = "Let's get you a free quote",
  intro = "Answer a few quick questions and we'll come back to you within 12 hours.",
}: {
  source?: string;
  heading?: string;
  intro?: string;
}) {
  const [data, setData] = useState<Data>(EMPTY);
  const [files, setFiles] = useState<File[]>([]);
  const [fileNote, setFileNote] = useState("");
  const [step, setStep] = useState(0);
  const [review, setReview] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const country = useMemo(() => COUNTRIES.find((c) => c.code === data.countryCode) ?? COUNTRIES[0], [data.countryCode]);
  const total = STEP_KEYS.length;
  const key = STEP_KEYS[step];
  const set = <K extends keyof Data>(k: K, v: Data[K]) => setData((d) => ({ ...d, [k]: v }));

  const canAdvance = (k: StepKey): boolean => {
    switch (k) {
      case "name": return data.name.trim().length > 0;
      case "phone": return validatePhone(data.phone, country) === "";
      case "email": return validateEmail(data.email) === "";
      case "property": return !!data.propertyType;
      case "products": return data.productsNeeded.length > 0;
      case "project": return !!data.projectType;
      case "timeline": return !!data.timeline;
      default: return true; // location + details are optional
    }
  };

  // Move forward without re-validating — used by single-select steps where the
  // click itself is the valid answer (avoids reading stale `data` in a timeout).
  const advance = () => {
    if (step < total - 1) setStep((s) => s + 1);
    else setReview(true);
  };
  const next = () => {
    if (key === "email") { const e = validateEmail(data.email); setEmailError(e); if (e) return; }
    if (key === "phone") { const e = validatePhone(data.phone, country); setPhoneError(e); if (e) return; }
    if (!canAdvance(key)) return;
    advance();
  };
  const back = () => {
    if (review) { setReview(false); return; }
    if (step > 0) setStep((s) => s - 1);
  };
  const onEnter = (e: KeyboardEvent) => { if (e.key === "Enter") { e.preventDefault(); next(); } };

  const toggleProduct = (v: string) =>
    set("productsNeeded", data.productsNeeded.includes(v)
      ? data.productsNeeded.filter((x) => x !== v)
      : [...data.productsNeeded, v]);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const skipped: string[] = [];
    const accepted = Array.from(list).filter((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
      if (!ALLOWED_EXT.includes(ext)) { skipped.push(`${f.name} (unsupported type)`); return false; }
      if (f.size > MAX_SIZE) { skipped.push(`${f.name} (over 10 MB)`); return false; }
      return true;
    });
    const combined = [...files, ...accepted].slice(0, MAX_FILES);
    if (files.length + accepted.length > MAX_FILES) skipped.push(`only the first ${MAX_FILES} files were kept`);
    setFiles(combined);
    setFileNote(skipped.length ? `Some files were skipped: ${skipped.join(", ")}.` : "");
  };

  const label = (opts: Option[] | typeof TIMELINES, v: string) => opts.find((o) => o.value === v)?.label ?? v;

  async function submit() {
    setSubmitting(true);
    setError(false);
    const productLabels = data.productsNeeded.map((v) => label(PRODUCTS, v));
    const payload = {
      source,
      name: data.name,
      phone: `${data.countryCode} ${data.phone}`,
      email: data.email || "Not provided",
      propertyType: label(PROPERTY_TYPES, data.propertyType),
      projectType: label(PROJECT_TYPES, data.projectType),
      stage: label(TIMELINES, data.timeline),
      area: data.siteLocation,
      message: productLabels.length ? `Interested in: ${productLabels.join(", ")}` : "",
      notes: data.message,
      files: files.map((f) => f.name).join(", "),
      productsNeeded: productLabels,
      privacyConsent: data.privacyConsent,
      marketingConsent: data.marketingConsent,
    };
    try {
      const res = await fetch("/api/enquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setData(EMPTY); setFiles([]); setFileNote(""); setStep(0);
    setReview(false); setSubmitted(false); setError(false); setEmailError(""); setPhoneError("");
  }

  function sendToPhone() {
    const text = encodeURIComponent("Hi Swiftrooms — please send me your showroom details and location.");
    window.open(`https://wa.me/${WA_PHONE}?text=${text}`, "_blank", "noopener");
  }

  // ── Thank-you ────────────────────────────────────────────────────────────
  if (submitted) {
    const firstName = data.name.trim().split(" ")[0];
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-8 md:p-12 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-[#f0fdf4] flex items-center justify-center mb-6">
          <svg className="w-7 h-7 text-[#007969]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-semibold text-[#1c1c1e] mb-3">Thank You{firstName ? `, ${firstName}` : ""}!</h3>
        <p className="text-[#6b7280] mb-2 max-w-md mx-auto">
          Your quote request has been received and our team will contact you shortly.
        </p>
        <p className="text-[#6b7280] mb-8 max-w-md mx-auto">We&apos;ll arrange your free site visit by call or WhatsApp.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={sendToPhone}
            className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-3.5 text-sm rounded-xl font-semibold hover:brightness-95 transition-all"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24z" /></svg>
            Send to My Phone
          </button>
          <Link href="/" className="btn-outline justify-center">Return to Home</Link>
          <button onClick={reset} className="text-[0.7rem] tracking-widest uppercase text-gray-400 hover:text-[#007969] transition-colors px-4 py-3">
            Submit another request
          </button>
        </div>
      </div>
    );
  }

  const progress = review ? 1 : (step + 1) / total;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 lg:p-10">
      {/* Header */}
      <p className="text-label text-[#007969] mb-2">Free Consultation</p>
      <h2 className="text-2xl md:text-3xl font-semibold text-[#1c1c1e] mb-2">{heading}</h2>
      <p className="text-[#6b7280] text-sm mb-5 max-w-md">{intro}</p>
      <div className="flex flex-wrap gap-2 mb-6 text-[0.6rem] tracking-widest uppercase">
        {["No Obligation", "Free Site Visit", "Reply within 12 hours"].map((b) => (
          <span key={b} className="border border-gray-200 text-gray-500 px-2.5 py-1 rounded-full">{b}</span>
        ))}
      </div>

      {/* Progress */}
      <div className="h-1 w-full bg-gray-100 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-[#007969] rounded-full transition-all duration-300" style={{ width: `${progress * 100}%` }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={review ? "review" : key}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.22 }}
        >
          {!review && (
            <p className="text-[0.7rem] tracking-widest uppercase text-gray-400 mb-3">Question {step + 1} of {total}</p>
          )}

          {/* ── Steps ────────────────────────────────────────────────── */}
          {!review && key === "name" && (
            <Field title="What's your name?" hint="So we know who we're speaking with.">
              <input
                type="text" autoFocus value={data.name} onKeyDown={onEnter}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Your full name"
                className={inputCls}
              />
            </Field>
          )}

          {!review && key === "phone" && (
            <Field title="Phone number" hint="Your best contact number.">
              <div className="flex gap-2">
                <select
                  value={data.countryCode} onChange={(e) => set("countryCode", e.target.value)}
                  className="px-3 py-3.5 border border-gray-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-[#007969]/30 bg-white"
                  aria-label="Country code"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                  ))}
                </select>
                <input
                  type="tel" inputMode="tel" autoFocus value={data.phone} onKeyDown={onEnter}
                  onChange={(e) => { set("phone", e.target.value.replace(/[^\d\s\-()]/g, "")); if (phoneError) setPhoneError(""); }}
                  onBlur={() => data.phone && setPhoneError(validatePhone(data.phone, country))}
                  placeholder="50 123 4567"
                  className={`flex-1 min-w-0 ${inputCls}`}
                />
              </div>
              {phoneError && <p className="text-red-500 text-sm mt-2">{phoneError}</p>}
            </Field>
          )}

          {!review && key === "email" && (
            <Field title="Email" hint="Optional — your email address.">
              <input
                type="email" autoFocus value={data.email} onKeyDown={onEnter}
                onChange={(e) => { set("email", e.target.value); if (emailError) setEmailError(""); }}
                onBlur={() => setEmailError(validateEmail(data.email))}
                placeholder="you@example.com"
                className={inputCls}
              />
              {emailError && <p className="text-red-500 text-sm mt-2">{emailError}</p>}
            </Field>
          )}

          {!review && key === "property" && (
            <Field title="What type of property?">
              <OptionGrid options={PROPERTY_TYPES} selected={[data.propertyType]}
                onSelect={(v) => { set("propertyType", v); setTimeout(advance, 120); }} />
            </Field>
          )}

          {!review && key === "products" && (
            <Field title="What are you interested in?" hint="Select all that apply.">
              <OptionGrid options={PRODUCTS} selected={data.productsNeeded} onSelect={toggleProduct} multi />
            </Field>
          )}

          {!review && key === "project" && (
            <Field title="New build or renovation?">
              <OptionGrid options={PROJECT_TYPES} selected={[data.projectType]}
                onSelect={(v) => { set("projectType", v); setTimeout(advance, 120); }} />
            </Field>
          )}

          {!review && key === "timeline" && (
            <Field title="When would you like it done?" hint="Ideal timeline.">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TIMELINES.map((t) => {
                  const on = data.timeline === t.value;
                  return (
                    <button key={t.value} onClick={() => { set("timeline", t.value); setTimeout(advance, 120); }}
                      className={`text-left px-5 py-4 rounded-xl border transition-all ${on ? "border-[#007969] bg-[#f0fdf4] text-[#007969]" : "border-gray-200 hover:border-[#007969] hover:bg-[#f0fdf4]"}`}>
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </Field>
          )}

          {!review && key === "location" && (
            <Field title="Where's the project located?" hint="Optional.">
              <input
                type="text" autoFocus value={data.siteLocation} onKeyDown={onEnter}
                onChange={(e) => set("siteLocation", e.target.value)}
                placeholder="e.g. Dubai Hills, Dubai"
                className={inputCls}
              />
            </Field>
          )}

          {!review && key === "details" && (
            <Field title="Anything else we should know?" hint="Optional.">
              <textarea
                value={data.message} rows={4}
                onChange={(e) => set("message", e.target.value)}
                placeholder="Sizes, quantities, questions…"
                className={`${inputCls} resize-none`}
              />
              {/* File upload */}
              <div className="mt-4">
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-full border border-dashed border-gray-300 rounded-xl px-4 py-4 text-sm text-[#6b7280] hover:border-[#007969] hover:text-[#007969] transition-all flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15V3m0 0L8 7m4-4l4 4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" /></svg>
                  Attach plans or photos (PDF, JPG, PNG)
                </button>
                <input ref={fileRef} type="file" multiple accept={ACCEPT} className="hidden"
                  onChange={(e) => addFiles(e.target.files)} />
                {fileNote && <p className="text-amber-600 text-xs mt-2">{fileNote}</p>}
                {files.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {files.map((f, i) => (
                      <li key={i} className="flex items-center justify-between text-sm text-[#3a3a3c] bg-[#f8f9fa] rounded-lg px-3 py-2">
                        <span className="truncate">{f.name}</span>
                        <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))}
                          className="text-gray-400 hover:text-red-500 ml-3" aria-label="Remove file">✕</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Field>
          )}

          {/* ── Review ───────────────────────────────────────────────── */}
          {review && (
            <div>
              <p className="text-[0.7rem] tracking-widest uppercase text-gray-400 mb-3">Review</p>
              <h3 className="text-xl font-semibold text-[#1c1c1e] mb-2">Tell us about your project</h3>
              <p className="text-[#6b7280] text-sm mb-6">Please take a moment to review your details before submitting.</p>
              <dl className="divide-y divide-gray-100 border-y border-gray-100 mb-6">
                <Row label="Name" value={data.name} />
                <Row label="Phone" value={`${data.countryCode} ${data.phone}`} />
                <Row label="Email" value={data.email || "Not provided"} />
                <Row label="Property" value={label(PROPERTY_TYPES, data.propertyType)} />
                <Row label="Interested in" value={data.productsNeeded.map((v) => label(PRODUCTS, v)).join(", ") || "—"} />
                <Row label="Project" value={label(PROJECT_TYPES, data.projectType)} />
                <Row label="Timeline" value={label(TIMELINES, data.timeline)} />
                <Row label="Location" value={data.siteLocation || "Not specified"} />
                {data.message && <Row label="Notes" value={data.message} />}
                {files.length > 0 && <Row label="Files" value={`${files.length} file${files.length !== 1 ? "s" : ""}`} />}
              </dl>
              <label className="flex items-start gap-3 text-sm text-[#3a3a3c] mb-3 cursor-pointer">
                <input type="checkbox" checked={data.privacyConsent} onChange={(e) => set("privacyConsent", e.target.checked)}
                  className="mt-1 accent-[#007969]" />
                <span>I agree to be contacted about my enquiry.</span>
              </label>
              <label className="flex items-start gap-3 text-sm text-[#3a3a3c] mb-6 cursor-pointer">
                <input type="checkbox" checked={data.marketingConsent} onChange={(e) => set("marketingConsent", e.target.checked)}
                  className="mt-1 accent-[#007969]" />
                <span>Send Swiftrooms details &amp; location to my phone.</span>
              </label>
              {error && (
                <p className="text-red-500 text-sm mb-4">Something went wrong sending your request. Please try again, or reach us on WhatsApp.</p>
              )}
              <button onClick={submit} disabled={submitting || !data.privacyConsent}
                className="btn-brand w-full justify-center disabled:opacity-50">
                {submitting ? "Sending…" : "Submit Enquiry"}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Nav */}
      <div className="flex gap-3 mt-8">
        {(step > 0 || review) && (
          <button onClick={back} className="text-[0.7rem] tracking-widest uppercase text-gray-400 hover:text-[#007969] transition-colors px-2 py-3">
            ← Back
          </button>
        )}
        {!review && key !== "property" && key !== "project" && key !== "timeline" && (
          <button onClick={next} disabled={!canAdvance(key)}
            className="btn-brand ml-auto justify-center disabled:opacity-50">
            {step === total - 1 ? "Review" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}

const inputCls =
  "w-full px-4 py-3.5 text-base text-[#1c1c1e] border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007969]/30 outline-none transition-all placeholder:text-[#9ca3af]";

function Field({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-lg md:text-xl font-semibold text-[#1c1c1e] mb-1">{title}</p>
      {hint && <p className="text-[#6b7280] text-sm mb-5">{hint}</p>}
      {!hint && <div className="mb-5" />}
      {children}
    </div>
  );
}

function OptionGrid({ options, selected, onSelect, multi }: {
  options: Option[]; selected: string[]; onSelect: (v: string) => void; multi?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map((o) => {
        const on = selected.includes(o.value);
        return (
          <button key={o.value} onClick={() => onSelect(o.value)}
            className={`flex items-center gap-3 text-left px-4 py-4 rounded-xl border transition-all ${on ? "border-[#007969] bg-[#f0fdf4] text-[#007969]" : "border-gray-200 text-[#3a3a3c] hover:border-[#007969] hover:bg-[#f0fdf4]"}`}>
            <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={ICONS[o.icon]} />
            </svg>
            <span className="text-sm font-medium">{o.label}</span>
            {multi && (
              <span className={`ml-auto w-4 h-4 rounded border flex items-center justify-center ${on ? "bg-[#007969] border-[#007969]" : "border-gray-300"}`}>
                {on && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-3">
      <dt className="text-[0.65rem] tracking-widest uppercase text-gray-400 flex-shrink-0">{label}</dt>
      <dd className="text-sm text-[#1c1c1e] text-right">{value}</dd>
    </div>
  );
}
