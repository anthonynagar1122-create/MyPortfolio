import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Contact RouteMaster",
  description: "Get in touch with us. We'd love to hear from you.",
};

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="flex-grow pt-32">
        <section className="py-24 md:py-32 lg:py-48 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h1 className="text-5xl font-display font-700 text-neutral-900 mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl">
              Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
            </p>
          </div>

          <form className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                Subject
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="How can we help?"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                Message
              </label>
              <textarea
                rows={6}
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Tell us more..."
              />
            </div>

            <button type="submit" className="btn btn-primary w-full">
              Send Message
            </button>
          </form>

          <div className="mt-16 pt-16 border-t border-neutral-200 grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold text-neutral-900 mb-2">Email</h4>
              <a href="mailto:hello@routemaster.online" className="text-primary-500 hover:text-primary-600">
                hello@routemaster.online
              </a>
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900 mb-2">Phone</h4>
              <p className="text-neutral-700">[Contact phone]</p>
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900 mb-2">Address</h4>
              <p className="text-neutral-700">[Company address]</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
