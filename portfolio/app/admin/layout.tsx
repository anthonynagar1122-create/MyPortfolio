import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { gateOwner } from "@/lib/admin-gate";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };

// The shell holds no admin content. Everything, children included, renders only
// after requireOwner() succeeds behind the boundary (cacheComponents pattern).
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-[#5C5C5C]">Loading</p>}>
      <OwnerOnly>{children}</OwnerOnly>
    </Suspense>
  );
}

async function OwnerOnly({ children }: { children: React.ReactNode }) {
  await connection();
  // gateOwner() calls requireOwner() first; 401 redirects to sign-in, 403 renders Forbidden.
  if ((await gateOwner()) === "forbidden") {
    return (
      <main className="mx-auto max-w-xl px-4 py-16">
        <h1 className="text-2xl font-semibold text-[#1A1A1A]">403 Forbidden</h1>
        <p className="mt-2 text-sm text-[#5C5C5C]">This area is for the site owner only.</p>
      </main>
    );
  }
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <nav aria-label="Admin" className="mb-6 flex flex-wrap gap-4 border-b border-[#E5E5E0] pb-3 text-sm font-medium">
        <Link href="/admin">Dashboard</Link>
        <Link href="/admin/items">Items</Link>
        <Link href="/admin/comments">Comments</Link>
        <Link href="/admin/suggestions">Suggestions</Link>
      </nav>
      {children}
    </div>
  );
}
