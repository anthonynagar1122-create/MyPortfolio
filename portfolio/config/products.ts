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
    tagline: "Intelligent Journey Planning for Connected Mobility",
    description: "AI-powered multimodal route optimization that simplifies travel across railways, buses, flights, and local transport.",
    category: "Mobility",
    icon: "🛤️",
    accentColor: "cyan",

    // Links - UPDATE with actual URLs when available
    landingPage: "/products/product1",
    applicationUrl: null, // Will be set when app is deployed
    demoUrl: null,

    // Downloads - set when apps are released
    androidUrl: null,
    iosUrl: null,

    // Support
    supportUrl: "/support",
    documentationUrl: "/docs/routemaster",

    // Status
    status: "showcase",
    launchDate: undefined,

    // Product Details
    features: [
      "Railway, bus, and flight planning",
      "Real-time tracking and updates",
      "Cost optimization across modes",
      "Accessibility-first features",
      "Multi-language support",
      "Offline maps and routing",
    ],
    useCases: [
      "Business travelers planning complex journeys",
      "Daily commuters optimizing routes",
      "Logistics coordinators managing deliveries",
    ],
    targetAudience: [
      "Business travelers",
      "Daily commuters",
      "Logistics companies",
      "Transportation planners",
    ],

    // SEO
    seoTitle: "RouteMaster - Intelligent Journey Planning & Mobility",
    seoDescription: "AI-powered multimodal route optimization for seamless travel planning across all transportation modes.",
    seoKeywords: ["route planning", "mobility", "transportation", "AI", "multimodal"],
  },

  product2: {
    id: "product2",
    name: "Fufaji's",
    tagline: "Digital Commerce for Local Retailers",
    description: "Complete shop management suite empowering local retailers to go digital with inventory, ordering, and customer analytics.",
    category: "Commerce",
    icon: "🏪",
    accentColor: "emerald",

    landingPage: "/products/product2",
    applicationUrl: null,
    demoUrl: null,

    androidUrl: null,
    iosUrl: null,

    supportUrl: "/support",
    documentationUrl: "/docs/fufaji",

    status: "showcase",
    launchDate: undefined,

    features: [
      "Shop inventory management",
      "Mobile ordering platform",
      "Customer analytics dashboard",
      "Payment processing integration",
      "Order fulfillment tracking",
      "Local delivery coordination",
    ],
    useCases: [
      "Neighborhood stores expanding online",
      "Fresh produce vendors going digital",
      "Local service providers reaching customers",
    ],
    targetAudience: [
      "Local shop owners",
      "Fresh produce vendors",
      "Service providers",
      "Neighborhood retailers",
    ],

    seoTitle: "Fufaji's - Digital Commerce Platform for Local Retailers",
    seoDescription: "Complete e-commerce solution for local shops with inventory, payments, and customer analytics.",
    seoKeywords: ["local commerce", "shop management", "e-commerce", "retail", "inventory"],
  },

  product3: {
    id: "product3",
    name: "Funds-for-Family",
    tagline: "Family Financial Support Without Complexity",
    description: "Transparent, secure platform for recording and tracking family and community financial support with privacy controls.",
    category: "Finance",
    icon: "👨‍👩‍👧‍👦",
    accentColor: "violet",

    landingPage: "/products/product3",
    applicationUrl: null,
    demoUrl: null,

    androidUrl: null,
    iosUrl: null,

    supportUrl: "/support",
    documentationUrl: "/docs/funds-for-family",

    status: "showcase",
    launchDate: undefined,

    features: [
      "Support request creation and tracking",
      "Transparent contribution ledger",
      "Privacy controls per request",
      "Trust-based community features",
      "Secure document storage",
      "Real-time notifications",
    ],
    useCases: [
      "Family emergencies requiring financial support",
      "Educational support for family members",
      "Community initiatives and projects",
      "Trust-based lending circles",
    ],
    targetAudience: [
      "Families managing shared finances",
      "Community support groups",
      "Educational institutions",
      "Community organizations",
    ],

    seoTitle: "Funds-for-Family - Transparent Family Financial Support",
    seoDescription: "Secure, transparent platform for recording family and community financial support with privacy controls.",
    seoKeywords: ["family finance", "community support", "transparent", "trust", "financial tracking"],
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
