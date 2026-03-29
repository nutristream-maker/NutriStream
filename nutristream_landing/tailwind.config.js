/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          cyan:    '#00F5FF',
          violet:  '#8B5CF6',
          emerald: '#10B981',
          rose:    '#F43F5E',
        },
        dark: {
          950: '#04050a',
          900: '#080C14',
          800: '#0D1220',
          700: '#121828',
          600: '#1a2235',
        }
      },
      animation: {
        'pulse-slow':    'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float':         'float 6s ease-in-out infinite',
        'glow':          'glow 2s ease-in-out infinite alternate',
        'gradient-x':    'gradient-x 8s ease infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%':   { boxShadow: '0 0 5px #00F5FF44, 0 0 20px #00F5FF22' },
          '100%': { boxShadow: '0 0 20px #00F5FF88, 0 0 60px #00F5FF44' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
}
