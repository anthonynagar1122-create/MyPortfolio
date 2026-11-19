import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";

export const metadata = {
  title: "About RouteMaster",
  description: "Learn about our mission, vision, and the story behind RouteMaster.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="flex-grow pt-32">
        <section className="py-24 md:py-32 lg:py-48 bg-gradient-to-br from-neutral-900 to-neutral-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-5xl md:text-6xl font-display font-700 mb-6">
              About RouteMaster
            </h1>
            <p className="text-xl text-neutral-300 max-w-2xl">
              Our story, mission, and vision for the future.
            </p>
          </div>
        </section>

        <section className="py-24 md:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-display font-700 text-neutral-900 mb-4">
                Our Mission
              </h2>
              <p className="text-lg text-neutral-700 leading-relaxed max-w-3xl">
                [Mission statement placeholder - describes what we&apos;re trying to achieve and why it matters]
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-display font-700 text-neutral-900 mb-4">
                Our Vision
              </h2>
              <p className="text-lg text-neutral-700 leading-relaxed max-w-3xl">
                [Vision statement placeholder - describes the future we&apos;re building toward]
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-display font-700 text-neutral-900 mb-4">
                Our Values
              </h2>
              <ul className="space-y-4 text-lg text-neutral-700">
                <li className="flex gap-4">
                  <span className="text-primary-500 font-bold">•</span>
                  <span><strong>User-Centric:</strong> We design for real users and their real problems</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary-500 font-bold">•</span>
                  <span><strong>Innovation:</strong> We embrace new technologies and approaches</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary-500 font-bold">•</span>
                  <span><strong>Reliability:</strong> We build products people can trust</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-primary-500 font-bold">•</span>
                  <span><strong>Impact:</strong> We measure success by the value we create</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-16 pt-16 border-t border-neutral-200">
            <Link href="/team" className="btn btn-primary">
              Meet Our Team
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
