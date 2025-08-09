/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium dark theme colors
        dark: {
          900: '#0a0a0a',
          800: '#111111',
          700: '#1a1a1a',
          600: '#262626',
          500: '#404040',
          400: '#525252',
          300: '#737373',
          200: '#a3a3a3',
          100: '#d4d4d4',
        },
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
        // Premium accent colors for dark theme
        neon: {
          blue: '#00d4ff',
          purple: '#8b5cf6',
          green: '#10b981',
        },
      },
      boxShadow: {
        'premium': '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
        'glow': '0 0 20px rgba(14, 165, 233, 0.3)',
        'accent-glow': '0 0 20px rgba(249, 115, 22, 0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}