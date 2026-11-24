import type { Metadata } from "next";
import HomeContent from "./home-content";

export const metadata: Metadata = {
  title: "RouteMaster Intelligent System Pvt. Ltd. | Independent Digital Products",
  description: "Discover RouteMaster, Fufaji and Funds for Family: independent digital products for mobility, local commerce and family finance.",
};

export default function Home() {
  return <HomeContent />;
}
