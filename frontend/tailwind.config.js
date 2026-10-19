/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#090D16',
        surface: '#111726',
        'surface-elevated': '#182035',
        border: '#1E293B',
        accent: '#6366F1',
        'accent-hover': '#4F46E5',
        stem: {
          speech: '#10B981',
          traffic: '#EF4444',
          crowd: '#3B82F6',
          hum: '#F97316',
          music: '#A855F7',
          ambient: '#14B8A6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
