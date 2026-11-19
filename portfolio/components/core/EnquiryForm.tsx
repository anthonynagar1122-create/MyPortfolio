"use client";

import { useState } from "react";
import { getColorClasses } from "@/lib/colors";

interface EnquiryFormProps {
  title?: string;
  description?: string;
  buttonText?: string;
  successMessage?: string;
  productOptions?: { label: string; value: string }[];
}

export function EnquiryForm({
  title = "Get in Touch",
  description = "Tell us about your needs and we'll be in touch within 24 hours.",
  buttonText = "Send Enquiry",
  successMessage = "Thank you! We'll be in touch soon.",
  productOptions = [
    { label: "Select a product", value: "" },
    { label: "General Inquiry", value: "general" },
    { label: "Demo Request", value: "demo" },
  ],
}: EnquiryFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    product: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setError("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      // Send to backend API
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Failed to submit form");
        return;
      }

      const data = await response.json();
      setIsSubmitted(true);
      setFormData({ name: "", email: "", company: "", product: "", message: "" });
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error("Form submission error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-700 text-neutral-900 mb-4">
            {title}
          </h2>
          <p className="text-lg text-neutral-600">{description}</p>
        </div>

        {isSubmitted ? (
          <div className={`p-6 ${getColorClasses("emerald").bg} border rounded-lg text-center`}>
            <p className={`text-lg font-600 ${getColorClasses("emerald").dark}`}>{successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-600 text-neutral-900 mb-2">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="Your name"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-600 text-neutral-900 mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="your@email.com"
                required
              />
            </div>

            {/* Company */}
            <div>
              <label htmlFor="company" className="block text-sm font-600 text-neutral-900 mb-2">
                Company
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="Your company (optional)"
              />
            </div>

            {/* Product Interest */}
            <div>
              <label htmlFor="product" className="block text-sm font-600 text-neutral-900 mb-2">
                Interest
              </label>
              <select
                id="product"
                name="product"
                value={formData.product}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              >
                {productOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-600 text-neutral-900 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
                placeholder="Tell us about your needs..."
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-900">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-4 bg-primary-500 text-white rounded-lg font-600 hover:bg-primary-600 disabled:bg-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {isLoading ? "Sending..." : buttonText}
            </button>

            {/* Privacy Note */}
            <p className="text-xs text-neutral-500 text-center">
              We respect your privacy. Your information will never be shared.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
