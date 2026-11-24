import { site } from "@/lib/config";

export const metadata = {
  title: "Privacy",
  description: `How ${site.name} handles your data`,
};

const h2 = "mt-8 text-xl font-semibold text-[color:var(--text)]";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl bg-[color:var(--bg)] px-4 py-10 text-[color:var(--text)] sm:px-6 sm:py-16">
      <h1 className="text-3xl font-bold sm:text-4xl">Privacy</h1>
      <p className="mt-3 text-[color:var(--muted)]">
        This page explains what {site.name} stores about you, why, and how to have it removed.
      </p>

      <h2 className={h2}>What is stored</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6">
        <li>
          <strong>Subscribers:</strong> your email address, only if you subscribe, along with whether you have confirmed
          it.
        </li>
        <li>
          <strong>Comments:</strong> the text you post and the name you give with it.
        </li>
        <li>
          <strong>Votes:</strong> the votes you cast on projects and ideas.
        </li>
        <li>
          <strong>Visits:</strong> a daily salted visitor hash used to count unique visitors and to limit abuse. The hash
          changes every day, and your raw IP address is not stored.
        </li>
      </ul>

      <h2 className={h2}>Why</h2>
      <p className="mt-3">
        Emails are used to send a confirmation message and a note when a new project launches. Comments and votes show
        what people want. The visitor hash gives anonymous visitor counts and keeps the forms from being flooded.
      </p>

      <h2 className={h2}>Unsubscribing</h2>
      <p className="mt-3">Every email we send contains an unsubscribe link. Opening it removes you from the list.</p>

      <h2 className={h2}>Deleting your data</h2>
      <p className="mt-3">
        To have your email, comments or votes deleted, email the site owner at [owner email] and say what you would like
        removed.
      </p>
    </main>
  );
}
