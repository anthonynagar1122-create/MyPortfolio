import { site } from "@/lib/config";

export const metadata = {
  title: "Terms",
  description: `Terms of use for ${site.name}`,
};

const h2 = "mt-8 text-xl font-semibold text-[#1A1A1A]";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl bg-[#FAFAF7] px-4 py-10 text-[#1A1A1A] sm:px-6 sm:py-16">
      <h1 className="text-3xl font-bold sm:text-4xl">Terms</h1>
      <p className="mt-3 text-[#5C5C5C]">By using {site.name} you agree to the points below.</p>

      <h2 className={h2}>Using the site</h2>
      <p className="mt-3">
        You can browse projects, vote, comment, suggest ideas and subscribe to launch emails. Please keep what you post
        civil and relevant. Comments and suggestions may be moderated or removed.
      </p>

      <h2 className={h2}>Your content</h2>
      <p className="mt-3">
        Comments and suggestions you submit are shown on the site. You can ask for them to be deleted as described on the
        privacy page.
      </p>

      <h2 className={h2}>Data</h2>
      <p className="mt-3">
        What we store about you, and how to unsubscribe or request deletion, is described on the{" "}
        <a href="/privacy" className="underline">
          privacy page
        </a>
        .
      </p>

      <h2 className={h2}>Contact</h2>
      <p className="mt-3">Questions about these terms: [owner email].</p>
    </main>
  );
}
