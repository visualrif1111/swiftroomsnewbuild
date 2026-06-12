"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { productCategories } from "@/lib/data";

export default function EnquireForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(false);

    const form = e.currentTarget;
    const data = new FormData(form);

    const products: string[] = [];
    productCategories.forEach((cat) => {
      if (data.get(`product_${cat.id}`)) products.push(cat.name);
    });

    const payload = {
      firstName: data.get("firstName"),
      lastName: data.get("lastName"),
      email: data.get("email"),
      phone: data.get("phone"),
      projectType: data.get("projectType"),
      location: data.get("location"),
      products,
      budget: data.get("budget"),
      notes: data.get("notes"),
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

  if (submitted) {
    return (
      <div className="lg:col-span-2 py-16 flex flex-col items-start gap-6">
        <div className="w-14 h-14 bg-[#f0fdf4] flex items-center justify-center">
          <svg className="w-7 h-7 text-[#007969]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-label text-[#007969] mb-2">Enquiry received</p>
          <h2 className="text-title text-[#1c1c1e] mb-4">Thank you — we&apos;ll be in touch.</h2>
          <p className="text-[#6b7280] leading-relaxed max-w-md">
            Your enquiry has been submitted. A member of our team will contact you within
            one business day to discuss your project and arrange a free site survey.
          </p>
        </div>
        <div className="flex gap-4 flex-wrap mt-2">
          <Link href="/technical/process" className="btn-brand">See Our Process</Link>
          <Link href="/portfolio" className="btn-outline">Browse Portfolio</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <p className="text-label text-[#007969] mb-6">Contact Details</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[0.65rem] tracking-widests uppercase text-[#6b7280] block mb-2">First Name *</label>
              <input
                name="firstName"
                type="text"
                required
                className="w-full bg-white border border-gray-200 text-[#1c1c1e] px-4 py-3 text-sm focus:outline-none focus:border-[#007969] transition-colors"
              />
            </div>
            <div>
              <label className="text-[0.65rem] tracking-widests uppercase text-[#6b7280] block mb-2">Last Name *</label>
              <input
                name="lastName"
                type="text"
                required
                className="w-full bg-white border border-gray-200 text-[#1c1c1e] px-4 py-3 text-sm focus:outline-none focus:border-[#007969] transition-colors"
              />
            </div>
            <div>
              <label className="text-[0.65rem] tracking-widests uppercase text-[#6b7280] block mb-2">Email *</label>
              <input
                name="email"
                type="email"
                required
                className="w-full bg-white border border-gray-200 text-[#1c1c1e] px-4 py-3 text-sm focus:outline-none focus:border-[#007969] transition-colors"
              />
            </div>
            <div>
              <label className="text-[0.65rem] tracking-widests uppercase text-[#6b7280] block mb-2">Phone *</label>
              <input
                name="phone"
                type="tel"
                required
                className="w-full bg-white border border-gray-200 text-[#1c1c1e] px-4 py-3 text-sm focus:outline-none focus:border-[#007969] transition-colors"
              />
            </div>
          </div>
        </div>

        <div>
          <p className="text-label text-[#007969] mb-6">Project Details</p>
          <div className="space-y-4">
            <div>
              <label className="text-[0.65rem] tracking-widests uppercase text-[#6b7280] block mb-2">Project Type</label>
              <select
                name="projectType"
                className="w-full bg-white border border-gray-200 text-[#3a3a3c] px-4 py-3 text-sm focus:outline-none focus:border-[#007969] transition-colors"
              >
                <option value="">Select project type</option>
                <option>New Build — Villa</option>
                <option>New Build — Apartment</option>
                <option>Renovation / Replacement</option>
                <option>Commercial Development</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="text-[0.65rem] tracking-widests uppercase text-[#6b7280] block mb-2">Location</label>
              <input
                name="location"
                type="text"
                placeholder="e.g. Emirates Hills, Dubai"
                className="w-full bg-white border border-gray-200 text-[#1c1c1e] px-4 py-3 text-sm focus:outline-none focus:border-[#007969] transition-colors placeholder:text-gray-300"
              />
            </div>
            <div>
              <label className="text-[0.65rem] tracking-widests uppercase text-[#6b7280] block mb-3">Products of Interest</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {productCategories.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      name={`product_${cat.id}`}
                      value={cat.name}
                      className="accent-[#007969]"
                    />
                    <span className="text-[#6b7280] text-xs group-hover:text-[#007969] transition-colors">
                      {cat.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[0.65rem] tracking-widests uppercase text-[#6b7280] block mb-2">Budget Range</label>
              <select
                name="budget"
                className="w-full bg-white border border-gray-200 text-[#3a3a3c] px-4 py-3 text-sm focus:outline-none focus:border-[#007969] transition-colors"
              >
                <option value="">Prefer not to say</option>
                <option>Under AED 50,000</option>
                <option>AED 50,000 – 150,000</option>
                <option>AED 150,000 – 500,000</option>
                <option>Over AED 500,000</option>
              </select>
            </div>
            <div>
              <label className="text-[0.65rem] tracking-widests uppercase text-[#6b7280] block mb-2">Additional Notes</label>
              <textarea
                name="notes"
                rows={4}
                placeholder="Any additional details about your project, timeline or specific requirements..."
                className="w-full bg-white border border-gray-200 text-[#1c1c1e] px-4 py-3 text-sm focus:outline-none focus:border-[#007969] transition-colors resize-none placeholder:text-gray-300"
              />
            </div>
          </div>
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
          {submitting ? "Submitting…" : "Submit Enquiry"}
        </button>
        <p className="text-gray-400 text-xs text-center">
          We respond within 1 business day. No spam, no pushy sales.
        </p>
      </form>
    </div>
  );
}
