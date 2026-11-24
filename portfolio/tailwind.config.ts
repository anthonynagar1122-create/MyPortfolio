import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          300: '#a8c5ff',
          500: '#3563F6', // Electric blue - main primary
          600: '#2650D1',
          700: '#1e3a8a',
          900: '#1E3A8A',
        },
        // Secondary colors
        secondary: {
          50: '#f8f9fb',
          100: '#f1f5f9',
          300: '#cbd5e1',
          500: '#64748B', // Slate grey
          700: '#334155',
          900: '#101827', // Deep navy - main secondary
        },
        // Accent colors (for products)
        accent: {
          cyan: '#61D5E8',
          emerald: '#10B981',
          violet: '#A855F7',
        },
        // Semantic colors
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        disabled: '#E2E8F0',

        // Neutral palette
        neutral: {
          0: '#FFFFFF',
          50: '#F7F8FA',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
      },

      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': 'rgb(16, 24, 39)',
            '--tw-prose-headings': 'rgb(16, 24, 39)',
            '--tw-prose-lead': 'rgb(100, 116, 139)',
            '--tw-prose-links': 'rgb(53, 99, 246)',
            '--tw-prose-bold': 'rgb(16, 24, 39)',
            '--tw-prose-counters': 'rgb(100, 116, 139)',
            '--tw-prose-bullets': 'rgb(226, 232, 240)',
            '--tw-prose-hr': 'rgb(226, 232, 240)',
            '--tw-prose-quotes': 'rgb(100, 116, 139)',
            '--tw-prose-quote-borders': 'rgb(226, 232, 240)',
            '--tw-prose-captions': 'rgb(100, 116, 139)',
            '--tw-prose-code': 'rgb(16, 24, 39)',
            '--tw-prose-pre-code': 'rgb(241, 245, 249)',
            '--tw-prose-pre-bg': 'rgb(15, 23, 42)',
            '--tw-prose-pre-border': 'rgb(71, 85, 105)',
            '--tw-prose-th-borders': 'rgb(226, 232, 240)',
            '--tw-prose-td-borders': 'rgb(226, 232, 240)',
            '--tw-prose-invert-body': 'rgb(241, 245, 249)',
            '--tw-prose-invert-headings': 'rgb(241, 245, 249)',
            '--tw-prose-invert-lead': 'rgb(148, 163, 184)',
            '--tw-prose-invert-links': 'rgb(96, 165, 255)',
            '--tw-prose-invert-bold': 'rgb(241, 245, 249)',
            '--tw-prose-invert-counters': 'rgb(148, 163, 184)',
            '--tw-prose-invert-bullets': 'rgb(51, 65, 85)',
            '--tw-prose-invert-hr': 'rgb(51, 65, 85)',
            '--tw-prose-invert-quotes': 'rgb(148, 163, 184)',
            '--tw-prose-invert-quote-borders': 'rgb(51, 65, 85)',
            '--tw-prose-invert-captions': 'rgb(148, 163, 184)',
            '--tw-prose-invert-code': 'rgb(241, 245, 249)',
            '--tw-prose-invert-pre-code': 'rgb(15, 23, 42)',
            '--tw-prose-invert-pre-bg': 'rgba(0, 0, 0, 0.5)',
            '--tw-prose-invert-pre-border': 'rgb(51, 65, 85)',
            '--tw-prose-invert-th-borders': 'rgb(51, 65, 85)',
            '--tw-prose-invert-td-borders': 'rgb(51, 65, 85)',
          },
        },
      },

      fontFamily: {
        // Font families are set via CSS variables in layout.tsx
        sans: 'var(--font-sans, system-ui, sans-serif)',
        mono: 'var(--font-mono, monospace)',
      },

      fontSize: {
        // Display scale
        'display-lg': ['56px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'display-sm': ['32px', { lineHeight: '1.3', letterSpacing: '-0.02em' }],

        // Heading scale
        'h1': ['44px', { lineHeight: '1.3', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h2': ['32px', { lineHeight: '1.35', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h3': ['24px', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h4': ['20px', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '600' }],
        'h5': ['18px', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '600' }],

        // Body scale
        'body-lg': ['18px', { lineHeight: '1.6' }],
        'body': ['16px', { lineHeight: '1.6' }],
        'body-sm': ['14px', { lineHeight: '1.6' }],
        'body-xs': ['13px', { lineHeight: '1.5' }],

        // Label scale
        'label': ['13px', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '+0.025em' }],

        // Mono scale
        'mono': ['14px', { lineHeight: '1.4', fontFamily: 'JetBrains Mono' }],
        'mono-sm': ['12px', { lineHeight: '1.4', fontFamily: 'JetBrains Mono' }],
      },

      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
        '3xl': '48px',
        '4xl': '64px',
        '5xl': '96px',
        '6xl': '128px',
      },

      borderRadius: {
        'none': '0px',
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
        'full': '9999px',
      },

      boxShadow: {
        'none': 'none',
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'elevation': '0 4px 12px 0 rgba(16, 24, 39, 0.08)',
      },

      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
      },

      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.6, 1)',
      },

      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #101827 0%, #1E293B 100%)',
        'gradient-blue': 'linear-gradient(135deg, #3563F6 0%, #2650D1 100%)',
      },

      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1440px',
        '2xl': '1920px',
      },
    },
  },
  plugins: [],
};

export default config;
