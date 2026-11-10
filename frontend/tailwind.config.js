/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      colors: {
        primary: { DEFAULT: '#2563EB', 50: '#EFF6FF', 100: '#DBEAFE', 500: '#3B82F6', 600: '#2563EB', 700: '#1D4ED8' },
        teal: { DEFAULT: '#0EA5A4', 50: '#F0FDFA', 500: '#14B8A6', 600: '#0EA5A4' },
      },
    },
  },
  plugins: [],
};
