/**
 * Design System Tokens
 * Premium B2B SaaS Aesthetic (Stripe/Linear/Vercel)
 */

export const tokens = {
  // Color Palette
  colors: {
    // Primary (Trust/Tech)
    primary: {
      50: '#F0F4FF',
      100: '#E0E7FF',
      500: '#3563F6',
      600: '#2D52D9',
      900: '#0F1B4F',
    },
    // Neutral (Text/Surfaces)
    neutral: {
      50: '#FAFAFA',
      100: '#F3F4F6',
      200: '#E5E7EB',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#0F172A',
    },
    // Product Accents (3 unique identities)
    accent: {
      cyan: '#61D5E8',   // Product 1
      emerald: '#10B981', // Product 2
      violet: '#A855F7',  // Product 3
    },
    // Semantic Colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3563F6',
  },

  // Typography Scale (pixels)
  typography: {
    // Display (Hero, section headers)
    displayLg: {
      fontSize: '56px',
      fontWeight: 700,
      lineHeight: '1.2',
      fontFamily: 'Space Grotesk, sans-serif',
    },
    displayMd: {
      fontSize: '40px',
      fontWeight: 700,
      lineHeight: '1.3',
      fontFamily: 'Space Grotesk, sans-serif',
    },
    // Heading
    headingLg: {
      fontSize: '40px',
      fontWeight: 600,
      lineHeight: '1.3',
      fontFamily: 'Space Grotesk, sans-serif',
    },
    headingMd: {
      fontSize: '28px',
      fontWeight: 600,
      lineHeight: '1.4',
      fontFamily: 'Space Grotesk, sans-serif',
    },
    headingSm: {
      fontSize: '20px',
      fontWeight: 600,
      lineHeight: '1.4',
      fontFamily: 'Space Grotesk, sans-serif',
    },
    // Body
    bodyLg: {
      fontSize: '18px',
      fontWeight: 400,
      lineHeight: '1.6',
      fontFamily: 'Inter, sans-serif',
    },
    bodyMd: {
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: '1.6',
      fontFamily: 'Inter, sans-serif',
    },
    bodySm: {
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: '1.6',
      fontFamily: 'Inter, sans-serif',
    },
    // Label
    label: {
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: '1.4',
      fontFamily: 'Inter, sans-serif',
    },
    // Mono (Code, data)
    mono: {
      fontSize: '13px',
      fontWeight: 400,
      lineHeight: '1.5',
      fontFamily: 'JetBrains Mono, monospace',
    },
  },

  // Spacing Scale (8px base)
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
    '4xl': '96px',
  },

  // Container Widths
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Responsive Breakpoints
  breakpoints: {
    mobile: '375px',
    tablet: '768px',
    laptop: '1024px',
    desktop: '1440px',
    wide: '1920px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },

  // Border Radius
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },

  // Transitions
  transitions: {
    fast: 'all 150ms ease-in-out',
    normal: 'all 250ms ease-in-out',
    slow: 'all 350ms ease-in-out',
  },
};

/**
 * Component Specifications
 */
export const components = {
  // Navigation
  nav: {
    height: '72px',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    padding: '0 32px',
    gap: '24px',
  },

  // Hero Section
  hero: {
    minHeight: '100vh',
    padding: { desktop: '96px 32px', mobile: '64px 16px' },
    backgroundGradient: 'linear-gradient(135deg, #0F172A 0%, #1F2937 100%)',
    gap: { desktop: '64px', mobile: '32px' },
  },

  // Cards
  card: {
    padding: '24px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    shadow: 'md',
    hoverShadow: 'lg',
    transition: 'all 250ms ease-in-out',
  },

  // Buttons
  button: {
    primary: {
      backgroundColor: '#3563F6',
      color: '#FFFFFF',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: 600,
      hoverBackgroundColor: '#2D52D9',
      focusRing: '3px solid #E0E7FF',
      focusRingOffset: '2px',
    },
    secondary: {
      backgroundColor: '#F3F4F6',
      color: '#0F172A',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: 600,
      hoverBackgroundColor: '#E5E7EB',
      focusRing: '3px solid #E0E7FF',
      focusRingOffset: '2px',
    },
  },

  // Forms
  form: {
    input: {
      padding: '12px 16px',
      fontSize: '16px',
      borderRadius: '8px',
      border: '1px solid #E5E7EB',
      focusBorder: '2px solid #3563F6',
      hoverBorder: '1px solid #D1D5DB',
    },
    label: {
      fontSize: '14px',
      fontWeight: 500,
      color: '#374151',
      marginBottom: '6px',
    },
  },

  // Product Grid
  productGrid: {
    desktop: { columns: 3, gap: '32px' },
    tablet: { columns: 2, gap: '24px' },
    mobile: { columns: 1, gap: '16px' },
  },

  // Feature Grid
  featureGrid: {
    desktop: { columns: 3, gap: '32px' },
    tablet: { columns: 2, gap: '24px' },
    mobile: { columns: 1, gap: '16px' },
  },
};

/**
 * Accessibility
 */
export const a11y = {
  contrastRatios: {
    normal: '4.5:1', // Text
    graphics: '3:1',  // Graphics/icons
  },
  focusRing: '3px solid #E0E7FF',
  focusRingOffset: '2px',
  touchTarget: '44px', // Minimum for mobile
};

/**
 * Anti-patterns to avoid
 */
export const antiPatterns = [
  'Excessive gradients or blur effects',
  'Decorative animations without purpose',
  'Low-contrast muted text (<4.5:1)',
  'Emoji as interface icons',
  'Auto-playing video or audio',
  'Infinite scroll without pagination',
  'Forms without clear error states',
  'Hover-only CTAs (mobile-unfriendly)',
  'Fake testimonials or invented data',
  'Heavy animations on low-end devices',
];
