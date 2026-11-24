import { Navigation } from "@/components/core";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Privacy Policy",
  description: "How RouteMaster Intelligent System Pvt. Ltd. handles information submitted through its corporate website.",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navigation />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-20 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold text-neutral-950">Privacy Policy</h1>
        <p className="mt-4 text-sm text-neutral-500">Last updated: 24 November 2026</p>
        <div className="mt-10 space-y-8 leading-8 text-neutral-700">
          <section>
            <h2 className="text-2xl font-semibold text-neutral-950">1. About this policy</h2>
            <p className="mt-3">
              This policy explains how RouteMaster Intelligent System Pvt. Ltd. handles information when
              you visit this corporate website or submit an enquiry. Individual products may have
              separate privacy notices and terms when their services become available.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-neutral-950">2. Information you provide</h2>
            <p className="mt-3">
              When you use the contact form, we collect the name, email address, optional company
              and product interest, and message that you submit. Please do not send passwords,
              payment card details or sensitive personal information through this form.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-neutral-950">3. How we use information</h2>
            <p className="mt-3">
              We use enquiry details to respond to your request, understand product or partnership
              interest, maintain business correspondence and protect the website against misuse.
              We do not sell personal information.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-neutral-950">4. Service providers</h2>
            <p className="mt-3">
              The website is hosted through Vercel and enquiry records are stored in a dedicated
              Supabase project. If outbound email delivery is enabled, the relevant message data
              may also be processed by the email delivery provider. These providers process data
              under their own service terms and privacy notices.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-neutral-950">5. Retention and security</h2>
            <p className="mt-3">
              We retain enquiry information for as long as reasonably necessary to respond,
              maintain business records and meet applicable obligations. We use access controls
              and database security policies, but no internet transmission or storage system can
              be guaranteed to be completely secure.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-neutral-950">6. Your choices</h2>
            <p className="mt-3">
              You may contact us to request access to, correction of or deletion of information
              you submitted, subject to applicable legal and record-keeping requirements.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-neutral-950">7. Contact</h2>
            <p className="mt-3">
              For privacy questions, email <a className="font-semibold text-primary-700" href="mailto:hello@routemaster.online">hello@routemaster.online</a>.
            </p>
          </section>
          <p className="text-sm text-neutral-500">
            This page is a general website privacy notice and is not legal advice. Product-specific
            notices may apply to separate applications.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
