import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "RouteMaster — Technology That Moves Businesses Forward",
  description:
    "Build intelligent digital products for mobility, local commerce, and community finance. RouteMaster ecosystem: RouteMaster, Fufaji, Funds-for-Family.",
  keywords: [
    "RouteMaster",
    "Intelligent transport",
    "Local commerce",
    "Family finance",
    "Fufaji",
    "Funds-for-Family",
    "Digital products",
    "Startup",
  ],
  authors: [{ name: "RouteMaster", url: "https://routemaster.online" }],
  openGraph: {
    title: "RouteMaster — Technology That Moves Businesses Forward",
    description:
      "Build intelligent digital products for mobility, local commerce, and community finance.",
    url: "https://routemaster.online",
    siteName: "RouteMaster",
    images: [
      {
        url: "https://routemaster.online/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RouteMaster",
    description: "Technology That Moves Businesses Forward",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} scroll-smooth`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3563F6" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
