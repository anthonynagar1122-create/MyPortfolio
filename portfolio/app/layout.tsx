import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/layout/SiteNav";
import { fixtureMode } from "@/lib/db/fixture";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

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
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3563F6" />
      </head>
      <body className="antialiased">
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