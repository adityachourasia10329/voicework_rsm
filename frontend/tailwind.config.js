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
        zerodha: {
          blue: '#387ed1',
          'blue-hover': '#2e6bb5',
          'blue-light': '#ebf3fc',
          text: '#424242',
          heading: '#222222',
          muted: '#666666',
          border: '#e0e0e0',
          'border-light': '#eeeeee',
          bg: '#fbfbfb',
          card: '#ffffff',
          green: '#26a69a',
          red: '#df514c',
          orange: '#ff9800',
        },
        background: '#fbfbfb',
        surface: '#ffffff',
        'surface-elevated': '#f4f5f7',
        border: '#e5e7eb',
        accent: '#387ed1',
        'accent-hover': '#2e6bb5',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
