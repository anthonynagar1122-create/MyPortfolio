import Link from "next/link";

export const metadata = { title: "Subscription confirmed" };

export default function SubscribeConfirmedPage() {
  return (
    <main className="mx-auto flex max-w-xl flex-col gap-4 bg-[#FAFAF7] px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-semibold text-[#1A1A1A]">You are subscribed</h1>
      <p className="text-sm text-[#5C5C5C]">Your email address is confirmed. You can unsubscribe from any email we send.</p>
      <Link href="/" className="text-sm font-medium text-[#2563EB] underline underline-offset-2">
        Back to ideas and projects
      </Link>
    </main>
  );
}
