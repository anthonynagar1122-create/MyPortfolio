import Link from "next/link";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <section className="max-w-lg rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">RouteMaster</p>
        <h1 className="mt-4 text-3xl font-bold text-neutral-950">Private workspace</h1>
        <p className="mt-4 leading-7 text-neutral-600">
          The public portfolio does not use customer sign-in. Private company workspace access is managed separately.
        </p>
        <Link href="/" className="btn btn-primary mt-7">Return to website</Link>
      </section>
    </main>
  );
}
