import type { Metadata } from "next";
import HomeContent from "./home-content";

export const metadata: Metadata = {
  title: "RouteMaster — One Ecosystem, Many Solutions, A Shared Purpose",
  description: "A technology company building useful, secure and accessible experiences that solve real-world problems. Discover RouteMaster, Fufaji's, and Funds-for-Family.",
};

export default function Home() {
  return <HomeContent />;
}