/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Main brand colors
        'brand-black': '#0B0B0D', // Main dark color (near black)
        'brand-white': '#F9F9FB', // Main light color (near white)
        
        // Teal accent color (main brand accent)
        'brand-teal': {
          50: '#E6FFFA',
          100: '#B2F5EA',
          200: '#81E6D9',
          300: '#4FD1C5',
          400: '#38B2AC', // Primary teal
          500: '#319795',
          600: '#2C7A7B',
          700: '#285E61',
          800: '#234E52',
          900: '#1D4044',
        },

        // UI colors
        'ui-gray': {
          50: '#F7F7F8',
          100: '#EEEEF1',
          200: '#DEDEE6',
          300: '#CACAD6',
          400: '#A1A1B5',
          500: '#71718F',
          600: '#575770',
          700: '#414159',
          800: '#313143',
          900: '#22222E',
        },

        // Functional colors
        'success': '#0D9488', // Success green (teal shade)
        'warning': '#F59E0B', // Warning yellow
        'error': '#EF4444',   // Error red
        'info': '#3B82F6',    // Info blue
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'smooth': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'hover': '0 8px 30px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        sema: {
          "primary": "#38B2AC",
          "secondary": "#319795",
          "accent": "#4FD1C5",
          "neutral": "#313143",
          "base-100": "#F9F9FB",
          "info": "#3B82F6",
          "success": "#0D9488",
          "warning": "#F59E0B",
          "error": "#EF4444",
        },
      },
    ],
  },
} 