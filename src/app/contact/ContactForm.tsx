"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

export default function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(false);

    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
      firstName: data.get("firstName"),
      lastName: data.get("lastName"),
      email: data.get("email"),
      phone: data.get("phone"),
      message: data.get("message"),
    };

    try {
      const res = await fetch("/api/contact", {
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

  if (submitted) {
    return (
      <div className="py-10 flex flex-col items-start gap-5">
        <div className="w-12 h-12 bg-[#f0fdf4] flex items-center justify-center">
          <svg className="w-6 h-6 text-[#007969]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-label text-[#007969] mb-2">Message sent</p>
          <h3 className="text-title text-[#1c1c1e] mb-3">Thank you — we&apos;ll be in touch.</h3>
          <p className="text-[#6b7280] leading-relaxed max-w-sm">
            We typically respond within one business day. In the meantime, you&apos;re welcome
            to browse our portfolio or product catalogue.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap mt-1">
          <Link href="/portfolio" className="btn-brand">View Portfolio</Link>
          <Link href="/catalogue" className="btn-outline">Browse Catalogue</Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-label text-[#6b7280] block mb-2">First Name</label>
          <input
            name="firstName"
            type="text"
            required
            className="w-full bg-white border border-gray-200 text-[#1c1c1e] px-4 py-3 text-sm focus:outline-none focus:border-[#007969] transition-colors"
            placeholder="First name"
          />
        </div>
        <div>
          <label className="text-label text-[#6b7280] block mb-2">Last Name</label>
          <input
            name="lastName"
            type="text"
            required
            className="w-full bg-white border border-gray-200 text-[#1c1c1e] px-4 py-3 text-sm focus:outline-none focus:border-[#007969] transition-colors"
            placeholder="Last name"
          />
        </div>
      </div>
      <div>
        <label className="text-label text-[#6b7280] block mb-2">Email</label>
        <input
          name="email"
          type="email"
          required
          className="w-full bg-white border border-gray-200 text-[#1c1c1e] px-4 py-3 text-sm focus:outline-none focus:border-[#007969] transition-colors"
          placeholder="your@email.com"
        />
      </div>
      <div>
        <label className="text-label text-[#6b7280] block mb-2">Phone</label>
        <input
          name="phone"
          type="tel"
          className="w-full bg-white border border-gray-200 text-[#1c1c1e] px-4 py-3 text-sm focus:outline-none focus:border-[#007969] transition-colors"
          placeholder="+971 50 000 0000"
        />
      </div>
      <div>
        <label className="text-label text-[#6b7280] block mb-2">Message</label>
        <textarea
          name="message"
          rows={5}
          required
          className="w-full bg-white border border-gray-200 text-[#1c1c1e] px-4 py-3 text-sm focus:outline-none focus:border-[#007969] transition-colors resize-none"
          placeholder="Tell us about your project..."
        />
      </div>

      {error && (
        <p className="text-red-600 text-sm">
          Something went wrong — please try again or call us directly.
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn-brand w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? "Sending…" : "Send Message"}
      </button>
      <p className="text-gray-400 text-xs text-center">
        We typically respond within 1 business day.
      </p>
    </form>
  );
}
