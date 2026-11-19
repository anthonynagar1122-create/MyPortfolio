import { Navigation, Hero, EnquiryForm, CTASection } from "@/components/core";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with us. We'd love to hear from you.",
};

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navigation />

      <Hero
        headline="Get in Touch"
        subheadline="Contact"
        description="Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible."
        primaryCTA={{ label: "Send Message", href: "#form" }}
        variant="dark"
      />

      <section className="py-24 md:py-32 lg:py-48 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12 mb-20">
            {[
              { title: "Email", value: "hello@example.com", icon: "📧" },
              { title: "Phone", value: "+1 (555) 123-4567", icon: "📞" },
              { title: "Office", value: "San Francisco, CA", icon: "📍" },
            ].map((contact, idx) => (
              <div key={idx} className="text-center">
                <div className="text-5xl mb-4">{contact.icon}</div>
                <h3 className="text-xl font-display font-700 text-neutral-900 mb-2">
                  {contact.title}
                </h3>
                <p className="text-neutral-600">{contact.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="form">
        <EnquiryForm
          title="Send Us a Message"
          description="Tell us how we can help. We'll get back to you within 24 hours."
          productOptions={[
            { label: "Select inquiry type", value: "" },
            { label: "General Inquiry", value: "general" },
            { label: "Demo Request", value: "demo" },
            { label: "Partnership", value: "partnership" },
            { label: "Support", value: "support" },
          ]}
        />
      </section>

      <CTASection
        headline="We're Here to Help"
        description="Have more questions? Check out our FAQ or contact our support team."
        primaryButtonText="View FAQ"
        primaryButtonHref="/faq"
        secondaryButtonText="Support Portal"
        secondaryButtonHref="https://support.example.com"
        variant="dark"
      />

      <Footer />
    </div>
  );
}
