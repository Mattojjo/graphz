/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Segoe UI',
          'Tahoma',
          'Geneva',
          'Verdana',
          'sans-serif',
        ],
        mono: ['SF Mono', 'Consolas', 'monospace'],
      },
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(400px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.3s ease both',
      },
    },
  },
  plugins: [],
};

