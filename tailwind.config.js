/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'fade-in': 'fadeIn 1s ease-in forwards',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-heart': 'floatHeart 2s ease-in-out forwards',
        'bounce-char': 'bounceChar 0.6s ease-in-out infinite',
        'loading-dots': 'loadingDots 1.4s infinite',
        'float-gentle': 'floatGentle 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floatHeart: {
          '0%': { 
            transform: 'translateY(0) scale(0)',
            opacity: '0'
          },
          '50%': { 
            transform: 'translateY(-20px) scale(1.2)',
            opacity: '0.8'
          },
          '100%': { 
            transform: 'translateY(-40px) scale(1)',
            opacity: '0'
          }
        },
        bounceChar: {
          '0%, 100%': { 
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-5px) scale(1.1)',
          }
        },
        loadingDots: {
          '0%, 20%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-5px)',
            opacity: '0.5',
          },
          '80%, 100%': {
            transform: 'translateY(0)',
          }
        },
        floatGentle: {
          '0%, 100%': { 
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          }
        },
      },
      fontFamily: {
        diary: ['Klee One', 'YuMincho', 'Yu Mincho', 'Hiragino Mincho ProN', 'serif'],
      },
      letterSpacing: {
        'diary': '0.05em',
      },
      lineHeight: {
        'diary': '2',
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: ["light"],
  },
}

