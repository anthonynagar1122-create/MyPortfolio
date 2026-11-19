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
    name: "Product One",
    tagline: "Professional solution for enterprise needs",
    description: "A comprehensive platform designed to solve real-world challenges.",
    category: "Enterprise",
    icon: "🚀",
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
    documentationUrl: "/docs/product1",

    // Status
    status: "showcase",
    launchDate: undefined,

    // Product Details
    features: [
      "Feature 1",
      "Feature 2",
      "Feature 3",
    ],
    useCases: [
      "Use case 1",
      "Use case 2",
    ],
    targetAudience: [
      "Enterprise customers",
      "Teams",
    ],

    // SEO
    seoTitle: "Product One - Professional Solution",
    seoDescription: "Discover Product One and solve your business challenges.",
    seoKeywords: ["product", "solution", "enterprise"],
  },

  product2: {
    id: "product2",
    name: "Product Two",
    tagline: "Innovative platform for teams",
    description: "Empower your team with cutting-edge tools.",
    category: "Collaboration",
    icon: "💼",
    accentColor: "emerald",

    landingPage: "/products/product2",
    applicationUrl: null,
    demoUrl: null,

    androidUrl: null,
    iosUrl: null,

    supportUrl: "/support",
    documentationUrl: "/docs/product2",

    status: "showcase",
    launchDate: undefined,

    features: [
      "Feature 1",
      "Feature 2",
      "Feature 3",
    ],
    useCases: [
      "Use case 1",
      "Use case 2",
    ],
    targetAudience: [
      "Teams",
      "Organizations",
    ],

    seoTitle: "Product Two - Team Collaboration",
    seoDescription: "Transform how your team works with Product Two.",
    seoKeywords: ["collaboration", "teams", "productivity"],
  },

  product3: {
    id: "product3",
    name: "Product Three",
    tagline: "Secure solution for communities",
    description: "Build trust and transparency in your community.",
    category: "Community",
    icon: "🤝",
    accentColor: "violet",

    landingPage: "/products/product3",
    applicationUrl: null,
    demoUrl: null,

    androidUrl: null,
    iosUrl: null,

    supportUrl: "/support",
    documentationUrl: "/docs/product3",

    status: "showcase",
    launchDate: undefined,

    features: [
      "Feature 1",
      "Feature 2",
      "Feature 3",
    ],
    useCases: [
      "Use case 1",
      "Use case 2",
    ],
    targetAudience: [
      "Communities",
      "Groups",
    ],

    seoTitle: "Product Three - Community Solutions",
    seoDescription: "Create meaningful connections with Product Three.",
    seoKeywords: ["community", "trust", "transparency"],
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
