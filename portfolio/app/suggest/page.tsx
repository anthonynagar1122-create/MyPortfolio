import Link from "next/link";
import { SubscribeForm } from "@/components/forms/SubscribeForm";
import { SuggestForm } from "@/components/forms/SuggestForm";

export const metadata = {
  title: "Suggest an idea",
  description: "Suggest an idea or subscribe for updates",
};

export default function SuggestPage() {
  return (
    <main className="mx-auto flex max-w-xl flex-col gap-10 bg-[color:var(--bg)] px-4 py-10 sm:px-6 sm:py-16">
      <Link href="/" className="text-sm font-medium text-[color:var(--primary)] underline underline-offset-2">
        All ideas and projects
      </Link>
      <section aria-labelledby="suggest-heading" className="flex flex-col gap-4">
        <h1 id="suggest-heading" className="text-3xl font-semibold text-[color:var(--text)]">
          Suggest an idea
        </h1>
        <p className="text-sm text-[color:var(--muted)]">No account needed. Suggestions are reviewed before anything is published.</p>
        <SuggestForm />
      </section>
      <section id="subscribe" aria-labelledby="subscribe-heading" className="flex flex-col gap-4 border-t border-[color:var(--border)] pt-8">
        <h2 id="subscribe-heading" className="text-xl font-semibold text-[color:var(--text)]">
          Get updates
        </h2>
        <SubscribeForm />
      </section>
    </main>
  );
}
