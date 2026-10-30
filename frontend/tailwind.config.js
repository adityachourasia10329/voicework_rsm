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
        // Superlist "Orange-Purple-Pink-Blue-Green" palette from attached image
        coral: {
          DEFAULT: '#FF4D36',
          hover: '#FF644E',
          active: '#E53E28',
          glow: 'rgba(255, 77, 54, 0.35)',
        },
        purple: {
          DEFAULT: '#6B70F0',
          hover: '#7E83F6',
          light: 'rgba(107, 112, 240, 0.15)',
          border: 'rgba(107, 112, 240, 0.35)',
        },
        pink: {
          DEFAULT: '#FF5DB1',
          hover: '#FF75C0',
          light: 'rgba(255, 93, 177, 0.15)',
        },
        azure: {
          DEFAULT: '#258BF5',
          hover: '#429CFF',
          light: 'rgba(37, 139, 245, 0.15)',
        },
        emerald: {
          DEFAULT: '#27A376',
          hover: '#33C287',
          light: 'rgba(39, 163, 118, 0.15)',
        },
        // Grounded Futuristic Obsidian Dark Base (like bpssite & Superlist dark surfaces)
        obsidian: {
          950: '#08090E',
          900: '#0D0E15', // Main canvas background
          850: '#12131C', // Secondary background
          800: '#181926', // Panel / Card surface
          750: '#1F2133', // Elevated card / Dialog
          700: '#2A2C42', // High-contrast border / hover
          border: 'rgba(255, 255, 255, 0.08)',
          'border-active': 'rgba(255, 255, 255, 0.22)',
          'border-glow': 'rgba(107, 112, 240, 0.35)',
        },
        // Compatibility aliases remapped to dark futuristic theme
        zerodha: {
          blue: '#FF4D36', // Superlist coral accent
          'blue-hover': '#FF644E',
          'blue-light': 'rgba(255, 77, 54, 0.12)',
          text: '#9FA4B8',
          heading: '#FFFFFF',
          muted: '#646982',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-light': 'rgba(255, 255, 255, 0.04)',
          bg: '#0D0E15',
          card: '#181926',
          green: '#27A376',
          red: '#FF4D36',
          orange: '#FF8833',
        },
        background: '#0D0E15',
        surface: '#181926',
        'surface-elevated': '#1F2133',
        border: 'rgba(255, 255, 255, 0.08)',
        accent: '#FF4D36',
        'accent-hover': '#FF644E',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['Space Mono', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'futuristic-glow': '0 0 30px rgba(107, 112, 240, 0.15)',
        'coral-glow': '0 0 25px rgba(255, 77, 54, 0.35)',
        'glass-card': '0 8px 32px rgba(0, 0, 0, 0.45)',
      },
    },
  },
  plugins: [],
};
