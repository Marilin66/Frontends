/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          light:   '#3B82F6',
          dark:    '#1D4ED8',
          50:      '#EFF6FF',
          100:     '#DBEAFE',
        },
        surface: '#F8FAFC',
        success: '#10B981',
        warning: '#F59E0B',
        error:   '#EF4444',
        info:    '#0EA5E9',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        'card':     '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-md':  '0 4px 12px 0 rgb(0 0 0 / 0.08)',
        'card-lg':  '0 8px 24px 0 rgb(0 0 0 / 0.10)',
        'dropdown': '0 8px 30px -4px rgb(0 0 0 / 0.12), 0 0 0 1px rgb(0 0 0 / 0.04)',
        'modal':    '0 24px 64px -12px rgb(0 0 0 / 0.18)',
        'premium':  '0 4px 24px 0 rgb(0 0 0 / 0.08)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '28px',
      },
      maxWidth: {
        'screen-xl': '1280px',
      },
      screens: {
        'xs': '480px',
        // Les breakpoints Tailwind par défaut :
        // sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px
      },
      height: {
        'screen-dvh': '100dvh',
      },
      minHeight: {
        'screen-dvh': '100dvh',
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-top':    'env(safe-area-inset-top)',
      },
    },
  },
  plugins: [],
}
