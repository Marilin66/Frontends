/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1877F2',
          light: '#4267B2',
          dark: '#0e5a9a',
          50: '#F0F2F5',
        },
        secondary: {
          DEFAULT: '#F0F2F5',
          light: '#F0F2F5',
          dark: '#E4E6EB',
        },
        surface: '#F0F2F5',
        'fb-white': '#FFFFFF',
        'fb-gray': '#65676B',
        'fb-divider': '#CED0D4',
        'fb-hover': '#E4E6EB',
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        patient: '#1877F2',
        medecin: '#00A400',
        adminHopital: '#2A6F97',
        superAdmin: '#335C81',
        laborantin: '#2F7F8F',
        success: '#42B72A',
        warning: '#F7B125',
        error: '#FA3E3E',
        info: '#1877F2',
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'fb': '0 1px 2px rgba(0, 0, 0, 0.1)',
        'fb-md': '0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'fb': '8px',
      },
    },
  },
  plugins: [],
}
