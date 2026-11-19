import { Navigation, Hero, CTASection } from "@/components/core";
import { Footer } from "@/components/layout/Footer";
import { siteContent } from "@/config/site-content";

export const metadata = {
  title: "Our Team",
  description: "Meet the talented people building the future.",
};

const { team: teamMembers } = siteContent;

export default function TeamPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navigation />

      <Hero
        headline="Meet Our Team"
        subheadline="People"
        description="A diverse group of talented people dedicated to solving real problems."
        primaryCTA={{ label: "Join Us", href: "/careers" }}
        variant="dark"
      />

      {/* Team Grid */}
      <section className="py-24 md:py-32 lg:py-48 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-primary-100 to-primary-50 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-5xl">👤</span>
                </div>
                <h3 className="text-2xl font-display font-700 text-neutral-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-primary-600 font-600 mb-2">{member.role}</p>
                <p className="text-neutral-600 mb-6">{member.expertise}</p>
                <div className="flex justify-center gap-4">
                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">LinkedIn</a>
                  <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">Twitter</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        headline="Join Our Team"
        description="We're always looking for talented people who want to make a difference."
        primaryButtonText="View Openings"
        primaryButtonHref="/careers"
        variant="dark"
      />

      <Footer />
    </div>
  );
}
