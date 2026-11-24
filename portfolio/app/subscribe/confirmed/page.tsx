import Link from "next/link";

export const metadata = { title: "Subscription confirmed" };

export default function SubscribeConfirmedPage() {
  return (
    <main className="mx-auto flex max-w-xl flex-col gap-4 bg-[color:var(--bg)] px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-semibold text-[color:var(--text)]">You are subscribed</h1>
      <p className="text-sm text-[color:var(--muted)]">Your email address is confirmed. You can unsubscribe from any email we send.</p>
      <Link href="/" className="text-sm font-medium text-[color:var(--primary)] underline underline-offset-2">
        Back to ideas and projects
      </Link>
    </main>
  );
}
