import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/layout/SiteNav";
import { Heartbeat } from "@/components/analytics/Heartbeat";
import { fixtureMode } from "@/lib/db/fixture";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Static script (no user data). Runs synchronously in <head> so data-theme is
// set before first paint. The choice lives in localStorage "theme"; without
// one, the OS preference decides.
const themeInitScript = `try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)}catch(e){}`;

export const metadata: Metadata = {
  title: "Your Name — Ideas and Projects",
  description: "Ideas, projects, and what people actually want.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2563EB" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased">
        <Heartbeat />
        {fixtureMode ? (
          <>
            <SiteNav />
            {children}
          </>
        ) : (
          <ClerkProvider>
            <SiteNav />
            {children}
          </ClerkProvider>
        )}
      </body>
    </html>
  );
}