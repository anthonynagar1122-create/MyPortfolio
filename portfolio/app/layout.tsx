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
  metadataBase: new URL("https://routemaster.vercel.app"),
  title: {
    default: "RouteMaster Intelligent Systems | Independent Digital Products",
    template: "%s | RouteMaster",
  },
  description:
    "RouteMaster Intelligent Systems builds independent digital products for mobility, local commerce and family finance.",
  keywords: [
    "RouteMaster Intelligent Systems",
    "RouteMaster",
    "Mobility technology",
    "Local commerce",
    "Fufaji",
    "Funds for Family",
    "Digital products",
  ],
  authors: [{ name: "RouteMaster Intelligent Systems" }],
  openGraph: {
    title: "RouteMaster Intelligent Systems",
    description: "Independent digital products for mobility, local commerce and family finance.",
    url: "https://routemaster.vercel.app",
    siteName: "RouteMaster",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RouteMaster Intelligent Systems",
    description: "Independent digital products for mobility, local commerce and family finance.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} scroll-smooth`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3563F6" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
