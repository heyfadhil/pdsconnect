"use client";

import { useState } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

type FormData = {
  full_name: string;
  company_name: string;
  email: string;
  phone: string;
  role_interest: string;
  message: string;
};

const initialData: FormData = {
  full_name: "",
  company_name: "",
  email: "",
  phone: "",
  role_interest: "",
  message: "",
};

type Status = "idle" | "loading" | "success" | "error";

export default function InterestForm() {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const ref = useScrollReveal();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      setStatus("success");
      setFormData(initialData);
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to submit. Please try again."
      );
    }
  };

  const inputClass =
    "w-full h-12 px-4 rounded-lg border-[1.5px] border-light-border bg-white text-ink-gray placeholder:text-mid-gray text-body-md transition-all duration-[150ms] focus:outline-none focus:border-vivid-cyan focus:shadow-[0_0_0_3px_rgba(6,182,212,0.18)]";

  const labelClass = "block text-[14px] font-semibold text-carbon-black mb-1.5";

  return (
    <section id="contact" className="bg-off-white py-24 md:py-32" ref={ref}>
      <div className="max-w-content mx-auto px-5 md:px-10">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="reveal label uppercase tracking-[0.08em] font-semibold mb-4" style={{ color: "#06B6D4" }}>
              Join PDS Connect
            </p>
            <h2 className="reveal font-display text-heading-1 font-bold text-carbon-black mb-5">
              Want to Be Part of the Next Event?
            </h2>
            <p className="reveal text-body-lg text-ink-gray">
              Submit your interest below and our team will be in touch to
              discuss onboarding and the right events for your business.
            </p>
          </div>

          {/* Success state */}
          {status === "success" ? (
            <div className="reveal visible text-center py-16 px-8 rounded-2xl bg-white border border-light-border shadow-sm">
              <div className="w-16 h-16 rounded-full bg-pale-blue-tint flex items-center justify-center mx-auto mb-6">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2E7FD9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="font-display text-heading-2 font-bold text-carbon-black mb-3">
                Thank You!
              </h3>
              <p className="text-body-lg text-ink-gray">
                Our team will be in touch shortly.
              </p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-8 px-6 py-2.5 rounded-lg border-[1.5px] border-light-border text-ink-gray text-sm font-semibold hover:border-calm-blue hover:text-calm-blue transition-all duration-fast"
              >
                Submit Another Enquiry
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="reveal bg-white rounded-2xl border border-light-border shadow-sm p-8 md:p-10"
            >
              <div className="grid md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label htmlFor="full_name" className={labelClass}>
                    Full Name <span className="text-calm-blue">*</span>
                  </label>
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    required
                    placeholder="Jane Smith"
                    value={formData.full_name}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                {/* Company Name */}
                <div>
                  <label htmlFor="company_name" className={labelClass}>
                    Company Name <span className="text-calm-blue">*</span>
                  </label>
                  <input
                    id="company_name"
                    name="company_name"
                    type="text"
                    required
                    placeholder="Acme Corporation"
                    value={formData.company_name}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className={labelClass}>
                    Email Address <span className="text-calm-blue">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="jane@acme.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className={labelClass}>
                    Phone Number{" "}
                    <span className="text-mid-gray font-normal">(optional)</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+60 12 345 6789"
                    value={formData.phone}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                {/* Role Interest */}
                <div className="md:col-span-2">
                  <label htmlFor="role_interest" className={labelClass}>
                    I am interested as a{" "}
                    <span className="text-calm-blue">*</span>
                  </label>
                  <select
                    id="role_interest"
                    name="role_interest"
                    required
                    value={formData.role_interest}
                    onChange={handleChange}
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option value="" disabled>
                      Select your role...
                    </option>
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                    <option value="unsure">Not sure yet</option>
                  </select>
                </div>

                {/* Message */}
                <div className="md:col-span-2">
                  <label htmlFor="message" className={labelClass}>
                    Message / How did you hear about us?{" "}
                    <span className="text-mid-gray font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    placeholder="Tell us a bit about your business and what you're looking for..."
                    value={formData.message}
                    onChange={handleChange}
                    className={`${inputClass} h-auto py-3 resize-none`}
                  />
                </div>
              </div>

              {/* Error message */}
              {status === "error" && (
                <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  {errorMsg}
                </p>
              )}

              {/* Submit */}
              <div className="mt-8 flex items-center gap-4">
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-lg text-white font-semibold text-[15px] transition-all duration-[150ms] hover:-translate-y-[3px] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                  style={{
                    background: "linear-gradient(135deg, #2E7FD9 0%, #06B6D4 50%, #14B8A6 100%)",
                    boxShadow: "0 4px 20px rgba(6,182,212,0.30)",
                    transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)",
                  }}
                >
                  {status === "loading" ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Enquiry
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </>
                  )}
                </button>
                <p className="text-body-sm text-mid-gray">
                  No spam — we&apos;ll only contact you about PDS Connect.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
