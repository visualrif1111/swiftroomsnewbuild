"use client";

import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

const TOTAL_STEPS = 7;

const VISIT_TYPES = [
  "View product samples",
  "Discuss a project",
  "Compare glazing systems",
  "Meet the Swiftrooms team",
  "Explore design options",
  "Not sure yet",
];

const PRODUCT_INTERESTS = [
  "Sliding Doors",
  "Bi-Folding Doors",
  "Windows",
  "Front Entrance Doors",
  "Garden Rooms",
  "Skylights / Rooflights",
  "Curtain Wall Systems",
  "General Consultation",
];

const PREFERRED_TIMES = [
  "Morning (8:30–12:00)",
  "Afternoon (12:00–17:30)",
  "Saturday Morning (10:00–14:00)",
];

const VISITOR_ROLES = [
  "Homeowner",
  "Architect",
  "Contractor",
  "Interior Designer",
  "Developer",
  "Other",
];

const CONTACT_METHODS = ["Phone", "WhatsApp", "Email"];

const STEP_TITLES = [
  "What would you like to do?",
  "Which products interest you?",
  "When would you like to visit?",
  "Tell us about your group.",
  "Tell us about your project.",
  "How should we reach you?",
  "Confirm your booking request.",
];

const STEP_LABELS = [
  "Visit Purpose",
  "Product Interest",
  "Preferred Date",
  "Visitor Details",
  "Project Context",
  "Contact Details",
  "Confirm & Book",
];

function CloseIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function CheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function OptionCard({
  label,
  selected,
  onClick,
  multi,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 border transition-all duration-150 flex items-center justify-between gap-3 ${
        selected
          ? "bg-[#1c1c1e] border-[#1c1c1e] text-white"
          : "bg-white border-gray-200 text-[#3a3a3c] hover:border-[#1c1c1e]"
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
      <span
        className={`flex-shrink-0 w-5 h-5 border flex items-center justify-center transition-all ${
          selected ? "border-white" : multi ? "border-gray-300 rounded-sm" : "border-gray-300 rounded-full"
        }`}
      >
        {selected && <CheckIcon className="w-3 h-3" />}
      </span>
    </button>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[0.6rem] tracking-widest uppercase text-[#6b7280] block mb-2">
      {children}
    </label>
  );
}

function TextInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <FieldLabel>
        {label}
        {required && " *"}
      </FieldLabel>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-gray-200 text-[#1c1c1e] px-4 py-3 text-sm focus:outline-none focus:border-[#1c1c1e] transition-colors placeholder:text-gray-300"
      />
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-4 py-3 border-b border-gray-100 last:border-0">
      <span className="text-[0.6rem] tracking-widest uppercase text-[#6b7280] w-28 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-[#1c1c1e]">{value}</span>
    </div>
  );
}

interface FormData {
  visitType: string;
  productInterest: string[];
  preferredDate: string;
  preferredTime: string;
  altDateTime: string;
  numVisitors: string;
  visitorRole: string;
  projectLocation: string;
  projectDescription: string;
  timeline: string;
  name: string;
  email: string;
  phone: string;
  contactMethod: string;
}

const INITIAL: FormData = {
  visitType: "",
  productInterest: [],
  preferredDate: "",
  preferredTime: "",
  altDateTime: "",
  numVisitors: "1",
  visitorRole: "",
  projectLocation: "",
  projectDescription: "",
  timeline: "",
  name: "",
  email: "",
  phone: "",
  contactMethod: "Phone",
};

export default function ShowroomVisitForm({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<FormData>(INITIAL);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const set = (field: keyof FormData) => (value: string) =>
    setData((prev) => ({ ...prev, [field]: value }));

  const toggleProduct = (product: string) =>
    setData((prev) => ({
      ...prev,
      productInterest: prev.productInterest.includes(product)
        ? prev.productInterest.filter((p) => p !== product)
        : [...prev.productInterest, product],
    }));

  function validate(): string | null {
    switch (step) {
      case 0: return data.visitType ? null : "Please select the purpose of your visit.";
      case 1: return data.productInterest.length > 0 ? null : "Please select at least one product.";
      case 2: return data.preferredDate ? null : "Please enter a preferred date.";
      case 3: return data.visitorRole ? null : "Please tell us your role.";
      case 4: return null;
      case 5: {
        if (!data.name) return "Please enter your full name.";
        if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return "Please enter a valid email.";
        if (!data.phone) return "Please enter your phone number.";
        return null;
      }
      default: return null;
    }
  }

  function goNext() {
    const err = validate();
    if (err) { setValidationError(err); return; }
    setValidationError(null);
    setDirection(1);
    setStep((s) => s + 1);
    contentRef.current?.scrollTo({ top: 0 });
  }

  function goBack() {
    setValidationError(null);
    setDirection(-1);
    setStep((s) => s - 1);
    contentRef.current?.scrollTo({ top: 0 });
  }

  async function submit() {
    setSubmitting(true);
    setError(false);
    try {
      const res = await fetch("/api/showroom-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          email: data.email,
          visitType: data.visitType,
          productInterest: data.productInterest.join(", "),
          preferredTime: `${data.preferredDate}${data.preferredTime ? `, ${data.preferredTime}` : ""}`,
          altDateTime: data.altDateTime,
          numVisitors: data.numVisitors,
          visitorRole: data.visitorRole,
          projectLocation: data.projectLocation,
          project: data.projectDescription,
          timeline: data.timeline,
          contactMethod: data.contactMethod,
        }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }

  const stepVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir * 24 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir * -24 }),
  };

  if (submitted) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <span className="text-label text-[#007969]">Showroom Visit</span>
          <button onClick={onClose} className="text-[#6b7280] hover:text-[#1c1c1e] transition-colors p-1" aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        <div className="flex-1 flex flex-col items-start justify-center px-8 py-12">
          <div className="w-12 h-12 bg-[#1c1c1e] flex items-center justify-center mb-6">
            <CheckIcon className="w-6 h-6 text-white" />
          </div>
          <p className="text-label text-[#007969] mb-3">Booking Requested</p>
          <h2 className="font-heading text-2xl font-bold text-[#1c1c1e] mb-4 leading-snug">
            We&apos;ll confirm within<br />24 hours.
          </h2>
          <p className="text-[#6b7280] text-sm leading-relaxed mb-8 max-w-sm">
            Our showroom team will contact you via {data.contactMethod} to confirm your appointment at our Jebel Ali showroom.
          </p>
          <div className="bg-[#f8f9fa] p-5 mb-8 w-full max-w-sm text-sm text-[#3a3a3c] leading-relaxed">
            <p className="font-semibold text-[#1c1c1e] mb-1">4900 Showroom, Jebel Ali</p>
            <p className="text-[#6b7280] text-xs">Industrial Area 1, Dubai</p>
            <p className="text-[#6b7280] text-xs mt-1">Sun–Thu 8:30–17:30 · Sat 10:00–14:00</p>
          </div>
          <button onClick={onClose} className="btn-brand">
            Close
          </button>
        </div>
      </div>
    );
  }

  const progress = (step / (TOTAL_STEPS - 1)) * 100;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <span className="text-label text-[#007969]">Book Showroom Visit</span>
            <p className="text-[0.65rem] text-[#6b7280] mt-0.5">
              Step {step + 1} of {TOTAL_STEPS} — {STEP_LABELS[step]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#6b7280] hover:text-[#1c1c1e] transition-colors p-1"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="h-[2px] bg-gray-100">
          <motion.div
            className="h-full bg-[#1c1c1e]"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="font-heading text-lg md:text-xl font-bold text-[#1c1c1e] leading-snug">
            {STEP_TITLES[step]}
          </h2>
        </div>
      </div>

      {/* Content */}
      <div ref={contentRef} className="flex-1 overflow-y-auto overscroll-contain">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="px-6 py-6"
          >
            {/* Step 0: Visit Type */}
            {step === 0 && (
              <div className="space-y-2">
                {VISIT_TYPES.map((opt) => (
                  <OptionCard
                    key={opt}
                    label={opt}
                    selected={data.visitType === opt}
                    onClick={() => set("visitType")(opt)}
                  />
                ))}
              </div>
            )}

            {/* Step 1: Product Interest (multi-select) */}
            {step === 1 && (
              <div className="space-y-2">
                <p className="text-xs text-[#6b7280] mb-4">Select all that apply.</p>
                {PRODUCT_INTERESTS.map((opt) => (
                  <OptionCard
                    key={opt}
                    label={opt}
                    selected={data.productInterest.includes(opt)}
                    onClick={() => toggleProduct(opt)}
                    multi
                  />
                ))}
              </div>
            )}

            {/* Step 2: Preferred Visit Date */}
            {step === 2 && (
              <div className="space-y-5">
                <TextInput
                  label="Preferred Date"
                  type="date"
                  value={data.preferredDate}
                  onChange={set("preferredDate")}
                  required
                />
                <div>
                  <FieldLabel>Preferred Time</FieldLabel>
                  <div className="space-y-2">
                    {PREFERRED_TIMES.map((t) => (
                      <OptionCard
                        key={t}
                        label={t}
                        selected={data.preferredTime === t}
                        onClick={() => set("preferredTime")(t)}
                      />
                    ))}
                  </div>
                </div>
                <TextInput
                  label="Alternative date / time (optional)"
                  placeholder="e.g. Any Thursday afternoon"
                  value={data.altDateTime}
                  onChange={set("altDateTime")}
                />
              </div>
            )}

            {/* Step 3: Visitor Details */}
            {step === 3 && (
              <div className="space-y-5">
                <TextInput
                  label="Number of visitors"
                  type="number"
                  placeholder="1"
                  value={data.numVisitors}
                  onChange={set("numVisitors")}
                />
                <div>
                  <FieldLabel>You are visiting as a *</FieldLabel>
                  <div className="space-y-2">
                    {VISITOR_ROLES.map((r) => (
                      <OptionCard
                        key={r}
                        label={r}
                        selected={data.visitorRole === r}
                        onClick={() => set("visitorRole")(r)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Project Context */}
            {step === 4 && (
              <div className="space-y-4">
                <TextInput
                  label="Project location (optional)"
                  placeholder="e.g. Arabian Ranches, Dubai"
                  value={data.projectLocation}
                  onChange={set("projectLocation")}
                />
                <div>
                  <FieldLabel>Project description (optional)</FieldLabel>
                  <textarea
                    rows={4}
                    placeholder="Brief overview of your project — helps us prepare the right team member and samples."
                    value={data.projectDescription}
                    onChange={(e) => set("projectDescription")(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-[#1c1c1e] px-4 py-3 text-sm focus:outline-none focus:border-[#1c1c1e] transition-colors resize-none placeholder:text-gray-300"
                  />
                </div>
                <TextInput
                  label="Timeline / urgency (optional)"
                  placeholder="e.g. Need to decide within 2 months"
                  value={data.timeline}
                  onChange={set("timeline")}
                />
              </div>
            )}

            {/* Step 5: Contact Details */}
            {step === 5 && (
              <div className="space-y-4">
                <TextInput label="Full Name" value={data.name} onChange={set("name")} required />
                <TextInput label="Email" type="email" value={data.email} onChange={set("email")} required />
                <TextInput label="Phone" type="tel" placeholder="+971 ..." value={data.phone} onChange={set("phone")} required />
                <div>
                  <FieldLabel>Preferred contact method</FieldLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {CONTACT_METHODS.map((m) => (
                      <OptionCard
                        key={m}
                        label={m}
                        selected={data.contactMethod === m}
                        onClick={() => set("contactMethod")(m)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Confirmation */}
            {step === 6 && (
              <div>
                <p className="text-sm text-[#6b7280] mb-6 leading-relaxed">
                  Please review your booking details. We&apos;ll confirm your appointment within 24 hours.
                </p>
                <div className="border border-gray-100">
                  <SummaryRow label="Purpose" value={data.visitType} />
                  <SummaryRow label="Products" value={data.productInterest.join(", ")} />
                  <SummaryRow label="Preferred date" value={data.preferredDate} />
                  {data.preferredTime && <SummaryRow label="Time" value={data.preferredTime} />}
                  {data.altDateTime && <SummaryRow label="Alternative" value={data.altDateTime} />}
                  <SummaryRow label="Visitors" value={data.numVisitors} />
                  <SummaryRow label="Role" value={data.visitorRole} />
                  {data.projectLocation && <SummaryRow label="Project" value={data.projectLocation} />}
                  <SummaryRow label="Name" value={data.name} />
                  <SummaryRow label="Phone" value={data.phone} />
                  <SummaryRow label="Email" value={data.email} />
                  <SummaryRow label="Contact via" value={data.contactMethod} />
                </div>
                <div className="mt-5 bg-[#f8f9fa] p-4 text-xs text-[#6b7280] leading-relaxed">
                  <span className="font-semibold text-[#3a3a3c]">4900 Showroom</span> · Jebel Ali Industrial Area 1, Dubai<br />
                  Sun–Thu 8:30–17:30 · Sat 10:00–14:00
                </div>
                {error && (
                  <p className="text-red-600 text-sm mt-4">
                    Something went wrong — please try again or call us on +971 505 269 149.
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer navigation */}
      <div
        className="flex-shrink-0 border-t border-gray-100 px-6 py-4 flex items-center gap-3 bg-white"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        {validationError && (
          <p className="flex-1 text-xs text-red-500">{validationError}</p>
        )}
        {!validationError && <div className="flex-1" />}
        {step > 0 && (
          <button type="button" onClick={goBack} className="btn-outline py-3 px-5 text-xs">
            Back
          </button>
        )}
        {step < TOTAL_STEPS - 1 ? (
          <button type="button" onClick={goNext} className="btn-brand py-3 px-6 text-xs">
            Next
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="btn-brand py-3 px-6 text-xs disabled:opacity-60"
          >
            {submitting ? "Booking…" : "Book Showroom Visit"}
          </button>
        )}
      </div>
    </div>
  );
}
