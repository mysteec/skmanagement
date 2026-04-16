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
      },
      colors: {
        pastel: {
          blue: '#DBEAFE',
          'blue-dark': '#93C5FD',
          green: '#DCFCE7',
          'green-dark': '#86EFAC',
          amber: '#FEF3C7',
          'amber-dark': '#FCD34D',
          purple: '#EDE9FE',
          'purple-dark': '#C4B5FD',
          rose: '#FFE4E6',
          'rose-dark': '#FCA5A5',
          teal: '#CCFBF1',
          'teal-dark': '#5EEAD4',
          orange: '#FFEDD5',
          'orange-dark': '#FDBA74',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      }
    },
  },
  plugins: [],
}
