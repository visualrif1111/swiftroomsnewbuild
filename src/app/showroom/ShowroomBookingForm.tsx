"use client";

import { useState, FormEvent } from "react";

export default function ShowroomBookingForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    preferredTime: "",
    project: "",
  });

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(false);
    try {
      const res = await fetch("/api/showroom-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="border border-[#007969]/30 bg-[#f0fdf4] p-8 text-center">
        <div className="w-12 h-12 bg-[#007969] flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-label text-[#007969] mb-2">Appointment Requested</p>
        <p className="text-[#3a3a3c] font-semibold mb-3">We&apos;ll confirm within 24 hours.</p>
        <p className="text-[#6b7280] text-sm">
          Our team will contact you on the details provided to confirm a convenient time.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[0.6rem] tracking-widest uppercase text-[#6b7280] block mb-2">Name *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={set("name")}
            className="w-full bg-white border border-gray-200 text-[#1c1c1e] px-4 py-3 text-sm focus:outline-none focus:border-[#007969] transition-colors"
          />
        </div>
        <div>
          <label className="text-[0.6rem] tracking-widest uppercase text-[#6b7280] block mb-2">Phone *</label>
          <input
            type="tel"
            required
            value={form.phone}
            onChange={set("phone")}
            className="w-full bg-white border border-gray-200 text-[#1c1c1e] px-4 py-3 text-sm focus:outline-none focus:border-[#007969] transition-colors"
          />
        </div>
      </div>
      <div>
        <label className="text-[0.6rem] tracking-widest uppercase text-[#6b7280] block mb-2">Email *</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={set("email")}
          className="w-full bg-white border border-gray-200 text-[#1c1c1e] px-4 py-3 text-sm focus:outline-none focus:border-[#007969] transition-colors"
        />
      </div>
      <div>
        <label className="text-[0.6rem] tracking-widest uppercase text-[#6b7280] block mb-2">Preferred Date & Time</label>
        <input
          type="text"
          placeholder="e.g. Tuesday morning, any week"
          value={form.preferredTime}
          onChange={set("preferredTime")}
          className="w-full bg-white border border-gray-200 text-[#1c1c1e] px-4 py-3 text-sm focus:outline-none focus:border-[#007969] transition-colors placeholder:text-gray-300"
        />
      </div>
      <div>
        <label className="text-[0.6rem] tracking-widest uppercase text-[#6b7280] block mb-2">Your Project</label>
        <textarea
          rows={3}
          placeholder="Brief description of your project — helps us prepare the right team member."
          value={form.project}
          onChange={set("project")}
          className="w-full bg-white border border-gray-200 text-[#1c1c1e] px-4 py-3 text-sm focus:outline-none focus:border-[#007969] transition-colors resize-none placeholder:text-gray-300"
        />
      </div>
      {error && (
        <p className="text-red-600 text-sm">Something went wrong — please try again or call us directly.</p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="btn-brand w-full justify-center disabled:opacity-60"
      >
        {submitting ? "Requesting…" : "Request Appointment"}
      </button>
      <p className="text-gray-400 text-xs text-center">We confirm within 24 hours. No obligation.</p>
    </form>
  );
}
