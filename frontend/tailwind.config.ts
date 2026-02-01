import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // S-Tier Color Palette (Stripe/Linear inspired)
      colors: {
        // Primary brand color - sophisticated indigo-blue
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1', // Main primary
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Neutrals - slate-based for sophistication
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          150: '#e9eef4',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // Semantic colors
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        info: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        // Day colors for itinerary visualization
        day: {
          1: '#6366f1', // Indigo (primary)
          2: '#10b981', // Emerald
          3: '#f59e0b', // Amber
          4: '#ef4444', // Red
          5: '#8b5cf6', // Violet
          6: '#ec4899', // Pink
          7: '#06b6d4', // Cyan
          8: '#84cc16', // Lime
          9: '#f97316', // Orange
          10: '#14b8a6', // Teal
          11: '#a855f7', // Purple
          12: '#3b82f6', // Blue
          13: '#eab308', // Yellow
          14: '#64748b', // Slate
        },
      },
      // Typography scale
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],        // 12px
        'sm': ['0.8125rem', { lineHeight: '1.25rem' }],   // 13px
        'base': ['0.875rem', { lineHeight: '1.5rem' }],   // 14px
        'md': ['0.9375rem', { lineHeight: '1.5rem' }],    // 15px
        'lg': ['1rem', { lineHeight: '1.5rem' }],         // 16px
        'xl': ['1.125rem', { lineHeight: '1.75rem' }],    // 18px
        '2xl': ['1.25rem', { lineHeight: '1.75rem' }],    // 20px
        '3xl': ['1.5rem', { lineHeight: '2rem' }],        // 24px
        '4xl': ['1.875rem', { lineHeight: '2.25rem' }],   // 30px
        '5xl': ['2.25rem', { lineHeight: '2.5rem' }],     // 36px
      },
      // Spacing (4px base unit)
      spacing: {
        '0.5': '2px',
        '1': '4px',
        '1.5': '6px',
        '2': '8px',
        '2.5': '10px',
        '3': '12px',
        '3.5': '14px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
        '9': '36px',
        '10': '40px',
        '11': '44px',
        '12': '48px',
        '14': '56px',
        '16': '64px',
        '18': '72px',
        '20': '80px',
        '24': '96px',
      },
      // Border radius
      borderRadius: {
        'none': '0',
        'sm': '4px',
        'DEFAULT': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
        'full': '9999px',
      },
      // Box shadows - refined with subtle color tints
      boxShadow: {
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.03)',
        'sm': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'DEFAULT': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'md': '0 6px 12px -2px rgb(0 0 0 / 0.06), 0 3px 6px -3px rgb(0 0 0 / 0.06)',
        'lg': '0 10px 20px -3px rgb(0 0 0 / 0.08), 0 4px 8px -4px rgb(0 0 0 / 0.06)',
        'xl': '0 20px 30px -5px rgb(0 0 0 / 0.1), 0 8px 12px -6px rgb(0 0 0 / 0.08)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.15)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        // Primary colored shadows for CTAs
        'primary': '0 4px 14px 0 rgb(99 102 241 / 0.25)',
        'primary-lg': '0 8px 24px 0 rgb(99 102 241 / 0.3)',
        // Card shadows
        'card': '0 1px 3px rgb(0 0 0 / 0.04), 0 1px 2px rgb(0 0 0 / 0.06)',
        'card-hover': '0 8px 25px -5px rgb(0 0 0 / 0.08), 0 4px 10px -6px rgb(0 0 0 / 0.06)',
        'none': 'none',
      },
      // Animation durations
      transitionDuration: {
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
      },
      // Custom easings
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      // Keyframe animations
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-down': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'hero-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'skeleton-shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'stagger-fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-up': 'fade-up 0.3s ease-out',
        'fade-down': 'fade-down 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'shimmer': 'shimmer 2s infinite linear',
        'pulse-subtle': 'pulse-subtle 2s infinite ease-in-out',
        'spin-slow': 'spin-slow 3s linear infinite',
        'hero-float': 'hero-float 6s ease-in-out infinite',
        'skeleton-shimmer': 'skeleton-shimmer 1.5s infinite linear',
        'stagger-fade-up': 'stagger-fade-up 0.4s ease-out forwards',
      },
      // Backdrop blur
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
      },
    },
  },
  plugins: [],
};

export default config;
