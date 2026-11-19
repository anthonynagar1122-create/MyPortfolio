/**
 * Product Configuration System
 * Centralized product definitions for easy future integration
 */

export type ProductStatus = "showcase" | "preview" | "live";
export type ProductId = "product1" | "product2" | "product3";

export interface Product {
  id: ProductId;
  name: string;
  tagline: string;
  description: string;
  category: string;
  icon: string;
  accentColor: "cyan" | "emerald" | "violet";

  // Links
  landingPage: string;
  applicationUrl: string | null;
  demoUrl: string | null;

  // Downloads
  androidUrl: string | null;
  iosUrl: string | null;

  // Support
  supportUrl: string | null;
  documentationUrl: string | null;

  // Status & Availability
  status: ProductStatus;
  launchDate?: string;

  // Metadata
  features: string[];
  useCases: string[];
  targetAudience: string[];

  // SEO
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
}

/**
 * Product Definitions
 * Update these configurations to change product information across the entire site
 */
export const products: Record<ProductId, Product> = {
  product1: {
    id: "product1",
    name: "RouteMaster",
    tagline: "Connecting people to places",
    description: "Journey planning, affordable mobility, multimodal transport and accessibility for everyone.",
    category: "Mobility",
    icon: "🛣️",
    accentColor: "cyan",

    landingPage: "/products/routemaster",
    applicationUrl: null,
    demoUrl: null,

    androidUrl: null,
    iosUrl: null,

    supportUrl: "/support",
    documentationUrl: "/docs/routemaster",

    status: "showcase",
    launchDate: undefined,

    features: [
      "Multi-modal journey planning",
      "Accessibility route options",
      "Real-time transit information",
      "Fare comparison",
      "Women-safe travel insights",
    ],
    useCases: [
      "Daily commuters",
      "Travellers seeking affordable options",
      "People with mobility needs",
      "Rural connectivity",
    ],
    targetAudience: [
      "Everyday travellers",
      "Accessibility-conscious users",
      "Cost-conscious commuters",
    ],

    seoTitle: "RouteMaster - Intelligent Mobility",
    seoDescription: "Find affordable, accessible journey options across multiple transport modes.",
    seoKeywords: ["mobility", "transport", "journey planning", "accessibility"],
  },

  product2: {
    id: "product2",
    name: "Fufaji's",
    tagline: "Empowering local commerce",
    description: "Fair pricing, small-shop digitization, local sourcing and trusted transactions.",
    category: "Local Commerce",
    icon: "🏪",
    accentColor: "emerald",

    landingPage: "/products/fufajis",
    applicationUrl: null,
    demoUrl: null,

    androidUrl: null,
    iosUrl: null,

    supportUrl: "/support",
    documentationUrl: "/docs/fufajis",

    status: "showcase",
    launchDate: undefined,

    features: [
      "Digital storefronts for small shops",
      "Transparent pricing",
      "Local inventory discovery",
      "Direct producer connections",
      "Fair commission structure",
    ],
    useCases: [
      "Local retailer digitization",
      "Direct farm-to-consumer",
      "Small business expansion",
      "Community commerce",
    ],
    targetAudience: [
      "Local shop owners",
      "Small businesses",
      "Community shoppers",
      "Artisans and producers",
    ],

    seoTitle: "Fufaji's - Local Commerce Platform",
    seoDescription: "Empower small shops and local producers with fair digital commerce.",
    seoKeywords: ["local commerce", "small business", "fair pricing", "community"],
  },

  product3: {
    id: "product3",
    name: "Funds-for-Family",
    tagline: "Supporting family coordination",
    description: "Family expense coordination, transparent contributions and financial well-being.",
    category: "Family Finance",
    icon: "👨‍👩‍👧",
    accentColor: "violet",

    landingPage: "/products/funds-for-family",
    applicationUrl: null,
    demoUrl: null,

    androidUrl: null,
    iosUrl: null,

    supportUrl: "/support",
    documentationUrl: "/docs/funds-for-family",

    status: "showcase",
    launchDate: undefined,

    features: [
      "Family expense coordination",
      "Transparent contribution tracking",
      "Emergency assistance organization",
      "Shared financial goals",
      "Secure family document vault",
    ],
    useCases: [
      "Household expense management",
      "Emergency family support",
      "Education expense planning",
      "Multi-generational coordination",
    ],
    targetAudience: [
      "Families",
      "Household groups",
      "Elder care coordinators",
      "Financial planners",
    ],

    seoTitle: "Funds-for-Family - Family Financial Coordination",
    seoDescription: "Coordinate family finances transparently and securely.",
    seoKeywords: ["family finance", "household expenses", "financial coordination"],
  },
};

/**
 * Helper functions for product management
 */

export function getProduct(id: ProductId): Product {
  return products[id];
}

export function getAllProducts(): Product[] {
  return Object.values(products);
}

export function getProductsByStatus(status: ProductStatus): Product[] {
  return getAllProducts().filter((p) => p.status === status);
}

export function isProductAvailable(id: ProductId): boolean {
  const product = getProduct(id);
  return product.status === "live" || product.status === "preview";
}

export function getProductCtaLabel(product: Product): string {
  if (product.status === "live" && product.applicationUrl) {
    return "Launch App";
  } else if (product.status === "preview" && product.demoUrl) {
    return "Try Demo";
  } else {
    return "Learn More";
  }
}

export function getProductCtaHref(product: Product): string {
  if (product.status === "live" && product.applicationUrl) {
    return product.applicationUrl;
  } else if (product.status === "preview" && product.demoUrl) {
    return product.demoUrl;
  } else {
    return product.landingPage;
  }
}
