"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title?: string;
  description?: string;
  items: FAQItem[];
}

export function FAQSection({
  title = "Frequently Asked Questions",
  description = "Find answers to common questions about our products and services.",
  items,
}: FAQSectionProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <section className="py-24 md:py-32 bg-neutral-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-700 text-neutral-900 mb-4">
            {title}
          </h2>
          <p className="text-lg text-neutral-600">{description}</p>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="border border-neutral-200 rounded-lg overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() =>
                  setExpandedIndex(expandedIndex === index ? null : index)
                }
                className="w-full px-6 py-4 md:px-8 md:py-6 flex items-center justify-between hover:bg-neutral-100 transition-colors"
                aria-expanded={expandedIndex === index}
                aria-controls={`faq-${index}`}
              >
                <span className="text-lg font-600 text-neutral-900 text-left">
                  {item.question}
                </span>
                <svg
                  className={`w-5 h-5 text-neutral-600 transition-transform duration-200 flex-shrink-0 ml-4 ${
                    expandedIndex === index ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </button>

              {expandedIndex === index && (
                <div
                  id={`faq-${index}`}
                  className="px-6 py-4 md:px-8 md:py-6 border-t border-neutral-200 bg-white"
                >
                  <p className="text-neutral-600 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-600">No questions available yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
