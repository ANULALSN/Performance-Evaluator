/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0a0a0f',
        'bg-secondary': '#12121a',
        'bg-tertiary': '#1c1c21',
        'bg-card': 'rgba(255,255,255,0.04)',
        'border-default': 'rgba(255,255,255,0.08)',
        'border-color': 'rgba(255, 255, 255, 0.08)',
        'glass-bg': 'rgba(20, 20, 24, 0.7)',
        'glass-border': 'rgba(255, 255, 255, 0.1)',
        'accent-primary': '#6366f1',
        'accent-secondary': '#a855f7',
        'accent-purple': '#7c3aed',
        'accent-blue': '#2563eb',
        'accent-green': '#10b981',
        'accent-amber': '#f59e0b',
        'accent-error': '#ef4444',
        'text-primary': '#f8fafc',
        'text-secondary': '#94a3b8',
        'text-muted': '#94a3b8',
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      backdropBlur: {
        'glass': '12px',
      }
    },
  },
  plugins: [],
}
