/**
 * Company Principles & Values
 * Core commitments that guide product and design decisions
 */

export interface Principle {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  commitments: string[];
  accentColor: "blue" | "green" | "purple";
}

export const principles: Principle[] = [
  {
    id: "security",
    name: "Security",
    tagline: "Protect people and their data",
    description:
      "We build with privacy and security at the foundation. Every service uses modern authentication, encryption and audit controls. Trust is earned through transparency and rigorous protection.",
    icon: "🔒",
    accentColor: "blue",
    commitments: [
      "Encrypt sensitive data at rest and in transit",
      "Use industry-standard authentication (passkeys, MFA)",
      "Conduct regular security audits",
      "Publish security advisories transparently",
      "No sale of personal data to third parties",
    ],
  },
  {
    id: "society",
    name: "Society",
    tagline: "Make useful services accessible",
    description:
      "Technology should reduce friction for everyday people. We focus on solving real problems that affect real communities, particularly those underserved by existing solutions.",
    icon: "🤝",
    accentColor: "green",
    commitments: [
      "Design for accessibility (WCAG 2.1 AA minimum)",
      "Serve people with limited resources and connectivity",
      "Measure and report social impact",
      "Listen to communities we serve",
      "Support locally-rooted problem solving",
    ],
  },
  {
    id: "experience",
    name: "Experience",
    tagline: "Make technology easier to use",
    description:
      "Useful software is useless if nobody can figure out how to use it. We design for clarity, speed and delight. Every interaction should feel intentional and respectful of people's time.",
    icon: "✨",
    accentColor: "purple",
    commitments: [
      "Design for simplicity, not complexity",
      "Respect user time and attention",
      "Provide clear, helpful feedback",
      "Support multiple languages and literacy levels",
      "Make offline-first workflows when possible",
    ],
  },
];

export function getPrinciple(id: string): Principle | undefined {
  return principles.find((p) => p.id === id);
}

export function getAllPrinciples(): Principle[] {
  return principles;
}
