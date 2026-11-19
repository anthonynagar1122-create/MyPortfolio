/**
 * Centralized site content configuration
 * Update this file to change content across the entire site
 * No code changes needed
 */

interface TeamMember {
  name: string;
  role: string;
  expertise: string;
  linkedin: string;
  twitter: string;
}

export const siteContent = {
  // Company Information
  company: {
    name: "RouteMaster",
    tagline: "Build the future of logistics",
    year_founded: 2024,
    team_size: 10,
    customers_served: 50,
    email: "team@routemaster.online",
    phone: "+1 (555) 123-4567",
    office: "San Francisco, CA",
    mission: "Revolutionizing how businesses manage their supply chain with AI-powered insights",
    vision: "A world where every logistics decision is data-driven and intelligent",
    website: "https://routemaster.online",
  },

  // Team Members
  team: [] as TeamMember[],

  // Company Values
  values: [
    {
      name: "Integrity",
      description: "We build trust through transparency and honest communication",
    },
    {
      name: "Innovation",
      description: "We embrace cutting-edge technology to solve complex problems",
    },
    {
      name: "Impact",
      description: "We measure success by the positive change we create",
    },
    {
      name: "Inclusivity",
      description: "We celebrate diverse perspectives and welcome all voices",
    },
  ],

  // Company Capabilities/Features
  capabilities: [
    {
      name: "Innovation",
      description: "Cutting-edge AI and machine learning at the core",
      emoji: "🚀",
    },
    {
      name: "Modern Architecture",
      description: "Scalable, cloud-native infrastructure",
      emoji: "🏗️",
    },
    {
      name: "Data-Driven",
      description: "Real-time analytics and insights",
      emoji: "📊",
    },
    {
      name: "Security",
      description: "Enterprise-grade security and compliance",
      emoji: "🔒",
    },
    {
      name: "Global Ready",
      description: "Support for multi-region deployment",
      emoji: "🌍",
    },
    {
      name: "Sustainable",
      description: "Committed to carbon-neutral operations",
      emoji: "♻️",
    },
  ],

  // Company Timeline/Milestones
  timeline: [
    {
      year: 2024,
      milestone: "Founded RouteMaster",
      description: "Started with a vision to revolutionize logistics",
    },
    {
      year: 2024,
      milestone: "First 50 customers",
      description: "Launched product to early adopters",
    },
    {
      year: 2025,
      milestone: "Series A Planning",
      description: "Expanding team and product capabilities",
    },
  ],

  // Products Information
  products: [
    {
      id: "product1",
      name: "RouteMaster Core",
      tagline: "AI-powered route optimization",
      description: "Real-time route optimization using machine learning",
      category: "Core Platform",
      icon: "🗺️",
      accent_color: "cyan",
    },
    {
      id: "product2",
      name: "RouteMaster Analytics",
      tagline: "Deep insights into supply chain",
      description: "Comprehensive analytics and reporting platform",
      category: "Analytics",
      icon: "📈",
      accent_color: "emerald",
    },
    {
      id: "product3",
      name: "RouteMaster Network",
      tagline: "Collaborate with partners",
      description: "Partner ecosystem and integration hub",
      category: "Collaboration",
      icon: "🤝",
      accent_color: "violet",
    },
  ],

  // Jobs/Careers
  jobs: [
    {
      title: "Senior Full-Stack Engineer",
      team: "Product",
      location: "Remote",
      level: "Senior",
    },
    {
      title: "Product Designer",
      team: "Design",
      location: "Remote",
      level: "Mid",
    },
    {
      title: "Product Manager",
      team: "Product",
      location: "Remote",
      level: "Senior",
    },
    {
      title: "Sales Representative",
      team: "Sales",
      location: "Remote",
      level: "Mid",
    },
    {
      title: "Customer Success Manager",
      team: "Support",
      location: "Remote",
      level: "Mid",
    },
  ],

  // Social Links
  social: {
    linkedin: "https://linkedin.com/company/routemaster",
    twitter: "https://twitter.com/routemaster",
    github: "https://github.com/routemaster",
    email: "hello@routemaster.online",
  },

  // Press/Media
  media: {
    press_kit_url: "https://routemaster.online/press-kit",
    media_contact: "press@routemaster.online",
    featured_in: [],
  },
};
