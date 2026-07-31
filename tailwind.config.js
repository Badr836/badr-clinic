/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        brand: {
          50: '#eef6f6',
          100: '#d7e9e8',
          200: '#b0d3d1',
          300: '#82b6b3',
          400: '#569896',
          500: '#3a7d7b',
          600: '#2c6361',
          700: '#254f4e',
          800: '#1f403f',
          900: '#1a3535',
          950: '#0d1e1e',
        },
        clinical: {
          amber: '#c07830',
          red: '#b3403a',
          slate: '#5b6b74',
        },
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}
