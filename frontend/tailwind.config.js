/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    'bg-primary',
    'bg-primary-dark',
    'bg-primary-light',
    'hover:bg-primary',
    'hover:bg-primary-dark',
    'text-primary',
    'border-primary',
    'shadow-primary',
  ],
  theme: {
    extend: {
      colors: {
        // 🌸 BRAND (Belle)
        primary: '#E91E63',
        'primary-dark': '#C2185B',
        'primary-light': '#F8BBD0',

        // 🎯 UI BASE
        secondary: '#1e293b',
        background: '#0f172a',
        surface: '#111827',

        // ⚡ Estados
        accent: '#E91E63',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
    },
  },

  darkMode: 'class',
  plugins: [],
}