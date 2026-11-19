import type { Metadata } from "next";
import HomeContent from "./home-content";

export const metadata: Metadata = {
  title: "Welcome to Our Portfolio",
  description: "Discover innovative products solving real-world challenges.",
};

export default function Home() {
  return <HomeContent />;
}