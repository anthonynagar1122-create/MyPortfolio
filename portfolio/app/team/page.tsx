import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Our Team",
  description: "Meet the talented people building RouteMaster",
};

export default function TeamPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="flex-grow pt-32">
        <section className="py-24 md:py-32 lg:py-48 bg-gradient-to-br from-neutral-900 to-neutral-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-5xl md:text-6xl font-display font-700 mb-6">
              Our Team
            </h1>
            <p className="text-xl text-neutral-300 max-w-2xl">
              Talented people building products that matter.
            </p>
          </div>
        </section>

        <section className="py-24 md:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-12">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="text-center">
                <div className="w-32 h-32 bg-neutral-200 rounded-full mx-auto mb-6 flex items-center justify-center text-5xl">
                  👤
                </div>
                <h4 className="text-xl font-semibold text-neutral-900">Team Member Name</h4>
                <p className="text-neutral-600 mt-2 mb-4">Role & Title</p>
                <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                  [Short bio describing their background and what they do at RouteMaster]
                </p>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-500 hover:text-primary-600 font-medium text-sm"
                >
                  LinkedIn →
                </a>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
