"use client";

import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

const TOTAL_STEPS = 8;

const PROJECT_TYPES = [
  "Aluminium Sliding Doors",
  "Aluminium Bi-Folding Doors",
  "Aluminium Windows",
  "Aluminium Doors",
  "UPVC Windows & Doors",
  "Curtain Wall / Facade System",
  "Garden Room",
  "Skylights / Rooflights",
  "Insect Screens",
  "Not Sure Yet",
];

const PROPERTY_TYPES = [
  "Villa",
  "Apartment",
  "Commercial",
  "New Build",
  "Renovation",
  "Other",
];

const PROJECT_STAGES = [
  "Just researching",
  "Ready for consultation",
  "Have measurements",
  "Already have drawings",
  "Need urgent installation",
];

const BUDGET_SCOPES = [
  "Small upgrade",
  "Multiple openings",
  "Full property package",
  "Luxury renovation",
  "Commercial project",
  "Not sure",
];

const CONTACT_METHODS = ["Phone", "WhatsApp", "Email"];

const EMIRATES = ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Umm Al Quwain", "Fujairah"];

const STEP_TITLES = [
  "What are you interested in?",
  "What type of property is this for?",
  "Where is your project?",
  "What stage is your project at?",
  "What best describes your project?",
  "Do you have any drawings or images?",
  "How should we reach you?",
  "Review your request.",
];

const STEP_LABELS = [
  "Project Type",
  "Property Type",
  "Location",
  "Project Stage",
  "Budget & Scope",
  "Files & Notes",
  "Contact Details",
  "Confirm & Submit",
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
      className={`w-full text-left px-4 py-3.5 border transition-all duration-150 flex items-center justify-between gap-3 group ${
        selected
          ? "bg-[#1c1c1e] border-[#1c1c1e] text-white"
          : "bg-white border-gray-200 text-[#3a3a3c] hover:border-[#1c1c1e]"
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
      <span
        className={`flex-shrink-0 w-5 h-5 border flex items-center justify-center transition-all ${
          selected
            ? "border-white bg-transparent"
            : multi
            ? "border-gray-300 rounded-sm"
            : "border-gray-300 rounded-full"
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
  projectType: string;
  propertyType: string;
  area: string;
  emirate: string;
  address: string;
  projectStage: string;
  budgetScope: string;
  hasFiles: string;
  notes: string;
  name: string;
  email: string;
  phone: string;
  contactMethod: string;
  message: string;
}

const INITIAL: FormData = {
  projectType: "",
  propertyType: "",
  area: "",
  emirate: "",
  address: "",
  projectStage: "",
  budgetScope: "",
  hasFiles: "",
  notes: "",
  name: "",
  email: "",
  phone: "",
  contactMethod: "Phone",
  message: "",
};

export default function FreeQuoteForm({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<FormData>(INITIAL);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  const set = (field: keyof FormData) => (value: string) =>
    setData((prev) => ({ ...prev, [field]: value }));

  function validate(): string | null {
    switch (step) {
      case 0: return data.projectType ? null : "Please select what you're interested in.";
      case 1: return data.propertyType ? null : "Please select a property type.";
      case 2: return data.area && data.emirate ? null : "Please enter your area and emirate.";
      case 3: return data.projectStage ? null : "Please select your project stage.";
      case 4: return data.budgetScope ? null : "Please select a budget scope.";
      case 5: return null;
      case 6: {
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
      const locationParts = [data.area, data.emirate, data.address].filter(Boolean);
      const res = await fetch("/api/enquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "free-quote-form",
          projectType: data.projectType,
          propertyType: data.propertyType,
          location: locationParts.join(", "),
          projectStage: data.projectStage,
          budgetScope: data.budgetScope,
          hasFiles: fileNames.length > 0 ? `Yes — ${fileNames.join(", ")}` : data.hasFiles,
          notes: data.notes,
          name: data.name,
          email: data.email,
          phone: data.phone,
          contactMethod: data.contactMethod,
          message: data.message,
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
          <span className="text-label text-[#007969]">Free Quote Request</span>
          <button onClick={onClose} className="text-[#6b7280] hover:text-[#1c1c1e] transition-colors p-1" aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        <div className="flex-1 flex flex-col items-start justify-center px-8 py-12">
          <div className="w-12 h-12 bg-[#1c1c1e] flex items-center justify-center mb-6">
            <CheckIcon className="w-6 h-6 text-white" />
          </div>
          <p className="text-label text-[#007969] mb-3">Request Submitted</p>
          <h2 className="font-heading text-2xl font-bold text-[#1c1c1e] mb-4 leading-snug">
            Thank you, {data.name.split(" ")[0]}.<br />We&apos;ll be in touch.
          </h2>
          <p className="text-[#6b7280] text-sm leading-relaxed mb-8 max-w-sm">
            Your quote request has been received. A member of our team will contact you via{" "}
            {data.contactMethod} within one business day to discuss your project.
          </p>
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
            <span className="text-label text-[#007969]">Get a Free Quote</span>
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
        {/* Progress bar */}
        <div className="h-[2px] bg-gray-100">
          <motion.div
            className="h-full bg-[#1c1c1e]"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
        {/* Step title */}
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
            {/* Step 0: Project Type */}
            {step === 0 && (
              <div className="space-y-2">
                {PROJECT_TYPES.map((opt) => (
                  <OptionCard
                    key={opt}
                    label={opt}
                    selected={data.projectType === opt}
                    onClick={() => set("projectType")(opt)}
                  />
                ))}
              </div>
            )}

            {/* Step 1: Property Type */}
            {step === 1 && (
              <div className="space-y-2">
                {PROPERTY_TYPES.map((opt) => (
                  <OptionCard
                    key={opt}
                    label={opt}
                    selected={data.propertyType === opt}
                    onClick={() => set("propertyType")(opt)}
                  />
                ))}
              </div>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <div className="space-y-4">
                <TextInput
                  label="Area / Community"
                  placeholder="e.g. Emirates Hills, Jumeirah, Downtown"
                  value={data.area}
                  onChange={set("area")}
                  required
                />
                <div>
                  <FieldLabel>Emirate *</FieldLabel>
                  <div className="space-y-2">
                    {EMIRATES.map((e) => (
                      <OptionCard
                        key={e}
                        label={e}
                        selected={data.emirate === e}
                        onClick={() => set("emirate")(e)}
                      />
                    ))}
                  </div>
                </div>
                <TextInput
                  label="Full Address (optional)"
                  placeholder="Street or building name if known"
                  value={data.address}
                  onChange={set("address")}
                />
              </div>
            )}

            {/* Step 3: Project Stage */}
            {step === 3 && (
              <div className="space-y-2">
                {PROJECT_STAGES.map((opt) => (
                  <OptionCard
                    key={opt}
                    label={opt}
                    selected={data.projectStage === opt}
                    onClick={() => set("projectStage")(opt)}
                  />
                ))}
              </div>
            )}

            {/* Step 4: Budget / Scope */}
            {step === 4 && (
              <div className="space-y-2">
                {BUDGET_SCOPES.map((opt) => (
                  <OptionCard
                    key={opt}
                    label={opt}
                    selected={data.budgetScope === opt}
                    onClick={() => set("budgetScope")(opt)}
                  />
                ))}
              </div>
            )}

            {/* Step 5: Files & Notes */}
            {step === 5 && (
              <div className="space-y-5">
                <div>
                  <FieldLabel>Drawings, plans or images (optional)</FieldLabel>
                  <div
                    className="border border-dashed border-gray-300 p-6 text-center cursor-pointer hover:border-[#1c1c1e] transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <p className="text-sm text-[#6b7280] mb-1">Click to attach files</p>
                    <p className="text-xs text-gray-400">PDF, DWG, JPG, PNG accepted</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.dwg,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => {
                        const names = Array.from(e.target.files ?? []).map((f) => f.name);
                        setFileNames(names);
                      }}
                    />
                  </div>
                  {fileNames.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {fileNames.map((n) => (
                        <li key={n} className="flex items-center gap-2 text-xs text-[#3a3a3c]">
                          <CheckIcon className="w-3 h-3 text-[#007969] flex-shrink-0" />
                          {n}
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Files are noted and our team will request them during consultation.
                  </p>
                </div>
                <div>
                  <FieldLabel>Additional notes (optional)</FieldLabel>
                  <textarea
                    rows={4}
                    placeholder="Any other details about your project — timeline, specific requirements, design preferences..."
                    value={data.notes}
                    onChange={(e) => set("notes")(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-[#1c1c1e] px-4 py-3 text-sm focus:outline-none focus:border-[#1c1c1e] transition-colors resize-none placeholder:text-gray-300"
                  />
                </div>
              </div>
            )}

            {/* Step 6: Contact Details */}
            {step === 6 && (
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
                <div>
                  <FieldLabel>Message (optional)</FieldLabel>
                  <textarea
                    rows={3}
                    placeholder="Anything else you'd like us to know..."
                    value={data.message}
                    onChange={(e) => set("message")(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-[#1c1c1e] px-4 py-3 text-sm focus:outline-none focus:border-[#1c1c1e] transition-colors resize-none placeholder:text-gray-300"
                  />
                </div>
              </div>
            )}

            {/* Step 7: Confirmation */}
            {step === 7 && (
              <div>
                <p className="text-sm text-[#6b7280] mb-6 leading-relaxed">
                  Please review your details. We&apos;ll use this to prepare a relevant quotation and contact you to arrange a free site visit.
                </p>
                <div className="border border-gray-100">
                  <SummaryRow label="Interest" value={data.projectType} />
                  <SummaryRow label="Property" value={data.propertyType} />
                  <SummaryRow label="Location" value={[data.area, data.emirate].filter(Boolean).join(", ")} />
                  <SummaryRow label="Stage" value={data.projectStage} />
                  <SummaryRow label="Scope" value={data.budgetScope} />
                  {fileNames.length > 0 && <SummaryRow label="Files" value={`${fileNames.length} file(s) noted`} />}
                  {data.notes && <SummaryRow label="Notes" value={data.notes} />}
                  <SummaryRow label="Name" value={data.name} />
                  <SummaryRow label="Email" value={data.email} />
                  <SummaryRow label="Phone" value={data.phone} />
                  <SummaryRow label="Contact via" value={data.contactMethod} />
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
        {!validationError && (
          <div className="flex-1" />
        )}
        {step > 0 && (
          <button
            type="button"
            onClick={goBack}
            className="btn-outline py-3 px-5 text-xs"
          >
            Back
          </button>
        )}
        {step < TOTAL_STEPS - 1 ? (
          <button
            type="button"
            onClick={goNext}
            className="btn-brand py-3 px-6 text-xs"
          >
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
            {submitting ? "Submitting…" : "Submit Quote Request"}
          </button>
        )}
      </div>
    </div>
  );
}
