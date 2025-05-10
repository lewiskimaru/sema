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
        'brand-black': '#191414', // Spotify-inspired dark
        'brand-white': '#FFFFFF', // Crisp white
        
        // Green accent color (Spotify-inspired)
        'brand-green': {
          50: '#EDFDF2',
          100: '#D3F9DE',
          200: '#A7F3C1',
          300: '#70E99D',
          400: '#1DB954', // Spotify primary green
          500: '#17A449',
          600: '#11853C',
          700: '#0F6A32',
          800: '#0D5428',
          900: '#09361A',
        },

        // UI colors (modernized grays)
        'ui-gray': {
          50: '#F9F9FB',
          100: '#F1F1F4',
          200: '#E4E4E9',
          300: '#D2D2DB',
          400: '#A8A8B9',
          500: '#7C7C95',
          600: '#626275',
          700: '#4A4A59',
          800: '#34343E',
          900: '#232328',
        },

        // Functional colors
        'success': '#1DB954', // Spotify green
        'warning': '#F59E0B', // Amber warning
        'error': '#E91E63',   // Pink error
        'info': '#4F46E5',    // Indigo info
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
          "primary": "#1DB954",
          "secondary": "#17A449",
          "accent": "#70E99D",
          "neutral": "#34343E",
          "base-100": "#FFFFFF",
          "info": "#4F46E5",
          "success": "#1DB954",
          "warning": "#F59E0B",
          "error": "#E91E63",
        },
      },
    ],
  },
} 