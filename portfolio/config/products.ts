/**
 * Public product catalogue for the RouteMaster corporate portfolio.
 * Product infrastructure, authentication, data and release cycles remain independent.
 */
export type ProductStatus = "showcase" | "preview" | "live";
export type ProductId = "product1" | "product2" | "product3";

export interface Product {
  id: ProductId;
  slug: "routemaster" | "fufaji" | "funds-for-family";
  name: string;
  tagline: string;
  description: string;
  category: string;
  icon: string;
  accentColor: "cyan" | "emerald" | "violet";
  landingPage: string;
  applicationUrl: string | null;
  demoUrl: string | null;
  androidUrl: string | null;
  iosUrl: string | null;
  supportUrl: string | null;
  documentationUrl: string | null;
  status: ProductStatus;
  launchDate?: string;
  features: string[];
  useCases: string[];
  targetAudience: string[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
}

export const products: Record<ProductId, Product> = {
  product1: {
    id: "product1",
    slug: "routemaster",
    name: "RouteMaster",
    tagline: "Make complex journeys easier to plan",
    description: "A multi-modal journey-planning platform focused on India, bringing transport options and route choices into one decision experience.",
    category: "Mobility technology",
    icon: "🧭",
    accentColor: "cyan",
    landingPage: "/apps/routemaster",
    applicationUrl: null,
    demoUrl: null,
    androidUrl: null,
    iosUrl: null,
    supportUrl: "/contact",
    documentationUrl: null,
    status: "showcase",
    features: [
      "Multi-modal journey discovery",
      "Route alternatives and trade-off comparison",
      "Railway network and timetable data",
      "Journey planning designed around real travel constraints",
    ],
    useCases: [
      "Compare practical ways to travel between cities",
      "Explore rail and connected transport options",
      "Help travellers make informed route decisions",
    ],
    targetAudience: ["Everyday travellers", "Migrant workers and families", "Travel and mobility partners"],
    seoTitle: "RouteMaster | Multi-modal Journey Planning",
    seoDescription: "Explore RouteMaster's vision for connected, multi-modal journey planning in India.",
    seoKeywords: ["RouteMaster", "journey planner", "multi-modal transport", "India travel"],
  },
  product2: {
    id: "product2",
    slug: "fufaji",
    name: "Fufaji",
    tagline: "A simpler, fairer neighbourhood shopping experience",
    description: "A single-shop local commerce platform built around clear prices, trusted products and a straightforward ordering experience.",
    category: "Local commerce",
    icon: "🛒",
    accentColor: "emerald",
    landingPage: "/apps/fufaji",
    applicationUrl: null,
    demoUrl: null,
    androidUrl: null,
    iosUrl: null,
    supportUrl: "/contact",
    documentationUrl: null,
    status: "showcase",
    features: [
      "Single-shop catalogue and inventory",
      "Transparent fixed-price shopping",
      "Simple cart and checkout journey",
      "Order, payment and fulfilment workflows",
    ],
    useCases: [
      "Help local customers order everyday essentials",
      "Give shop owners clearer control over catalogue and stock",
      "Coordinate picking, packing, delivery and collections",
    ],
    targetAudience: ["Neighbourhood customers", "Independent shop owners", "Local delivery teams"],
    seoTitle: "Fufaji | Trust-led Local Commerce",
    seoDescription: "Discover Fufaji, a straightforward local shopping experience focused on trust and transparent pricing.",
    seoKeywords: ["Fufaji", "local commerce", "neighbourhood shop", "fixed price"],
  },
  product3: {
    id: "product3",
    slug: "funds-for-family",
    name: "Funds for Family",
    tagline: "Bring family and community finances into clearer view",
    description: "A family-focused finance and coordination product being developed with an emphasis on transparent records, clear decisions and responsible access.",
    category: "Family finance",
    icon: "🤝",
    accentColor: "violet",
    landingPage: "/apps/funds-for-family",
    applicationUrl: null,
    demoUrl: null,
    androidUrl: null,
    iosUrl: null,
    supportUrl: "/contact",
    documentationUrl: null,
    status: "showcase",
    features: [
      "Structured family finance records",
      "Clear contribution and obligation visibility",
      "Role-aware access and decision workflows",
      "A focus on transparency and accountability",
    ],
    useCases: [
      "Keep family financial information organised",
      "Make shared commitments easier to understand",
      "Support accountable coordination between members",
    ],
    targetAudience: ["Families", "Trusted family coordinators", "Community groups"],
    seoTitle: "Funds for Family | Transparent Family Finance",
    seoDescription: "Learn about Funds for Family and its focus on clear, accountable family financial coordination.",
    seoKeywords: ["Funds for Family", "family finance", "financial coordination", "transparency"],
  },
};

export function getProduct(id: ProductId): Product {
  return products[id];
}

export function getAllProducts(): Product[] {
  return Object.values(products);
}

export function getProductsByStatus(status: ProductStatus): Product[] {
  return getAllProducts().filter((product) => product.status === status);
}

export function isProductAvailable(id: ProductId): boolean {
  const product = getProduct(id);
  return product.status === "live" || product.status === "preview";
}

export function getProductCtaLabel(product: Product): string {
  if (product.status === "live" && product.applicationUrl) return "Launch App";
  if (product.status === "preview" && product.demoUrl) return "Try Demo";
  return "Explore Product";
}

export function getProductCtaHref(product: Product): string {
  if (product.status === "live" && product.applicationUrl) return product.applicationUrl;
  if (product.status === "preview" && product.demoUrl) return product.demoUrl;
  return product.landingPage;
}
