import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Technology & Architecture",
  description: "Learn about the technology behind RouteMaster products",
};

export default function TechnologyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="flex-grow pt-32">
        <section className="py-24 md:py-32 lg:py-48 bg-gradient-to-br from-neutral-900 to-neutral-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-5xl md:text-6xl font-display font-700 mb-6">
              Technology & Architecture
            </h1>
            <p className="text-xl text-neutral-300 max-w-2xl">
              Built on modern cloud infrastructure with a focus on reliability and scalability.
            </p>
          </div>
        </section>

        <section className="py-24 md:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-20">
            <div>
              <h2 className="text-3xl font-display font-700 text-neutral-900 mb-8">
                Core Architecture
              </h2>
              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-4">Backend</h3>
                  <ul className="space-y-2 text-neutral-700">
                    <li>• PostgreSQL with Supabase</li>
                    <li>• RESTful and GraphQL APIs</li>
                    <li>• Microservices architecture</li>
                    <li>• Real-time data synchronization</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-4">Frontend</h3>
                  <ul className="space-y-2 text-neutral-700">
                    <li>• React & Next.js</li>
                    <li>• TypeScript for type safety</li>
                    <li>• Responsive mobile-first design</li>
                    <li>• Progressive web app capabilities</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-display font-700 text-neutral-900 mb-8">
                Infrastructure
              </h2>
              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-4">Hosting & Deployment</h3>
                  <ul className="space-y-2 text-neutral-700">
                    <li>• Cloudflare Workers & Pages</li>
                    <li>• Global edge network</li>
                    <li>• Automatic SSL/TLS certificates</li>
                    <li>• DDoS protection included</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-4">Security & Compliance</h3>
                  <ul className="space-y-2 text-neutral-700">
                    <li>• End-to-end encryption</li>
                    <li>• Regular security audits</li>
                    <li>• GDPR compliant</li>
                    <li>• Data backup & disaster recovery</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-display font-700 text-neutral-900 mb-8">
                DevOps & Monitoring
              </h2>
              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-4">CI/CD Pipeline</h3>
                  <ul className="space-y-2 text-neutral-700">
                    <li>• GitHub Actions for automation</li>
                    <li>• Automated testing on every push</li>
                    <li>• Continuous deployment</li>
                    <li>• Zero-downtime updates</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-4">Observability</h3>
                  <ul className="space-y-2 text-neutral-700">
                    <li>• Sentry for error tracking</li>
                    <li>• PostHog for analytics</li>
                    <li>• Real-time performance monitoring</li>
                    <li>• User behavior insights</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
