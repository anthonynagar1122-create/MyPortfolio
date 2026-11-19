import { Navigation, Hero, CTASection, EnquiryForm } from "@/components/core";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Careers",
  description: "Join our team and help us build the future.",
};

export default function CareersPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navigation />

      <Hero
        headline="Join Our Team"
        subheadline="Careers"
        description="We're looking for talented, passionate people who want to solve real problems and build great products."
        primaryCTA={{ label: "View Openings", href: "#openings" }}
        variant="dark"
      />

      <section className="py-24 md:py-32 lg:py-48 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-700 text-neutral-900 mb-6">
              Why Work With Us?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Impact", description: "Your work directly influences millions of users globally." },
              { title: "Growth", description: "Continuous learning and professional development opportunities." },
              { title: "Culture", description: "Collaborative, inclusive, and innovative team environment." },
              { title: "Benefits", description: "Competitive compensation and comprehensive benefits package." },
              { title: "Flexibility", description: "Work-life balance with flexible working arrangements." },
              { title: "Mission", description: "Join a team passionate about solving real problems." },
            ].map((perk, idx) => (
              <div key={idx} className="text-center">
                <div className="text-5xl mb-4">
                  {["💡", "📈", "👥", "🎁", "⏰", "🎯"][idx]}
                </div>
                <h3 className="text-xl font-display font-700 text-neutral-900 mb-2">
                  {perk.title}
                </h3>
                <p className="text-neutral-600">{perk.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="openings" className="py-24 md:py-32 lg:py-48 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-700 text-neutral-900">
              Current Openings
            </h2>
          </div>

          <div className="space-y-6">
            {[
              { title: "Senior Full-Stack Engineer", team: "Product", location: "Remote" },
              { title: "Product Designer", team: "Design", location: "Remote" },
              { title: "Product Manager", team: "Product", location: "Remote" },
              { title: "Sales Representative", team: "Sales", location: "Remote" },
              { title: "Customer Success Manager", team: "Support", location: "Remote" },
            ].map((job, idx) => (
              <div key={idx} className="p-6 bg-white rounded-lg border border-neutral-200 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-display font-700 text-neutral-900">
                      {job.title}
                    </h3>
                    <div className="flex gap-4 mt-2">
                      <span className="text-sm text-neutral-600">{job.team}</span>
                      <span className="text-sm text-neutral-600">{job.location}</span>
                    </div>
                  </div>
                  <a href="/contact" className="px-4 py-2 bg-primary-500 text-white rounded-lg font-600 hover:bg-primary-600 transition-colors">
                    Apply
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-8 bg-primary-50 rounded-lg border border-primary-200 text-center">
            <p className="text-neutral-900 mb-4">
              Don't see a role that fits? We're always interested in talented people.
            </p>
            <a href="/contact" className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg font-600 hover:bg-primary-600 transition-colors">
              Send Your Profile
            </a>
          </div>
        </div>
      </section>

      <CTASection
        headline="Ready to Make an Impact?"
        description="Apply now or tell us what you're passionate about."
        primaryButtonText="Get in Touch"
        primaryButtonHref="/contact"
        variant="dark"
      />

      <EnquiryForm
        title="Apply or Inquire"
        productOptions={[
          { label: "Select interest", value: "" },
          { label: "Job Inquiry", value: "job" },
          { label: "General Interest", value: "general" },
          { label: "Freelance Work", value: "freelance" },
        ]}
      />

      <Footer />
    </div>
  );
}
