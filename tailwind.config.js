/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ntz: {
          white: '#FFFFFF',
          dark: '#333333',
          light: '#A9A9A9',
          blue: '#BBE1FA',
          pink: '#FFC4D1',
          'gradient-start': '#D9DFFF',
          'gradient-end': '#FFC4D1',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'ntz-gradient': 'linear-gradient(135deg, #D9DFFF 0%, #BBE1FA 50%, #FFC4D1 100%)',
      },
      boxShadow: {
        'ntz-card': '0 2px 20px 0 rgba(187, 225, 250, 0.35)',
        'ntz-pin': '0 4px 15px rgba(255, 196, 209, 0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        scaleIn: { from: { opacity: 0, transform: 'scale(0.95)' }, to: { opacity: 1, transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
}
