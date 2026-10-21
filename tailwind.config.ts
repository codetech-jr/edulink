import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // ── Paleta Oxford Moderno ──────────────────────────
        // Primario: Azul Marino (#1E3A8A / #1E40AF)
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#1e40af",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
          DEFAULT: "#1e3a8a",
          hover: "#1e40af",
        },
        // Secundario: Verde Esmeralda (#059669)
        secondary: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
          DEFAULT: "#059669",
          hover: "#047857",
        },
        // Acento: Ámbar Cálido (#D97706)
        accent: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          950: "#451a03",
          DEFAULT: "#d97706",
          hover: "#b45309",
        },
        // Neutros: Slate (#F8FAFC fondo, #0F172A texto)
        neutral: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
          DEFAULT: "#0f172a",
        },
        // Token semántico brand sincronizado con Azul Marino
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#1e40af",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
          DEFAULT: "#1e3a8a",
          hover: "#1e40af",
        },
        // Mapeo retrocompatible de indigo a Oxford Azul Marino
        indigo: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#1e40af", // Azul Marino interactivo / hover (#1E40AF)
          600: "#1e3a8a", // Azul Marino Oxford base (#1E3A8A)
          700: "#172554", // Azul Marino profundo
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#0f172a",
          DEFAULT: "#1e3a8a",
        },
        // Oxford namespace shortcuts
        oxford: {
          primary: "#1e3a8a",
          "primary-hover": "#1e40af",
          secondary: "#059669",
          accent: "#d97706",
          bg: "#f8fafc",
          text: "#0f172a",
        },
        // Tokens semánticos de estado
        success: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
          DEFAULT: "#059669",
        },
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          950: "#451a03",
          DEFAULT: "#d97706",
        },
        danger: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
          950: "#450a0a",
          DEFAULT: "#dc2626",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '0.875rem', letterSpacing: '0.01em' }], // 11px
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0' }],             // 12px
        'sm': ['0.84375rem', { lineHeight: '1.25rem', letterSpacing: '-0.005em' }],// 13.5px
        'base': ['0.9375rem', { lineHeight: '1.375rem', letterSpacing: '-0.01em' }],// 15px
        'md': ['1rem', { lineHeight: '1.5rem', letterSpacing: '-0.011em' }],        // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.014em' }],   // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.017em' }],    // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.021em' }],       // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.024em' }],  // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.027em' }],    // 36px
      },
      borderRadius: {
        sm: '0.375rem',   // 6px
        md: '0.5rem',     // 8px
        lg: '0.75rem',    // 12px
        xl: '1rem',       // 16px
        '2xl': '1.25rem', // 20px
        '3xl': '1.5rem',  // 24px
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out both',
        'fade-in-left': 'fadeInLeft 0.5s ease-out both',
        'slide-in-right': 'slideInRight 0.7s ease-out both',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
        'grid-pulse': 'gridPulse 8s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(30px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        gridPulse: {
          '0%, 100%': { opacity: '0.03' },
          '50%': { opacity: '0.07' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      backgroundImage: {
        'grid-white': 'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
    },
  },
  plugins: [],
};
export default config;
