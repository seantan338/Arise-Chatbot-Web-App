/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Arise Real Estate brand palette (from the staff handbook)
        teal: {
          DEFAULT: '#0D7377',
          dark: '#095155',
          light: '#E6F4F5',
          mid: '#C0E8EA',
        },
        accent: '#14A085',
        gold: '#E8A838',
        ink: '#1A2A2A',
        muted: '#5A7070',
        line: '#D0E4E4',
        surface: '#FFFFFF',
        canvas: '#F7FAFA',
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 16px rgba(13,115,119,.10)',
        lift: '0 6px 32px rgba(13,115,119,.18)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        blink: {
          '0%, 80%, 100%': { opacity: '0.25' },
          '40%': { opacity: '1' },
        },
      },
      animation: {
        fadeUp: 'fadeUp .25s ease both',
        blink: 'blink 1.4s infinite both',
      },
    },
  },
  plugins: [],
}
